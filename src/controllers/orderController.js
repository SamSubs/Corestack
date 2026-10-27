const prisma = require('../prisma/client');
const logger = require('../utils/logger');

const createOrder = async (req, res) => {
  try {
    // Padronização: usar req.user.id
    const userId = req.user.id;

    // 1. Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { 
        userId,
        product: { deletedAt: null }
      },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // 2. Calculate total
    const total = cartItems.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);

    // 3. Create order, order items, and update stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Check and update stock for each item ATOMICALLY
      for (const item of cartItems) {
        const updatedStock = await tx.product.updateMany({
          where: { 
            id: item.productId, 
            stock: { gte: item.quantity } 
          },
          data: { stock: { decrement: item.quantity } }
        });

        if (updatedStock.count === 0) {
          throw new Error(`Estoque insuficiente para o produto ID: ${item.productId}`);
        }
      }

      // Create Order with Event
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price
            }))
          },
          events: {
            create: [{ userId, type: 'CREATED' }]
          }
        },
        include: { items: true, events: true }
      });

      // Clear Cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Erro ao criar pedido' });
  }
};

const getOrders = async (req, res) => {
  try {
    // Padronização: usar req.user.id
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { userId, deletedAt: null },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.id);

    const order = await prisma.order.findFirst({ 
      where: { id: orderId, deletedAt: null } 
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // 🔒 Garantir dono do pedido
    if (order.userId !== userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // 🚫 Bloqueios críticos
    if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)) {
      return res.status(400).json({ error: "Este pedido não pode mais ser cancelado." });
    }

    // Regra: se ainda não pago, cancela direto e devolve estoque
    if (order.status === "PENDING_PAYMENT") {
      await prisma.$transaction(async (tx) => {
        const orderWithItems = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true }
        });

        const updated = await tx.order.updateMany({
          where: { id: orderId, status: "PENDING_PAYMENT" },
          data: {
            status: "CANCELLED",
            paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "PENDING",
            cancelledAt: new Date(),
            cancelledBy: userId
          }
        });

        if (updated.count === 0) throw new Error("Conflito de concorrência");

        // Devolver estoque
        for (const item of orderWithItems.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }

        await tx.orderEvent.create({ data: { orderId, userId, type: 'CANCELLED_AND_STOCK_RETURNED' } });
      });

      logger.info('ORDER_CANCELLED', { orderId, userId, method: 'AUTOMATIC_UNPAID' });
      return res.json({ message: "Cancelado com sucesso e estoque devolvido" });
    }

    // Regra: se já pago/em processamento, solicita cancelamento
    if (["PAID", "PROCESSING"].includes(order.status)) {
      const updated = await prisma.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { 
          status: "CANCEL_REQUESTED",
          cancelledBy: userId
        }
      });
      if (updated.count === 0) return res.status(409).json({ error: "Conflito de concorrência. Status alterado." });

      await prisma.orderEvent.create({ data: { orderId, userId, type: 'CANCEL_REQUESTED' } });
      
      logger.info('ORDER_CANCEL_REQUESTED', { orderId, userId });
      return res.json({ message: "Cancelamento solicitado" });
    }

    return res.status(400).json({ error: "Estado do pedido inválido para cancelamento" });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ error: 'Erro ao processar cancelamento' });
  }
};

const payOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.id);

    const order = await prisma.order.findFirst({ 
      where: { id: orderId, deletedAt: null } 
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // Idempotência e Bloqueios
    if (['PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      return res.json({ message: "O pedido já foi pago ou está em processamento." });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({ error: "Não é possível pagar um pedido cancelado." });
    }

    // Permitir retentativa se PENDING_PAYMENT (mesmo que paymentStatus seja FAILED)
    if (order.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ error: "Estado do pedido inválido para pagamento." });
    }

    // Simulação realista: 20% de falha
    const isSuccess = Math.random() < 0.8;

    if (!isSuccess) {
      const failed = await prisma.order.updateMany({
        where: { id: orderId, status: 'PENDING_PAYMENT' },
        data: { paymentStatus: 'FAILED' }
      });
      if (failed.count > 0) {
        await prisma.orderEvent.create({ data: { orderId, userId, type: 'PAYMENT_FAILED' } });
      }
      return res.status(402).json({ error: "Pagamento recusado pelo banco. Tente novamente." });
    }

    // Sucesso
    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: 'PENDING_PAYMENT' },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING"
      }
    });

    if (updated.count === 0) {
       return res.status(409).json({ error: "Conflito: O pedido já foi modificado." });
    }

    await prisma.orderEvent.create({ data: { orderId, userId, type: 'PAID' } });

    logger.info('PAYMENT_SUCCESS', { orderId, userId });
    return res.json({ message: "Pagamento aprovado" });
  } catch (error) {
    logger.error('PAYMENT_ERROR', error, { orderId: Number(req.params.id), userId: req.user?.id });
    return res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  cancelOrder,
  payOrder
};
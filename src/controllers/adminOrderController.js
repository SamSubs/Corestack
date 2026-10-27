const prisma = require('../prisma/client');
const logger = require('../utils/logger');

// GET /api/admin/orders — Todos os pedidos (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
};

// PATCH /api/admin/orders/:id/status — Atualizar status do pedido com Máquina de Estados Rígida
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const adminId = req.user.id;

    const order = await prisma.order.findFirst({ 
      where: { id: orderId, deletedAt: null } 
    });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    // 1. Bloquear se já cancelado ou entregue
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      return res.status(400).json({ error: `Não é possível alterar um pedido com status ${order.status}` });
    }

    // 2. Definir transições válidas
    const validTransitions = {
      'PENDING_PAYMENT': ['CANCELLED', 'PROCESSING'],
      'PAID': ['PROCESSING', 'CANCEL_REQUESTED'],
      'PROCESSING': ['SHIPPED', 'CANCEL_REQUESTED'],
      'SHIPPED': ['DELIVERED'],
      'CANCEL_REQUESTED': ['CANCELLED']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ error: `Transição de ${order.status} para ${status} não permitida via Admin.` });
    }

    // 3. Executar atualização atômica
    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { 
        status,
        ...(status === 'CANCELLED' ? { cancelledAt: new Date(), cancelledBy: adminId } : {}),
        ...(status === 'SHIPPED' ? { shippedAt: new Date() } : {}),
        ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {})
      }
    });

    if (updated.count === 0) return res.status(409).json({ error: "Conflito: Status alterado por outro processo." });

    // 4. Registrar Auditoria
    await prisma.orderEvent.create({
      data: { orderId, userId: adminId, type: `ADMIN_STATUS_CHANGE_${status}` }
    });

    return res.json({ message: `Status atualizado para ${status}` });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

const approveCancel = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const adminId = req.user.id;

    const order = await prisma.order.findFirst({ 
      where: { id: orderId, deletedAt: null } 
    });

    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    if (order.status !== "CANCEL_REQUESTED") {
      return res.status(400).json({ error: "Pedido não está aguardando cancelamento" });
    }

    await prisma.$transaction(async (tx) => {
      const orderWithItems = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      const updated = await tx.order.updateMany({
        where: { id: orderId, status: "CANCEL_REQUESTED" },
        data: {
          status: "CANCELLED",
          paymentStatus: "REFUNDED",
          cancelledAt: new Date(),
          approvedBy: adminId
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

      await tx.orderEvent.create({ data: { orderId, userId: adminId, type: 'CANCELLED_AND_STOCK_RETURNED' } });
    });

    logger.info('ADMIN_APPROVE_CANCEL', { orderId, adminId });
    return res.json({ message: "Cancelamento aprovado e estoque devolvido" });
  } catch (error) {
    logger.error('ADMIN_APPROVE_CANCEL_ERROR', error, { orderId: Number(req.params.id), adminId: req.user?.id });
    return res.status(500).json({ error: 'Erro ao aprovar cancelamento' });
  }
};

const shipOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const adminId = req.user.id;
    
    const order = await prisma.order.findFirst({ 
      where: { id: orderId, deletedAt: null } 
    });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    // Idempotência
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return res.json({ message: "O pedido já foi enviado anteriormente." });
    }

    if (order.status !== 'PROCESSING') {
      return res.status(400).json({ error: "Apenas pedidos em 'Processamento' podem ser enviados." });
    }

    // Gerar código de rastreio simples (ex: BR1234ABCD)
    const trackingCode = 'BR' + Math.random().toString(36).substring(2, 8).toUpperCase() + 'D';

    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: "PROCESSING" },
      data: { 
        status: "SHIPPED",
        trackingCode,
        shippedAt: new Date()
      }
    });

    if (updated.count === 0) return res.status(409).json({ error: "Conflito: Pedido alterado" });

    await prisma.orderEvent.create({ data: { orderId, userId: adminId, type: 'SHIPPED' } });

    return res.json({ message: "Pedido enviado", trackingCode });
  } catch (error) {
    console.error('Ship order error:', error);
    return res.status(500).json({ error: 'Erro ao enviar pedido' });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const adminId = req.user.id;

    const order = await prisma.order.findFirst({ 
      where: { id: orderId, deletedAt: null } 
    });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    // Idempotência
    if (order.status === 'DELIVERED') {
      return res.json({ message: "O pedido já foi entregue anteriormente." });
    }

    if (order.status !== 'SHIPPED') {
      return res.status(400).json({ error: "Apenas pedidos 'Enviados' podem ser marcados como entregues." });
    }

    const updated = await prisma.order.updateMany({
      where: { id: orderId, status: "SHIPPED" },
      data: { 
        status: "DELIVERED",
        deliveredAt: new Date()
      }
    });

    if (updated.count === 0) return res.status(409).json({ error: "Conflito: Pedido alterado" });

    await prisma.orderEvent.create({ data: { orderId, userId: adminId, type: 'DELIVERED' } });

    return res.json({ message: "Pedido entregue" });
  } catch (error) {
    console.error('Deliver order error:', error);
    return res.status(500).json({ error: 'Erro ao entregar pedido' });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    const order = await prisma.order.findFirst({ 
      where: { id: orderId, deletedAt: null } 
    });

    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });

    if (order.status !== "CANCELLED") {
      return res.status(400).json({ error: "Só é possível excluir pedidos cancelados" });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: new Date() }
    });

    logger.info('ADMIN_DELETE_ORDER', { orderId, adminId: req.user.id });
    return res.json({ message: "Pedido deletado com sucesso (Soft Delete)" });
  } catch (error) {
    logger.error('ADMIN_DELETE_ORDER_ERROR', error, { orderId: Number(req.params.id), adminId: req.user?.id });
    return res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
};

module.exports = { 
  getAllOrders, 
  updateOrderStatus,
  approveCancel,
  shipOrder,
  deliverOrder,
  deleteOrder
};

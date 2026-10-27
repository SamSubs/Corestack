const prisma = require('../prisma/client');

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    // Padronização: req.user.id
    const userId = req.user.id;

    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity: parseInt(quantity)
      }
    });

    return res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ error: 'Erro ao adicionar item ao carrinho' });
  }
};

const getCart = async (req, res) => {
  try {
    // Padronização: req.user.id
    const userId = req.user.id;
    const cart = await prisma.cartItem.findMany({
      where: { 
        userId,
        product: { deletedAt: null }
      },
      include: { product: true }
    });
    return res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ error: 'Erro ao buscar carrinho' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({
      where: { id: parseInt(id) }
    });
    return res.status(204).send();
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({ error: 'Erro ao remover item do carrinho' });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart
};

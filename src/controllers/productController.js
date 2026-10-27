const prisma = require('../prisma/client');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock)
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null }
    });
    return res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id: parseInt(id), deletedAt: null }
    });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.json(product);
  } catch (error) {
    console.error('Get product by id error:', error);
    return res.status(500).json({ error: 'Erro ao buscar produto' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById
};

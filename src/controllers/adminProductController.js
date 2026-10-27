const prisma = require('../prisma/client');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, image } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({ error: 'Name, price and stock are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Admin create product error:', error);
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image } = req.body;

    const productId = parseInt(id);
    const existing = await prisma.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: 'Produto não encontrado ou deletado' });

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        image: image !== undefined ? image : undefined
      }
    });

    return res.json(product);
  } catch (error) {
    console.error('Admin update product error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);
    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() }
    });
    return res.json({ message: 'Produto deletado com sucesso (Soft Delete)' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    return res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};

const listAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null }
    });
    return res.json(products);
  } catch (error) {
    console.error('Admin list products error:', error);
    return res.status(500).json({ error: 'Erro ao listar produtos' });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  listAllProducts
};

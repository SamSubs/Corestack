const prisma = require('../prisma/client');

exports.getUsers = async (req, res) => {
  try {
    // Padronização: req.user.id
    const users = await prisma.user.findMany({
      where: { deletedAt: null }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};
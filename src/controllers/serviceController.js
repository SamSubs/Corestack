const prisma = require('../prisma/client');

const serviceController = {
  // List all active services
  getAll: async (req, res, next) => {
    try {
      const services = await prisma.service.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(services || []);
    } catch (error) {
      next(error);
    }
  },

  // Get single service
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({ where: { id } });
      if (!service) return res.status(404).json({ error: 'Service not found' });
      res.json(service);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Create service
  create: async (req, res, next) => {
    try {
      const { name, description, price } = req.body;
      const service = await prisma.service.create({
        data: { name, description, price }
      });
      res.status(201).json(service);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = serviceController;

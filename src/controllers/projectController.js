const prisma = require('../prisma/client');

const projectController = {
  // List all projects with their technologies
  getAll: async (req, res, next) => {
    try {
      const projects = await prisma.project.findMany({
        include: { technologies: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(projects || []);
    } catch (error) {
      next(error);
    }
  },

  // Get single project
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await prisma.project.findUnique({
        where: { id },
        include: { technologies: true }
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });
      res.json(project);
    } catch (error) {
      next(error);
    }
  },

  // Admin: Create project
  create: async (req, res, next) => {
    try {
      const { title, description, techStack, link, image, technologyIds } = req.body;
      const project = await prisma.project.create({
        data: {
          title,
          description,
          techStack,
          link,
          image,
          technologies: technologyIds ? {
            connect: technologyIds.map(id => ({ id }))
          } : undefined
        }
      });
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;

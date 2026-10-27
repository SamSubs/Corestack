const logger = require('../utils/logger');

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    logger.error('ADMIN_ACCESS_DENIED', new Error('Tentativa de acesso não autorizado'), { 
      userId: req.user?.id || 'anonymous', 
      ip: req.ip,
      url: req.originalUrl 
    });
    return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
  }
  next();
};

module.exports = adminMiddleware;

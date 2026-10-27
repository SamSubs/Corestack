const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  req.id = uuidv4();
  const start = Date.now();

  res.on('finish', () => {
    logger.info('HTTP_REQUEST', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - start,
      ip: req.ip
    });
  });

  next();
};

module.exports = requestLogger;

const errorMiddleware = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || 500;
  
  // Log estruturado JSON
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id || 'anonymous',
    ip: req.ip
  }));

  const message = (isProduction && statusCode === 500) 
    ? 'Erro interno do servidor' 
    : (err.message || 'Erro interno no servidor');

  return res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorMiddleware;

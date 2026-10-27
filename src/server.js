const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info('SERVER_STARTED', { port: PORT });
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Segurança contra ataques de slow loris e persistência
server.keepAliveTimeout = 61000;
server.headersTimeout = 65000;

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT_EXCEPTION', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED_REJECTION', err);
  process.exit(1);
});
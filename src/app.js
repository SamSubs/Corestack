require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const requestLogger = require('./middlewares/requestLogger');


const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const prisma = require('./prisma/client');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5177'
].filter(Boolean);

// Configuração de CORS (Deve vir antes de quase tudo)
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(compression());
app.use(requestLogger);

// Servir arquivos estáticos ANTES do Helmet para evitar bloqueios de política cross-origin
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: '7d',
  etag: true
}));

// Segurança Básica (Configurado para permitir recursos cross-origin de forma restrita)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [
        "'self'",
        "data:",
        process.env.BACKEND_URL || 'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:5177'
      ],
      scriptSrc: ["'self'"],
      connectSrc: [
        "'self'",
        process.env.BACKEND_URL || 'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:5177'
      ],
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '1mb' }));


// Rate Limiting Global (100 requisições por 15 min)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Aumentado para leitura
  message: { error: 'Muitas requisições, tente novamente em 15 minutos.' }
});
app.use('/api', globalLimiter);

// Limiter Específico para Auth
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login. Tente novamente em 5 minutos.' }
});
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

// Limiter para Pagamentos e Pedidos (Proteção contra spam/flood)
const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas transações em pouco tempo. Aguarde um minuto.' }
});
app.use('/api/orders/create', transactionLimiter);
app.use('/api/orders/*/pay', transactionLimiter);

// Limiter para Contato
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas mensagens enviadas. Tente novamente em 15 minutos.' }
});
app.use('/api/contact', contactLimiter);

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.get('/', (req, res) => {
  res.send('API Marketplace Destaque Rodando');
});

// Registrar rotas
app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', portfolioRoutes);

app.get('/api/debug/error-test', (req, res) => {
  throw new Error('Erro de teste proposital para validar o Error Handler Global');
});

// Error Handler Global (DEVE ser o último)
const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

module.exports = app;
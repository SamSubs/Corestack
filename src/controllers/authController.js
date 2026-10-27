const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const logger = require('../utils/logger');

const crypto = require('crypto');

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '15m' }
  );

  const refreshTokenValue = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt
    }
  });

  return { accessToken, refreshTokenValue };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'CUSTOMER' }
    });

    return res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    logger.error('REGISTER_FAILED', error, { ip: req.ip });
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.info('LOGIN_FAILED', { email, ip: req.ip, reason: 'Credenciais inválidas' });
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const { accessToken, refreshTokenValue } = await generateTokens(user);

    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    logger.info('LOGIN_SUCCESS', { userId: user.id, email: user.email, role: user.role, ip: req.ip });
    return res.json({ token: accessToken });
  } catch (error) {
    logger.error('LOGIN_ERROR', error, { ip: req.ip });
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token ausente' });
    }

    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!existingToken || existingToken.expiresAt < new Date()) {
      logger.warn('REFRESH_TOKEN_INVALID', { ip: req.ip });
      if (existingToken) {
        // Token expirado ou reutilizado tardiamente: invalida TODOS os tokens do usuário por segurança
        await prisma.refreshToken.deleteMany({ where: { userId: existingToken.userId } });
      }
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: 'Refresh token inválido ou expirado' });
    }

    // Rotação: invalida o antigo
    await prisma.refreshToken.delete({ where: { id: existingToken.id } });

    const { accessToken, refreshTokenValue } = await generateTokens(existingToken.user);

    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    logger.info('REFRESH_TOKEN_SUCCESS', { userId: existingToken.user.id, ip: req.ip });
    return res.json({ token: accessToken });
  } catch (error) {
    logger.error('REFRESH_TOKEN_ERROR', error, { ip: req.ip });
    return res.status(500).json({ error: 'Erro ao atualizar token' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      const existingToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (existingToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        logger.info('LOGOUT_SUCCESS', { userId: existingToken.userId, ip: req.ip });
      }
    }
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    logger.error('LOGOUT_ERROR', error, { ip: req.ip });
    return res.status(500).json({ error: 'Erro ao fazer logout' });
  }
};

module.exports = { register, login, refresh, logout };

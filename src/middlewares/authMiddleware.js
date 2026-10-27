const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Padronização OBRIGATÓRIA: req.user = { id, email, role }
    if (decoded.id && decoded.email && decoded.role) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      next();
    } else {
      return res.status(401).json({ error: 'Token com formato de identidade inválido' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
const xss = require('xss');

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Sanitiza dados de entrada (xss protection) nas strings
      const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            result[key] = xss(value);
          } else if (typeof value === 'object' && value !== null) {
            result[key] = sanitizeObject(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      };

      req.body = sanitizeObject(req.body);

      // Validação Zod
      const parsedData = schema.parse(req.body);
      req.body = parsedData; // Sobrescreve com dados validados (pode converter strings para números se configurado no schema)
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Erro de validação',
        details: error.errors ? error.errors.map(e => ({ path: e.path.join('.'), message: e.message })) : error.message
      });
    }
  };
};

module.exports = validateRequest;

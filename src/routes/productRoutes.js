const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware');
const { createProduct, getProducts, getProductById } = require('../controllers/productController');
const logger = require('../utils/logger');

// Criar produto (protegido)
// Nota: O adminProductRoutes também possui criação de produto, 
// mas mantemos aqui conforme a estrutura original, agora montado em /api/products
router.post('/', authMiddleware, createProduct);

// Listar produtos (público)
router.get('/', getProducts);
router.get('/:id', getProductById);

const fs = require('fs');

const checkMagicNumber = (filePath) => {
  const buffer = Buffer.alloc(12);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  const hex = buffer.toString('hex').toUpperCase();

  // JPEG: FF D8 FF
  if (hex.startsWith('FFD8FF')) return true;
  // PNG: 89 50 4E 47
  if (hex.startsWith('89504E47')) return true;
  // WEBP: RIFF...WEBP (RIFF starts at 0, WEBP starts at 8)
  if (hex.startsWith('52494646') && buffer.toString('utf8', 8, 12) === 'WEBP') return true;

  return false;
};

/**
 * @route POST /api/products/upload
 * @desc Upload de imagem de produto
 * @access Private (Admin/Auth)
 */
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Por favor, selecione uma imagem.' });
    }

    if (!checkMagicNumber(req.file.path)) {
      fs.unlinkSync(req.file.path);
      logger.error('UPLOAD_FAILED_MAGIC_NUMBER', new Error('Assinatura de arquivo inválida'), { userId: req.user.id });
      return res.status(400).json({ error: 'Arquivo inválido ou corrompido' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Logging avançado
    logger.info('PRODUCT_IMAGE_UPLOAD', {
      userId: req.user.id,
      filename: req.file.filename
    });

    return res.status(200).json({
      image: fileUrl
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload route error:', error);
    return res.status(500).json({ error: 'Erro interno no upload de imagem' });
  }
});

module.exports = router;
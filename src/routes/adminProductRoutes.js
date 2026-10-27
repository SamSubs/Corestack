const { Router } = require('express');
const adminProductController = require('../controllers/adminProductController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { createProductSchema, updateProductSchema } = require('../schemas/validationSchemas');

const router = Router();

// Todas rotas admin requerem estar logado E ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/products', validateRequest(createProductSchema), adminProductController.createProduct);
router.put('/products/:id', validateRequest(updateProductSchema), adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);
router.get('/products', adminProductController.listAllProducts);

module.exports = router;

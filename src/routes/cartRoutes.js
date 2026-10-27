const { Router } = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;

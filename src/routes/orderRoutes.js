const { Router } = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.post('/create', orderController.createOrder);
router.get('/', orderController.getOrders);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/pay', orderController.payOrder);

module.exports = router;

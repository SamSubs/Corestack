const { Router } = require('express');
const adminOrderController = require('../controllers/adminOrderController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/orders', adminOrderController.getAllOrders);
router.patch('/orders/:id/status', adminOrderController.updateOrderStatus);
router.put('/orders/:id/cancel', adminOrderController.approveCancel);
router.put('/orders/:id/ship', adminOrderController.shipOrder);
router.put('/orders/:id/deliver', adminOrderController.deliverOrder);
router.delete('/orders/:id', adminOrderController.deleteOrder);

module.exports = router;

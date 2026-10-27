const express = require('express');
const router = express.Router();

const { getUsers } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// 🔒 PROTEGENDO A ROTA
router.get('/users', authMiddleware, getUsers);

module.exports = router;
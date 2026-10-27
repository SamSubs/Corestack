const express = require('express');
const router = express.Router();

const { register, login, refresh, logout } = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const { registerSchema, loginSchema } = require('../schemas/validationSchemas');

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);

module.exports = router;
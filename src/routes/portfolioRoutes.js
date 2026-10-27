const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const projectController = require('../controllers/projectController');
const contactController = require('../controllers/contactController');

// Services
router.get('/services', serviceController.getAll);
router.get('/services/:id', serviceController.getById);

// Projects
router.get('/projects', projectController.getAll);
router.get('/projects/:id', projectController.getById);

// Contact
router.post('/contact', contactController.submit);

module.exports = router;

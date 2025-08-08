const express = require('express');
const router = express.Router();
const authController = require('../../controllers/login/loginController');

router.post('/login', authController.login);

module.exports = router;

const express = require('express');
const router = express.Router();
const UserController = require('../../../controllers/administrativo/user/userController');

// 1. Defina a rota mais específica (/active) primeiro.
router.get('/active', UserController.getActiveUserCount);

// 2. Defina a rota com o parâmetro dinâmico (:id) depois.
router.get('/:id', UserController.getById);

// Rotas restantes
router.get('/', UserController.getAll);

router.post('/', UserController.insert);

router.put('/:id', UserController.update);

router.delete('/:id', UserController.delete);

module.exports = router;
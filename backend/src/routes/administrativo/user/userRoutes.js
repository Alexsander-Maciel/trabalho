const express = require('express');
const router = express.Router();
const UserController = require('../../../controllers/administrativo/user/userController');

// Defina a rota mais específica (/active/dia) primeiro
router.get('/active/dia', UserController.getActiveUser);

// Depois, a rota /active
router.get('/active', UserController.getActiveUserCount);

// Por último, a rota mais genérica com o parâmetro dinâmico (:id)
router.get('/:id', UserController.getById);

// Rotas restantes
router.get('/', UserController.getAll);

router.post('/', UserController.insert);

router.put('/:id', UserController.update);

router.delete('/:id', UserController.delete);

module.exports = router;
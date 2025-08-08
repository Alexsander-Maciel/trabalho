const express = require('express');
const router = express.Router();
const userGroupController = require('../../../controllers/administrativo/user/userGroupController');

// GET todos os relacionamentos
router.get('/', userGroupController.getAll);

// GET grupos por userId
router.get('/user/:userId', userGroupController.getByUserId);

// POST novo relacionamento
router.post('/', userGroupController.insert);

// PUT (update) um relacionamento
router.put('/:id', userGroupController.update);

// DELETE lógico (soft delete)
router.delete('/:id', userGroupController.softDelete);

module.exports = router;

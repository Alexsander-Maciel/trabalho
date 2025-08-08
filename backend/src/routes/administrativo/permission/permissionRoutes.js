const express = require('express');
const router = express.Router();
const permissionController = require('../../../controllers/administrativo/permission/permissionController');

router.get('/', permissionController.getAll);

router.get('/:id', permissionController.getById);

// A rota POST agora chama a função que decide se deve criar ou atualizar
router.post('/',  permissionController.insert);

router.put('/:id', permissionController.update);

router.delete('/:id', permissionController.softDelete);

module.exports = router;
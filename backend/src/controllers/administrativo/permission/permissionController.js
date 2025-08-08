// controllers/administrativo/permission/permissionController.js

const PermissionModel = require('../../../models/administrativo/permission/permissionModel');

const permissionController = {
  async getAll(req, res) {
    try {
      const permissions = await PermissionModel.getAll();
      res.status(200).json(permissions);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      res.status(500).json({ message: 'Erro ao buscar permissões', error: error.message });
    }
  },

  async getById(req, res) {
    const id = req.params.id; // Este ID é o do MENU
    try {
      const permissions = await PermissionModel.getByMenuId(id);
      if (!permissions || permissions.length === 0) {
        return res.status(200).json([]); // Retorna um array vazio se não houver permissões
      }
      res.status(200).json(permissions);
    } catch (error) {
      console.error('Erro ao buscar permissão por ID do menu:', error);
      res.status(500).json({ message: 'Erro ao buscar permissão por ID do menu', error: error.message });
    }
  },

  async insert(req, res) {
    try {
      const userId = req.user.id;
      const permissionData = { ...req.body, userId };

      if (!permissionData.menu_id) {
          return res.status(400).json({ message: 'ID do menu é obrigatório.' });
      }
      if (!permissionData.user_id && !permissionData.group_id) {
          return res.status(400).json({ message: 'Permissão deve ser atribuída a um usuário ou grupo.' });
      }

      const existingPermission = await PermissionModel.findExistingPermission(permissionData);

      if (existingPermission) {
        return res.status(409).json({ message: 'Já existe uma permissão criada para este usuário/grupo neste menu. Utilize a opção de edição para alterá-la.' });
      } else {
        const result = await PermissionModel.insert(permissionData);
        return res.status(201).json({ message: 'Permissão criada com sucesso!', insertId: result.insertId });
      }

    } catch (error) {
      console.error('Erro ao salvar permissão:', error);
      return res.status(500).json({ message: 'Erro ao salvar permissão', error: error.message });
    }
  },

  async update(req, res) {
    const id = req.params.id; // Este é o ID da PERMISSÃO a ser atualizada
    try {
      const userId = req.user.id;
      const permissionData = { ...req.body, userId };
      
      // Validação
      if (!id) {
          return res.status(400).json({ message: 'ID da permissão é obrigatório para atualização.' });
      }

      const result = await PermissionModel.update(id, permissionData);

      res.status(200).json({ message: 'Permissão atualizada com sucesso', result });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      res.status(500).json({ message: 'Erro ao atualizar permissão', error: error.message });
    }
  },

  async softDelete(req, res) {
    const id = req.params.id;
    try {
      const userId = req.user.id;
      await PermissionModel.softDelete(id, userId);
      res.status(200).json({ message: 'Permissão deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar permissão:', error);
      res.status(500).json({ message: 'Erro ao deletar permissão', error: error.message });
    }
  }
};

module.exports = permissionController;
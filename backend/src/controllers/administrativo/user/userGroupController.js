const UserGroupModel = require('../../../models/administrativo/user/userGroupModel');

const userGroupsController = {
  async getAll(req, res) {
    try {
      const data = await UserGroupModel.getAll();
      res.status(200).json(data);
    } catch (err) {
      console.error('Erro ao buscar todos os user_groups:', err);
      res.status(500).json({ error: 'Erro interno ao buscar user_groups.' });
    }
  },

  async getByUserId(req, res) {
    const { userId } = req.params;
    try {
      const data = await UserGroupModel.getByUserId(userId);
      res.status(200).json(data);
    } catch (err) {
      console.error('Erro ao buscar grupos do usuário:', err);
      res.status(500).json({ error: 'Erro interno ao buscar grupos do usuário.' });
    }
  },

  async insert(req, res) {
    const { user_id, group_id, created_by } = req.body;
    try {
      const result = await UserGroupModel.insert({ user_id, group_id, created_by });
      res.status(201).json({ message: 'Relacionamento inserido com sucesso.', result });
    } catch (err) {
      console.error('Erro ao inserir relacionamento usuário-grupo:', err);
      res.status(500).json({ error: 'Erro interno ao inserir relacionamento.' });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    const { user_id, group_id, updated_by } = req.body;
    try {
      const result = await UserGroupModel.update(id, { user_id, group_id, updated_by });
      res.status(200).json({ message: 'Relacionamento atualizado com sucesso.', result });
    } catch (err) {
      console.error('Erro ao atualizar relacionamento:', err);
      res.status(500).json({ error: 'Erro interno ao atualizar relacionamento.' });
    }
  },

  async softDelete(req, res) {
    const { id } = req.params;
    const { deleted_by } = req.body;
    try {
      const result = await UserGroupModel.softDelete(id, deleted_by);
      res.status(200).json({ message: 'Relacionamento deletado com sucesso.', result });
    } catch (err) {
      console.error('Erro ao deletar relacionamento:', err);
      res.status(500).json({ error: 'Erro interno ao deletar relacionamento.' });
    }
  }
};

module.exports = userGroupsController;

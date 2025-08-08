const db = require('../../../config/db');
const { logAction } = require('../log/logModel');

const UserGroupModel = {
  async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM user_groups WHERE deleted_at IS NULL");
      return rows;
    } catch (error) {
      console.error('Erro ao buscar user_groups:', error);
      throw error;
    }
  },

  async getByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT group_id FROM user_groups WHERE user_id = ? AND deleted_at IS NULL`,
        [userId]
      );
      return rows.map(row => row.group_id);
    } catch (error) {
      console.error('Erro ao buscar grupos por user_id:', error);
      throw error;
    }
  },

  async insert({ user_id, group_id, created_by }) {
    try {
      const [result] = await db.query(
        `INSERT INTO user_groups (user_id, group_id, created_by) VALUES (?, ?, ?)`,
        [user_id, group_id, created_by]
      );
      await logAction('INSERT', 'user_groups', result.insertId, created_by);
      return result;
    } catch (error) {
      console.error('Erro ao inserir user_group:', error);
      throw error;
    }
  },

  async update(id, { user_id, group_id, updated_by }) {
    try {
      const [result] = await db.query(
        `UPDATE user_groups SET user_id = ?, group_id = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`,
        [user_id, group_id, updated_by, id]
      );
      await logAction('UPDATE', 'user_groups', id, updated_by);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar user_group:', error);
      throw error;
    }
  },

  async softDelete(id, deleted_by) {
    try {
      const [result] = await db.query(
        `UPDATE user_groups SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
        [deleted_by, id]
      );
      await logAction('DELETE', 'user_groups', id, deleted_by);
      return result;
    } catch (error) {
      console.error('Erro ao deletar user_group:', error);
      throw error;
    }
  }
};

module.exports = UserGroupModel;

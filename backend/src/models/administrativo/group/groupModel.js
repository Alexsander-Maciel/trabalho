const db = require('../../../config/db');
const { logAction } = require('../log/logModel');

const GroupModel = {
  async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM groups WHERE deleted_at IS NULL");
      return rows;
    } catch (error) {
      console.error('Erro no getAll grupos:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM groups WHERE id = ? AND deleted_at IS NULL", [id]);
      return rows[0];
    } catch (error) {
      console.error('Erro no getById grupo:', error);
      throw error;
    }
  },

  async insert(group) {
    try {
      const [result] = await db.query(
        `INSERT INTO groups (name, created_by) VALUES (?, ?)`,
        [group.name, group.userId]
      );
      await logAction('INSERT', 'groups', result.insertId, group.userId);
      return result;
    } catch (error) {
      console.error('Erro ao inserir grupo:', error);
      throw error;
    }
  },

  async update(id, group) {
    try {
      const [result] = await db.query(
        `UPDATE groups SET name = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`,
        [group.name, group.userId, id]
      );
      await logAction('UPDATE', 'groups', id, group.userId);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      throw error;
    }
  },

  async softDelete(id, userId) {
    try {
      const [result] = await db.query(
        `UPDATE groups SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
        [userId, id]
      );
      await logAction('DELETE', 'groups', id, userId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
      throw error;
    }
  }
};

module.exports = GroupModel;

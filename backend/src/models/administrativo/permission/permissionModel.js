// models/administrativo/permission/permissionModel.js

const db = require('../../../config/db');
const { logAction } = require('../log/logModel');

const PermissionModel = {
  async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT * FROM permissions WHERE deleted_at IS NULL
      `);
      return rows;
    } catch (error) {
      console.error('Erro no getAll permissions:', error);
      throw error;
    }
  },

  async getByMenuId(id) {
    try {
      const [rows] = await db.query(`
        SELECT * FROM permissions WHERE menu_id = ? AND deleted_at IS NULL
      `, [id]);
      return rows;
    } catch (error) {
      console.error('Erro no getByMenuId permission:', error);
      throw error;
    }
  },

  async findExistingPermission(permissionData) {
    let query = `SELECT id FROM permissions WHERE menu_id = ? AND deleted_at IS NULL`;
    let params = [permissionData.menu_id];

    if (permissionData.user_id) {
      query += ` AND user_id = ?`;
      params.push(permissionData.user_id);
    } else if (permissionData.group_id) {
      query += ` AND group_id = ?`;
      params.push(permissionData.group_id);
    } else {
      return null;
    }

    try {
      const [existing] = await db.query(query, params);
      return existing && existing.length > 0 ? existing[0] : null;
    } catch (error) {
      console.error('Erro ao buscar permissão existente:', error);
      throw error;
    }
  },

  async insert(permission) {
    try {
      // Validação de dados foi movida para o controller
      const [result] = await db.query(
        `INSERT INTO permissions 
        (menu_id, user_id, group_id, can_view, can_insert, can_update, can_delete, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          permission.menu_id,
          permission.user_id || null,
          permission.group_id || null,
          permission.can_view,
          permission.can_insert,
          permission.can_update,
          permission.can_delete,
          permission.userId
        ]
      );
  
      await logAction('INSERT', 'permissions', result.insertId, permission.userId);
      return result;
    } catch (error) {
      console.error('Erro ao inserir permission:', error);
      throw error;
    }
  },

  async update(id, permission) {
    try {
      const [result] = await db.query(
        `UPDATE permissions SET 
          menu_id = ?, user_id = ?, group_id = ?, 
          can_view = ?, can_insert = ?, can_update = ?, can_delete = ?, 
          updated_by = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          permission.menu_id,
          permission.user_id || null,
          permission.group_id || null,
          permission.can_view,
          permission.can_insert,
          permission.can_update,
          permission.can_delete,
          permission.userId,
          id
        ]
      );
      // Aqui, a chamada de log foi movida para o controller para garantir que o userId esteja disponível
      return result;
    } catch (error) {
      console.error('Erro ao atualizar permission:', error);
      throw error;
    }
  },

  async softDelete(id, userId) {
    try {
      const [result] = await db.query(
        `UPDATE permissions SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
        [userId, id]
      );
      await logAction('DELETE', 'permissions', id, userId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar permission:', error);
      throw error;
    }
  }
};

module.exports = PermissionModel;
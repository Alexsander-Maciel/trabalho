const db = require('../../../config/db');
const { logAction } = require('../log/logModel');

const UserModel = {
  async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE deleted_at IS NULL");
      return rows;
    } catch (error) {
      console.error('Erro no getAll usuários:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL", [id]);
      return rows[0];
    } catch (error) {
      console.error('Erro no getById usuário:', error);
      throw error;
    }
  },

   async getActiveUserCount() {
  try {
    // A consulta retorna um array com um único objeto: [{ activeCount: 5 }]
    const [rows] = await db.query(
      'SELECT COUNT(*) as activeCount FROM users WHERE last_active >= NOW() - INTERVAL 5 MINUTE'
    );
    
    // Retorna apenas o primeiro (e único) objeto do array
    return rows; 
  } catch (error) {
    console.error('Erro ao buscar a contagem de usuários ativos:', error);
    throw error;
  }
},

 async getActiveUser() {
  try {
    // A consulta retorna um array com um único objeto: [{ activeCount: 5 }]
    const [rows] = await db.query(
      'SELECT *  FROM users WHERE last_active >= NOW() - INTERVAL 5 MINUTE'
    );
    
    // Retorna apenas o primeiro (e único) objeto do array
    return rows[0]; 
  } catch (error) {
    console.error('Erro ao buscar usuários ativos:', error);
    throw error;
  }
},

  async insert(user) {
    try {
      const [result] = await db.query(
        `INSERT INTO users (username, email, password, created_by) VALUES (?, ?, ?, ?)`,
        [user.username, user.email, user.password, user.userId]
      );
      await logAction('INSERT', 'users', result.insertId, user.userId);
      return result;
    } catch (error) {
      console.error('Erro ao inserir usuário:', error);
      throw error;
    }
  },

  async update(id, user) {
    try {
      const [result] = await db.query(
        `UPDATE users SET username = ?, email = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`,
        [user.name, user.email, user.userId, id]
      );
      await logAction('UPDATE', 'users', id, user.userId);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  async softDelete(id, deleted_by) {
    try {
      const [result] = await db.query(
        `UPDATE users SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
        [userId, id]
      );
      await logAction('DELETE', 'users', id, userId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }
};



module.exports = UserModel;
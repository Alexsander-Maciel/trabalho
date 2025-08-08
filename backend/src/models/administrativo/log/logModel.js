const db = require('../../../config/db');

const logAction = async (action, table, recordId, userId) => {
  try {

    await db.query(
      'INSERT INTO logs (user_by, action, table_name, record_id) VALUES (?, ?, ?, ?)',
      [userId, action, table, recordId]
    );
  } catch (error) {
    console.error('Erro ao inserir log:', error);
    // Opcional: você pode relançar ou apenas logar
    // throw error;
  }
};

module.exports = { logAction };

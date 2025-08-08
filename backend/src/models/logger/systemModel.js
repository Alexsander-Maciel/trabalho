// src/utils/SystemLogger.js
const db = require('../../config/db');

class SystemLogger {

 static async logError({  message, stack, route, method  }) {
    try {
      await db.query(
        `INSERT INTO error_logs (route, method, message, stack, user_id) VALUES ( ?, ?, ?, ?, ?)`,
        [route, method, message, stack, userId]
      );
    } catch (logError) {
      console.error('Erro ao registrar log no banco:', logError.message);
    }
  }


  static async logBadResponse(req, res, error = null) {
    try {
    
      await db.query(
        `INSERT INTO error_logs (route, method, message, stack, user_id) VALUES (?, ?, ?, ?, ?)`,
        [
          req.originalUrl || 'Unknown',
          req.method || 'Unknown',
          error?.message || `Resposta com status ${res.statusCode}`,
          error?.stack || null,
          req.user?.id || null
        ]
      );
    } catch (err) {
      console.error('Erro ao registrar resposta fora do padrão:', err.message);
    }
  }
}

module.exports = SystemLogger;

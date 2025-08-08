const db = require('../../config/db');

const saveToken = async (userId, token, createdBy, expiresAt) => {
  await db.query(
    `INSERT INTO tokens (user_id, token, created_at, expires_at, created_by)
     VALUES (?, ?, NOW(), ?, ?)`,
    [userId, token, expiresAt, createdBy]
  );
};

module.exports = { saveToken };

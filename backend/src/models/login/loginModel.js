const db = require('../../config/db');

const findByUsernameOrEmail = async (identifier) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE username = ? OR email = ? AND deleted_at IS NULL',
    [identifier, identifier]
  );
  return rows[0];
};

module.exports = { findByUsernameOrEmail };
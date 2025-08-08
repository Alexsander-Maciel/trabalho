const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Certifique-se de que o caminho está correto

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave-secreta');
    req.user = decoded; // Adiciona dados do usuário à requisição

    // 1. A linha com "await" deve estar dentro de um bloco try/catch e antes de next()
    await db.query('UPDATE users SET last_active = NOW() WHERE id = ?', [req.user.id]);
    
    // 2. Chame next() somente após a operação do banco de dados ser concluída com sucesso
    next();
  } catch (err) {
    console.error('Erro na verificação do token ou na atualização do last_active:', err);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = verifyToken;
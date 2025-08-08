const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyStrictToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    // Decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo');
    const userId = decoded.id;

    //console.log('Usuário decodificado do token:', userId);

    // Consulta o token salvo no banco
    const [rows] = await db.query('SELECT token FROM tokens WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    const savedToken = rows[0]?.token;

    //console.log('Token salvo no banco:', savedToken);
    //console.log('Token enviado:', token);

    if (!savedToken || savedToken !== token) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erro ao verificar token:", err.message);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = verifyStrictToken;
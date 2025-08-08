const authService = require('../../auth/authLogin');

const login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Informe usuário/email e senha' });
  }

  try {
    const { id, token, name } = await authService.login(identifier, password);
    return res.json({ success: true,id, token, name });
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = { login };

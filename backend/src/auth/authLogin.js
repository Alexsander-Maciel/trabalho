const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/login/loginModel');
const tokenModel = require('../models/login/tokenModel');
require('dotenv').config();

const login = async (identifier, password) => {
  const user = await userModel.findByUsernameOrEmail(identifier);
  if (!user) {
    throw new Error('Usuário ou email não encontrado');
  }

  const isPasswordValid = await (password, user.password);
  if (!isPasswordValid) {
    throw new Error('Senha inválida');
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8); // 8 horas

  await tokenModel.saveToken(user.id, token, user.username, expiresAt);

  return { token, id: user.id , name: user.username };
};

module.exports = { login };

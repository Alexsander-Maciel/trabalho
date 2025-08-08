const express = require('express');
require('dotenv').config();
const cors = require('cors');

// Controles
const authMiddleware = require('./src/middleware/authMiddleware');
const verifyStrictToken = require('./src/middleware/authStrict');
const monitorResponses = require('./src/middleware/monitorResponses');


// Rotas
const authRoutes = require('./src/routes/login/authRoutes');
const userRoutes = require('./src/routes/administrativo/user/userRoutes');
const userGroupRoutes = require('./src/routes/administrativo/user/userGroupRoutes');
const groupRoutes = require('./src/routes/administrativo/group/groupRoutes');
const menuRoutes = require('./src/routes/administrativo/menu/menuRoutes');
const permissionRoutes = require('./src/routes/administrativo/permission/permissionRoutes');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
// Se seu monitorResponses quer pegar status de todas as respostas, ele deve ser depois do auth middlewares
app.use(authMiddleware);
app.use(verifyStrictToken);

app.use(monitorResponses);

// Rotas protegidas

app.use('/api/admin/user', userRoutes);
app.use('/api/admin/user-group', userGroupRoutes);
app.use('/api/admin/group', groupRoutes);
app.use('/api/admin/menu', menuRoutes);
app.use('/api/admin/permission', permissionRoutes);



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

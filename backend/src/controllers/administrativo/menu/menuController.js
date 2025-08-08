const MenuModel = require('../../../models/administrativo/menu/menuModel');

 const validateRouteAccess = async (req, res) => {
    const route  = '/' + req.params.route; // Pega a rota da URL (ex: '/admin/usuarios')
    const userId = req.user.id; // Pega o ID do usuário do token
   
    if (!route) {
      return res.status(400).json({ message: 'A rota é obrigatória.' });
    }

    try {
      const menu = await MenuModel.getMenuByRoute(route);
      
      // Caso 1: Menu não existe ou está desativado
      if (!menu) {
        return res.status(404).json({ message: 'A página foi desativada pelo administrador.' });
      }

      // Caso 2: Menu existe, mas o usuário não tem permissão
      const hasPermission = await MenuModel.checkPermissionForUser(menu.id, userId);
      if (!hasPermission) {
        return res.status(403).json({ message: 'Você não tem acesso administrativo para esta página.' });
      }

      // Caso 3: Tudo certo, acesso permitido
      res.status(200).json({ message: 'Acesso liberado.' });

    } catch (error) {
      console.error('Erro ao validar rota:', error);
      res.status(500).json({ message: 'Erro interno ao validar a rota.', error: error.message });
    }
  };

const getAllMenus = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 0; // Pega o parâmetro 'page' da URL, com 0 como padrão
    const limit = parseInt(req.query.limit, 10) || 10; // Pega o parâmetro 'limit' da URL, com 10 como padrão

    const result = await MenuModel.getAll(page, limit);
    res.json(result); // O model já retorna um objeto com 'menus' e 'totalCount'
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os menus' });
  }
};

const getMenuById = async (req, res) => {
  try {
    const id = req.params.id;
    const menu = await MenuModel.getById(id);
    if (!menu) return res.status(404).json({ error: 'Menu não encontrado' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o menu' });
  }
};

const getMenusByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const menus = await MenuModel.getMenusByUserId(userId);
    res.json(menus);
  } catch (error) {
    console.error('Erro ao buscar menus por usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar menus do usuário' });
  }
};


const createMenu = async (req, res) => {
  try {
    const data = req.body;
    const result = await MenuModel.insert(data);
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar o menu' });
  }
};

const updateMenu = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    await MenuModel.update(id, data);
    res.json({ message: 'Menu atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o menu' });
  }
};

const deleteMenu = async (req, res) => {
    const id = req.params.id;
    const { force_delete } = req.body; // Captura o flag para exclusão forçada

    try {
      const userId = req.user.id;
      
      // 1. Verificação de dependências antes de qualquer exclusão
      const hasDependencies = await MenuModel.hasDependencies(id);

      if (hasDependencies && !force_delete) {
        return res.status(409).json({ 
          message: 'Este menu possui submenus ou permissões vinculadas. Para continuar, todas as dependências serão excluídas permanentemente. Deseja prosseguir?'
        });
      }

      // 2. Executa a exclusão em cascata ou a exclusão simples
      await MenuModel.softDelete(id, userId, force_delete);
      
      res.status(200).json({ message: 'Menu deletado com sucesso' });

    } catch (error) {
      console.error('Erro ao deletar menu:', error);
      res.status(500).json({ message: 'Erro ao deletar menu', error: error.message });
    }
};

module.exports = {
  validateRouteAccess,
  getAllMenus,
  getMenuById,
  getMenusByUserId,
  createMenu,
  updateMenu,
  deleteMenu
};
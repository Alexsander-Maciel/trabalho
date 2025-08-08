const db = require('../../../config/db');
const { logAction } = require('../log/logModel');

const MenuModel = {
  
async getMenuByRoute(route) {
    try {
      // Use TRIM() e LOWER() para garantir que a busca seja case-insensitive e livre de espaços
      const [rows] = await db.query(
        `SELECT id, name, deleted_at FROM menus WHERE LOWER(TRIM(route)) = LOWER(TRIM(?))`,
        [route]
      );
      // Retornar o primeiro resultado ou null se não for encontrado
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar menu pela rota:', error);
      throw error;
    }
  },



  async checkPermissionForUser(menuId, userId) {
    try {
      // 1. Verifica permissão direta do usuário
      const [userPerms] = await db.query(
        `SELECT id FROM permissions WHERE menu_id = ? AND user_id = ? AND can_view = 1 AND deleted_at IS NULL`,
        [menuId, userId]
      );
      if (userPerms.length > 0) return true;

      // 2. Se não tiver, verifica permissão através de grupos
      const [groups] = await db.query(
        `SELECT g.id FROM groups g
         JOIN user_groups ug ON g.id = ug.group_id
         WHERE ug.user_id = ?`,
        [userId]
      );

      if (groups.length > 0) {
        const groupIds = groups.map(g => g.id);
        const [groupPerms] = await db.query(
          `SELECT id FROM permissions WHERE menu_id = ? AND group_id IN (?) AND can_view = 1 AND deleted_at IS NULL`,
          [menuId, groupIds]
        );
        return groupPerms.length > 0;
      }
      
      return false; // Nenhuma permissão encontrada
    } catch (error) {
      console.error('Erro ao verificar permissão do usuário:', error);
      throw error;
    }
  },

  async getAll(page = 0, limit = 10) {
    try {
      const offset = page * limit;

      // Query para buscar os menus da página atual com LIMIT e OFFSET
      const [rows] = await db.query(
        "SELECT * FROM menus WHERE deleted_at IS NULL LIMIT ? OFFSET ?",
        [limit, offset]
      );
      
      // Query para contar o total de menus (sem paginação)
      const [totalCountRows] = await db.query(
        "SELECT COUNT(*) AS totalCount FROM menus WHERE deleted_at IS NULL"
      );
      const totalCount = totalCountRows[0].totalCount;

      // Retorna os menus da página e o total geral
      return { menus: rows, totalCount: totalCount };

    } catch (error) {
      console.error('Erro no getAll menus:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const [rows] = await db.query("SELECT * FROM menus WHERE id = ? AND deleted_at IS NULL", [id]);
      return rows[0];
    } catch (error) {
      console.error('Erro no getById menu:', error);
      throw error;
    }
  },

  async getMenusByUserId(userId) {
    try {
      const numericUserId = Number(userId);
  
      // 1. Buscar grupos do usuário
      const [userGroups] = await db.query(
        `SELECT group_id FROM user_groups WHERE user_id = ? AND deleted_at IS NULL`,
        [numericUserId]
      );
      const groupIds = userGroups.map(g => g.group_id);
  
      // 2. Buscar menus com permissão direta
      let query = `
        SELECT DISTINCT m.*
        FROM menus m
        JOIN permissions p ON m.id = p.menu_id
        WHERE m.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND (
            p.user_id = ?
      `;
      const params = [numericUserId];
  
      if (groupIds.length > 0) {
        const placeholders = groupIds.map(() => '?').join(', ');
        query += ` OR p.group_id IN (${placeholders})`;
        params.push(...groupIds);
      }
  
      query += `)`;
  
      const [permittedMenus] = await db.query(query, params);
  
      // 3. Map para evitar duplicação
      const allMenusMap = new Map();
  
      // Adiciona menu e busca pai
      const fetchMenuByIdAndParents = async (id) => {
        if (allMenusMap.has(id)) return;
  
        const [rows] = await db.query(`SELECT * FROM menus WHERE id = ? AND deleted_at IS NULL`, [id]);
        if (rows.length > 0) {
          const menu = rows[0];
          allMenusMap.set(menu.id, menu);
          if (menu.parent_id) {
            await fetchMenuByIdAndParents(menu.parent_id);
          }
        }
      };
  
      // Adiciona filhos
      const fetchChildrenRecursively = async (parentId) => {
        const [rows] = await db.query(`SELECT * FROM menus WHERE parent_id = ? AND deleted_at IS NULL`, [parentId]);
        for (const row of rows) {
          if (!allMenusMap.has(row.id)) {
            allMenusMap.set(row.id, row);
            await fetchChildrenRecursively(row.id);
          }
        }
      };
  
      for (const menu of permittedMenus) {
        allMenusMap.set(menu.id, menu);
  
        if (menu.parent_id) {
          await fetchMenuByIdAndParents(menu.parent_id);
        }
  
        await fetchChildrenRecursively(menu.id);
      }
  
      const allMenus = Array.from(allMenusMap.values());
  
      // 4. Montar árvore
      const buildTree = (items, parentId = null) => {
        return items
          .filter(item => item.parent_id === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.id)
          }));
      };
  
      return buildTree(allMenus);
    } catch (error) {
      console.error('Erro ao buscar menus por usuário:', error);
      throw error;
    }
  },   

  async insert(menu) {
    try {
      const [result] = await db.query(
        `INSERT INTO menus (name, parent_id, route, created_by) VALUES (?, ?, ?, ?)`,
        [menu.name, menu.parent_id || null, menu.route, menu.userId]
      );
      await logAction('INSERT', 'menus', result.insertId, menu.userId);
      return result;
    } catch (error) {
      console.error('Erro ao inserir menu:', error);
      throw error;
    }
  },

  async update(id, menu) {
    try {
      const [result] = await db.query(
        `UPDATE menus SET name = ?, parent_id = ?, route = ?, updated_by = ?, updated_at = NOW() WHERE id = ?`,
        [menu.name, menu.parent_id || null, menu.route, menu.userId, id]
      );
      await logAction('UPDATE', 'menus', id, menu.userId);
      return result;
    } catch (error) {
      console.error('Erro ao atualizar menu:', error);
      throw error;
    }
  },

   async hasDependencies(menuId) {
    try {
      // Verifica submenus (outros menus que têm este como parent_id)
      const [submenus] = await db.query(
        `SELECT id FROM menus WHERE parent_id = ? AND deleted_at IS NULL`,
        [menuId]
      );

      // Verifica permissões atreladas a este menu
      const [permissions] = await db.query(
        `SELECT id FROM permissions WHERE menu_id = ? AND deleted_at IS NULL`,
        [menuId]
      );
      
      return submenus.length > 0 || permissions.length > 0;
    } catch (error) {
      console.error('Erro ao verificar dependências do menu:', error);
      throw error;
    }
  },

  async softDelete(id, userId, force_delete = false) {
    try {
      // Se force_delete for true, primeiro exclui submenus e permissões
      if (force_delete) {
        // Exclui submenus
        await db.query(
          `UPDATE menus SET deleted_at = NOW(), deleted_by = ? WHERE parent_id = ?`,
          [userId, id]
        );
        // Exclui permissões
        await db.query(
          `UPDATE permissions SET deleted_at = NOW(), deleted_by = ? WHERE menu_id = ?`,
          [userId, id]
        );
      }
      
      // Finalmente, exclui o menu principal
      const [result] = await db.query(
        `UPDATE menus SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
        [userId, id]
      );
      
      await logAction('DELETE', 'menus', id, userId);
      return result;
    } catch (error) {
      console.error('Erro ao deletar menu:', error);
      throw error;
    }
  }
};

module.exports = MenuModel;
const GroupModel = require('../../../models/administrativo/group/groupModel');

const getAllGroups = async (req, res) => {
  try {
    const groups = await GroupModel.getAll();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os grupos' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const id = req.params.id;
    const group = await GroupModel.getById(id);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o grupo' });
  }
};

const createGroup = async (req, res) => {
  try {
    const group = req.body;
    const result = await GroupModel.insert(group);
    res.status(201).json({ message: 'Grupo criado com sucesso', id: result.insertId });
  } catch (error) {
    console.error('Erro ao criar o grupo:', error);
    res.status(500).json({ error: 'Erro ao criar o grupo' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const group = req.body;
    await GroupModel.update(id, group);
    res.json({ message: 'Grupo atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o grupo' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const id = req.params.id;
    const { deleted_by } = req.body;
    await GroupModel.softDelete(id, deleted_by);
    res.json({ message: 'Grupo excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir o grupo' });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup
};
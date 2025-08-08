import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Paper,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

// Componente auxiliar para exibir o conteúdo das abas
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Constrói o caminho completo do menu para exibição (ex: 'Menu Principal > Submenu')
const buildMenuPath = (menu, allMenus) => {
  if (!menu) return '';
  if (!menu.parent_id) {
    return menu.name;
  }
  const parentMenu = allMenus.find(m => m.id === menu.parent_id);
  if (parentMenu) {
    return `${buildMenuPath(parentMenu, allMenus)} > ${menu.name}`;
  }
  return menu.name;
};

const MenuDetails = ({ menu, onClose, onMenuCreated, onMenuUpdated, onMenuDeleted }) => {
  if (!menu) {
    console.error("Prop 'menu' é indefinida. Fechando detalhes.");
    return null;
  }
  
  const [editedMenu, setEditedMenu] = useState(menu);
  const [activeTab, setActiveTab] = useState(0);
  const [saveError, setSaveError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userPermissions, setUserPermissions] = useState([]);
  const [groupPermissions, setGroupPermissions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  // Novos estados para busca e paginação de usuários
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Novos estados para busca e paginação de grupos
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [groupPage, setGroupPage] = useState(0);
  
  const isNewMenu = !menu.id;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMenu({ ...editedMenu, [name]: value });
  };
  
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');
      
      const headers = { 'Authorization': `Bearer ${token}` };

      const [menusResponse, usersResponse, groupsResponse, permissionsResponse] = await Promise.all([
        fetch('http://localhost:3001/api/admin/menu', { headers }),
        fetch('http://localhost:3001/api/admin/user', { headers }),
        fetch('http://localhost:3001/api/admin/group', { headers }),
        editedMenu.id 
          ? fetch(`http://localhost:3001/api/admin/permission/${editedMenu.id}`, { headers }) 
          : Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
      ]);
      
      if (!menusResponse.ok) throw new Error('Falha ao buscar menus.');
      if (!usersResponse.ok) throw new Error('Falha ao buscar usuários.');
      if (!groupsResponse.ok) throw new Error('Falha ao buscar grupos.');
      if (editedMenu.id && !permissionsResponse.ok) throw new Error('Falha ao buscar permissões.');

      const menusData = await menusResponse.json();
      const usersData = await usersResponse.json();
      const groupsData = await groupsResponse.json();
      const permissionsData = await permissionsResponse.json();

      setAllMenus(Array.isArray(menusData.menus) ? menusData.menus : menusData);
      setAllUsers(usersData);
      setAllGroups(groupsData);
      
      if (editedMenu.id) {
        setUserPermissions(permissionsData.filter(p => p.user_id));
        setGroupPermissions(permissionsData.filter(p => p.group_id));
      }
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setSaveError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editedMenu) {
      fetchAllData();
    }
  }, [editedMenu.id]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (!token || !userString) {
      alert('Autenticação necessária.');
      return;
    }
    const user = JSON.parse(userString);
    setSaveError('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editedMenu,
          parent_id: editedMenu.parent_id === '' ? null : editedMenu.parent_id,
          userId: user.id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao criar o menu.');
      }
      setSuccessMessage('Menu criado com sucesso!');
      onMenuCreated(data);
    } catch (err) {
      setSaveError(err.message);
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (!token || !userString) {
      alert('Autenticação necessária.');
      return;
    }
    const user = JSON.parse(userString);
    setSaveError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`http://localhost:3001/api/admin/menu/${editedMenu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editedMenu,
          parent_id: editedMenu.parent_id === '' ? null : editedMenu.parent_id,
          userId: user.id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar o menu.');
      }
      setSuccessMessage('Menu atualizado com sucesso!');
      onMenuUpdated(data);
    } catch (err) {
      setSaveError(err.message);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir este menu?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (!token || !userString) {
      alert('Autenticação necessária.');
      return;
    }
    const user = JSON.parse(userString);
    setSaveError('');
    setSuccessMessage('');
    
    // Função auxiliar para realizar a exclusão
    const executeDelete = async (force_delete = false) => {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/menu/${editedMenu.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: user.id, force_delete: force_delete })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // Se o backend retornar 409, exibe a confirmação
          if (response.status === 409) {
            if (window.confirm(data.message)) {
              await executeDelete(true); // Se confirmar, chama a função novamente com o flag
            }
            return;
          }
          throw new Error(data.message || 'Falha ao excluir o menu.');
        }
        
        setSuccessMessage('Menu excluído com sucesso!');
        onMenuDeleted(editedMenu.id);
      } catch (err) {
        setSaveError(err.message);
        console.error(err);
      }
    };

    await executeDelete(); // Chama a função de exclusão pela primeira vez
  };

  const handleAddPermission = (permissionType) => {
    const newPermission = {
      id: `temp-${Date.now()}`,
      menu_id: editedMenu.id,
      user_id: permissionType === 'user' ? '' : null,
      group_id: permissionType === 'group' ? '' : null,
      can_view: false, can_insert: false, can_update: false, can_delete: false
    };
    if (permissionType === 'user') {
      setUserPermissions([...userPermissions, newPermission]);
    } else {
      setGroupPermissions([...groupPermissions, newPermission]);
    }
  };

  const handlePermissionChange = (e, perm) => {
    const { name, checked, value } = e.target;
    
    const isUserPermission = perm.user_id !== null;
    const key = name === 'user_id' || name === 'group_id' ? name : name;
    const newValue = name === 'user_id' || name === 'group_id' ? value : checked;

    const updater = (prevPerms) => prevPerms.map(p =>
      p.id === perm.id ? { ...p, [key]: newValue } : p
    );

    if (isUserPermission) {
      setUserPermissions(updater);
    } else {
      setGroupPermissions(updater);
    }
  };
  
  const handleSavePermission = async (permission) => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (!token || !userString) {
      alert('Autenticação necessária.');
      return;
    }
    const user = JSON.parse(userString);
    
    const isNewPermission = typeof permission.id === 'string' && permission.id.startsWith('temp-');
    
    const payload = {
      menu_id: editedMenu.id,
      user_id: permission.user_id || null,
      group_id: permission.group_id || null,
      can_view: permission.can_view,
      can_insert: permission.can_insert,
      can_update: permission.can_update,
      can_delete: permission.can_delete,
      userId: user.id
    };

    try {
      const url = isNewPermission 
          ? 'http://localhost:3001/api/admin/permission' 
          : `http://localhost:3001/api/admin/permission/${permission.id}`;
      const method = isNewPermission ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao salvar permissão.');
      }
      
      alert(data.message);
      fetchAllData();
    } catch (err) {
      console.log('Erro esperado ao salvar permissão:', err.message);
      alert('Erro ao salvar permissão: ' + err.message);

      const isNewPermission = typeof permission.id === 'string' && permission.id.startsWith('temp-');
      if (isNewPermission) {
          const isUserPermission = permission.user_id !== null;
          if (isUserPermission) {
              setUserPermissions(prevPerms => prevPerms.filter(p => p.id !== permission.id));
          } else {
              setGroupPermissions(prevPerms => prevPerms.filter(p => p.id !== permission.id));
          }
      }
    }
  };
  
  const handleDeletePermission = async (permissionId) => {
    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta permissão?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const userString = localStorage.getItem('user');
      if (!token || !userString) {
        alert('Autenticação necessária.');
        return;
      }
      const user = JSON.parse(userString);

      const response = await fetch(`http://localhost:3001/api/admin/permission/${permissionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });
      if (!response.ok) throw new Error('Falha ao excluir permissão.');
      alert('Permissão excluída com sucesso!');
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir permissão.');
    }
  };

  // --- Lógica de busca e paginação ---
  
  // Funções de paginação
  const handleChangeUserPage = (event, newPage) => { setUserPage(newPage); };
  const handleChangeGroupPage = (event, newPage) => { setGroupPage(newPage); };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
    setGroupPage(0);
  };

  // Filtra as permissões de usuário com base no termo de busca (useMemo para performance)
  const filteredUserPermissions = useMemo(() => {
    if (!userSearchTerm) return userPermissions;
    const lowerCaseSearch = userSearchTerm.toLowerCase();
    return userPermissions.filter(perm => {
      const user = allUsers.find(u => u.id === perm.user_id);
      return user?.username.toLowerCase().includes(lowerCaseSearch);
    });
  }, [userPermissions, allUsers, userSearchTerm]);

  // Filtra as permissões de grupo com base no termo de busca (useMemo para performance)
  const filteredGroupPermissions = useMemo(() => {
    if (!groupSearchTerm) return groupPermissions;
    const lowerCaseSearch = groupSearchTerm.toLowerCase();
    return groupPermissions.filter(perm => {
      const group = allGroups.find(g => g.id === perm.group_id);
      return group?.name.toLowerCase().includes(lowerCaseSearch);
    });
  }, [groupPermissions, allGroups, groupSearchTerm]);

  // Aplica a paginação nos dados filtrados
  const paginatedUserPermissions = useMemo(() => {
    return filteredUserPermissions.slice(userPage * rowsPerPage, userPage * rowsPerPage + rowsPerPage);
  }, [filteredUserPermissions, userPage, rowsPerPage]);

  const paginatedGroupPermissions = useMemo(() => {
    return filteredGroupPermissions.slice(groupPage * rowsPerPage, groupPage * rowsPerPage + rowsPerPage);
  }, [filteredGroupPermissions, groupPage, rowsPerPage]);

  // --- Renderização do componente ---

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          {isNewMenu ? 'Adicionar Novo Menu' : `Detalhes do Menu #${editedMenu.id}`}
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onClose}>
          Sair
        </Button>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" gap={2} mb={3}>
          {isNewMenu ? (
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave}>Gravar</Button>
          ) : (
            <>
              <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={handleUpdate}>Atualizar</Button>
              <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>Excluir</Button>
            </>
          )}
          <Button variant="contained" startIcon={<SearchIcon />}>Pesquisar</Button>
        </Box>
        
        <Box component="form" noValidate autoComplete="off">
            {editedMenu.id && (
              <TextField label="ID" name="id" value={editedMenu.id || ''} disabled fullWidth margin="normal" />
            )}
            <TextField label="Nome do Menu" name="name" value={editedMenu.name || ''} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Rota" name="route" value={editedMenu.route || ''} onChange={handleChange} fullWidth margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel id="parent-menu-select-label">Menu Pai</InputLabel>
              <Select labelId="parent-menu-select-label" id="parent-menu-select" value={editedMenu.parent_id || ''} label="Menu Pai" name="parent_id" onChange={handleChange} disabled={loading}>
                <MenuItem value=""><em>Nenhum (Menu Principal)</em></MenuItem>
                {allMenus.filter(m => m.id !== editedMenu.id).map((menuOption) => (
                  <MenuItem key={menuOption.id} value={menuOption.id}>{buildMenuPath(menuOption, allMenus)}</MenuItem>
                ))}
              </Select>
            </FormControl>
        </Box>
      </Paper>

      <Paper>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Nível de Usuário" disabled={isNewMenu} />
          <Tab label="Grupo" disabled={isNewMenu} />
        </Tabs>
        
        <TabPanel value={activeTab} index={0}>
          <Box display="flex" justifyContent="space-between" mb={2}>
              <TextField
                  label="Localizar Usuário"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: '40%' }}
              />
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddPermission('user')}>
                Adicionar Permissão de Usuário
              </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell align="center">Visualizar</TableCell>
                  <TableCell align="center">Inserir</TableCell>
                  <TableCell align="center">Atualizar</TableCell>
                  <TableCell align="center">Deletar</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUserPermissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={perm.user_id || ''}
                          onChange={(e) => handlePermissionChange(e, perm)}
                          name="user_id"
                        >
                          <MenuItem value=""><em>Selecione</em></MenuItem>
                          {allUsers.map(user => (
                            <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_view} onChange={(e) => handlePermissionChange(e, perm)} name="can_view" /></TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_insert} onChange={(e) => handlePermissionChange(e, perm)} name="can_insert" /></TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_update} onChange={(e) => handlePermissionChange(e, perm)} name="can_update" /></TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_delete} onChange={(e) => handlePermissionChange(e, perm)} name="can_delete" /></TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleSavePermission(perm)}><SaveIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeletePermission(perm.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
              component="div"
              count={filteredUserPermissions.length}
              page={userPage}
              onPageChange={handleChangeUserPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Linhas por página:"
          />
        </TabPanel>
        
        <TabPanel value={activeTab} index={1}>
        <Box display="flex" justifyContent="space-between" mb={2}>
              <TextField
                  label="Localizar Grupo"
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: '40%' }}
              />
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddPermission('group')}>
                Adicionar Permissão de Grupo
              </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Grupo</TableCell>
                  <TableCell align="center">Visualizar</TableCell>
                  <TableCell align="center">Inserir</TableCell>
                  <TableCell align="center">Atualizar</TableCell>
                  <TableCell align="center">Deletar</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedGroupPermissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <FormControl fullWidth>
                        <Select
                          value={perm.group_id || ''}
                          onChange={(e) => handlePermissionChange(e, perm)}
                          name="group_id"
                        >
                           <MenuItem value=""><em>Selecione</em></MenuItem>
                          {allGroups.map(group => (
                            <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_view} onChange={(e) => handlePermissionChange(e, perm)} name="can_view" /></TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_insert} onChange={(e) => handlePermissionChange(e, perm)} name="can_insert" /></TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_update} onChange={(e) => handlePermissionChange(e, perm)} name="can_update" /></TableCell>
                    <TableCell align="center"><Checkbox checked={!!perm.can_delete} onChange={(e) => handlePermissionChange(e, perm)} name="can_delete" /></TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleSavePermission(perm)}><SaveIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDeletePermission(perm.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
              component="div"
              count={filteredGroupPermissions.length}
              page={groupPage}
              onPageChange={handleChangeGroupPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Linhas por página:"
          />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MenuDetails;
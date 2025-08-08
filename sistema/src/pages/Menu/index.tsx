import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Button,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuDetails from './MenuDetails';

const MenuListPage = ({ onMenuUpdate }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(null);
  const navigate = useNavigate();

  // Estados para a paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }
      
      const response = await fetch(
        `http://localhost:3001/api/admin/menu?page=${page}&limit=${rowsPerPage}`, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          navigate('/');
        }
        throw new Error('Falha ao buscar a lista de menus.');
      }
      
      const data = await response.json();
      
      // Adição da verificação: A API retorna um objeto de paginação ou apenas um array?
      if (data.menus && Array.isArray(data.menus)) {
        setMenus(data.menus);
        setTotalCount(data.totalCount || 0); 
      } else if (Array.isArray(data)) {
        setMenus(data);
        setTotalCount(data.length); 
      } else {
        setMenus([]);
        setTotalCount(0);
      }
      
    } catch (err) {
      console.error("Erro ao buscar menus:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [navigate, page, rowsPerPage]);

  const handleOpenMenu = (menu) => {
    setSelectedMenu(menu);
  };

  const handleCloseDetails = () => {
    setSelectedMenu(null);
    onMenuUpdate();
  };

  const handleMenuCreated = () => {
    fetchMenus();
    onMenuUpdate();
  };

  const handleMenuUpdated = () => {
    fetchMenus();
    onMenuUpdate();
  };
  
  const handleMenuDeleted = () => {
    fetchMenus();
    onMenuUpdate();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (selectedMenu) {
    return (
      <MenuDetails 
        menu={selectedMenu} 
        onClose={handleCloseDetails} 
        onMenuCreated={handleMenuCreated}
        onMenuUpdated={handleMenuUpdated}
        onMenuDeleted={handleMenuDeleted}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Menus
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenMenu({})}
        >
          Adicionar
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Rota</TableCell>
                <TableCell>Parent ID</TableCell>
                <TableCell>Criado em</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {menus.map((menu) => (
                <TableRow 
                  key={menu.id}
                  onClick={() => handleOpenMenu(menu)}
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  <TableCell component="th" scope="row">{menu.id}</TableCell>
                  <TableCell>{menu.name}</TableCell>
                  <TableCell>{menu.route}</TableCell>
                  <TableCell>{menu.parent_id || '-'}</TableCell>
                  <TableCell>{new Date(menu.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}
    </Container>
  );
};

export default MenuListPage;
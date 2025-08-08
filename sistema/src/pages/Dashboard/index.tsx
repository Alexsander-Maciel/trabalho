import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './styles.css';

// Importando componentes do Material UI
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

// Importando ícones para os cards
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const DashboardPage = () => {
  // Estado para a lista de usuários
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  // Estado para a contagem de usuários ativos
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(true);
  const [errorActiveUsers, setErrorActiveUsers] = useState(null);

  // Estado para a contagem de produtos
  const [productCount, setProductCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);

  const navigate = useNavigate();

  // Função genérica para buscar dados da API
  const fetchData = async (url) => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      throw new Error('Token não encontrado');
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        navigate('/');
        throw new Error('Token inválido ou expirado');
      }

      if (!response.ok) {
        throw new Error('Erro na rede ou no servidor');
      }

      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Efeito para buscar a lista de todos os usuários
  useEffect(() => {
    const fetchUsersData = async () => {
      setLoadingUsers(true);
      try {
        const data = await fetchData('http://localhost:3001/api/admin/user');
        setUsers(data);
      } catch (err) {
        setErrorUsers(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsersData();
  }, [navigate]);

  // Efeito para buscar a contagem de usuários ativos
  useEffect(() => {
    const fetchActiveUsersData = async () => {
      setLoadingActiveUsers(true);
      try {
        const data = await fetchData('http://localhost:3001/api/admin/user/active');
        setActiveUserCount(data.activeCount);
      } catch (err) {
        setErrorActiveUsers(err.message);
      } finally {
        setLoadingActiveUsers(false);
      }
    };
    fetchActiveUsersData();
  }, [navigate]);

  // Efeito para buscar a contagem de produtos
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoadingProducts(true);
      try {
        const data = await fetchData('http://localhost:3001/api/admin/products/count'); // Rota para contar produtos
        setProductCount(data.productCount);
      } catch (err) {
        setErrorProducts(err.message);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProductsData();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard de Administração</h1>
        <p>Visão geral do sistema.</p>
        <nav>
          <Link to="/">Voltar para a Página Inicial</Link>
        </nav>
      </header>

      {/* Container flexível para os cards usando Grid do MUI */}
      <Box sx={{ flexGrow: 1, my: 4 }}>
        <Grid container spacing={2}>
          {/* Card 1: Usuários Ativos */}
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderLeft: '5px solid #007bff' }}>
              <CardContent>
                <GroupIcon sx={{ fontSize: 40, color: '#007bff' }} />
                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                  Usuários Ativos
                </Typography>
                {loadingActiveUsers ? (
                  <CircularProgress />
                ) : errorActiveUsers ? (
                  <Typography color="error">{errorActiveUsers}</Typography>
                ) : (
                  <Typography variant="h3" color="#007bff" sx={{ fontWeight: 'bold' }}>
                    {activeUserCount}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Total de Usuários */}
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderLeft: '5px solid #28a745' }}>
              <CardContent>
                <GroupIcon sx={{ fontSize: 40, color: '#28a745' }} />
                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                  Total de Usuários
                </Typography>
                {loadingUsers ? (
                  <CircularProgress />
                ) : errorUsers ? (
                  <Typography color="error">{errorUsers}</Typography>
                ) : (
                  <Typography variant="h3" color="#28a745" sx={{ fontWeight: 'bold' }}>
                    {users.length}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Total de Produtos */}
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderLeft: '5px solid #ffc107' }}>
              <CardContent>
                <ShoppingCartIcon sx={{ fontSize: 40, color: '#ffc107' }} />
                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                  Total de Produtos
                </Typography>
                {loadingProducts ? (
                  <CircularProgress />
                ) : errorProducts ? (
                  <Typography color="error">{errorProducts}</Typography>
                ) : (
                  <Typography variant="h3" color="#ffc107" sx={{ fontWeight: 'bold' }}>
                    {productCount}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <hr className="divider" />

      {/* Tabela de Usuários */}
      <section className="dashboard-section">
        <h2>Lista de Usuários</h2>
        {/* ... código da tabela ... */}
      </section>
    </div>
  );
};

export default DashboardPage;
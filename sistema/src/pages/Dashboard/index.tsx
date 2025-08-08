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
import Divider from '@mui/material/Divider';

// Importando ícones para os cards
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';

// Importando o novo componente da tabela
import UsersTable from '../../components/User/UsersTable';

const DashboardPage = () => {
  // Estado para a lista de TODOS os usuários
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  // Estado para a contagem de usuários ativos
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [loadingActiveUserCount, setLoadingActiveUserCount] = useState(true);
  const [errorActiveUserCount, setErrorActiveUserCount] = useState(null);

  // NOVO: Estado para a lista de usuários ATIVOS DO DIA
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(true);
  const [errorActiveUsers, setErrorActiveUsers] = useState(null);

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
  const fetchActiveUserCountData = async () => {
    setLoadingActiveUserCount(true);
    try {
      const data = await fetchData('http://localhost:3001/api/admin/user/active');
      
      // Ajuste aqui para acessar o primeiro item do array
      if (Array.isArray(data) && data.length > 0) {
        setActiveUserCount(data[0].activeCount);
      } else {
        // Se a API retornar uma lista vazia, a contagem é 0
        setActiveUserCount(0);
      }
    } catch (err) {
      setErrorActiveUserCount(err.message);
    } finally {
      setLoadingActiveUserCount(false);
    }
  };
  fetchActiveUserCountData();
}, [navigate]);

  // Efeito para buscar a contagem de produtos
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoadingProducts(true);
      try {
        const data = await fetchData('http://localhost:3001/api/admin/products/count');
        setProductCount(data.productCount);
      } catch (err) {
        setErrorProducts(err.message);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProductsData();
  }, [navigate]);

  // NOVO: Efeito para buscar a lista de usuários ativos do dia
  useEffect(() => {
    const fetchActiveUsers = async () => {
      setLoadingActiveUsers(true);
      try {
        // Usando a nova rota dedicada para usuários ativos do dia
        const data = await fetchData('http://localhost:3001/api/admin/user/active/dia');
        setActiveUsers(data);
      } catch (err) {
        setErrorActiveUsers(err.message);
      } finally {
        setLoadingActiveUsers(false);
      }
    };
    fetchActiveUsers();
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

      <Box sx={{ flexGrow: 1, p: 4, my: 4, bgcolor: '#f4f6f8' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderLeft: '5px solid #007bff', boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PersonPinCircleIcon sx={{ fontSize: 48, color: '#007bff' }} />
                <Typography variant="h6" component="div" sx={{ mt: 1, mb: 1 }}>
                  Usuários Ativos
                </Typography>
                {loadingActiveUserCount ? (
                  <CircularProgress size={24} />
                ) : errorActiveUserCount ? (
                  <Typography color="error">{errorActiveUserCount}</Typography>
                ) : (
                  <Typography variant="h3" color="#007bff" sx={{ fontWeight: 'bold' }}>
                    {activeUserCount}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderLeft: '5px solid #28a745', boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <GroupIcon sx={{ fontSize: 48, color: '#28a745' }} />
                <Typography variant="h6" component="div" sx={{ mt: 1, mb: 1 }}>
                  Total de Usuários
                </Typography>
                {loadingUsers ? (
                  <CircularProgress size={24} />
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
          
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ borderLeft: '5px solid #ffc107', boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <ShoppingCartIcon sx={{ fontSize: 48, color: '#ffc107' }} />
                <Typography variant="h6" component="div" sx={{ mt: 1, mb: 1 }}>
                  Total de Produtos
                </Typography>
                {loadingProducts ? (
                  <CircularProgress size={24} />
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

      <Divider sx={{ my: 4 }} />

      {/* Seção para a Tabela de Usuários Ativos do Dia */}
      <section className="dashboard-section">
        <h2>Usuários Ativos do Dia</h2>
        {loadingActiveUsers ? (
          <CircularProgress />
        ) : errorActiveUsers ? (
          <Typography color="error">Erro ao carregar usuários ativos: {errorActiveUsers}</Typography>
        ) : (
          <UsersTable users={activeUsers} />
        )}
      </section>

      <Divider sx={{ my: 4 }} />
      
      {/* Seção para a Tabela de Todos os Usuários */}
      <section className="dashboard-section">
        <h2>Lista Completa de Usuários</h2>
        {loadingUsers ? (
          <CircularProgress />
        ) : errorUsers ? (
          <Typography color="error">Erro ao carregar usuários: {errorUsers}</Typography>
        ) : (
          <UsersTable users={users} />
        )}
      </section>

    </div>
  );
};

export default DashboardPage;
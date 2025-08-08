import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import Navbar from '../components/Navbar'; 

const ProtectedLayout = ({ menuUpdateTrigger }) => {
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState({ granted: false, message: '' });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const validateRoute = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      
      const currentRoute = location.pathname;
      console.log('Frontend: Tentando validar a rota:', currentRoute);

      setLoading(true);
      try {
        // A URL é construída com o path parameter, como você solicitou.
        // Ex: http://localhost:3001/api/admin/menu/validate-route/dashboard
        const response = await fetch(`http://localhost:3001/api/admin/menu/validate-route${currentRoute}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setAccess({ granted: true, message: '' });
        } else {
          const data = await response.json();
          setAccess({ granted: false, message: data.message || 'Acesso negado.' });
        }
      } catch (error) {
        console.error('Erro de validação de rota no frontend:', error);
        setAccess({ granted: false, message: 'Erro ao validar o acesso. Verifique a conexão com o servidor.' });
      } finally {
        setLoading(false);
      }
    };

    validateRoute();
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!access.granted) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh" textAlign="center">
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6">{access.message}</Typography>
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>Voltar</Button>
      </Box>
    );
  }
  
  return (
    <>
      <Navbar menuUpdateTrigger={menuUpdateTrigger} />
      <Outlet />
    </>
  );
};

export default ProtectedLayout;

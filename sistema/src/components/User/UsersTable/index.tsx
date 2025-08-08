import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const UsersTable = ({ users }) => {
  // A verificação robusta continua, garantindo que `users` é um array
  if (!users || !Array.isArray(users) || users.length === 0) {
    return (
      <Typography sx={{ mt: 2 }}>
        Nenhum usuário encontrado.
      </Typography>
    );
  }

  // Função para verificar se a data de atividade é de hoje
  const isUserActiveToday = (lastActiveTimestamp) => {
    if (!lastActiveTimestamp) return false;

    const today = new Date();
    const lastActivityDate = new Date(lastActiveTimestamp);

    return (
      lastActivityDate.getDate() === today.getDate() &&
      lastActivityDate.getMonth() === today.getMonth() &&
      lastActivityDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 3, borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {isUserActiveToday(user.last_active) ? 'Ativo' : 'Inativo'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;
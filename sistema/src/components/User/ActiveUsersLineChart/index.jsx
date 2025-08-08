import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Registra os componentes necessários para o Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ActiveUsersLineChart = ({ data, loading, error }) => {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Carregando dados...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="300px">
            <Typography color="error">Erro ao carregar o gráfico: {error}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.map(item => item.date), // Eixo X: Datas
    datasets: [
      {
        label: 'Usuários Ativos por Dia',
        data: data.map(item => item.count), // Eixo Y: Contagem
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Usuários Ativos Diariamente',
      },
    },
    scales: {
        y: {
          beginAtZero: true,
        }
      }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  );
};

export default ActiveUsersLineChart;
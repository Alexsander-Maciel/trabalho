import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Bem-vindo ao Sistema!</h1>
      <p>Esta é a página inicial da sua aplicação React.</p>
      <nav>
        <Link to="/dashboard">Ir para o Dashboard</Link>
      </nav>
    </div>
  );
};

export default HomePage;
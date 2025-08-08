import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedLayout from './middleware/ProtectedLayout';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import HomePage from './pages/Home';
import MenuListPage from './pages/Menu';

function App() {
  const [menuUpdateTrigger, setMenuUpdateTrigger] = useState(0);

  const handleMenuUpdate = () => {
    setMenuUpdateTrigger(prev => prev + 1);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de login, que não precisa de proteção */}
        <Route path="/" element={<LoginPage />} />

        {/* Grupo de rotas protegidas. Todas as rotas aqui serão validadas pelo ProtectedLayout */}
        <Route element={<ProtectedLayout menuUpdateTrigger={menuUpdateTrigger} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/menus" element={<MenuListPage onMenuUpdate={handleMenuUpdate} />} />
        </Route>

        {/* Rota para 404 - Página não encontrada. Não precisa de proteção. */}
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

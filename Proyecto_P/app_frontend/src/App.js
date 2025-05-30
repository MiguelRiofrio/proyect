// src/App.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Drawer, CssBaseline, ThemeProvider } from '@mui/material';
import Header from './components/Header';
import Sidebar from './components/Siderbar';
import AppRoutes from './routes/AppRoutes';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import theme from './theme'; // Importa el tema personalizado

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      if (location.pathname !== '/login') {
        navigate('/login');
      }
    }
    setIsLoading(false);
  }, [location, navigate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, location, navigate]);

  const handleLogin = (access, role) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('user_role', role);
    setIsAuthenticated(true);
    setUserRole(role);
    navigate('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return <div className="loading-screen">Cargando...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline aplica una base consistente de estilos */}
      <CssBaseline />
      <div className="app-container">
        {location.pathname !== '/login' && (
          <header className="header">
            <Header
              isAuthenticated={isAuthenticated}
              handleLogout={handleLogout}
              toggleSidebar={toggleSidebar}
            />
          </header>
        )}

        <Drawer anchor="left" open={sidebarOpen} onClose={toggleSidebar}>
          {isAuthenticated && <Sidebar />}
        </Drawer>

        <main className="main-content">
          <div className="body-content">
            <AppRoutes
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              handleLogin={handleLogin}
            />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;

// Sidebar.js
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListGroup, ListGroupItem, Container } from 'reactstrap';
import {
  Home,
  Dashboard,
  ListAlt,
  Map,
  LineStyleOutlined,
  Analytics as AnalyticsIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const Sidebar = () => {
  const userRole = localStorage.getItem('user_role'); // Obtener el rol desde localStorage

  // Estado para manejar el submenú de Complementos
  const [isComplementosSubMenuOpen, setIsComplementosSubMenuOpen] = useState(false);

  // Función para alternar la visibilidad del submenú de Complementos
  const toggleComplementosSubMenu = () => {
    setIsComplementosSubMenuOpen(!isComplementosSubMenuOpen);
  };

  // Definir las opciones de navegación para cada rol
  const navigationOptions = {
    editor: [
      {
        to: '/actividadeslist',
        label: 'Lista de Actividades',
        icon: <ListAlt style={{ marginRight: '10px' }} />,
      },
      {
        label: 'Lista de Complementos',
        icon: <LineStyleOutlined style={{ marginRight: '10px' }} />,
        subMenu: [
          { to: '/puertos', label: 'Lista Puertos' },
          { to: '/personas', label: 'Lista de Personas' },
          { to: '/embarcaciones', label: 'Lista de Embarcaciones' },
          { to: '/especies', label: 'Lista de Especies' },
        ],
      },
    ],
    user: [
      {
        to: '/home',
        label: 'Home',
        icon: <Home style={{ marginRight: '10px' }} />,
      },
      {
        to: '/dashboard',
        label: 'Gráficos',
        icon: <Dashboard style={{ marginRight: '10px' }} />,
      },
      {
        to: '/estadistica',
        label: 'Estadística',
        icon: <AnalyticsIcon style={{ marginRight: '10px' }} />,
      },
      {
        to: '/mapa',
        label: 'Mapa',
        icon: <Map style={{ marginRight: '10px' }} />,
      },
      {
        to: '/reporte',
        label: 'Reporte',
        icon: <ReceiptIcon style={{ marginRight: '10px' }} />,
      },
      {
        to: '/actividadeslist',
        label: 'Lista de Actividades',
        icon: <ListAlt style={{ marginRight: '10px' }} />,
      },
      {
        label: 'Lista de Complementos',
        icon: <LineStyleOutlined style={{ marginRight: '10px' }} />,
        subMenu: [
          { to: '/puertos', label: 'Lista Puertos' },
          { to: '/personas', label: 'Lista de Personas' },
          { to: '/embarcaciones', label: 'Lista de Embarcaciones' },
          { to: '/especies', label: 'Lista de Especies' },
        ],
      },
    ],
    superuser: [
      {
        to: '/gestionUser',
        label: 'Panel Administrador',
        icon: <AdminPanelSettingsIcon style={{ marginRight: '10px' }} />,
      },
    ],
  };

  // Determinar las opciones a mostrar según el rol del usuario
  let currentNavigation = [];

  if (userRole === 'superuser') {
    // Superusuario ve todas las opciones de usuario más las de administrador
    currentNavigation = [...navigationOptions.user, ...navigationOptions.superuser];
  } else if (userRole === 'user') {
    // Usuario estándar ve todas las opciones de usuario
    currentNavigation = [...navigationOptions.user];
  } else if (userRole === 'editor') {
    // Editor ve solo sus opciones específicas
    currentNavigation = [...navigationOptions.editor];
  } else {
    // Opcional: manejar roles desconocidos o no autenticados
    currentNavigation = [];
  }

  return (
    <div
      className='sidebar'
      style={{
        width: '240px',
        backgroundColor: '#f4f4f4',
        height: '100vh',
        position: 'fixed',
      }}
    >
      <Container className="p-3 text-center">
        <h3 style={{ color: '#007bff', marginBottom: '10px' }}>Navegación</h3>
      </Container>

      <ListGroup flush>
        {currentNavigation.map((item, index) => {
          if (item.subMenu) {
            return (
              <div key={index}>
                <ListGroupItem
                  action
                  onClick={toggleComplementosSubMenu}
                  style={{ cursor: 'pointer' }}
                >
                  {item.icon} {item.label}
                </ListGroupItem>
                {isComplementosSubMenuOpen && (
                  <div style={{ marginLeft: '20px' }}>
                    <ListGroup flush>
                      {item.subMenu.map((subItem, subIndex) => (
                        <ListGroupItem tag={NavLink} to={subItem.to} action key={subIndex}>
                          {subItem.label}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </div>
                )}
              </div>
            );
          }

          return (
            <ListGroupItem tag={NavLink} to={item.to} action key={index}>
              {item.icon} {item.label}
            </ListGroupItem>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default Sidebar;

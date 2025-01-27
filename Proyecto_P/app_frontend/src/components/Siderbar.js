import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListGroup, ListGroupItem, Container } from 'reactstrap';
import { Home, Dashboard, ListAlt, Map, LineStyleOutlined } from '@mui/icons-material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptIcon from '@mui/icons-material/Receipt';

const Sidebar = () => {
  const userRole = localStorage.getItem('user_role'); // Obtener el rol desde localStorage
  
  // Estado para manejar el submenú de Puertos
  const [isPuertosSubMenuOpen, setIsPuertosSubMenuOpen] = useState(false);

  // Función para alternar la visibilidad del submenú de Puertos
  const togglePuertosSubMenu = () => {
    setIsPuertosSubMenuOpen(!isPuertosSubMenuOpen);
  };

  return (
    <div 
      className='sidebar' 
      style={{
        width: '240px',
        backgroundColor: '#f4f4f4',
        height: '100vh',
        position: 'fixed'
      }}
    >
      <Container className="p-3 text-center">
        <h3 style={{ color: '#007bff', marginBottom: '10px' }}>Navegación</h3>
      </Container>
      
      <ListGroup flush>

        {/* Opción Home */}
        <ListGroupItem tag={NavLink} to="/" action>
          <Home style={{ marginRight: '10px' }} /> Home
        </ListGroupItem>

        {/* Opción Graficos */}
        <ListGroupItem tag={NavLink} to="/dashboard" action>
          <Dashboard style={{ marginRight: '10px' }} /> Gráficos  
        </ListGroupItem>

        {/* Opción Estadística */}
        <ListGroupItem tag={NavLink} to="/estadistica" action>
          <AnalyticsIcon style={{ marginRight: '10px' }} /> Estadística  
        </ListGroupItem>

        {/* Opción Mapa */}
        <ListGroupItem tag={NavLink} to="/mapa" action>
          <Map style={{ marginRight: '10px' }} /> Mapa
        </ListGroupItem>

        {/* Opción Reporte */}
        <ListGroupItem tag={NavLink} to="/reporte" action>
          <ReceiptIcon style={{ marginRight: '10px' }} /> Reporte
        </ListGroupItem>

        {/* Opción Lista de Actividades */}
        <ListGroupItem tag={NavLink} to="/actividadeslist" action>
          <ListAlt style={{ marginRight: '10px' }} /> Lista de Actividades
        </ListGroupItem>

        {/* Opción con Submenú de Puertos */}
        <ListGroupItem 
          action
          onClick={togglePuertosSubMenu} 
          style={{ cursor: 'pointer' }}
        >
          <LineStyleOutlined style={{ marginRight: '10px' }} />
          Lista de Complemento 
        </ListGroupItem>

        {/** Submenú de Puertos (mini lista) */}
        {isPuertosSubMenuOpen && (
          <div style={{ marginLeft: '20px' }}>
            <ListGroup flush>
              <ListGroupItem tag={NavLink} to="/puertos" action>
                Lista puertos
              </ListGroupItem>
              <ListGroupItem tag={NavLink} to="/personas" action>
                Lista de personas
              </ListGroupItem>
              <ListGroupItem tag={NavLink} to="/embarcaciones" action>
                Lista de embarcacion
              </ListGroupItem>
              <ListGroupItem tag={NavLink} to="/especies" action>
                Lista de especie
              </ListGroupItem>
              {/* Agrega más puertos si lo requieres */}
            </ListGroup>
          </div>
        )}

        {/* Panel Administrador solo para admin */}
        {userRole === 'admin' && (
          <ListGroupItem tag={NavLink} to="/gestionUser" action>
            <AdminPanelSettingsIcon style={{ marginRight: '10px' }} /> Panel Administrador
          </ListGroupItem>
        )}
      </ListGroup>
    </div>
  );
};

export default Sidebar;

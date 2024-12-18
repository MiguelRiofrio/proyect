import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { Home, Dashboard, ListAlt, Map, ExpandLess, ExpandMore } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Container } from 'reactstrap';

const Sidebar = () => {
  const userRole = localStorage.getItem('user_role'); // Obtener el rol desde localStorage
  const [isMapSubMenuOpen, setIsMapSubMenuOpen] = useState(false); // Estado para manejar el submenú

  const toggleMapSubMenu = () => {
    setIsMapSubMenuOpen(!isMapSubMenuOpen); // Alternar la visibilidad del submenú
  };

  return (
    <div className='sidebar' style={{ width: '240px', backgroundColor: '#f4f4f4', height: '100vh', position: 'fixed' }}>
      <Container className="p-3 text-center">
        <h3 style={{ color: '#007bff', marginBottom: '10px' }}>Navegación</h3>
      </Container>
      
      <ListGroup flush>
        <ListGroupItem tag={NavLink} to="/" action>
          <Home style={{ marginRight: '10px' }} /> Home
        </ListGroupItem>
        <ListGroupItem tag={NavLink} to="/dashboard" action>
          <Dashboard style={{ marginRight: '10px' }} /> Dashboard
        </ListGroupItem>
        {/* Submenú para Map */}
        <ListGroupItem action onClick={toggleMapSubMenu}>
          <Map style={{ marginRight: '10px' }} /> Map
          {isMapSubMenuOpen ? <ExpandLess style={{ float: 'right' }} /> : <ExpandMore style={{ float: 'right' }} />}
        </ListGroupItem>
        <Collapse isOpen={isMapSubMenuOpen}>
          <ListGroup flush className="pl-4">
            <ListGroupItem tag={NavLink} to="/mapacaptura" action>
              Mapa Captura
            </ListGroupItem>
            <ListGroupItem tag={NavLink} to="/mapaavistamiento" tipo={"a"} action>
              Mapa Incidencia
            </ListGroupItem>
            <ListGroupItem tag={NavLink} to="/mapaincidencia" action>
              Mapa Avistamiento
            </ListGroupItem>
          </ListGroup>
        </Collapse>
        <ListGroupItem tag={NavLink} to="/reporte" action>
          <ReceiptIcon style={{ marginRight: '10px' }} /> Report
        </ListGroupItem>
        <ListGroupItem tag={NavLink} to="/actividadeslist" action>
          <ListAlt style={{ marginRight: '10px' }} /> Lista de Actividades
        </ListGroupItem>

        {/* Mostrar la opción de "Register" solo para administradores */}
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

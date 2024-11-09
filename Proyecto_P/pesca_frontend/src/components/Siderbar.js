import React from 'react';
import { NavLink } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'reactstrap';
import { Home, Dashboard, ListAlt, Map  } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Container } from 'reactstrap';
const Sidebar = () => {
  const userRole = localStorage.getItem('user_role'); // Obtener el rol desde localStorage

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
        <ListGroupItem tag={NavLink} to="/mapacaptura" action>
          <Map style={{ marginRight: '10px' }} /> Map
        </ListGroupItem>
        <ListGroupItem tag={NavLink} to="/actividades" action>
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

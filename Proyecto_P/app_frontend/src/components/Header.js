import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import './Header.css';

const Header = ({ isAuthenticated, handleLogout, toggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Controlar la apertura del menú desplegable del usuario
  const toggleUserMenu = () => setDropdownOpen(!dropdownOpen);

 

  return (
    <header className="header d-flex justify-content-between align-items-center p-3 bg-light shadow-sm">
      {/* Ícono Hamburger para abrir el Sidebar */}
      <Button
        color="link"
        aria-label="Toggle Sidebar"
        onClick={toggleSidebar}
        className="icon-button"
      >
        <MenuIcon style={{ fontSize: '28px' }} />
      </Button>

      {/* Navegación al Home */}
      <NavLink
        to="/home"
        className="header-title text-dark font-weight-bold"
        style={{ fontSize: '1.5rem', textDecoration: 'none' }}
      >
          Gestor de Especies Vulnerables
      </NavLink>

     

      {/* Menú de usuario */}
      {isAuthenticated && (
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggleUserMenu}>
          <DropdownToggle
            caret
            color="link"
            className="user-menu-icon"
            style={{ color: '#000', fontSize: '24px' }}
          >
            <AccountCircle />
          </DropdownToggle>
          <DropdownMenu end>
            {/* Navegar al perfil */}
            <DropdownItem
              onClick={() => {
                navigate('/perfil');
                toggleUserMenu();
              }}
            >
              Perfil
            </DropdownItem>
            <DropdownItem divider />
            {/* Cerrar sesión */}
            <DropdownItem onClick={handleLogout}>Cerrar Sesión</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      )}
    </header>
  );
};

export default Header;

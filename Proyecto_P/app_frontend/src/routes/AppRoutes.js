// AppRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import ActividadPesqueraList from '../pages/crud/ActividadPesqueraList';
import AgregarActividadPesquera from '../pages/crud/AgregarActividad';
import EditarActividadPesquera from '../pages/crud/EditarActividadPesquera';
import DetalleActividadPesquera from '../pages/crud/DetalleActividadPesquera';
import { routerCrudRoutes } from '../pages/crud/Component/routerCrudRoutes';
import Perfil from '../pages/users/Perfil';
import Dashboard from '../pages/Dashboard_Palangre/Dashboard';
import Login from '../pages/login/Login';
import GestionUsuarios from '../pages/users/GestionUsuarios';
import Estadistica from '../pages/Estadistica/EstadisticasPesqueras';
import Reporte from '../pages/reporte/Reporte';
import Mapa from '../pages/Mapa/Mapa';
import { useLocation } from 'react-router-dom';

const AppRoutes = ({ isAuthenticated, userRole, handleLogin }) => {
  const location = useLocation();

  // Definir rutas disponibles para cada rol
  const adminRoutes = (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/actividadeslist" element={<ActividadPesqueraList />} />
      <Route path="/agregar" element={<AgregarActividadPesquera />} />
      <Route path="/editar/:id" element={<EditarActividadPesquera />} />
      <Route path="/detalle/:id" element={<DetalleActividadPesquera />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/estadistica" element={<Estadistica />} />
      <Route path="/reporte" element={<Reporte />} />
      {routerCrudRoutes}
      <Route path="/gestionUser" element={<GestionUsuarios />} />
      {/* Redirigir cualquier otra ruta al dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </>
  );

  const editorRoutes = (
    <>
      <Route path="/actividadeslist" element={<ActividadPesqueraList />} />
      {/* Redirigir cualquier otra ruta al /actividadeslist */}
      <Route path="*" element={<Navigate to="/actividadeslist" />} />
      {routerCrudRoutes}
    </>
  );

  return (
    <div className={location.pathname === '/login' ? 'login-page' : 'app-page'}>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        {isAuthenticated ? (
          userRole === 'admin' ? (
            adminRoutes
          ) : userRole === 'editor' ? (
            editorRoutes
          ) : (
            // Opcional: manejar otros roles o restringir acceso
            <Route path="*" element={<Navigate to="/dashboard" />} />
          )
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </div>
  );
};

export default AppRoutes;

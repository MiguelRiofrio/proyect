// AppRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import ActividadPesqueraList from '../pages/crud/ActividadPesqueraList';
import AgregarActividadPesquera from '../pages/crud/AgregarActividadPesquera';
import EditarActividadPesquera from '../pages/crud/EditarActividadPesquera';
import DetalleActividadPesquera from '../pages/crud/DetalleActividadPesquera';
import Perfil from '../pages/users/Perfil';
import Dashboard from '../pages/Dashboard_Palangre/Dashboard';
import MapaCaptura from '../pages/MapaCaptura/MapaCaptura';
import MapaAvistamiento from '../pages/MapaAvistamiento/MapaAvistamiento';
import MapaIncidente from '../pages/MapaIncidentes/MapaIncidentes';
import Login from '../pages/login/Login';
import GestionUsuarios from '../pages/users/GestionUsuarios';
import Reporte from '../pages/reporte/Reporte';
const AppRoutes = ({ isAuthenticated, userRole, handleLogin }) => {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mapacaptura" element={<MapaCaptura />} />
          <Route path="/mapaavistamiento" element={<MapaAvistamiento />} />
          <Route path="/mapaincidencia" element={<MapaIncidente />} />
          <Route path="/actividades" element={<ActividadPesqueraList />} />
          <Route path="/agregar" element={<AgregarActividadPesquera />} />
          <Route path="/editar/:id" element={<EditarActividadPesquera />} />
          <Route path="/detalle/:id" element={<DetalleActividadPesquera />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/reporte" element={<Reporte/>} />

          {userRole === 'admin' ? (
            <Route path="/gestionUser" element={<GestionUsuarios />} />
          ) : (
            <Route path="*" element={<Navigate to="/dashboard" />} />
          )}
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  );
};

export default AppRoutes;

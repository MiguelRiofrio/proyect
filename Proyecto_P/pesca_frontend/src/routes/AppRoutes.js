// AppRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/home/Home';
import ActividadPesqueraList from '../pages/crud/ActividadPesqueraList';
import AgregarActividadPesquera from '../pages/crud/AgregarActividadPesquera';
import EditarActividadPesquera from '../pages/crud/EditarActividadPesquera';
import DetalleActividadPesquera from '../pages/crud/DetalleActividadPesquera';
import Perfil from '../pages/users/Perfil';
import Dashboard from '../pages/Dashboard/Dashboard';
import MapaCaptura from '../pages/Dashboard/MapaCaptura';
import Login from '../pages/login/Login';
import GestionUsuarios from '../pages/users/GestionUsuarios';

const AppRoutes = ({ isAuthenticated, userRole, handleLogin }) => {
  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      {isAuthenticated ? (
        <>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mapacaptura" element={<MapaCaptura />} />
          <Route path="/actividades" element={<ActividadPesqueraList />} />
          <Route path="/agregar" element={<AgregarActividadPesquera />} />
          <Route path="/editar/:id" element={<EditarActividadPesquera />} />
          <Route path="/detalle/:id" element={<DetalleActividadPesquera />} />
          <Route path="/perfil" element={<Perfil />} />
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

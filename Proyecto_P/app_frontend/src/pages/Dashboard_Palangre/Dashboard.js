// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../routes/api';
import FiltroEmbarcaciones from './DashboardFiltro';
import ContenidoDashboard from './DashboardContenido';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [embarcacion, setEmbarcacion] = useState('');
  const [embaracionesList, setEmbarcacionesList] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchEmbarcaciones();
  }, [embarcacion]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`/dashboard/?embarcacion=${embarcacion}`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      setLoading(false);
    }
  };

  const fetchEmbarcaciones = async () => {
    try {
      const response = await axios.get('/crud/embarcaciones/');
      setEmbarcacionesList(response.data);
    } catch (error) {
      console.error('Error al obtener embarcaciones:', error);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center mt-5">No hay datos disponibles</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dashboard Avanzado Pesquero</h1>
      <FiltroEmbarcaciones
        embarcacion={embarcacion}
        setEmbarcacion={setEmbarcacion}
        embarcacionesList={embaracionesList}
      />
      <ContenidoDashboard dashboardData={dashboardData} />
    </div>
  );
};

export default Dashboard;




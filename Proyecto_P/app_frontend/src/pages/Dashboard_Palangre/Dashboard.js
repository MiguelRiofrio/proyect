import React, { useEffect, useState } from 'react';
import DashboardFiltro from './DashboardFiltro'; // Ajusta la ruta según tu estructura
import ContenidoDashboard from './DashboardContenido';
import axios from '../../routes/api';
import { Spinner, Alert } from 'reactstrap';

const Dashboard = () => {
  const [puerto, setPuerto] = useState('');
  const [embarcacion, setEmbarcacion] = useState('');
  const [year, setYear] = useState(''); // Nuevo estado para el año
  const [embarcacionesList, setEmbarcacionesList] = useState([]);
  const [puertosList, setPuertosList] = useState([]);
  const [yearsList, setYearsList] = useState([]); // Nuevo estado para la lista de años
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener lista de embarcaciones, puertos y años disponibles desde la API
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const params = {};
        if (puerto) params.puerto = puerto;
        if (year) params.year = year;

        const res = await axios.get('/filtro-dashboard/', { params });

        setEmbarcacionesList(res.data.embarcaciones);
        setPuertosList(
          res.data.resumen_por_puerto.map((item) => ({
            nombre_puerto: item.puerto,
            total_embarcaciones: item.total_embarcaciones,
          }))
        );
        setYearsList(res.data.available_years); // Establecer la lista de años disponibles

        // Reiniciar el filtro de embarcación al cambiar el puerto o año
        setEmbarcacion('');
      } catch (err) {
        console.error("Error al obtener las listas de filtros:", err);
        setError("No se pudieron cargar las listas de filtros.");
      }
    };
    fetchFilters();
  }, [puerto, year]); // Añadido 'year' a las dependencias

  // Obtener datos del dashboard cuando cambian los filtros
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (embarcacion) params.embarcacion = embarcacion;
        if (puerto) params.puerto = puerto;
        if (year) params.year = year; // Incluir el año en los parámetros

        const res = await axios.get('/dashboard/', { params }); 
        setDashboardData(res.data);
      } catch (err) {
        console.error("Error al obtener los datos del dashboard:", err);
        setError("No se pudieron cargar los datos del dashboard.");
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, [embarcacion, puerto, year]); // Añadido 'year' a las dependencias

  if (loading) return <div className="text-center"><Spinner color="primary" /></div>;
  if (error) return <Alert color="danger">{error}</Alert>;
  if (!dashboardData) return <div>No hay datos disponibles.</div>;

  return (
    <div>
      <DashboardFiltro 
        embarcacion={embarcacion} 
        setEmbarcacion={setEmbarcacion} 
        embarcacionesList={embarcacionesList}
        puerto={puerto}
        setPuerto={setPuerto}
        puertosList={puertosList}
        year={year} // Pasar el año seleccionado
        setYear={setYear} // Pasar la función para actualizar el año
        yearsList={yearsList} // Pasar la lista de años disponibles
      />
      <ContenidoDashboard dashboardData={dashboardData} />
    </div>
  );
};

export default Dashboard;

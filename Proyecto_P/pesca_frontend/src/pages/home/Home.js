import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpi = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/kpi-home/');
        if (!response.ok) throw new Error('Error al obtener los KPIs.');
        const data = await response.json();
        setKpi(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKpi();
  }, []);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="home-container">
      {/* Encabezado */}
      <div className="home-header">
        <h1>🌊 Aplicación Análisis de Especies Vulnerables IPIAP</h1>
        <p>
          Descubre y analiza datos sobre las especies marinas en tiempo real. 
          Usa nuestras herramientas interactivas para explorar mapas, gráficos y más.
        </p>
        <button className="cta-button" onClick={() => navigate('/dashboard')}>
          Comenzar
        </button>
      </div>

      {/* Navegación */}
      <div className="home-navigation">
        <button className="nav-button" onClick={() => navigate('/dashboard')}>
          🌍 Explorar el Mapa
        </button>
        <button className="nav-button" onClick={() => navigate('/mapa')}>
          📊 Ver Gráficos
        </button>
        <button className="nav-button" onClick={() => navigate('/actividades')}>
          ℹ️ Más Información
        </button>
      </div>

      {/* Resumen General */}
      <div className="home-stats">
        <h2>📋 Datos Destacados</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total de Especies</h3>
            <p>{kpi.total_especies}</p>
          </div>
          <div className="stat-card">
            <h3>Observaciones Registradas</h3>
            <p>{kpi.total_avistamientos}</p>
          </div>
          <div className="stat-card">
            <h3>Incidencias Registradas</h3>
            <p>{kpi.total_incidencias}</p>
          </div>
          <div className="stat-card">
            <h3>Especie Más Común</h3>
            <p>
              {kpi.especie_mas_comun.especie__nombre_comun} 
              <br />
              <small>({kpi.especie_mas_comun.total_captura} capturas)</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

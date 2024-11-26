import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChartComponent from '../MapaCaptura/components/charts/ChartComponent'; // Ejemplo de gráfico destacado
import './Home.css';

const Home = ({ resumenDatos, totalEspecies, totalObservaciones, especieMasComun }) => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Encabezado */}
      <div className="home-header">
        <h1>🌊 Bienvenido a la Plataforma de Avistamientos</h1>
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
        <button className="nav-button" onClick={() => navigate('/mapacaptura')}>
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
            <p>{totalEspecies}</p>
          </div>
          <div className="stat-card">
            <h3>Observaciones Registradas</h3>
            <p>{totalObservaciones}</p>
          </div>
          <div className="stat-card">
            <h3>Especie Más Común</h3>
            <p>{especieMasComun}</p>
          </div>
        </div>
      </div>

      {/* Gráfico Destacado */}
      <div className="home-charts">
        <h2>📊 Resumen General</h2>
        <ChartComponent datos={resumenDatos} />
      </div>
    </div>
  );
};

export default Home;

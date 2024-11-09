import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar los elementos necesarios para los gráficos
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const ChartsG1 = ({ datos }) => {
  // Datos para el gráfico de Lances por Hora
  const lancesPorHora = datos.lances_por_hora || [];
  const horas = lancesPorHora.map(item => item.calado_inicial_hora);
  const totalLances = lancesPorHora.map(item => item.total);

  const lancesPorHoraData = {
    labels: horas,
    datasets: [{
      label: 'Lances por Hora',
      data: totalLances,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const lancesPorHoraOptions = {
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10, // Limitar las etiquetas del eje X
        },
      },
      y: {
        beginAtZero: true,
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Datos para el gráfico de Capturas por Faena
  const capturasPorFaena = datos.capturas_por_faena || [];
  const faenasCapturas = capturasPorFaena.map(item => item.codigo_lance__faena);
  const totalCapturas = capturasPorFaena.map(item => item.total_individuos);

  const capturasPorFaenaData = {
    labels: faenasCapturas,
    datasets: [{
      label: 'Capturas por Faena',
      data: totalCapturas,
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }]
  };

  const capturasPorFaenaOptions = {
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        beginAtZero: true,
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="charts-grid">
      <div className="chart-item">
        <h2>Lances por Hora</h2>
        <div style={{ height: '400px' }}> {/* Ajusta la altura del gráfico */}
          <Bar data={lancesPorHoraData} options={lancesPorHoraOptions} />
        </div>
      </div>
      
      <div className="chart-item">
        <h2>Capturas por Faena</h2>
        <div style={{ height: '400px' }}>
          <Bar data={capturasPorFaenaData} options={capturasPorFaenaOptions} />
        </div>
      </div>
    </div>
  );
};

export default ChartsG1;

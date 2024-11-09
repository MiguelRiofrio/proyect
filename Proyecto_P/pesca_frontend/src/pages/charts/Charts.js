import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoCapturas = ({ datos }) => {
  // Verificar que 'datos' esté definido y no vacío
  if (!datos || datos.length === 0) {
    return <p>No hay datos disponibles para mostrar el gráfico.</p>;
  }

  // Preparar los datos para el gráfico
  const nombresEspecies = datos.map((dato) => dato.nombre_cientifico);
  const totalIndividuos = datos.map((dato) => dato.total_individuos);

  // Configuración de los datos para Chart.js
  const data = {
    labels: nombresEspecies, // Etiquetas de cada barra
    datasets: [
      {
        label: 'Total de Individuos',
        data: totalIndividuos,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Configuración de las opciones del gráfico
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Total de Individuos por Especie'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div>
      <h2>Gráfico de Capturas</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GraficoCapturas;

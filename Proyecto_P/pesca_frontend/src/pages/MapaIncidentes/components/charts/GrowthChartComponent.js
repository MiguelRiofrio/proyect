import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GrowthChartComponent = ({ datos = [] }) => {
  // Procesar los datos para el gráfico de barras (Total de individuos por puerto de entrada)
  const puertosEntrada = [...new Set(datos.map(dato => dato.puerto_entrada))]; // Puertos de entrada únicos
  const totalPorPuerto = puertosEntrada.map(puerto => {
    // Sumar total de individuos por cada puerto de entrada
    return datos
      .filter(dato => dato.puerto_entrada === puerto)
      .reduce((acc, curr) => acc + curr.total_individuos, 0);
  });

  const data = {
    labels: puertosEntrada, // Eje X: nombres de puertos de entrada
    datasets: [
      {
        label: 'Total Individuos',
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        data: totalPorPuerto,  // Eje Y: total de individuos por puerto
      }
    ]
  };

  const options = {
    maintainAspectRatio: false, // Asegura que se ajuste al contenedor
    responsive: true,
    title: {
      display: true,
      text: 'Total de Individuos por Puerto de Entrada',
      fontSize: 20
    },
    legend: {
      display: false, // Ocultar leyenda
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default GrowthChartComponent;

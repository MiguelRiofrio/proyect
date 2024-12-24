import React from 'react';
import { Line } from 'react-chartjs-2';

const RegressionChart = ({ capturasMes, regresionLineal, meses }) => {
  // Asegurarnos de que `regresionLineal` sea procesado correctamente
  const formattedRegresionLineal = (regresionLineal || []).map((value) =>
    value !== null && value !== undefined ? parseFloat(value).toFixed(2) : 0
  );

  const chartData = {
    labels: meses.map((mes) => ` ${mes}`),
    datasets: [
      {
        label: 'Capturas Retenidas',
        data: capturasMes,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointRadius: 5,
        fill: false,
      },
      {
        label: 'Regresión Lineal',
        data: formattedRegresionLineal.map((value) => parseFloat(value)), // Convertimos a número real para el gráfico
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5], // Línea discontinua
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Mes',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Capturas (kg)',
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default RegressionChart;

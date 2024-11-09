import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const ChartComponent = ({ datos = [] }) => {
  // Obtener las especies únicas
  const especies = [...new Set(datos.map(dato => dato.nombre_cientifico))];

  // Crear los datasets para cada estado
  const dataAlimentandose = datos.map((dato, index) => ({
    x: especies.indexOf(dato.nombre_cientifico),
    y: dato.alimentandose
  }));

  const dataDeambulando = datos.map((dato, index) => ({
    x: especies.indexOf(dato.nombre_cientifico),
    y: dato.deambulando
  }));

  const dataEnReposo = datos.map((dato, index) => ({
    x: especies.indexOf(dato.nombre_cientifico),
    y: dato.en_reposo
  }));

  const data = {
    labels: especies, // Etiquetas para las especies
    datasets: [
      {
        label: 'Alimentándose',
        data: dataAlimentandose, // Datos para alimentándose
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
      },
      {
        label: 'Deambulando',
        data: dataDeambulando, // Datos para deambulando
        backgroundColor: 'rgba(255,159,64,0.6)',
        borderColor: 'rgba(255,159,64,1)',
      },
      {
        label: 'En Reposo',
        data: dataEnReposo, // Datos para en reposo
        backgroundColor: 'rgba(153,102,255,0.6)',
        borderColor: 'rgba(153,102,255,1)',
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Especies',
        },
        ticks: {
          callback: function(value, index) {
            return especies[index]; // Mostrar nombres de las especies en el eje X
          },
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Individuos',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y}`;
          }
        }
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

export default ChartComponent;

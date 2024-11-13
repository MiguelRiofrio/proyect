import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

const AnotherChartComponent = ({ datos = [] }) => {
  // Asegúrate de que datos es un array antes de usar map
  const totalAlimentandose = datos.reduce((acc, dato) => acc + dato.alimentandose, 0);
  const totalDeambulando = datos.reduce((acc, dato) => acc + dato.deambulando, 0);
  const totalEnReposo = datos.reduce((acc, dato) => acc + dato.en_reposo, 0);

  const data = {
    labels: ['Alimentándose', 'Deambulando', 'En Reposo'], // Etiquetas de los estados
    datasets: [
      {
        label: 'Estado de los Individuos',
        data: [totalAlimentandose, totalDeambulando, totalEnReposo], // Datos de los estados
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Color para Alimentándose
          'rgba(255, 159, 64, 0.6)', // Color para Deambulando
          'rgba(153, 102, 255, 0.6)', // Color para En Reposo
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    title: {
      display: true,
      text: 'Proporción de Estados (Alimentándose, Deambulando, En Reposo)',
      fontSize: 20,
    },
    legend: {
      display: true,
      position: 'right',
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default AnotherChartComponent;

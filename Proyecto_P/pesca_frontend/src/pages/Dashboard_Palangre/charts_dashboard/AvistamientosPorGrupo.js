import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AvistamientosPorGrupo = ({ datos }) => {
  console.log("Datos de Avistamientos por Grupo:", datos); // Verifica los datos

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3 style={{ textAlign: 'center' }}>Avistamientos por Grupo</h3>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={datos}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="grupos_avi_int" type="category" />
          <Tooltip />
          <Bar dataKey="total" fill="#FF8042" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AvistamientosPorGrupo;

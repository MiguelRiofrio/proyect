import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const CapturasPorEspecie = ({ datos }) => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <h3 style={{ textAlign: 'center' }}>Capturas por Especie</h3>
      <ResponsiveContainer>
        <BarChart data={datos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre_cientifico" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_captura" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CapturasPorEspecie;

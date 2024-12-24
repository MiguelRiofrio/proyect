import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PesoCapturas = () => {
    const formattedData = [
      { name: 'Retenido', value: 100 },
      { name: 'Descarte', value: 50 },
    ];
  
    const COLORS = ['#0088FE', '#FF8042'];
  
    return (
      <div style={{ width: '100%', height: 400 }}>
        <h3 style={{ textAlign: 'center' }}>Peso Capturado (Retenido vs Descartado)</h3>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={formattedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => `${entry.name}: ${entry.value} lbs`}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default PesoCapturas;

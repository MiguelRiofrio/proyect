// src/components/HeatmapLegend.jsx
import React, { useState } from 'react';
import './css/HeatmapLegend.css';

const HeatmapLegend = ({ 
  title = 'Intensidad', 
  minLabel = 'Bajo', 
  maxLabel = 'Alto', 
  thresholds = [
    { label: 'Muy bajo', range: '0 - 0.2', color: 'blue' },
    { label: 'Bajo', range: '0.2 - 0.4', color: 'cyan' },
    { label: 'Medio', range: '0.4 - 0.6', color: 'lime' },
    { label: 'Alto', range: '0.6 - 0.8', color: 'yellow' },
    { label: 'Muy alto', range: '0.8 - 1.0', color: 'red' }
  ]
}) => {
  const [showThresholds, setShowThresholds] = useState(true);

  const toggleThresholds = () => {
    setShowThresholds(prev => !prev);
  };

  return (
    <div className="heatmap-legend">
      <h4>{title}</h4>
      <div className="gradient-bar"></div>
      <div className="legend-labels">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <button onClick={toggleThresholds} className="toggle-thresholds">
        {showThresholds ? 'Ocultar detalles' : 'Mostrar detalles'}
      </button>
      {showThresholds && (
        <div className="legend-details">
          {thresholds.map((item, index) => (
            <div key={index} className="legend-item">
              <span 
                className="legend-color" 
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="legend-text">
                {item.label} ({item.range})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeatmapLegend;

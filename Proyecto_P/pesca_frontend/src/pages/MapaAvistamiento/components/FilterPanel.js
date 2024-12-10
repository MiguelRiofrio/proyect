import React from 'react';

const FilterPanel = ({ datos, filtro, filtroEstado, onFiltroChange, onEstadoChange }) => {
  const especies = [...new Set(datos.map((dato) => dato.nombre_cientifico))];

  return (
    <div>
      <h3>Filtrar Avistamientos</h3>
      <label htmlFor="filtro">Filtrar por nombre científico:</label>
      <select id="filtro" value={filtro} onChange={onFiltroChange} style={{ marginLeft: '10px', width: '100%' }}>
        <option value="">Todas las especies</option>
        {especies.map((especie, index) => (
          <option key={index} value={especie}>{especie}</option>
        ))}
      </select>

      <label htmlFor="filtroEstado" style={{ marginTop: '10px' }}>Filtrar por estado:</label>
      <select id="filtroEstado" value={filtroEstado} onChange={onEstadoChange} style={{ marginLeft: '10px', width: '100%' }}>
        <option value="">Todos los estados</option>
        <option value="alimentandose">Alimentándose</option>
        <option value="deambulando">Deambulando</option>
        <option value="en_reposo">En reposo</option>
      </select>
    </div>
  );
};

export default FilterPanel;

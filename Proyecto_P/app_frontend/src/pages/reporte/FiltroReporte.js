import React from 'react';
import { TextField, Autocomplete, Button, Box } from '@mui/material';

const FiltroReporte = ({ filtros, setFiltros, aplicarFiltros }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      
      <TextField
        label="Profundidad Mínima"
        name="profundidad_min"
        type="number"
        value={
          filtros.profundidad_min !== '' 
            ? filtros.profundidad_min 
            : filtros.profundidadMinima !== null 
              ? filtros.profundidadMinima 
              : ''
        }
        onChange={handleChange}
        fullWidth
        inputProps={{
          min: filtros.profundidadMinima || 0,
          max: filtros.profundidadMaxima || 100,
        }}
      />
      <TextField
        label="Profundidad Máxima"
        name="profundidad_max"
        type="number"
        value={
          filtros.profundidad_max !== '' 
            ? filtros.profundidad_max 
            : filtros.profundidadMaxima !== null 
              ? filtros.profundidadMaxima 
              : ''
        }
        onChange={handleChange}
        fullWidth
        inputProps={{
          min: filtros.profundidadMinima || 0,
          max: filtros.profundidadMaxima || 100,
        }}
      />

      <Autocomplete
        options={['Todas', ...(filtros.embarcaciones || [])]}
        value={filtros.embarcacion || 'Todas'}
        onChange={(event, newValue) => {
          setFiltros((prev) => ({ ...prev, embarcacion: newValue || '' }));
        }}
        renderInput={(params) => <TextField {...params} label="Embarcación" />}
        fullWidth
      />

      <Autocomplete
        multiple
        options={filtros.mesesDisponibles || []}
        getOptionLabel={(option) => option}
        value={filtros.mes_captura.length > 0 ? filtros.mes_captura : []}
        onChange={(event, newValue) => {
          setFiltros((prev) => ({ ...prev, mes_captura: newValue }));
        }}
        renderInput={(params) => <TextField {...params} label="Meses disponibles" />}
        fullWidth
      />

      <Autocomplete
        options={filtros.anosDisponibles || []}
        getOptionLabel={(option) => option.toString()}
        value={filtros.ano_captura || null}
        onChange={(event, newValue) => {
          setFiltros((prev) => ({ ...prev, ano_captura: newValue || '' }));
        }}
        renderInput={(params) => <TextField {...params} label="Año de Captura" />}
        fullWidth
      />

      <Button variant="contained" color="primary" onClick={aplicarFiltros}>
        Aplicar Filtros
      </Button>
    </Box>
  );
};

export default FiltroReporte;

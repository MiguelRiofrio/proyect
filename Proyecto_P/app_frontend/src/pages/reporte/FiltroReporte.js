import React from 'react';
import { TextField, Autocomplete, Button, Box } from '@mui/material';

const FiltroReporte = ({ filtros, setFiltros, aplicarFiltros }) => {
  // Manejador para los TextField (profundidades)
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Se actualiza el estado, si es necesario se puede convertir el valor a número
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };


  const mesesSeleccionados =
    filtros.mesesDisponibles?.filter((mes) => filtros.mes_captura.includes(mes.valor)) || [];

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      {/* Campo para Profundidad Mínima */}
      <TextField
        label="Profundidad Mínima"
        name="profundidad_min"
        type="number"
        value={
          filtros.profundidad_min !== ''
            ? filtros.profundidad_min
            : filtros.profundidadMinima // Se espera que este valor venga del endpoint de filtros
        }
        onChange={handleChange}
        fullWidth
        inputProps={{
          min: filtros.profundidadMinima || 0,
          max: filtros.profundidadMaxima || 100,
        }}
      />

      {/* Campo para Profundidad Máxima */}
      <TextField
        label="Profundidad Máxima"
        name="profundidad_max"
        type="number"
        value={
          filtros.profundidad_max !== ''
            ? filtros.profundidad_max
            : filtros.profundidadMaxima // Se espera que este valor venga del endpoint de filtros
        }
        onChange={handleChange}
        fullWidth
        inputProps={{
          min: filtros.profundidadMinima || 0,
          max: filtros.profundidadMaxima || 100,
        }}
      />

      {/* Autocomplete para Embarcación */}
      <Autocomplete
        options={['Todas', ...(filtros.embarcaciones || [])]}
        value={filtros.embarcacion || 'Todas'}
        onChange={(event, newValue) => {
          setFiltros((prev) => ({ ...prev, embarcacion: newValue || '' }));
        }}
        renderInput={(params) => <TextField {...params} label="Embarcación" />}
        fullWidth
      />

      {/* Autocomplete para seleccionar múltiples meses */}
      <Autocomplete
        multiple
        options={filtros.mesesDisponibles || []}
        getOptionLabel={(option) => option.nombre}
        value={mesesSeleccionados}
        onChange={(event, newValue) => {
          // Extrae el valor numérico de cada mes seleccionado
          const mesesSeleccionados = newValue.map((item) => item.valor);
          setFiltros((prev) => ({ ...prev, mes_captura: mesesSeleccionados }));
        }}
        renderInput={(params) => <TextField {...params} label="Meses disponibles" />}
        fullWidth
      />

      {/* Autocomplete para Año de Captura */}
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

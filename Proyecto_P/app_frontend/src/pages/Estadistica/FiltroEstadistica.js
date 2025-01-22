import React from 'react';
import { Card, CardContent, Typography, TextField, MenuItem } from '@mui/material';

const FiltrosEstadistica = ({ filters, embarcaciones, taxas, onInputChange, fechaMinima, fechaMaxima }) => {
  return (
    <Card className="filtro-flotante">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>

        {/* Filtro para embarcaciones */}
        <TextField
          label="Embarcación"
          name="embarcacion"
          value={filters.embarcacion}
          onChange={onInputChange}
          select
          fullWidth
          margin="normal"
          disabled={embarcaciones.length === 0}
        >
          <MenuItem value="">Todas</MenuItem>
          {embarcaciones.length > 0 ? (
            embarcaciones.map((emb, index) => (
              <MenuItem key={index} value={emb}>
                {emb}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              No hay embarcaciones disponibles
            </MenuItem>
          )}
        </TextField>

        {/* Filtro para taxas */}
        <TextField
          label="Taxa"
          name="taxa"
          value={filters.taxa}
          onChange={onInputChange}
          select
          fullWidth
          margin="normal"
          disabled={taxas.length === 0}
        >
          <MenuItem value="">Todas</MenuItem>
          {taxas.length > 0 ? (
            taxas.map((taxa, index) => (
              <MenuItem key={index} value={taxa}>
                {taxa}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              No hay taxas disponibles
            </MenuItem>
          )}
        </TextField>

        {/* Filtro para fecha inicio */}
        <TextField
          label="Fecha Inicio"
          name="fecha_inicio"
          type="date"
          value={filters.fecha_inicio}
          onChange={onInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: fechaMinima,
            max: fechaMaxima,
          }}
        />

        {/* Filtro para fecha fin */}
        <TextField
          label="Fecha Fin"
          name="fecha_fin"
          type="date"
          value={filters.fecha_fin}
          onChange={onInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: fechaMinima,
            max: fechaMaxima,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default FiltrosEstadistica;

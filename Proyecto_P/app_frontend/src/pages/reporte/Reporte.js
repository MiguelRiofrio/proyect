import React, { useEffect, useState } from 'react';
import api from '../../routes/api';
import FiltroReporte from './FiltroReporte';
import ContenidoReporte from './ContenidoReporte';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import './Reporte.css';

const Reporte = () => {
  const [reporte, setReporte] = useState(null);
  const [filtros, setFiltros] = useState({
    profundidad_min: '',
    profundidad_max: '',
    embarcacion: '',
    mes_captura: [],
    ano_captura: '',
    embarcaciones: [],
    mesesDisponibles: [],
    anosDisponibles: [],
    profundidadMinima: 0,
    profundidadMaxima: 100,
  });

  // Obtener el reporte desde la API con filtros aplicados
  const fetchReporte =  () => {
    const params = {
      profundidad_min: filtros.profundidad_min !== '' ? filtros.profundidad_min : filtros.profundidadMinima,
      profundidad_max: filtros.profundidad_max !== '' ? filtros.profundidad_max : filtros.profundidadMaxima,
      embarcacion: filtros.embarcacion !== 'Todas' ? filtros.embarcacion : '',
      mes_captura: filtros.mes_captura.length > 0 ? filtros.mes_captura.join(',') : '',
      ano_captura: filtros.ano_captura || '',
    };
    api.get('/reporte/', { params })
      .then((response) => {
        setReporte(response.data);
      })
      .catch((error) => {
        console.error('Error al cargar reporte:', error);
        setReporte(null);
      });
  };

  // Cargar filtros disponibles desde la API
  const fetchFiltrosDisponibles = async () => {
    try {
      const response = await api.get('/filtros-analisis/');
      if (response.data) {
        setFiltros((prev) => ({
          ...prev,
          embarcaciones: response.data.embarcaciones || [],
          mesesDisponibles: response.data.meses.map((mes) => mes.nombre) || [],
          anosDisponibles: response.data.anos?.filter((ano) => ano > 0) || [],
          profundidadMinima: response.data.rango_profundidad?.profundidad_minima || 0,
          profundidadMaxima: response.data.rango_profundidad?.profundidad_maxima || 100,
        }));
      }
    } catch (error) {
      console.error('Error al cargar filtros:', error);
    }
  };

  useEffect(() => {
    fetchFiltrosDisponibles();
    fetchReporte();
  }, []);

  return (
    <Grid container spacing={4} className="reporte-container">
      <Grid item xs={12} md={3}>
        <Card className="filtro-flotante">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            {filtros.embarcaciones.length > 0 && filtros.mesesDisponibles.length > 0 ? (
              <FiltroReporte filtros={filtros} setFiltros={setFiltros} aplicarFiltros={fetchReporte} />
            ) : (
              <Typography variant="body1">Cargando filtros...</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={9}>
        <ContenidoReporte reporte={reporte} filtros={filtros} />
      </Grid>
    </Grid>
  );
};

export default Reporte;

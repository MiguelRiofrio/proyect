import React, { useEffect, useState } from 'react';
import api from '../../routes/api';
import Filtros from './FiltroEstadistica'; // Asegúrate de que el nombre del archivo es correcto
import ContenidoEstadisticas from './ContenidoEstadistica'; // Asegúrate de que el nombre del archivo es correcto
import { Grid, CircularProgress, Typography, Alert } from '@mui/material';
import './EstadisticasPesqueras.css';

const EstadisticasPesqueras = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    embarcacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    taxa: '',
    profundidad_min: '',
    profundidad_max: '',
  });

  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [taxas, setTaxas] = useState([]);
  const [fechaMinima, setFechaMinima] = useState('');
  const [fechaMaxima, setFechaMaxima] = useState('');

  // Fetch Metadatos y Rango de Fechas
  const fetchMetadata = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.get('/filtro-estadistica/');

      if (
        response.data.rango_fechas &&
        response.data.rango_fechas.fecha_minima &&
        response.data.rango_fechas.fecha_maxima
      ) {
        setFechaMinima(response.data.rango_fechas.fecha_minima);
        setFechaMaxima(response.data.rango_fechas.fecha_maxima);

        setFilters((prev) => ({
          ...prev,
          fecha_inicio: response.data.rango_fechas.fecha_minima,
          fecha_fin: response.data.rango_fechas.fecha_maxima,
        }));
      } else {
        setError('No se encontraron datos de fechas.');
      }

      setEmbarcaciones(response.data.embarcaciones || []);
      setTaxas(response.data.taxas || []);
    } catch (err) {
      console.error('Error al cargar metadatos:', err);
      setError('No se pudieron cargar los metadatos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Estadísticas
  const fetchEstadisticas = async () => {
    if (!filters.fecha_inicio || !filters.fecha_fin) return; // Evitar llamadas innecesarias

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/estadisticas/', { params: filters });

      if (
        !response.data.resumen_general ||
        Object.keys(response.data.resumen_general).length === 0
      ) {
        setError('No se encontraron registros en el rango de fechas seleccionado.');
      } else {
        setEstadisticas(response.data);
      }
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      setError('No se pudieron cargar las estadísticas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar Filtros
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Validaciones de fechas
    if (name === 'fecha_inicio') {
      if (value < fechaMinima) {
        setFilters((prev) => ({ ...prev, fecha_inicio: fechaMinima }));
        setError(`La fecha de inicio no puede ser menor a ${fechaMinima}`);
        return;
      }
    }

    if (name === 'fecha_fin') {
      if (value > fechaMaxima) {
        setFilters((prev) => ({ ...prev, fecha_fin: fechaMaxima }));
        setError(`La fecha de fin no puede ser mayor a ${fechaMaxima}`);
        return;
      }
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
    setError(null); // Limpiar errores al cambiar filtros válidos
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchEstadisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Asegúrate de que solo 'filters' desencadena esta llamada

  // Mostrar mientras se cargan datos
  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        style={{ minHeight: '80vh', flexDirection: 'column' }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Cargando estadísticas...
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={4}>
      {/* Filtros */}
      <Grid item xs={12} md={3}>
        <Filtros
          filters={filters}
          embarcaciones={embarcaciones}
          taxas={taxas}
          onInputChange={handleInputChange}
          fechaMinima={fechaMinima}
          fechaMaxima={fechaMaxima}
        />
      </Grid>

      {/* Contenido de Estadísticas */}
      <Grid item xs={12} md={9}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : estadisticas ? (
          <ContenidoEstadisticas estadisticas={estadisticas} filtros={filters} />
        ) : (
          <Typography variant="h6" align="center">
            No se encontraron estadísticas.
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default EstadisticasPesqueras;

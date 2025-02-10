// src/components/Home.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../routes/api'; // Importar Axios
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Container,
  Stack,
} from '@mui/material';
import {
  Map as MapIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon,
  Waves as WavesIcon,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpi = async () => {
      try {
        setLoading(true);
        const response = await api.get('/kpi-home/'); // Cambiado a Axios
        setKpi(response.data); // Configura el estado con los datos de la API
      } catch (err) {
        setError(err.response?.data?.error || 'Error al obtener los KPIs.');
      } finally {
        setLoading(false);
      }
    };

    fetchKpi();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      {/* Encabezado */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 6,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
         Programa de Análisis de Especies Vulnerables IPIAP
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Descubre y analiza datos sobre las especies marinas. Usa nuestras herramientas para explorar mapas, gráficos y más.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 4 }}
          onClick={() => navigate('/dashboard')}
          startIcon={<WavesIcon />}
        >
          Comenzar
        </Button>
      </Box>

      {/* Navegación */}
      <Box
        sx={{
          mb: 6,
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              startIcon={<MapIcon />}
              onClick={() => navigate('/mapa')}
            >
              Explorar el Mapa
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              startIcon={<BarChartIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Ver Gráficos
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              size="large"
              startIcon={<InfoIcon />}
              onClick={() => navigate('/reporte')}
            >
              Más Información
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Resumen General */}
      <Box>
        <Typography variant="h4" gutterBottom align="center">
           Datos Destacados
        </Typography>
        <Grid container spacing={4}>
          {/* Total de Especies */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                boxShadow: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Total de Especies
              </Typography>
              <Typography variant="h4" color="primary">
                {kpi.total_especies}
              </Typography>
            </Card>
          </Grid>

          {/* Observaciones Registradas */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                boxShadow: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Observaciones Registradas
              </Typography>
              <Typography variant="h4" color="primary">
                {kpi.total_avistamientos}
              </Typography>
            </Card>
          </Grid>

          {/* Incidencias Registradas */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                boxShadow: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Incidencias Registradas
              </Typography>
              <Typography variant="h4" color="primary">
                {kpi.total_incidencias}
              </Typography>
            </Card>
          </Grid>

          {/* Especie Más Común */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                boxShadow: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Especie Más Común
              </Typography>
              <Typography variant="h5" color="primary">
                {kpi.especie_mas_comun.especie__nombre_comun}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ({kpi.especie_mas_comun.total_captura} capturas)
              </Typography>
            </Card>
          </Grid>

          {/* Índice de Diversidad de Shannon */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
                boxShadow: 3,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Typography variant="h6" gutterBottom>
                Índice de Diversidad de Shannon
              </Typography>
              <Typography variant="h4" color="primary">
                {kpi.indice_diversidad_shannon}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;

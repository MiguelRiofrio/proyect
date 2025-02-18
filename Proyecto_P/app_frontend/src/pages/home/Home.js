import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../routes/api';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Map as MapIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon,
  Waves as WavesIcon,
  Nature as NatureIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  Anchor as AnchorIcon,
} from '@mui/icons-material';

const cardStyles = {
  borderRadius: 2,
  boxShadow: 3,
  transition: 'transform 0.3s, boxShadow 0.3s',
  '&:hover': {
    transform: 'scale(1.03)',
    boxShadow: 6,
    cursor: 'pointer',
  },
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  p: 2,
  // Degradado más oscuro para mejorar contraste
  background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
  color: '#fff', // Texto en blanco para contrastar
};

const Home = () => {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    const fetchKpi = async () => {
      try {
        setLoading(true);
        const response = await api.get('/kpi-home/');
        setKpi(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al obtener los KPIs.');
      } finally {
        setLoading(false);
      }
    };
    fetchKpi();
  }, []);

  const handleOpenModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
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
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'black' }}>
          Programa de Análisis de Especies Vulnerables IPIAP
        </Typography>
        <Typography variant="h6" sx={{ maxWidth: 600, mx: 'auto', color: 'black' }}>
          Descubre y analiza datos sobre las especies marinas. Utiliza nuestras herramientas para explorar mapas, gráficos y obtener información detallada sobre la biodiversidad.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 4 }}
          onClick={() => navigate('/dashboard')}
          startIcon={<WavesIcon sx={{ color: 'black' }} />}
        >
          Comenzar
        </Button>
      </Box>

      {/* Navegación */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={4} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<MapIcon sx={{ color: 'black' }} />}
              onClick={() => navigate('/mapa')}
              sx={{ color: 'black', borderColor: 'black' }}
            >
              Explorar el Mapa
            </Button>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<BarChartIcon sx={{ color: 'black' }} />}
              onClick={() => navigate('/dashboard')}
              sx={{ color: 'black', borderColor: 'black' }}
            >
              Ver Gráficos
            </Button>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<InfoIcon sx={{ color: 'black' }} />}
              onClick={() => navigate('/reporte')}
              sx={{ color: 'black', borderColor: 'black' }}
            >
              Más Información
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Resumen General de KPIs */}
      <Box>
        <Typography variant="h4" gutterBottom align="center" sx={{ color: 'black' }}>
          Datos Destacados
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {/* Total de Especies */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={cardStyles}
              onClick={() =>
                handleOpenModal(
                  'Total de Especies',
                  <>
                    <Typography variant="body1" sx={{ color: 'black' }}>
                      Valor: <strong>{kpi.total_especies.value}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'black' }}>
                      {kpi.total_especies.descripcion}
                    </Typography>
                    {kpi.total_especies.ejemplos && kpi.total_especies.ejemplos.length > 0 && (
                      <>
                        <Typography variant="subtitle1" sx={{ mt: 2, color: 'black' }}>
                          Ejemplos de especies:
                        </Typography>
                        <List dense>
                          {kpi.total_especies.ejemplos.map((item, index) => (
                            <ListItem key={index} disableGutters>
                              <ListItemIcon>
                                <NatureIcon fontSize="small" sx={{ color: 'black' }} />
                              </ListItemIcon>
                              <ListItemText primary={item} sx={{ color: 'black' }} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </>
                )
              }
            >
              <CardContent sx={{ textAlign: 'center' }}>
                {/* Ícono y textos en blanco para buen contraste sobre el fondo oscuro */}
                <NatureIcon sx={{ fontSize: 50, color: '#fff' }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                  Total de Especies
                </Typography>
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  {kpi.total_especies.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  Ver detalles...
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Observaciones Registradas */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={cardStyles}
              onClick={() =>
                handleOpenModal(
                  'Observaciones Registradas',
                  <>
                    <Typography variant="body1" sx={{ color: 'black' }}>
                      Valor: <strong>{kpi.total_avistamientos.value}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'black' }}>
                      {kpi.total_avistamientos.descripcion}
                    </Typography>
                    {kpi.total_avistamientos.detalles && (
                      <>
                        <Typography variant="subtitle1" sx={{ mt: 2, color: 'black' }}>
                          Desglose de actividades:
                        </Typography>
                        <List dense>
                          <ListItem disableGutters>
                            <ListItemText primary={`Alimentándose: ${kpi.total_avistamientos.detalles.alimentandose}`} sx={{ color: 'black' }} />
                          </ListItem>
                          <ListItem disableGutters>
                            <ListItemText primary={`Deambulando: ${kpi.total_avistamientos.detalles.deambulando}`} sx={{ color: 'black' }} />
                          </ListItem>
                          <ListItem disableGutters>
                            <ListItemText primary={`En reposo: ${kpi.total_avistamientos.detalles.en_reposo}`} sx={{ color: 'black' }} />
                          </ListItem>
                        </List>
                      </>
                    )}
                  </>
                )
              }
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <VisibilityIcon sx={{ fontSize: 50, color: '#fff' }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                  Observaciones Registradas
                </Typography>
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  {kpi.total_avistamientos.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  Ver detalles...
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Incidencias Registradas */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={cardStyles}
              onClick={() =>
                handleOpenModal(
                  'Incidencias Registradas',
                  <>
                    <Typography variant="body1" sx={{ color: 'black' }}>
                      Valor: <strong>{kpi.total_incidencias.value}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'black' }}>
                      {kpi.total_incidencias.descripcion}
                    </Typography>
                    {kpi.total_incidencias.detalles && (
                      <>
                        <Typography variant="subtitle1" sx={{ mt: 2, color: 'black' }}>
                          Desglose de incidencias:
                        </Typography>
                        <List dense>
                          <ListItem disableGutters>
                            <ListItemText primary={`Herida grave: ${kpi.total_incidencias.detalles.herida_grave}`} sx={{ color: 'black' }} />
                          </ListItem>
                          <ListItem disableGutters>
                            <ListItemText primary={`Herida leve: ${kpi.total_incidencias.detalles.herida_leve}`} sx={{ color: 'black' }} />
                          </ListItem>
                          <ListItem disableGutters>
                            <ListItemText primary={`Muerto: ${kpi.total_incidencias.detalles.muerto}`} sx={{ color: 'black' }} />
                          </ListItem>
                        </List>
                      </>
                    )}
                  </>
                )
              }
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon sx={{ fontSize: 50, color: '#fff' }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                  Incidencias Registradas
                </Typography>
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  {kpi.total_incidencias.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  Ver detalles...
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Especie Más Común */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={cardStyles}
              onClick={() =>
                handleOpenModal(
                  'Especie Más Común',
                  <>
                    <Typography variant="body1" sx={{ color: 'black' }}>
                      Nombre Científico: <strong>{kpi.especie_mas_comun.nombre_cientifico}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: 'black' }}>
                      Nombre Común: <strong>{kpi.especie_mas_comun.nombre_comun}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: 'black' }}>
                      Total de Capturas: <strong>{kpi.especie_mas_comun.total_captura}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'black' }}>
                      {kpi.especie_mas_comun.descripcion}
                    </Typography>
                  </>
                )
              }
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AnchorIcon sx={{ fontSize: 50, color: '#fff' }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                  Especie Más Común
                </Typography>
                <Typography variant="h5" sx={{ color: '#fff' }}>
                  {kpi.especie_mas_comun.nombre_comun}
                </Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  Ver detalles...
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Índice de Diversidad de Shannon */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={cardStyles}
              onClick={() =>
                handleOpenModal(
                  'Índice de Diversidad de Shannon',
                  <>
                    <Typography variant="body1" sx={{ color: 'black' }}>
                      Valor: <strong>{kpi.indice_diversidad_shannon.value}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'black' }}>
                      {kpi.indice_diversidad_shannon.descripcion}
                    </Typography>
                    {kpi.indice_diversidad_shannon.detalles && kpi.indice_diversidad_shannon.detalles.length > 0 && (
                      <>
                        <Typography variant="subtitle1" sx={{ mt: 2, color: 'black' }}>
                          Detalle por especie:
                        </Typography>
                        <List dense>
                          {kpi.indice_diversidad_shannon.detalles.map((item, index) => (
                            <ListItem key={index} disableGutters>
                              <ListItemText
                                primary={`${item.nombre_cientifico}: ${item.cantidad} (Proporción: ${item.proporcion * 100}%)`}
                                sx={{ color: 'black' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </>
                )
              }
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 50, color: '#fff' }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                  Diversidad de Shannon
                </Typography>
                <Typography variant="h4" sx={{ color: '#fff' }}>
                  {kpi.indice_diversidad_shannon.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#fff' }}>
                  Ver detalles...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Modal con información detallada */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, overflow: 'hidden', background: '#fff' },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #90caf9, #e3f2fd)',
            color: 'black',
            borderBottom: '1px solid #ddd',
            py: 2,
          }}
        >
          {modalTitle}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            backgroundColor: '#fff',
            p: 3,
            color: 'black',
          }}
        >
          {modalContent}
        </DialogContent>
        <DialogActions
          sx={{
            background: 'linear-gradient(135deg, #e3f2fd, #90caf9)',
            p: 2,
          }}
        >
          <Button onClick={handleCloseModal} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home;

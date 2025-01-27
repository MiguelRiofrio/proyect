import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid
} from '@mui/material';
import './ContenidoReporte.css';

const ContenidoReporte = ({ reporte, filtros }) => {
  const reporteRef = useRef();

  const handlePrint = () => {
    if (reporteRef.current) {
      const printWindow = window.open('', '_blank');
      const content = reporteRef.current.innerHTML;

      printWindow.document.write(`
        <html>
          <head>
            <title>Reporte de Estadísticas</title>
            <style>
              body { font-family: 'Roboto', Arial, sans-serif; margin: 20px; color: #333; }
              h1, h2, h3 { color: #2c3e50; margin-bottom: 10px; }
              .reporte-container { width: 90%; margin: auto; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
              th { background-color: #f4f4f4; font-weight: bold; }
            </style>
          </head>
          <body>
            ${content}
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!reporte) {
    return <Typography variant="h6" align="center">Seleccione "Aplicar Filtros" para generar el reporte...</Typography>;
  }

  const resumenGeneral = reporte?.resumen_general || {};

  return (
    <Box ref={reporteRef} className="reporte-container" sx={{ padding: 4, backgroundColor: '#f4f6f8', borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Reporte Detallado de Actividades Pesqueras
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" color="secondary" gutterBottom>Resumen General</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Total de Especies:</strong></TableCell>
                      <TableCell>{resumenGeneral.total_especies ?? 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Total de Capturas:</strong></TableCell>
                      <TableCell>{resumenGeneral.total_capturas ?? 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Total de Avistamientos:</strong></TableCell>
                      <TableCell>{resumenGeneral.total_avistamientos ?? 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" color="secondary" gutterBottom>Profundidades e Incidencias</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Total de Incidencias:</strong></TableCell>
                      <TableCell>{resumenGeneral.total_incidencias ?? 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Profundidad Máxima:</strong></TableCell>
                      <TableCell>{resumenGeneral.profundidad_maxima ?? 'N/A'} m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Profundidad Mínima:</strong></TableCell>
                      <TableCell>{resumenGeneral.profundidad_minima ?? 'N/A'} m</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {reporte?.capturas_mas_comunes?.length > 0 && (
        <Card sx={{ boxShadow: 3, borderRadius: 2, marginTop: 4 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Especies Más Capturadas
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#1976d2' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#fff' }}><strong>Especie</strong></TableCell>
                    <TableCell sx={{ color: '#fff' }}><strong>Total Capturas</strong></TableCell>
                    <TableCell sx={{ color: '#fff' }}><strong>Peso Total (kg)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reporte.capturas_mas_comunes.map((captura, index) => (
                    <TableRow key={index}>
                      <TableCell>{captura.especie__nombre_cientifico || 'N/A'}</TableCell>
                      <TableCell>{captura.total_capturado ?? 0}</TableCell>
                      <TableCell>{captura.total_peso ?? 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Box textAlign="center" marginTop={4}>
        <Button onClick={handlePrint} variant="contained" color="primary">
          Imprimir Reporte
        </Button>
      </Box>
    </Box>
  );
};

export default ContenidoReporte;

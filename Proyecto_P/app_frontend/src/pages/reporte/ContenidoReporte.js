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
    <Box ref={reporteRef} className="reporte-container">
      <Typography variant="h4" gutterBottom align="center">
        Reporte Detallado de Actividades Pesqueras
      </Typography>

      <Card className="reporte-card">
        <CardContent>
          <Typography variant="h6" gutterBottom>Resumen General</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>Total de Especies: {resumenGeneral.total_especies ?? 'N/A'}</Typography>
              <Typography>Total de Capturas: {resumenGeneral.total_capturas ?? 'N/A'}</Typography>
              <Typography>Total de Avistamientos: {resumenGeneral.total_avistamientos ?? 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>Total de Incidencias: {resumenGeneral.total_incidencias ?? 'N/A'}</Typography>
              <Typography>Total de Lances: {resumenGeneral.total_lances ?? 'N/A'}</Typography>
              <Typography>Profundidad Máxima: {resumenGeneral.profundidad_maxima ?? 'N/A'} m</Typography>
              <Typography>Profundidad Mínima: {resumenGeneral.profundidad_minima ?? 'N/A'} m</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider />

      {reporte?.capturas_mas_comunes?.length > 0 && (
        <Box className="reporte-section">
          <Typography variant="h5" gutterBottom>Especies Más Capturadas</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Especie</strong></TableCell>
                  <TableCell><strong>Total Capturas</strong></TableCell>
                  <TableCell><strong>Peso Total (kg)</strong></TableCell>
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
        </Box>
      )}

      <Button onClick={handlePrint} variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Imprimir Reporte
      </Button>
    </Box>
  );
};

export default ContenidoReporte;

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
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import 'chart.js/auto';

const ContenidoEstadisticas = ({ estadisticas, filtros }) => {
  const reporteRef = useRef();

  const handlePrint = async () => {
    if (reporteRef.current) {
      try {
        const canvas = await html2canvas(reporteRef.current, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Reporte de Estadísticas</title>
              <style>
                body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <h1>Reporte de Estadísticas Pesqueras</h1>
              <p>Fecha de generación: ${new Date().toLocaleDateString()}</p>
              <img src="${imgData}" />
              <script>window.onload = function () { window.print(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } catch (error) {
        console.error('Error al generar la impresión:', error);
      }
    }
  };

  if (!estadisticas) {
    return <Typography variant="h6" align="center">No se encontraron estadísticas.</Typography>;
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <div ref={reporteRef}>
        <Card sx={{ marginBottom: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" textAlign="center" color="primary" gutterBottom>
               Estadísticas Pesqueras
            </Typography>
            <Typography variant="subtitle1" textAlign="center" color="textSecondary">
              Fecha de generación: {new Date().toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>

        {/* Tabla de filtros aplicados */}
        <Card sx={{ boxShadow: 3, borderRadius: 2, marginBottom: 4 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Estadistica Aplicados
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                
                <TableBody>
                  {Object.entries(filtros).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key.replace('_', ' ').toUpperCase()}</TableCell>
                      <TableCell>{value || 'No especificado'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Resumen General de Estadísticas
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Total de Especies:</strong></TableCell>
                    <TableCell>{estadisticas.resumen_general?.total_especies || 'No disponible'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total de Capturas:</strong></TableCell>
                    <TableCell>{estadisticas.resumen_general?.total_capturas || 'No disponible'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Profundidad Máxima:</strong></TableCell>
                    <TableCell>{estadisticas.resumen_general?.profundidad_maxima || 'No disponible'} m</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Divider sx={{ my: 4 }} />

        {estadisticas.capturas_mas_comunes?.length > 0 && (
          <Card sx={{ boxShadow: 3, borderRadius: 2, marginTop: 4 }}>
            <CardContent>
              <Typography variant="h5" color="secondary" gutterBottom>
                Capturas Más Comunes
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#1976d2' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#fff' }}>Especie</TableCell>
                      <TableCell sx={{ color: '#fff' }} align="right">Peso Retenido (kg)</TableCell>
                      <TableCell sx={{ color: '#fff' }} align="right">Peso Descartado (kg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estadisticas.capturas_mas_comunes.map((captura, index) => (
                      <TableRow key={index}>
                        <TableCell>{captura.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                        <TableCell align="right">{captura.total_peso?.toFixed(2) || 0}</TableCell>
                        <TableCell align="right">{captura.total_descartes?.toFixed(2) || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {estadisticas.tendencia_lances && (
          <Card sx={{ boxShadow: 3, borderRadius: 2, marginTop: 4 }}>
            <CardContent>
              <Typography variant="h5" color="primary" gutterBottom>
                Gráfico de Tendencia de Lances
              </Typography>
              <Box sx={{ height: '400px', maxWidth: '100%' }}>
                <Bar
                  data={{
                    labels: estadisticas.tendencia_lances.map(item => item.year),
                    datasets: [
                      {
                        label: 'Total de Lances',
                        data: estadisticas.tendencia_lances.map(item => item.total_lances),
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                      },
                      {
                        label: 'Profundidad Promedio (m)',
                        data: estadisticas.tendencia_lances.map(item => item.promedio_profundidad),
                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                      },
                    ],
                  }}
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </Box>
            </CardContent>
          </Card>
        )}
      </div>

      <Box textAlign="center" marginTop={4}>
        <Button variant="contained" color="primary" onClick={handlePrint}>
          Imprimir Reporte
        </Button>
      </Box>
    </Box>
  );
};

export default ContenidoEstadisticas;

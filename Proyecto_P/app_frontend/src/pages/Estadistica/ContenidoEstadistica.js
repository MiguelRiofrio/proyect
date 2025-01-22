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
  Grid
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import 'chart.js/auto'; // Asegúrate de importar Chart.js

const ContenidoEstadisticas = ({ estadisticas, filtros }) => {
  const reporteRef = useRef();

  // Logs de depuración
  console.log('ContenidoEstadisticas - estadisticas:', estadisticas);
  console.log('ContenidoEstadisticas - filtros:', filtros);

  const handlePrint = async () => {
    if (reporteRef.current) {
      try {
        const canvas = await html2canvas(reporteRef.current, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        const content = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Reporte de Estadísticas</title>
              <style>
                body {
                  font-family: 'Roboto', Arial, sans-serif;
                  margin: 20px;
                  color: #333;
                }
                img {
                  max-width: 100%;
                  height: auto;
                }
              </style>
            </head>
            <body>
              <h1>Reporte Completo de Estadísticas Pesqueras</h1>
              <h3>Fecha de generación: ${new Date().toLocaleDateString()}</h3>
              <img src="${imgData}" alt="Reporte" />
              <script>
                window.onload = function () {
                  window.print();
                };
              </script>
            </body>
          </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
      } catch (error) {
        console.error('Error al generar la impresión:', error);
      }
    } else {
      console.error('No se encontró el contenido del reporte para imprimir.');
    }
  };

  // Verificar si hay filtros aplicados
  const filtrosAplicados = Object.keys(filtros).some(key => filtros[key]);

  const desembarqueData = estadisticas?.capturas_mas_comunes?.length > 0 ? {
    labels: estadisticas.capturas_mas_comunes.map((item) => item.especie__nombre_cientifico || 'Desconocido'),
    datasets: [
      {
        label: 'Peso Retenido (kg)',
        data: estadisticas.capturas_mas_comunes.map((item) => item.total_peso || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Peso Descartado (kg)',
        data: estadisticas.capturas_mas_comunes.map((item) => item.total_descartes || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  } : null;

  const tendenciaLancesData = estadisticas?.tendencia_lances?.length > 0 ? {
    labels: estadisticas.tendencia_lances.map((item) => item.year),
    datasets: [
      {
        label: 'Total de Lances',
        data: estadisticas.tendencia_lances.map((item) => item.total_lances),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Promedio de Profundidad (m)',
        data: estadisticas.tendencia_lances.map((item) => item.promedio_profundidad),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
      },
    ],
  } : null;

  if (!estadisticas) {
    return (
      <Typography variant="h6" align="center">
        No se encontraron estadísticas.
      </Typography>
    );
  }

  return (
    <>
      <div ref={reporteRef}>
        <Card sx={{ margin: 4 }}>
          <CardContent>
            <Box sx={{ padding: 2, backgroundColor: '#ffffff', marginBottom: 4 }}>
              <Typography variant="h4" textAlign="center" gutterBottom>
                Reporte Completo de Estadísticas Pesqueras
              </Typography>
              <Typography variant="subtitle1" textAlign="center" gutterBottom>
                Fecha de generación: {new Date().toLocaleDateString()}
              </Typography>

              <Box sx={{ marginTop: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {filtrosAplicados ? 'Filtros Aplicados:' : 'Se muestran todos los datos disponibles'}
                </Typography>
                {filtrosAplicados ? (
                  <>
                    {filtros.embarcacion && <Typography variant="body1"><strong>Embarcación:</strong> {filtros.embarcacion}</Typography>}
                    {filtros.taxa && <Typography variant="body1"><strong>Taxa:</strong> {filtros.taxa}</Typography>}
                    {filtros.fecha_inicio && <Typography variant="body1"><strong>Fecha Inicio:</strong> {filtros.fecha_inicio}</Typography>}
                    {filtros.fecha_fin && <Typography variant="body1"><strong>Fecha Fin:</strong> {filtros.fecha_fin}</Typography>}
                    {filtros.profundidad_min && <Typography variant="body1"><strong>Profundidad Mínima:</strong> {filtros.profundidad_min} m</Typography>}
                    {filtros.profundidad_max && <Typography variant="body1"><strong>Profundidad Máxima:</strong> {filtros.profundidad_max} m</Typography>}
                  </>
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No se han aplicado filtros, mostrando todos los registros disponibles.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Resumen de estadísticas generales */}
            <Box sx={{ marginBottom: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Estadísticas Generales
                  </Typography>
                  {estadisticas.resumen_general ? (
                    <>
                      <Typography variant="body1">
                        <strong>Total de Especies:</strong> {estadisticas.resumen_general.total_especies || 'No disponible'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Total de Capturas:</strong> {estadisticas.resumen_general.total_capturas || 'No disponible'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Total de Avistamientos:</strong> {estadisticas.resumen_general.total_avistamientos || 'No disponible'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Total de Incidencias:</strong> {estadisticas.resumen_general.total_incidencias || 'No disponible'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Total de Lances:</strong> {estadisticas.resumen_general.total_lances || 'No disponible'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Profundidad Máxima:</strong> {estadisticas.resumen_general.profundidad_maxima || 'No disponible'} m
                      </Typography>
                      <Typography variant="body1">
                        <strong>Profundidad Mínima:</strong> {estadisticas.resumen_general.profundidad_minima || 'No disponible'} m
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body1" color="textSecondary" align="center">
                      No hay datos disponibles para estadísticas generales.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>

            <Divider />

            {/* Capturas más comunes */}
            {estadisticas.capturas_mas_comunes?.length > 0 ? (
              <Box sx={{ marginTop: 4, marginBottom: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Capturas Más Comunes
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Especie</strong></TableCell>
                        <TableCell align="right"><strong>Total Capturado (kg)</strong></TableCell>
                        <TableCell align="right"><strong>Total Descartado (kg)</strong></TableCell>
                        <TableCell align="right"><strong>Max Peso (kg)</strong></TableCell>
                        <TableCell align="right"><strong>Min Peso (kg)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {estadisticas.capturas_mas_comunes.map((captura, index) => (
                        <TableRow key={index}>
                          <TableCell>{captura.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                          <TableCell align="right">{captura.total_peso?.toFixed(2) || 0} kg</TableCell>
                          <TableCell align="right">{captura.total_descartes?.toFixed(2) || 0} kg</TableCell>
                          <TableCell align="right">{captura.max_peso?.toFixed(2) || 0} kg</TableCell>
                          <TableCell align="right">{captura.min_peso?.toFixed(2) || 0} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography variant="body1" align="center" color="textSecondary" sx={{ marginTop: 4 }}>
                No hay capturas registradas.
              </Typography>
            )}

            {/* Avistamientos más comunes */}
            {estadisticas.avistamientos_mas_comunes?.length > 0 ? (
              <Box sx={{ marginTop: 4, marginBottom: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Avistamientos Más Comunes
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Especie</strong></TableCell>
                        <TableCell align="right"><strong>Total Avistamientos</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {estadisticas.avistamientos_mas_comunes.map((avistamiento, index) => (
                        <TableRow key={index}>
                          <TableCell>{avistamiento.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                          <TableCell align="right">{avistamiento.total_avistamientos || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography variant="body1" align="center" color="textSecondary" sx={{ marginTop: 4 }}>
                No hay avistamientos registrados.
              </Typography>
            )}

            {/* Incidencias más comunes */}
            {estadisticas.incidencias_mas_comunes?.length > 0 ? (
              <Box sx={{ marginTop: 4, marginBottom: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Incidencias Más Comunes
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Especie</strong></TableCell>
                        <TableCell align="right"><strong>Total Incidencias</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {estadisticas.incidencias_mas_comunes.map((incidencia, index) => (
                        <TableRow key={index}>
                          <TableCell>{incidencia.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                          <TableCell align="right">{incidencia.total_incidencias || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Typography variant="body1" align="center" color="textSecondary" sx={{ marginTop: 4 }}>
                No hay incidencias registradas.
              </Typography>
            )}

            {/* Gráfico de Niveles de Desembarque */}
            {desembarqueData ? (
              <Box sx={{ marginTop: 4, marginBottom: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Gráfico de Niveles de Desembarque
                    </Typography>
                    <Box sx={{ height: '400px', maxWidth: '100%' }}>
                      <Bar data={desembarqueData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Typography variant="body1" color="textSecondary" align="center" sx={{ marginTop: 4 }}>
                No hay datos suficientes para generar el gráfico de desembarque.
              </Typography>
            )}

            {/* Gráfico de Tendencia de Lances */}
            {tendenciaLancesData ? (
              <Box sx={{ marginTop: 4, marginBottom: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tendencia de Lances por Año
                    </Typography>
                    <Box sx={{ height: '400px', maxWidth: '100%' }}>
                      <Bar data={tendenciaLancesData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ) : (
              <Typography variant="body1" color="textSecondary" align="center" sx={{ marginTop: 4 }}>
                No hay datos suficientes para generar el gráfico de tendencia de lances.
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>

      <Box textAlign="center" marginTop={4}>
        <Button variant="contained" color="primary" onClick={handlePrint}>
          Vista previa / Imprimir Reporte
        </Button>
      </Box>
    </>
  );
};

export default ContenidoEstadisticas;

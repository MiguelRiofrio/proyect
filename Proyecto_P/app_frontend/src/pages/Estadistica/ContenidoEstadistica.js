import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import 'chart.js/auto';

const ContenidoEstadisticas = ({ estadisticas, filtros }) => {
  const reporteRef = useRef();

  // Función auxiliar para normalizar un arreglo de números a una escala de 0 a 100,
  // redondeando cada valor a dos decimales.
  const normalizeArray = (dataArray) => {
    const max = Math.max(...dataArray);
    if (max === 0) return dataArray.map(() => 0);
    return dataArray.map((value) => parseFloat(((value / max) * 100).toFixed(2)));
  };

  // Opciones de gráfico: eje Y fijo de 0 a 100 y ticks formateados a dos decimales.
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: (value) => parseFloat(value).toFixed(2),
        },
      },
    },
  };

  // Preparar datos normalizados para la tendencia de lances por año.
  const tendenciaLances = estadisticas.tendencia_lances_por_ano || [];
  const lancesValues = tendenciaLances.map((item) => item.total_lances);
  const lancesNormalized = normalizeArray(lancesValues);
  const profundidadValues = tendenciaLances.map((item) => item.promedio_profundidad);
  const profundidadNormalized = normalizeArray(profundidadValues);

  // Preparar datos normalizados para la tendencia de capturas por mes.
  const tendenciaCapturas = estadisticas.tendencia_capturas_por_mes || [];
  const capturasValues = tendenciaCapturas.map((item) => item.total_capturas);
  const capturasNormalized = normalizeArray(capturasValues);
  const pesoRetenidoValues = tendenciaCapturas.map((item) => item.total_peso_retenido);
  const pesoRetenidoNormalized = normalizeArray(pesoRetenidoValues);

  // Calcular porcentajes para el gráfico Doughnut (Peso Retenido vs. Peso Descarte).
  const totalRetenido = estadisticas.resumen_general?.total_peso_retenido || 0;
  const totalDescarte = estadisticas.resumen_general?.total_peso_descarte || 0;
  const sumWeights = totalRetenido + totalDescarte;
  const pctRetenido =
    sumWeights > 0 ? parseFloat(((totalRetenido / sumWeights) * 100).toFixed(2)) : 0;
  const pctDescarte =
    sumWeights > 0 ? parseFloat(((totalDescarte / sumWeights) * 100).toFixed(2)) : 0;

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
    return (
      <Typography variant="h6" align="center">
        No se encontraron estadísticas.
      </Typography>
    );
  }

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Box ref={reporteRef}>
        {/* Encabezado */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h4" align="center" color="primary" gutterBottom>
              Estadísticas Pesqueras
            </Typography>
            <Typography variant="subtitle1" align="center" color="textSecondary">
              Fecha de generación: {new Date().toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>

        {/* Filtros Aplicados */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Filtros Aplicados
            </Typography>
            <TableContainer component={Paper}>
              <Table stickyHeader size="small">
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

        {/* Resumen General */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Resumen General
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[
                { label: 'Total de Especies', value: estadisticas.resumen_general?.total_especies },
                { label: 'Total de Capturas', value: estadisticas.resumen_general?.total_capturas },
                { label: 'Total de Avistamientos', value: estadisticas.resumen_general?.total_avistamientos },
                { label: 'Total de Incidencias', value: estadisticas.resumen_general?.total_incidencias },
                { label: 'Total de Lances', value: estadisticas.resumen_general?.total_lances },
                { label: 'Profundidad Máxima (m)', value: estadisticas.resumen_general?.profundidad_maxima },
                { label: 'Profundidad Mínima (m)', value: estadisticas.resumen_general?.profundidad_minima },
                { label: 'Total Peso Retenido (kg)', value: estadisticas.resumen_general?.total_peso_retenido },
                { label: 'Total Peso Descarte (kg)', value: estadisticas.resumen_general?.total_peso_descarte },
                {
                  label: 'Porcentaje de Descartes',
                  value: estadisticas.resumen_general?.porcentaje_descartes
                    ? estadisticas.resumen_general.porcentaje_descartes.toFixed(2) + '%'
                    : 'No disponible',
                },
              ].map((item, idx) => (
                <Box key={idx} sx={{ flex: '1 1 33%', minWidth: '200px' }}>
                  <Typography variant="subtitle1">
                    <strong>{item.label}:</strong>{' '}
                    {item.value !== undefined ? item.value : 'No disponible'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Gráficos de Tendencias */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Gráficos de Tendencias
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {/* Doughnut Chart */}
              <Box sx={{ flex: '1 1 100%', maxWidth: '500px', textAlign: 'center' }}>
                <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Porcentaje de Descartes (Doughnut)
                    </Typography>
                    <Box sx={{ height: '300px' }}>
                      <Doughnut
                        data={{
                          labels: ['Peso Retenido', 'Peso Descarte'],
                          datasets: [
                            {
                              data: [pctRetenido, pctDescarte],
                              backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                            },
                          ],
                        }}
                        options={{ plugins: { legend: { position: 'bottom' } } }}
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Este gráfico muestra la proporción entre el peso retenido y el peso descartado.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Tendencia de Lances (Bar) */}
              <Box sx={{ flex: '1 1 45%', minWidth: '300px', textAlign: 'center' }}>
                <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Tendencia de Lances (Bar)
                    </Typography>
                    <Box sx={{ height: '300px' }}>
                      <Bar
                        data={{
                          labels: tendenciaLances.map((item) => item.year),
                          datasets: [
                            {
                              label: 'Total de Lances',
                              data: lancesNormalized,
                              backgroundColor: 'rgba(54, 162, 235, 0.6)',
                            },
                          ],
                        }}
                        options={chartOptions}
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Evolución de los lances a lo largo de los años (normalizado).
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Tendencia de Lances (Line) */}
              <Box sx={{ flex: '1 1 45%', minWidth: '300px', textAlign: 'center' }}>
                <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Tendencia de Lances (Line)
                    </Typography>
                    <Box sx={{ height: '300px' }}>
                      <Line
                        data={{
                          labels: tendenciaLances.map((item) => item.year),
                          datasets: [
                            {
                              label: 'Promedio Profundidad (m)',
                              data: profundidadNormalized,
                              borderColor: 'rgba(255, 206, 86, 0.6)',
                              backgroundColor: 'rgba(255, 206, 86, 0.2)',
                              fill: true,
                            },
                          ],
                        }}
                        options={chartOptions}
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Promedio de profundidad por año, normalizado.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Tendencia de Capturas (Bar) */}
              <Box sx={{ flex: '1 1 45%', minWidth: '300px', textAlign: 'center' }}>
                <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Tendencia de Capturas (Bar)
                    </Typography>
                    <Box sx={{ height: '300px' }}>
                      <Bar
                        data={{
                          labels: tendenciaCapturas.map((item) => `Mes ${item.mes}`),
                          datasets: [
                            {
                              label: 'Total de Capturas',
                              data: capturasNormalized,
                              backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            },
                          ],
                        }}
                        options={chartOptions}
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Evolución mensual de capturas, normalizado.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Tendencia de Capturas (Line) */}
              <Box sx={{ flex: '1 1 45%', minWidth: '300px', textAlign: 'center' }}>
                <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="secondary" gutterBottom>
                      Tendencia de Capturas (Line)
                    </Typography>
                    <Box sx={{ height: '300px' }}>
                      <Line
                        data={{
                          labels: tendenciaCapturas.map((item) => `Mes ${item.mes}`),
                          datasets: [
                            {
                              label: 'Total Peso Retenido (kg)',
                              data: pesoRetenidoNormalized,
                              borderColor: 'rgba(153, 102, 255, 0.6)',
                              backgroundColor: 'rgba(153, 102, 255, 0.2)',
                              fill: true,
                            },
                          ],
                        }}
                        options={chartOptions}
                      />
                    </Box>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Evolución mensual del peso retenido en capturas, normalizado.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tablas de Detalle - Dispuestas Verticalmente */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Tablas de Detalle
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Niveles de Desembarque */}
              {estadisticas.niveles_desembarque?.length > 0 && (
                <Box>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        Niveles de Desembarque
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                              <TableCell sx={{ color: '#fff' }}>Especie</TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Retenido (kg)
                              </TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Descarte (kg)
                              </TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Capturas
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {estadisticas.niveles_desembarque.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                                <TableCell align="right">{item.total_retenido?.toFixed(2) || 0}</TableCell>
                                <TableCell align="right">{item.total_descarte?.toFixed(2) || 0}</TableCell>
                                <TableCell align="right">{item.total_capturas || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
              )}
              {/* Esfuerzo Pesquero por Embarcación */}
              {estadisticas.esfuerzo_pesquero?.length > 0 && (
                <Box>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        Esfuerzo Pesquero por Embarcación
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                              <TableCell sx={{ color: '#fff' }}>Embarcación</TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Lances
                              </TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Promedio Profundidad (m)
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {estadisticas.esfuerzo_pesquero.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.actividad__embarcacion__nombre_embarcacion || 'Desconocido'}</TableCell>
                                <TableCell align="right">{item.total_lances || 0}</TableCell>
                                <TableCell align="right">{item.promedio_profundidad?.toFixed(2) || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
              )}
              {/* Capturas Más Comunes */}
              {estadisticas.capturas_mas_comunes?.length > 0 && (
                <Box>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        Capturas Más Comunes
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                              <TableCell sx={{ color: '#fff' }}>Especie</TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Capturado (kg)
                              </TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Descartes (kg)
                              </TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Max Peso (kg)
                              </TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Min Peso (kg)
                              </TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Capturas
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {estadisticas.capturas_mas_comunes.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                                <TableCell align="right">{item.total_capturado?.toFixed(2) || 0}</TableCell>
                                <TableCell align="right">{item.total_descartes?.toFixed(2) || 0}</TableCell>
                                <TableCell align="right">{item.max_peso?.toFixed(2) || 0}</TableCell>
                                <TableCell align="right">{item.min_peso?.toFixed(2) || 0}</TableCell>
                                <TableCell align="right">{item.total_capturas || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
              )}
              {/* Avistamientos Más Comunes */}
              {estadisticas.avistamientos_mas_comunes?.length > 0 && (
                <Box>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        Avistamientos Más Comunes
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                              <TableCell sx={{ color: '#fff' }}>Especie</TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Avistamientos
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {estadisticas.avistamientos_mas_comunes.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                                <TableCell align="right">{item.total_avistamientos || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
              )}
              {/* Incidencias Más Comunes */}
              {estadisticas.incidencias_mas_comunes?.length > 0 && (
                <Box>
                  <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6" color="secondary" gutterBottom>
                        Incidencias Más Comunes
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                              <TableCell sx={{ color: '#fff' }}>Especie</TableCell>
                              <TableCell sx={{ color: '#fff' }} align="right">
                                Total Incidencias
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {estadisticas.incidencias_mas_comunes.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.especie__nombre_cientifico || 'Desconocido'}</TableCell>
                                <TableCell align="right">{item.total_incidencias || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handlePrint}>
          Imprimir Reporte
        </Button>
      </Box>
    </Box>
  );
};

export default ContenidoEstadisticas;

import React, { useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
} from '@mui/material';
import html2canvas from 'html2canvas';
import { generarTextoResumen } from './components/ResumenReporte'; // Asegúrate de que la ruta sea correcta
import DetalleTabla from './components/DetalleTabla'; // Ajusta la ruta según tu estructura

const ContenidoReporte = ({ reporte, filtros }) => {
  const reporteRef = useRef();

  // Llamadas a hooks que dependen de `reporte` deben realizarse siempre.
  const monthNames = {
    "1": "Enero", "2": "Febrero", "3": "Marzo", "4": "Abril",
    "5": "Mayo", "6": "Junio", "7": "Julio", "8": "Agosto",
    "9": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
  };

  const mesMaxAvistamientos = useMemo(() => {
    const distribucion = reporte && reporte.distribucion_avistamientos_por_mes
      ? reporte.distribucion_avistamientos_por_mes
      : [];
    return distribucion.reduce((prev, curr) =>
      (curr.total_avistamientos > (prev.total_avistamientos || 0) ? curr : prev), {});
  }, [reporte]);

  const topEmbarcacion = useMemo(() => {
    const datos = reporte && reporte.esfuerzo_por_embarcacion
      ? reporte.esfuerzo_por_embarcacion
      : [];
    return datos.length > 0
      ? datos.reduce((prev, curr) =>
          (curr.total_lances > prev.total_lances ? curr : prev), { total_lances: 0 })
      : null;
  }, [reporte]);

  if (!reporte) {
    return (
      <Typography variant="h6" align="center">
        Cargando reporte...
      </Typography>
    );
  }

  const filtrosObj = reporte.filtros_aplicados || {};
  const resumen = reporte.resumen_general || {};
  const detalleAdicional = reporte.detalle_adicional || {};

  const topCapturas = reporte.capturas_por_especie && reporte.capturas_por_especie.length > 0
    ? reporte.capturas_por_especie.slice(0, 3).map(item => item.especie__nombre_cientifico).join(', ')
    : 'No disponibles';
  const topAvistamientos = reporte.avistamientos_por_especie && reporte.avistamientos_por_especie.length > 0
    ? reporte.avistamientos_por_especie.slice(0, 3).map(item => item.especie__nombre_cientifico).join(', ')
    : 'No disponibles';
  const topIncidencias = reporte.incidencias_por_especie && reporte.incidencias_por_especie.length > 0
    ? reporte.incidencias_por_especie.slice(0, 3).map(item => item.especie__nombre_cientifico).join(', ')
    : 'No disponibles';

  const textoResumenCompleto = generarTextoResumen({
    filtrosObj,
    resumen,
    detalleAdicional,
    topCapturas,
    topAvistamientos,
    topIncidencias,
    tendenciaLances: reporte.tendencia_lances, // Se pasa la lista completa
    mesMaxAvistamientos,
    topEmbarcacion,
    monthNames,
  });

  const handlePrint = async () => {
    if (reporteRef.current) {
      try {
        const canvas = await html2canvas(reporteRef.current, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Reporte Pesquero</title>
              <style>
                body { font-family: 'Roboto', Arial, sans-serif; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <h1>Reporte Pesquero</h1>
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

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Box ref={reporteRef}>
        {/* Encabezado */}
        <Box
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            padding: 3,
            borderRadius: 2,
            mb: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Reporte Pesquero
          </Typography>
          <Typography variant="h6">
            Generado el: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        {/* Resumen Unificado */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Resumen del Reporte
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-line', textAlign: 'justify' }}
              dangerouslySetInnerHTML={{ __html: textoResumenCompleto }}
            />
          </CardContent>
        </Card>

        {/* Sección de Tablas de Detalle */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              Tablas de Detalle
            </Typography>

            {/* Capturas por Especie */}
            <DetalleTabla
              title="Capturas por Especie"
              data={reporte.capturas_mas_comunes}
              columns={[
                { field: 'especie__nombre_cientifico' },
                { field: 'total_capturado', align: 'right' },
                { field: 'total_peso', align: 'right' },
                { field: 'max_peso', align: 'right', label: 'Máx' },
                { field: 'min_peso', align: 'right', label: 'Mín' },
              ]}
            />

            {/* Avistamientos por Especie */}
            <DetalleTabla
              title="Avistamientos por Especie"
              data={reporte.avistamientos_mas_comunes}
              columns={[
                { field: 'especie__nombre_cientifico' },
                { field: 'total_avistamientos', align: 'right' },
              ]}
            />

            {/* Incidencias por Tipo */}
            <DetalleTabla
              title="Incidencias por Tipo (por Especie)"
              data={reporte.incidencias_por_tipo}
              columns={[
                { field: 'especie__nombre_cientifico', label: 'Nombre Cientifico'  },
                { field: 'herida_grave', align: 'right', label: 'Grave' },
                { field: 'herida_leve', align: 'right', label: 'Leve' },
                { field: 'muerto', align: 'right', label: 'Muerto' },
              ]}
            />

            {/* Esfuerzo Pesquero por Embarcación */}
            <DetalleTabla
              title="Esfuerzo Pesquero por Embarcación"
              data={reporte.esfuerzo_por_embarcacion}
              columns={[
                { field: 'embarcacion__nombre_embarcacion', label:'Embarcaciones' },
                { field: 'total_lances', align: 'right', label:'Total lances' },
              ]}
            />
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

export default ContenidoReporte;

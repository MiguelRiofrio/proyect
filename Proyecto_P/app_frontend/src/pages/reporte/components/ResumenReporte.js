// ResumenReporte.js
export const generarTextoResumen = ({
    filtrosObj,
    resumen,
    detalleAdicional,
    topCapturas,
    topAvistamientos,
    topIncidencias,
    tendenciaLances, // Ahora se recibe la lista completa de tendencias anuales
    mesMaxAvistamientos,
    topEmbarcacion,
    monthNames,
  }) => {
    // Generamos el texto de filtros aplicados
    const textoFiltros = Object.entries(filtrosObj)
      .map(([key, value]) => {
        let displayValue = value || 'No especificado';
        if (key.toLowerCase().includes('mes')) {
          if (typeof value === 'string' && value.includes(',')) {
            displayValue = value
              .split(',')
              .map((val) => monthNames[val.trim()] || val)
              .join(', ');
          } else {
            displayValue = monthNames[value] || value;
          }
        }
        return `${key.replace('_', ' ')}: ${displayValue}`;
      })
      .join(' - ');
  
    // Generamos la sección de actividad anual de forma dinámica
    const actividadAnual = (tendenciaLances && tendenciaLances.length > 0)
      ? tendenciaLances
          .map(item => `- En ${item.year} se reportaron ${item.total_lances || 'N/D'} lances (promedio de profundidad: ${item.promedio_profundidad ? item.promedio_profundidad.toFixed(2) : 'N/D'} m).`)
          .join('<br/>')
      : '- N/D';
  
    // Retornamos el HTML formateado en párrafos
    return `
  El reporte se generó utilizando los siguientes filtros: ${textoFiltros}.
  
  <strong>Resumen General:</strong>
  - Se han registrado ${resumen.total_especies || 0} especies (de las cuales ${resumen.total_especies_unicas_capturadas || 0} fueron capturadas al menos una vez).
  - Se registraron ${resumen.total_capturas || 0} capturas, ${resumen.total_avistamientos || 0} avistamientos, ${resumen.total_incidencias || 0} incidencias y ${resumen.total_lances || 0} lances.
  - La profundidad varió entre ${resumen.profundidad_minima || 0 } y ${resumen.profundidad_maxima || 'Sin Especificar'} metros.
  - Se obtuvo un total de ${resumen.total_peso_retenido || 'Sin Especificar'} kg de peso retenido y ${resumen.total_peso_descarte || 'No disponible'} kg de peso de descarte (equivalente a ${resumen.porcentaje_descartes ? resumen.porcentaje_descartes.toFixed(2) + '%' : 'No disponible'} de descartes).
  
  <strong>Detalles Adicionales:</strong>
  - Promedio de capturas por lance: ${detalleAdicional.promedio_capturas_por_lance || 0}.
  - Promedio de peso retenido por lance: ${detalleAdicional.promedio_peso_retenido_por_lance || 0} kg.
  - Ratio de capturas por especie única: ${detalleAdicional.ratio_capturas_por_especie_unica || 0}.
  
  <strong>Principales Resultados por Especie:</strong>
  - Especies con mayor capturas: ${topCapturas}.
  - Especies con mayor avistamientos: ${topAvistamientos}.
  - Especies con mayor incidencias: ${topIncidencias}.
  
  <strong>Actividad Anual:</strong>
  ${actividadAnual}
  
  <strong>Otros Aspectos Destacados:</strong>
  - El mes con mayor actividad en avistamientos fue ${mesMaxAvistamientos.nombre_mes || 'N/D'} con ${mesMaxAvistamientos.total_avistamientos || 'N/D'} registros.
  - La embarcación con mayor esfuerzo fue ${topEmbarcacion ? topEmbarcacion.embarcacion__nombre_embarcacion : 'N/D'}, que realizó ${topEmbarcacion ? topEmbarcacion.total_lances : 'N/D'} lances.
    `;
  };
  
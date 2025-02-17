// components/HeatmapLayer.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    // Verificar que el mapa y los puntos existen
    if (!map || !points?.length) return;

    // Asegurarse de que el contenedor del mapa tenga dimensiones válidas
    const size = map.getSize();
    if (size.x === 0 || size.y === 0) {
      console.warn("El contenedor del mapa tiene dimensiones 0; se retrasa la creación de la capa heatmap.");
      return;
    }

    // Convertir los puntos al formato requerido por leaflet.heat: [lat, lng, intensidad]
    const heatPoints = points.map(p => ([
      parseFloat(p.latitud),
      parseFloat(p.longitud),
      1  // Intensidad por defecto; se puede ajustar según la relevancia de cada punto
    ]));

    // Opciones de configuración para la capa heatmap, mejorando la visualización
    const heatLayerOptions = {
      radius: 35,      // Radio de influencia de cada punto en píxeles
      blur: 20,        // Cantidad de desenfoque para suavizar la transición de colores
      maxZoom: 15,     // Zoom máximo en el que se aplicará el efecto heatmap
      minOpacity: 0.5, // Opacidad mínima de la capa
      // Gradiente de colores para lograr una transición visual más suave
      gradient: {
        0.0: 'blue',   // Menor densidad
        0.25: 'cyan',
        0.5: 'lime',
        0.75: 'yellow',
        1.0: 'red'     // Mayor densidad
      }
    };

    // Crear la capa heatmap y agregarla al mapa
    const heatLayer = L.heatLayer(heatPoints, heatLayerOptions).addTo(map);

    // Limpieza: se elimina la capa heatmap al desmontar o actualizar el componente
    return () => {
      if (map && heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points]);

  return null;
};

export default HeatmapLayer;

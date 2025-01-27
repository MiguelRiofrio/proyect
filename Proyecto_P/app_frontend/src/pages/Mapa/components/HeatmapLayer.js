// components/HeatmapLayer.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Transformamos cada punto a [lat, lng, intensidad]
    // Si no tienes una intensidad específica, pon 1 por defecto.
    const heatPoints = points.map((p) => ([
      parseFloat(p.latitud),
      parseFloat(p.longitud),
      1 // o la intensidad que quieras asignar
    ]));

    // Creamos la capa de calor
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 35,  // Aumenta el radio para hacer los puntos más visibles
      blur: 20,    // Aumenta el desenfoque para suavizar la visualización
      maxZoom: 15, // Reduce el zoom máximo para que la capa sea más prominente
      minOpacity: 0.5, // Ajusta la opacidad mínima para que siempre sea visible
      gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'yellow',
        1.0: 'red'
      }  // Cambia el gradiente para un mayor contraste visual
    });
    // Agregamos la capa al mapa
    heatLayer.addTo(map);

    // Quitamos la capa cuando se desmonte el componente o cambien los puntos
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null; // No renderiza nada directamente
};

export default HeatmapLayer;

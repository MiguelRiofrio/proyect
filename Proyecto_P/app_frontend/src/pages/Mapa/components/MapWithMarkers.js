// components/MapWithHeatmap.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import HeatmapLayer from './HeatmapLayer';

const MapWithHeatmap = ({ datos, center, zoom }) => {
  const [geojsonData, setGeojsonData] = useState(null);

  // Cargar GeoJSON de áreas protegidas
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch('/geojson/areas_protegidas_ecuador.json');
        if (!response.ok) throw new Error('Error al cargar el archivo GeoJSON');
        const data = await response.json();
        setGeojsonData(data);
      } catch (error) {
        console.error('Error cargando el GeoJSON:', error);
      }
    };

    fetchGeoJSON();
  }, []);

  // Función para cada feature del GeoJSON (mostrar popup)
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const nombre = feature.properties.nombre || 'Área sin nombre';
      layer.bindPopup(`<strong>Área Protegida:</strong> ${nombre}`);
    }
  };

  // Estilo del GeoJSON (bordes, color de relleno, etc.)
  const geoJsonStyle = useMemo(
    () => ({
      color: '#FF5733',
      weight: 2,
      fillColor: '#FFC300',
      fillOpacity: 0.6,
    }),
    []
  );

  // Filtrar datos válidos con lat/long
  const validPoints = useMemo(() => {
    if (!Array.isArray(datos)) return [];
    return datos.filter(d => parseFloat(d.latitud) && parseFloat(d.longitud));
  }, [datos]);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* Capa del GeoJSON si existe */}
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Capade calor con tus datos filtrados */}
      <HeatmapLayer points={validPoints} />
    </MapContainer>
  );
};

export default MapWithHeatmap;

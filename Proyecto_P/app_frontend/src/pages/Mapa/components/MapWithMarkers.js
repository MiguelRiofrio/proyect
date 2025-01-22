// src/components/MapWithMarkers.jsx

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

const MapWithMarkers = ({ datos, center, zoom, customIcon }) => {
  const [geojsonData, setGeojsonData] = useState(null);

  // Cargar el GeoJSON al montar el componente
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch('/geojson/areas_protegidas_ecuador.json'); // Asegúrate de que esta ruta es correcta
        if (!response.ok) {
          throw new Error('Error al cargar el archivo GeoJSON');
        }
        const data = await response.json();
        setGeojsonData(data);
      } catch (error) {
        console.error('Error cargando el GeoJSON:', error);
      }
    };

    fetchGeoJSON();
  }, []);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const nombre = feature.properties.nombre || 'Área sin nombre';
      const popupContent = `<strong>Área Protegida:</strong> ${nombre}<br>`;
      layer.bindPopup(popupContent);
    }
  };

  const geoJsonStyle = {
    color: '#FF5733', // Color del borde
    weight: 2, // Grosor del borde
    fillColor: '#FFC300', // Color de relleno
    fillOpacity: 0.6, // Opacidad del relleno
  };

  // Validar datos recibidos
  const markers = Array.isArray(datos) ? datos : [];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{
        height: '500px',
        width: '100%',
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {/* Renderizar las áreas protegidas desde el GeoJSON */}
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={geoJsonStyle}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Renderizar los marcadores */}
      {markers.length > 0 ? (
        markers.map((dato, index) => {
          const lat = parseFloat(dato.latitud);
          const lng = parseFloat(dato.longitud);
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Coordenadas inválidas para el marcador en el índice ${index}:`, dato);
            return null;
          }
          return (
            <Marker key={`marker-${index}`} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <strong>Especie:</strong> {dato.especie} <br />
                <strong>Nombre Común:</strong> {dato.nombre_comun} <br />
                <strong>Profundidad:</strong> {dato.profundidad_suelo_marino}m
              </Popup>
            </Marker>
          );
        })
      ) : (
        // Mostrar un popup en el centro si no hay datos
        <Popup position={center}>
          <strong>No hay datos disponibles</strong>
        </Popup>
      )}
    </MapContainer>
  );
};

export default MapWithMarkers;

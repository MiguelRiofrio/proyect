import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapWithMarkers = ({ datos, center, zoom, customIcon }) => {
  const [geojsonData, setGeojsonData] = useState(null); // Estado para el GeoJSON

  // Cargar el GeoJSON al montar el componente
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const response = await fetch('/geojson/areas_protegidas_ecuador.json'); // Ruta al archivo GeoJSON
        if (!response.ok) {
          throw new Error('Error al cargar el archivo GeoJSON');
        }
        const data = await response.json();
        setGeojsonData(data); // Guardar los datos en el estado
      } catch (error) {
        console.error('Error cargando el GeoJSON:', error);
      }
    };

    fetchGeoJSON();
  }, []);

  const RedrawMap = () => {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize(); // Fuerza el redibujado del mapa
    }, [map]);
    return null;
  };

  // Estilo para las áreas protegidas
  const geoJsonStyle = {
    color: '#FF5733', // Color del borde
    weight: 2,        // Grosor del borde
    fillColor: '#FFC300', // Color de relleno
    fillOpacity: 0.6  // Opacidad del relleno
  };

  // Agregar popups para cada área protegida
  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const nombre = feature.properties.nombre || 'Área sin nombre';
      const coordenadas = feature.geometry.coordinates[0] || []; // Coordenadas de la geometría
      const coordenadasText = coordenadas
        .map((coord) => `[${coord[1].toFixed(4)}, ${coord[0].toFixed(4)}]`)
        .join('<br>');
      const popupContent = `
        <strong>Área Protegida:</strong> ${nombre}<br>
        <strong>Coordenadas:</strong><br>${coordenadasText}
      `;
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div className="map-section">
      <MapContainer
        center={center} // Centro inicial del mapa
        zoom={zoom} // Zoom inicial
        className="map-container"
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <RedrawMap />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        {/* Renderizar GeoJSON si está cargado */}
        {geojsonData && (
          <GeoJSON
            data={geojsonData}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Renderizar marcadores individuales si hay datos */}
        {datos.length > 0 &&
          datos.map((dato, index) => (
            <Marker
              key={index}
              position={[dato.latitud, dato.longitud]}
              icon={customIcon}
            >
              <Popup>
                <strong>Coordenadas:</strong> {dato.latitud}, {dato.longitud}<br/>
                <strong>Total Capturas:</strong> {dato.total_individuos}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapWithMarkers;

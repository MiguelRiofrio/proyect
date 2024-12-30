import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapWithMarkers = ({ datos, center, zoom, customIcon, tipo }) => {
  // Verificar que datos[tipo] existe y es un array
  const markers = datos[tipo] || [];
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

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const nombre = feature.properties.nombre || 'Área sin nombre';
      const popupContent = `
        <strong>Área Protegida:</strong> ${nombre}<br>
      `;
      layer.bindPopup(popupContent);
    }
  };

  // Estilo para las áreas protegidas
  const geoJsonStyle = {
    color: '#FF5733', // Color del borde
    weight: 2, // Grosor del borde
    fillColor: '#FFC300', // Color de relleno
    fillOpacity: 0.6, // Opacidad del relleno
  };

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

      {/* Renderizar marcadores dinámicamente según el tipo */}
      {markers.map((dato, index) => (
        <Marker
          key={`${tipo}-${index}`}
          position={[dato.latitud, dato.longitud]}
          icon={customIcon}
        >
          <Popup>
            <strong>Especie:</strong> {dato.especie} <br />
            <strong>Nombre Común:</strong> {dato.nombre_comun} <br />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapWithMarkers;

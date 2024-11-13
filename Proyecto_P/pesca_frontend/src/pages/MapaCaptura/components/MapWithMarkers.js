import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapWithMarkers = ({ datos, center, zoom, customIcon }) => {
  // Hook para redibujar el mapa cuando se monta o cambian los datos
  const RedrawMap = () => {
    const map = useMap();
    useEffect(() => {
      map.invalidateSize(); // Fuerza el redibujado del mapa
    }, [map]);
    return null;
  };

  return (
    <div className="map-section"> {/* Clase para estilos generales */}
      <MapContainer
        center={center} // Centro inicial del mapa
        zoom={zoom} // Zoom inicial
        className="map-container" // Clase específica del mapa
        style={{
          height: '100%', // Estilo inline por si no tienes CSS específico
          width: '100%',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <RedrawMap /> {/* Componente para redibujar */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        {/* Renderizamos marcadores si hay datos */}
        {datos.length > 0 &&
          datos.map((dato, index) => (
            <Marker
              key={index}
              position={[dato.latitud, dato.longitud]} // Coordenadas de cada marcador
              icon={customIcon} // Icono personalizado
            >
              <Popup>
                <strong>Coordenadas:</strong> {dato.latitud}, {dato.longitud}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapWithMarkers;

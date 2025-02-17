// src/components/MapWithHeatmap.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer';
import HeatmapLegend from './Legend'; // Importa la leyenda
import { FaExpand } from 'react-icons/fa';
import './css/MapWithHeatmap.css';

// Componente para recalcular el tamaño del mapa en eventos
const ResizeOnPrint = () => {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      if (map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('beforeprint', handleResize);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('beforeprint', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
};

const MapWithHeatmap = ({ datos, center, zoom, species, info }) => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const defaultBounds = useMemo(
    () => [
      [-10, -100], //norte, oeste
      [5, -75],// sur, este
    ],
    []
  );

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

  const onEachFeature = useCallback((feature, layer) => {
    if (feature.properties) {
      const nombre = feature.properties.nombre
        ? feature.properties.nombre.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : 'Área sin nombre';
      layer.bindPopup(`<strong>Área Protegida:</strong> ${nombre}`);
    }
  }, []);

  const geoJsonStyle = useMemo(() => ({
    color: '#FF5733',
    weight: 2,
    fillColor: '#FFC300',
    fillOpacity: 0.6,
  }), []);

  const validPoints = useMemo(() => {
    if (!Array.isArray(datos)) return [];
    return datos.filter(
      d => !isNaN(parseFloat(d.latitud)) && !isNaN(parseFloat(d.longitud))
    );
  }, [datos]);

  const renderMap = () => (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={zoom}
      maxBounds={defaultBounds}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
      className="leaflet-container"
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
      />
      {geojsonData && (
        <GeoJSON data={geojsonData} style={geoJsonStyle} onEachFeature={onEachFeature} />
      )}
      {validPoints.length > 0 && <HeatmapLayer points={validPoints} />}
      <ResizeOnPrint />
      {/* Agrega la leyenda del heatmap */}
      <HeatmapLegend />
    </MapContainer>
  );

  return (
    <div className="text-center">
      <div className="map-preview-container">
        <div className="map-preview-content">
          {renderMap()}

          {species && (
            <div className="map-overlay">
              <div>
                <strong>Especie:</strong> {species}
              </div>
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="expand-button"
            title="Expandir"
          >
            <FaExpand size={20} />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-container">
          <div className="modal-content">
            <button
              onClick={() => setShowModal(false)}
              className="modal-close-button"
            >
              Cerrar
            </button>
            <div className="map-modal-wrapper">
              {renderMap()}
              {species && (
                <div className="map-overlay modal-overlay">
                  <div>
                    <strong>Especie:</strong> {species}
                  </div>
                  {info && (
                    <div className="map-overlay-info">
                      {info}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapWithHeatmap;

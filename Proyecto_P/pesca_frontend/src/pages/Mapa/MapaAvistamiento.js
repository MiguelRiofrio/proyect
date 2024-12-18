import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, CardHeader, Spinner, Alert } from 'reactstrap';
import MapWithMarkers from './components/MapWithMarkers';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapaAvistamiento = () => {
  const [datos, setDatos] = useState({
    capturas: [],
    avistamientos: [],
    incidencias: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const customIcon = new Icon({
    iconUrl: require('../../assets/pictures/iconFish.png'),
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  // Fetch API Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/localizacion_especies/');
        if (!response.ok) throw new Error('Error al obtener los datos del servidor.');
        const data = await response.json();
        setDatos(data); // Guardar los datos en el estado
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del mapa.');
        console.error('Error al cargar los datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container fluid className="mt-5">
      {error && (
        <Alert color="danger" className="text-center">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner color="primary" size="sm" />
          <p className="mt-3">Cargando datos del mapa...</p>
        </div>
      ) : (
        <Card className="shadow mb-4">
          <CardHeader className="bg-primary text-white">
            <h3 className="mb-0 text-center">Mapa de Captura</h3>
          </CardHeader>
          <CardBody className="p-0">
            <MapWithMarkers
              datos={datos}
              center={[-0.5, -80]} // Coordenadas iniciales
              zoom={6} // Nivel de zoom inicial
              customIcon={customIcon} // Ícono 
              tipo={"avistamientos"}
            />
          </CardBody>
        </Card>
      )}
    </Container>
  );
};

export default MapaAvistamiento;

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Spinner, Alert } from 'reactstrap';
import MapWithMarkers from './components/MapWithMarkers';
import ChartsSection from './components/ChartsSection';
import FilterPanel from './components/FilterPanel';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapaCaptura.css';

const MapaCaptura = () => {
  const [datos, setDatos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const customIcon = new Icon({
    iconUrl: require('../../assets/pictures/iconFish.png'),
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/mapa_a/');
        if (!response.ok) throw new Error('Error al obtener los datos del servidor.');
        const data = await response.json();
        setDatos(data);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del mapa. Intenta nuevamente.');
        console.error('Error al cargar los datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const datosFiltrados = datos.filter((dato) => {
    const coincideNombre = filtro ? dato.nombre_cientifico === filtro : true;

    if (filtroEstado === 'alimentandose') {
      return coincideNombre && dato.alimentandose > 0;
    }
    if (filtroEstado === 'deambulando') {
      return coincideNombre && dato.deambulando > 0;
    }
    if (filtroEstado === 'en_reposo') {
      return coincideNombre && dato.en_reposo > 0;
    }

    return coincideNombre;
  });

  return (
    <Container fluid className="mt-5">
      <Card className="shadow mb-4">
        <CardHeader className="bg-primary text-white">
          <h3 className="mb-0 text-center">Mapa de Capturas y Avistamientos</h3>
        </CardHeader>
        <CardBody>
          {error && (
            <Alert color="danger" className="text-center">
              {error}
            </Alert>
          )}
          {loading ? (
            <div className="text-center">
              <Spinner color="primary" size="lg" />
              <p className="mt-3">Cargando datos del mapa...</p>
            </div>
          ) : (
            <>
              {/* Filtro flotante */}
              <div className="filter-panel-floating shadow">
                <Card className="shadow">
                  <CardHeader className="bg-secondary text-white">
                    <h5 className="mb-0 text-center">Filtros</h5>
                  </CardHeader>
                  <CardBody>
                    <FilterPanel
                      datos={datos}
                      filtro={filtro}
                      filtroEstado={filtroEstado}
                      onFiltroChange={(e) => setFiltro(e.target.value)}
                      onEstadoChange={(e) => setFiltroEstado(e.target.value)}
                    />
                  </CardBody>
                </Card>
              </div>

              {/* Mapa y gráficos */}
              <Row>
                <Col sm={12} className="map-section">
                  <Card className="shadow">
                    <CardHeader className="bg-info text-white">
                      <h5 className="mb-0 text-center">Mapa</h5>
                    </CardHeader>
                    <CardBody className="p-0">
                      <MapWithMarkers
                        datos={datosFiltrados}
                        center={[-0.5, -80]}
                        zoom={6}
                        customIcon={customIcon}
                      />
                    </CardBody>
                  </Card>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col sm={12}>
                  <Card className="shadow">
                    <CardHeader className="bg-success text-white">
                      <h5 className="mb-0 text-center">Análisis Estadístico</h5>
                    </CardHeader>
                    <CardBody>
                      <ChartsSection datos={datosFiltrados} />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default MapaCaptura;

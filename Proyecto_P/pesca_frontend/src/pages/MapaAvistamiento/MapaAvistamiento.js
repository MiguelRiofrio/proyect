import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Spinner, Alert, Button } from 'reactstrap';
import MapWithMarkers from './components/MapWithMarkers';
import ChartsSection from './components/ChartsSection';
import FilterPanel from './components/FilterPanel';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Slide } from '@mui/material';
import { FilterList as FilterListIcon, Close as CloseIcon } from '@mui/icons-material';
import './MapaAvistamiento.css';

const MapaAvistamiento = () => {
  const [datos, setDatos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false); // Estado para controlar el panel deslizante

  const customIcon = new Icon({
    iconUrl: require('../../assets/pictures/iconFish.png'),
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/mapa/');
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
          {/* Botón flotante para mostrar/ocultar el filtro */}
          <Button
            onClick={() => setFilterVisible(!filterVisible)}
            style={{
              position: 'fixed',
              bottom:"20px",
              left: '20px', // Lo mueve a la esquina superior derecha
              zIndex: 1200,
              backgroundColor: '#1976d2',
              color: '#fff',
              borderRadius: '50%',
              padding: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {filterVisible ? <CloseIcon /> : <FilterListIcon />}
          </Button>

          {/* Panel deslizante para filtros */}
          <Slide direction="left" in={filterVisible} mountOnEnter unmountOnExit>
            <div
              style={{
                position: 'fixed',
                top: '0',
                left: '0',
                height: '100%',
                width: '300px',
                backgroundColor: '#f9f9f9',
                boxShadow: '2px 0 5px rgba(0, 0, 0, 0.2)',
                zIndex: 1100,
                overflowY: 'auto',
                padding: '15px',
              }}
            >
              <h5 className="text-center mt-3">Filtros</h5>
              <FilterPanel
                datos={datos}
                filtro={filtro}
                filtroEstado={filtroEstado}
                onFiltroChange={(e) => setFiltro(e.target.value)}
                onEstadoChange={(e) => setFiltroEstado(e.target.value)}
              />
            </div>
          </Slide>

          {/* Mapa */}
          <Card className="shadow mb-4">
            <CardHeader className="bg-primary text-white">
              <h3 className="mb-0 text-center">Mapa de Avistamientos</h3>
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

          {/* Gráficos */}
          <Row className="mt-4">
            <Col sm={12}>
              <Card className="shadow">
                <CardHeader className="bg-success text-white">
                  <h5 className="mb-0 text-center">Análisis Estadístico</h5>
                </CardHeader>
                <CardBody>
                  <ChartsSection datos={datos} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default MapaAvistamiento;

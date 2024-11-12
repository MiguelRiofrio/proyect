import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-grid-system';
import MapWithMarkers from '../../components/MapWithMarkers';
import FilterPanel from '../../components/FilterPanel';
import LoadingModal from '../../components/LoadingModal';
import ChartsSection from '../../components/ChartsSection'; // Asegúrate de que la ruta sea correcta
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapaCaptura.css';
import '../../assets/pictures/iconFish.png';

const MapaCaptura = () => {
  const [datos, setDatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [modalOpen, setModalOpen] = useState(true);

  const customIcon = new Icon({
    iconUrl: require('../../assets/pictures/iconFish.png'),
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/mapa_a/')
      .then((response) => response.json())
      .then((data) => {
        setDatos(data);
        setModalOpen(false);
      })
      .catch((error) => {
        console.error("Error al cargar los datos:", error);
        setModalOpen(false);
      });
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
    <Container fluid>
      <LoadingModal isOpen={modalOpen} />

      {/* Mapa y Filtros */}
      <Row>
        <Col sm={4} className="filter-panel">
          <FilterPanel
            datos={datos}
            filtro={filtro}
            filtroEstado={filtroEstado}
            onFiltroChange={(e) => setFiltro(e.target.value)}
            onEstadoChange={(e) => setFiltroEstado(e.target.value)}
          />
        </Col>
        <Col sm={8} className="map-section">
          <MapWithMarkers
            datos={datosFiltrados}
            center={[-0.5, -80]}
            zoom={6}
            customIcon={customIcon}
          />
        </Col>
      </Row>

      {/* Gráficos */}
      <Row>
        <Col sm={12}>
          <ChartsSection datos={datosFiltrados} />
        </Col>
      </Row>
    </Container>
  );
};

export default MapaCaptura;

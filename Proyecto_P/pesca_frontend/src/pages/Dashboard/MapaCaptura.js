import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-grid-system';
import 'leaflet/dist/leaflet.css';
import ChartComponent from '../charts/ChartComponent';
import AnotherChartComponent from '../charts/AnotherChartComponent';
import GrowthChartComponent from '../charts/GrowthChartComponent';
import iconFish from '../../assets/pictures/iconFish.png';  // Icono personalizado

const MapaCaptura = () => {
  const [datos, setDatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");  // Filtro por estado (alimentándose, deambulando, en reposo)
  const [modalOpen, setModalOpen] = useState(true);

  const navigate = useNavigate();

  const customIcon = new Icon({
    iconUrl: iconFish,
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
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const handleEstadoChange = (e) => {
    setFiltroEstado(e.target.value);
  };

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
    <Container fluid className="grid-layout">
      {/* Modal de Cargando */}
      <Modal isOpen={modalOpen} centered>
        <ModalBody>
          <div style={{ textAlign: 'center' }}>
            <p>Cargando datos del mapa...</p>
            <p>Por favor espere o presione "Cancelar" para regresar a la página principal.</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => navigate('/')}>Cancelar</Button>
        </ModalFooter>
      </Modal>

      {/* Fila para el Mapa y el Panel de Filtros */}
      <Row>
        {/* Mapa */}
        <Col sm={8} className="map-section">
          <MapContainer
            center={[-0.5, -80]}
            zoom={6}
            style={{ height: '400px', width: '100%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
            {datosFiltrados.map((dato, index) => (
              <Marker key={index} position={[dato.latitud, dato.longitud]} icon={customIcon}>
                <Popup>
                  <strong>Coordenadas:</strong> {dato.latitud}, {dato.longitud}
                  <br />
                  <strong>{dato.nombre_cientifico}:</strong> {dato.total_individuos} individuos
                  <br />
                  <strong>Alimentándose:</strong> {dato.alimentandose}
                  <br />
                  <strong>Deambulando:</strong> {dato.deambulando}
                  <br />
                  <strong>En reposo:</strong> {dato.en_reposo}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Col>
        {/* Panel de Filtros */}
        <Col sm={4} className="filter-panel">
          <h3>Filtrar Avistamientos</h3>
          
          {/* Filtro por nombre científico */}
          <label htmlFor="filtro" style={{ fontWeight: 'bold' }}>Filtrar por nombre científico:</label>
          <select id="filtro" value={filtro} onChange={handleFiltroChange} style={{ marginLeft: '10px', width: '100%' }}>
            <option value="">Todas las especies</option>
            {[...new Set(datos.map((dato) => dato.nombre_cientifico))].map((especie, index) => (
              <option key={index} value={especie}>{especie}</option>
            ))}
          </select>

          {/* Filtro por estado (alimentándose, deambulando, en reposo) */}
          <label htmlFor="filtroEstado" style={{ fontWeight: 'bold', marginTop: '10px' }}>Filtrar por estado:</label>
          <select id="filtroEstado" value={filtroEstado} onChange={handleEstadoChange} style={{ marginLeft: '10px', width: '100%' }}>
            <option value="">Todos los estados</option>
            <option value="alimentandose">Alimentándose</option>
            <option value="deambulando">Deambulando</option>
            <option value="en_reposo">En reposo</option>
          </select>
        </Col>
      </Row>

      {/* Fila separada para los gráficos */}
      <Row>
        <Col sm={4} className="chart-section">
          <div style={{ width: '100%', height: '250px' }}>
            <ChartComponent datos={datosFiltrados} />
          </div>
        </Col>
        <Col sm={4} className="chart-section">
          <div style={{ width: '100%', height: '250px' }}>
            <AnotherChartComponent datos={datosFiltrados} />
          </div>
        </Col>

        <Col sm={4} className="chart-section">
          <div style={{ width: '100%', height: '250px' }}>
            <GrowthChartComponent datos={datosFiltrados} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default MapaCaptura;

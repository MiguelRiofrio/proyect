// Mapa.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  Row,
  Col,
  Button,
} from 'reactstrap';
import { FaFilter, FaSyncAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import api from '../../routes/api';
import MapWithMarkers from './components/MapWithMarkers';
import FiltroMapa from './components/FiltroMapa';
import './css/Mapa.css'; // Archivo CSS para estilos personalizados

const Mapa = () => {
  const [datos, setDatos] = useState({ capturas: [], avistamientos: [], incidencias: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState({
    tipoFiltro: 'todos',
    taxaFiltro: '',
    especieFiltro: '',
    profundidadMin: '',
    profundidadMax: '',
    puerto: '',
    embarcacion: '',
    year: '', // Añadido
  });

  const [filtrosDisponibles, setFiltrosDisponibles] = useState({
    taxas: [],
    especies: [],
    puertos: [],
    embarcaciones: [],
    rangoProfundidad: { min: 0, max: 100 },
    años: [], // Añadido
  });

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);

  // Obtener datos desde la API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsApplyingFilter(true);

      // Construcción de parámetros de consulta
      const params = {
        tipo: filtros.tipoFiltro,
        taxa: filtros.taxaFiltro || undefined,
        especie: filtros.especieFiltro || undefined,
        rango_profundidad_min: filtros.profundidadMin || undefined,
        rango_profundidad_max: filtros.profundidadMax || undefined,
        puerto: filtros.puerto || undefined,
        embarcacion: filtros.embarcacion || undefined,
        year: filtros.year || undefined, // Añadido
      };

      // Obtener datos de coordenadas y filtros
      const [coordenadasResponse, filtrosResponse] = await Promise.all([
        api.get(`/localizacion_especies/`, { params }),
        api.get(`/filtros-coordenadas/`, { params }), // Asegúrate de que este endpoint está correctamente configurado
      ]);

      console.log('Datos obtenidos:', coordenadasResponse.data);
      console.log('Filtros disponibles:', filtrosResponse.data);

      setDatos(coordenadasResponse.data || { capturas: [], avistamientos: [], incidencias: [] });

      setFiltrosDisponibles({
        taxas: filtrosResponse.data.taxas || [],
        especies: filtrosResponse.data.especies || [],
        puertos: filtrosResponse.data.puertos || [],
        embarcaciones: filtrosResponse.data.embarcaciones || [],
        rangoProfundidad: filtrosResponse.data.rango_profundidad || { min: 0, max: 100 },
        años: filtrosResponse.data.años || [], // Añadido
      });
    } catch (err) {
      setError('Error al cargar los datos del mapa.');
      console.error('Error al cargar los datos:', err);
    } finally {
      setLoading(false);
      setIsApplyingFilter(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  const aplicarFiltro = () => {
    fetchData();
  };

  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const handleReload = () => {
    fetchData();
  };

  return (
    <Container fluid className="mt-4 mapa-container">
      <Row className="justify-content-center">
        <Col lg={12}>
          <Card className="shadow">
            <CardHeader className="d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">Mapa de Actividades Pesqueras</h5>
              <Button color="light" onClick={handleReload} outline>
                <FaSyncAlt /> Recargar
              </Button>
            </CardHeader>
            <CardBody>
              {error && <Alert color="danger" className="text-center">{error}</Alert>}

              <Row className="mb-3">
                <Col xs="12" className="d-flex justify-content-between align-items-center">
                  <Button color="secondary" onClick={toggleFilter} outline>
                    <FaFilter /> {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </Button>
                </Col>
              </Row>

              <Row>

                {/* Columna de Filtros */}
                {isFilterOpen && (
                  
                  <Col md={3} className="mb-3">
                    <h6 className="mb-0">Filtros</h6>
                    <FiltroMapa
                      filtros={filtros}
                      setFiltros={setFiltros}
                      taxas={filtrosDisponibles.taxas}
                      especies={filtrosDisponibles.especies}
                      puertos={filtrosDisponibles.puertos}
                      embarcaciones={filtrosDisponibles.embarcaciones}
                      rangoProfundidad={filtrosDisponibles.rangoProfundidad}
                      años={filtrosDisponibles.años} // Añadido
                      aplicarFiltro={aplicarFiltro}
                      isApplyingFilter={isApplyingFilter}
                    />
                  </Col>
                )}

                {/* Columna del Mapa */}
                <Col md={isFilterOpen ? 9 : 12} className="mapa-responsive">
                  {loading ? (
                    <div className="text-center my-5">
                      <Spinner color="primary" size="lg" />
                      <p className="mt-3">Cargando datos del mapa...</p>
                    </div>
                  ) : (
                    <MapWithMarkers
                      datos={[...datos.capturas, ...datos.avistamientos, ...datos.incidencias]}
                      center={[-0.5, -80]}
                      zoom={6}
                    />
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Mapa;

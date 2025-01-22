// src/components/Mapa.jsx

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
} from 'reactstrap';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../routes/api'; // Asegúrate de que esta ruta es correcta
import MapWithMarkers from './components/MapWithMarkers'; // Ruta corregida
import FiltroMapa from './components/FiltroMapa'; // Importación del nuevo componente de filtros

// Importar el icono correctamente
import iconFish from '../../assets/pictures/iconFish.png'; // Verifica que el archivo existe en esta ruta

const Mapa = () => {
  // Estado para almacenar los datos de capturas, avistamientos e incidencias
  const [datos, setDatos] = useState({ capturas: [], avistamientos: [], incidencias: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado agrupado para los filtros
  const [filtros, setFiltros] = useState({
    tipoFiltro: 'todos',
    taxaFiltro: '',
    especieFiltro: '',
    profundidadMin: '',
    profundidadMax: '',
  });

  const [taxas, setTaxas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [rangoProfundidad, setRangoProfundidad] = useState({ min: 0, max: 50 });

  // Icono personalizado para el mapa
  const customIcon = new Icon({
    iconUrl: iconFish,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  // Función para obtener datos desde los dos endpoints
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir los parámetros de la solicitud
      const params = { tipo: filtros.tipoFiltro };
      if (filtros.taxaFiltro) {
        params.taxa = filtros.taxaFiltro;
      }

      // Llamadas a los dos endpoints en paralelo
      const [coordenadasResponse, filtrosResponse] = await Promise.all([
        api.get(`/localizacion_especies/`, { params }),  // Trae coordenadas
        api.get(`/filtros-coordenadas/`, { params }), // Trae filtros
      ]);

      console.log('Respuesta de /localizacion_especies:', coordenadasResponse.data);
      console.log('Respuesta de /filtros-coordenadas:', filtrosResponse.data);

      // Verificar la estructura de la respuesta de coordenadas
      if (!coordenadasResponse.data || typeof coordenadasResponse.data !== 'object') {
        throw new Error('La respuesta de /localizacion_especies no es un objeto válido.');
      }

      const { capturas, avistamientos, incidencias } = coordenadasResponse.data;

      setDatos({
        capturas: Array.isArray(capturas) ? capturas : [],
        avistamientos: Array.isArray(avistamientos) ? avistamientos : [],
        incidencias: Array.isArray(incidencias) ? incidencias : [],
      });

      // Establecer filtros
      setTaxas(Array.isArray(filtrosResponse.data.taxas) ? filtrosResponse.data.taxas : []);
      setEspecies(Array.isArray(filtrosResponse.data.especies) ? filtrosResponse.data.especies : []);
      setRangoProfundidad(filtrosResponse.data.rango_profundidad || { min: 0, max: 50 });

      // Establecer profundidad mínima y máxima desde la API con validaciones
      if (filtrosResponse.data.rango_profundidad) {
        setFiltros(prevFiltros => ({
          ...prevFiltros,
          profundidadMin: filtrosResponse.data.rango_profundidad.min != null
            ? filtrosResponse.data.rango_profundidad.min.toString()
            : '',
          profundidadMax: filtrosResponse.data.rango_profundidad.max != null
            ? filtrosResponse.data.rango_profundidad.max.toString()
            : '',
        }));
      } else {
        setFiltros(prevFiltros => ({
          ...prevFiltros,
          profundidadMin: '',
          profundidadMax: '',
        }));
      }

    } catch (err) {
      setError('Error al cargar los datos del mapa.');
      console.error('Error al cargar los datos:', err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar datos al montar el componente y cuando cambian tipoFiltro o taxaFiltro
  useEffect(() => {
    fetchData();
  }, [filtros.tipoFiltro, filtros.taxaFiltro]);

  // useEffect para actualizar las especies cuando cambia la taxa
  useEffect(() => {
    if (filtros.taxaFiltro) {
      // Filtrar especies basadas en la taxa seleccionada
      const especiesFiltradas = datos.capturas
        .concat(datos.avistamientos)
        .concat(datos.incidencias)
        .filter(item => item.taxa && item.taxa.toLowerCase() === filtros.taxaFiltro.toLowerCase())
        .map(item => item.nombre_comun);

      // Eliminar duplicados
      const especiesUnicas = [...new Set(especiesFiltradas)];
      setEspecies(especiesUnicas);
    } else {
      // Si no hay taxa seleccionada, mostrar todas las especies
      const todasEspecies = datos.capturas
        .concat(datos.avistamientos)
        .concat(datos.incidencias)
        .map(item => item.nombre_comun);

      // Eliminar duplicados
      const especiesUnicas = [...new Set(todasEspecies)];
      setEspecies(especiesUnicas);
    }
  }, [filtros.taxaFiltro, datos]);

  // Función para filtrar los datos antes de mostrarlos en el mapa
  const filtrarDatos = () => {
    let datosFiltrados = [];

    // Determinar qué tipos incluir
    const tipos = filtros.tipoFiltro === 'todos' ? ['capturas', 'avistamientos', 'incidencias'] : [filtros.tipoFiltro];

    tipos.forEach(tipo => {
      const items = datos[tipo] || [];
      let filteredItems = [...items];

      if (filtros.especieFiltro) {
        // Filtrar por 'nombre_comun' ya que 'especies' en los filtros son nombres comunes
        filteredItems = filteredItems.filter(item => item.nombre_comun === filtros.especieFiltro);
      }

      if (filtros.taxaFiltro) {
        filteredItems = filteredItems.filter(item => item.taxa && item.taxa.toLowerCase() === filtros.taxaFiltro.toLowerCase());
      }

      if (filtros.profundidadMin || filtros.profundidadMax) {
        filteredItems = filteredItems.filter(item => {
          const profundidad = parseFloat(item.profundidad_suelo_marino);
          return (
            (!filtros.profundidadMin || profundidad >= parseFloat(filtros.profundidadMin)) &&
            (!filtros.profundidadMax || profundidad <= parseFloat(filtros.profundidadMax))
          );
        });
      }

      datosFiltrados = datosFiltrados.concat(filteredItems);
    });

    console.log('Datos filtrados:', datosFiltrados);
    return datosFiltrados;
  };

  // Función para manejar la aplicación de filtros
  const aplicarFiltro = () => {
    fetchData();
  };

  return (
    <Container fluid className="mt-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Mostrar mensaje de error si existe */}
          {error && <Alert color="danger" className="text-center">{error}</Alert>}

          {/* Mostrar spinner mientras se cargan los datos */}
          {loading ? (
            <div className="text-center">
              <Spinner color="primary" size="sm" />
              <p className="mt-3">Cargando datos del mapa...</p>
            </div>
          ) : (
            <Row style={{ height: '500px' }}>
              {/* Panel de Filtros */}
              <Col md={3} style={{ height: '100%' }}>
                <Card className="shadow h-100">
                  <CardHeader className="bg-secondary text-white text-center">
                    <h3 className="mb-0">Filtros</h3>
                  </CardHeader>
                  <CardBody>
                    <FiltroMapa
                      filtros={filtros}
                      setFiltros={setFiltros}
                      taxas={taxas}
                      especies={especies}
                      profundidadMin={filtros.profundidadMin}
                      profundidadMax={filtros.profundidadMax}
                      rangoProfundidad={rangoProfundidad}
                      aplicarFiltro={aplicarFiltro}
                    />
                  </CardBody>
                </Card>
              </Col>

              {/* Mapa */}
              <Col md={9} style={{ height: '100%' }}>
                <Card className="shadow h-100">
                  <CardHeader className="bg-primary text-white text-center">
                    <h3 className="mb-0">Mapa de Captura</h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div style={{ height: '100%', width: '100%' }}>
                      <MapWithMarkers
                        datos={filtrarDatos()}
                        center={[-0.5, -80]} // Coordenadas iniciales
                        zoom={6} // Nivel de zoom inicial
                        customIcon={customIcon} // Ícono personalizado
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Mapa;

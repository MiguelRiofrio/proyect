import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, CardHeader, Spinner, Alert, Row, Col, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import MapWithMarkers from './components/MapWithMarkers';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../routes/api';

const Mapa = () => {
  const [datos, setDatos] = useState({
    capturas: [],
    avistamientos: [],
    incidencias: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("capturas");
  const [especies, setEspecies] = useState([]);
  const [taxas, setTaxas] = useState([]);
  const [especieFiltro, setEspecieFiltro] = useState("");
  const [taxaFiltro, setTaxaFiltro] = useState("");
  const [profundidadMin, setProfundidadMin] = useState("");
  const [profundidadMax, setProfundidadMax] = useState("");

  const customIcon = new Icon({
    iconUrl: require('../../assets/pictures/iconFish.png'),
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dataResponse, especiesResponse, taxasResponse] = await Promise.all([
          api.get('/localizacion_especies/'),
          api.get('crud/especies/'),
          api.get('crud/taxas/'),
        ]);

        setDatos(dataResponse.data);
        setEspecies(especiesResponse.data);
        setTaxas(taxasResponse.data);
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

  const filtrarEspeciesPorTaxa = () => {
    if (taxaFiltro) {
      return especies.filter((especie) => especie.taxa && especie.taxa.toLowerCase() === taxaFiltro.toLowerCase());
    }
    return especies;
  };

  const filtrarDatos = () => {
    let datosFiltrados = {};
  
    // Filtrar por tipo
    if (tipoFiltro === "todos") {
      datosFiltrados = { ...datos };
    } else {
      datosFiltrados = { [tipoFiltro]: datos[tipoFiltro] };
    }
  
    // Aplicar filtro por especie si está seleccionado
    if (especieFiltro) {
      Object.keys(datosFiltrados).forEach((key) => {
        datosFiltrados[key] = datosFiltrados[key].filter((item) => item.especie === especieFiltro);
      });
    }
  
    // Aplicar filtro por taxa si está seleccionado
    if (taxaFiltro) {
      Object.keys(datosFiltrados).forEach((key) => {
        datosFiltrados[key] = datosFiltrados[key].filter(
          (item) => item.taxa && item.taxa.toLowerCase() === taxaFiltro.toLowerCase()
        );
      });
    }
  
    // Aplicar filtro por rango de profundidad si al menos uno de los valores está presente
    if (profundidadMin || profundidadMax) {
      Object.keys(datosFiltrados).forEach((key) => {
        datosFiltrados[key] = datosFiltrados[key].filter((item) => {
          const profundidad = parseFloat(item.profundidad_suelo_marino); // Cambia a `item.profundidad_suelo_marino` si corresponde
          return (
            (!profundidadMin || profundidad >= parseFloat(profundidadMin)) &&
            (!profundidadMax || profundidad <= parseFloat(profundidadMax))
          );
        });
      });
    }
  
    console.log("Datos filtrados:", datosFiltrados); // Depuración
    return datosFiltrados;
  };
  
  return (
    <Container fluid className="mt-5">
      <Row className="justify-content-center">
        <Col lg={10}>
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
            <Row style={{ height: '500px' }}>
              <Col md={3} style={{ height: '100%' }}>
                <Card className="shadow h-100">
                  <CardHeader className="bg-secondary text-white">
                    <h3 className="mb-0 text-center">Filtros</h3>
                  </CardHeader>
                  <CardBody>
                    <Form>
                      <FormGroup>
                        <Label for="tipo">Tipo de Datos</Label>
                        <Input
                          type="select"
                          id="tipo"
                          value={tipoFiltro}
                          onChange={(e) => setTipoFiltro(e.target.value)}
                        >
                          <option value="capturas">Capturas</option>
                          <option value="avistamientos">Avistamientos</option>
                          <option value="incidencias">Incidencias</option>
                          <option value="todos">Todos</option>
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <Label for="taxa">Taxa</Label>
                        <Input
                          type="select"
                          id="taxa"
                          value={taxaFiltro}
                          onChange={(e) => {
                            setTaxaFiltro(e.target.value);
                            setEspecieFiltro(""); // Reiniciar el filtro de especie cuando se selecciona un nuevo taxa
                          }}
                        >
                          <option value="">Seleccione un taxa</option>
                          {taxas.map((taxa, index) => (
                            <option key={index} value={taxa}>
                              {taxa}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                      <FormGroup>
                        <Label for="especie">Especie</Label>
                        <Input
                          type="select"
                          id="especie"
                          value={especieFiltro}
                          onChange={(e) => setEspecieFiltro(e.target.value)}
                        >
                          <option value="">Seleccione una especie</option>
                          {filtrarEspeciesPorTaxa().map((especie) => (
                            <option key={especie.codigo_especie} value={especie.nombre_cientifico}>
                              {especie.nombre_cientifico}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                      <FormGroup>
                      <small className="form-text text-muted">Rango permitido: 0 - 50</small>

                        <Label for="profundidadMin">Profundidad Mínima</Label>
                        <Input
                          type="number"
                          id="profundidadMin"
                          value={profundidadMin}
                          onChange={(e) => setProfundidadMin(e.target.value)}
                          placeholder="Ingrese profundidad mínima"
                          min="0" // Valor mínimo permitido
                          max="50" // Valor máximo permitido
                        />
            
                        <Label for="profundidadMax">Profundidad Máxima</Label>
                        <Input
                          type="number"
                          id="profundidadMax"
                          value={profundidadMax}
                          onChange={(e) => setProfundidadMax(e.target.value)}
                          placeholder="Ingrese profundidad máxima"
                          min="0" // Valor mínimo permitido
                          max="50" // Valor máximo permitido
                        />
                      </FormGroup>
                      <Button color="primary" onClick={() => console.log("Filtro aplicado")}>Aplicar Filtro</Button>
                    </Form>
                  </CardBody>
                </Card>
              </Col>
              <Col md={9} style={{ height: '100%' }}>
                <Card className="shadow h-100">
                  <CardHeader className="bg-primary text-white">
                    <h3 className="mb-0 text-center">Mapa de Captura</h3>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div style={{ height: '100%', width: '100%' }}>
                      <MapWithMarkers
                        datos={filtrarDatos()}
                        center={[-0.5, -80]} // Coordenadas iniciales
                        zoom={6} // Nivel de zoom inicial
                        customIcon={customIcon} // Ícono personalizado
                        tipo={tipoFiltro} // Tipo de datos a mostrar en el mapa
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
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TabContent, TabPane, Nav, NavItem, NavLink, Table, Card, CardBody, CardHeader } from 'reactstrap';
import classnames from 'classnames';
import './style/DetalleActividad.css'; // Archivo CSS personalizado

const DetalleActividadPesquera = () => {
  const { id } = useParams(); // Obtiene el ID de la actividad desde la URL
  const [actividad, setActividad] = useState(null);
  const [lances, setLances] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetalleActividad();
  }, []);

  const fetchDetalleActividad = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/register/actividad/${id}/`);
      setActividad(response.data.actividad);
      setLances(response.data.lances || []);
    } catch (error) {
      console.error('Error al obtener los detalles de la actividad pesquera:', error);
    }
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const renderDetallesLance = (lance) => {
    if (lance.tipo_lance === 'palangre') {
      return (
        <>
          <h5 className="mt-4">Detalles del Lance </h5>
          <Table bordered>
            <thead>
              <tr>
                <th>Carnada 1</th>
                <th>Porcentaje Carnada 1</th>
                <th>Carnada 2</th>
                <th>Porcentaje Carnada 2</th>
                <th>Tipo de Anzuelo</th>
                <th>Cantidad de Anzuelos</th>
                <th>Línea Madre (m)</th>
                <th>Profundidad del Anzuelo (m)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{lance.detalles?.carnada1 || '-'}</td>
                <td>{lance.detalles?.porcentaje_carnada1 || '-'}</td>
                <td>{lance.detalles?.carnada2 || '-'}</td>
                <td>{lance.detalles?.porcentaje_carnada2 || '-'}</td>
                <td>{lance.detalles?.tipo_anzuelo || '-'}</td>
                <td>{lance.detalles?.cantidad_anzuelos || '-'}</td>
                <td>{lance.detalles?.linea_madre_metros || '-'}</td>
                <td>{lance.detalles?.profundidad_anzuelo_metros || '-'}</td>
              </tr>
            </tbody>
          </Table>
        </>
      );
    } else if (lance.tipo_lance === 'cerco') {
      return (
        <>
          <h5 className="mt-4">Detalles del Lance </h5>
          <Table bordered>
            <thead>
              <tr>
                <th>Altura de la Red</th>
                <th>Longitud de la Red</th>
                <th>Malla Cabecero</th>
                <th>Malla Cuerpo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{lance.detalles?.altura_red || '-'}</td>
                <td>{lance.detalles?.longitud_red || '-'}</td>
                <td>{lance.detalles?.malla_cabecero || '-'}</td>
                <td>{lance.detalles?.malla_cuerpo || '-'}</td>
              </tr>
            </tbody>
          </Table>
        </>
      );
    } else if (lance.tipo_lance === 'arrastre') {
      return (
        <>
          <h5 className="mt-4">Detalles del Lance </h5>
          <Table bordered>
            <thead>
              <tr>
                <th>TED</th>
                <th>Copo</th>
                <th>Túnel</th>
                <th>Pico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{lance.detalles?.ted ? 'Sí' : 'No'}</td>
                <td>{lance.detalles?.copo || '-'}</td>
                <td>{lance.detalles?.tunel || '-'}</td>
                <td>{lance.detalles?.pico || '-'}</td>
              </tr>
            </tbody>
          </Table>
        </>
      );
    }
    return <p>No hay detalles disponibles para este tipo de lance.</p>;
  };

  return (
    <div className="container mt-5 detalle-actividad">
      <h1 className="text-center mb-4">Detalle de Actividad Pesquera</h1>

      {actividad && (
        <>
          <Card className="mb-5 shadow">
            <CardHeader className="bg-primary text-white">
              <h3 className="mb-0">Detalles de la Actividad</h3>
            </CardHeader>
            <CardBody>
              <Table className="table-bordered table-hover">
                <tbody>
                  <tr>
                    <th>Código de Actividad</th>
                    <td>{actividad.codigo_actividad}</td>
                  </tr>
                  <tr>
                    <th>Fecha de Salida</th>
                    <td>{actividad.fecha_salida}</td>
                  </tr>
                  <tr>
                    <th>Puerto de Salida</th>
                    <td>{actividad.puerto_salida}</td>
                  </tr>
                  <tr>
                    <th>Fecha de Entrada</th>
                    <td>{actividad.fecha_entrada}</td>
                  </tr>
                  <tr>
                    <th>Puerto de Entrada</th>
                    <td>{actividad.puerto_entrada}</td>
                  </tr>
                  <tr>
                    <th>Nombre del Armador</th>
                    <td>{actividad.nombre_armador}</td>
                  </tr>
                  <tr>
                    <th>Nombre del Capitán</th>
                    <td>{actividad.nombre_capitan}</td>
                  </tr>
                  <tr>
                    <th>Embarcación</th>
                    <td>{actividad.nombre_embarcacion}</td>
                  </tr>
                  <tr>
                    <th>Matrícula</th>
                    <td>{actividad.matricula}</td>
                  </tr>
                  <tr>
                    <th>Observador</th>
                    <td>{actividad.observador}</td>
                  </tr>
                  <tr>
                    <th>Pesca Objetivo</th>
                    <td>{actividad.pesca_objetivo}</td>
                  </tr>
                  <tr>
                    <th>Arte de Pesca</th>
                    <td>{actividad.arte_pesca}</td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>

          {lances.length > 0 ? (
            <div>
              <h3 className="text-center">Lances</h3>
              <Nav tabs className="mb-3">
                {lances.map((lance, index) => (
                  <NavItem key={lance.lance.codigo_lance}>
                    <NavLink
                      className={classnames({ active: activeTab === `lance-${index + 1}` })}
                      onClick={() => toggle(`lance-${index + 1}`)}
                    >
                      Lance {index + 1} 
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>

              <TabContent activeTab={activeTab}>
                {lances.map((lance, index) => (
                  <TabPane key={lance.lance.codigo_lance} tabId={`lance-${index + 1}`}>
                    <Card className="shadow mb-4">
                      <CardHeader className="bg-secondary text-white">
                        <h4 className="mb-0">Lance {index + 1} - {lance.tipo_lance.toUpperCase()}</h4>
                      </CardHeader>
                      <CardBody>
                        <Table bordered>
                          <thead className="table-light">
                            <tr>
                              <th>Número de Lance</th>
                              <th>Calado Fecha</th>
                              <th>Calado Hora</th>
                              <th>Latitud</th>
                              <th>Longitud</th>
                              <th>Profundidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{lance.lance.numero_lance}</td>
                              <td>{lance.lance.calado_fecha}</td>
                              <td>{lance.lance.calado_hora}</td>
                              <td>{lance.lance.latitud}</td>
                              <td>{lance.lance.longitud}</td>
                              <td>{lance.lance.profundidad_suelo_marino}</td>
                            </tr>
                          </tbody>
                        </Table>
                        {renderDetallesLance(lance)}

                      </CardBody>
                    </Card>

                    {/* Capturas */}
                    {lance.capturas.length > 0 && (
                      <Card className="shadow mb-4">
                        <CardHeader className="bg-info text-white">
                          <h5 className="mb-0">Capturas</h5>
                        </CardHeader>
                        <CardBody>
                          <Table bordered>
                            <thead className="table-light">
                              <tr>
                                <th>Nombre Científico</th>
                                <th>Peso Retenido</th>
                                <th>Peso Descartado</th>
                                <th>Total Individuos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lance.capturas.map((captura, index) => (
                                <tr key={index}>
                                  <td>{captura.nombre_cientifico}</td>
                                  <td>{captura.peso_retenido}</td>
                                  <td>{captura.peso_descartado}</td>
                                  <td>{captura.total_individuos}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    )}

                    {/* Avistamientos */}
                    {lance.avistamientos.length > 0 && (
                      <Card className="shadow mb-4">
                        <CardHeader className="bg-success text-white">
                          <h5 className="mb-0">Avistamientos</h5>
                        </CardHeader>
                        <CardBody>
                          <Table bordered>
                            <thead className="table-light">
                              <tr>
                                <th>Nombre Científico</th>
                                <th>Total Individuos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lance.avistamientos.map((avistamiento, index) => (
                                <tr key={index}>
                                  <td>{avistamiento.nombre_cientifico}</td>
                                  <td>{avistamiento.total_individuos}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    )}

                    {/* Incidencias */}
                    {lance.incidencias.length > 0 && (
                      <Card className="shadow mb-4">
                        <CardHeader className="bg-danger text-white">
                          <h5 className="mb-0">Incidencias</h5>
                        </CardHeader>
                        <CardBody>
                          <Table bordered>
                            <thead className="table-light">
                              <tr>
                                <th>Nombre Científico</th>
                                <th>Heridas Graves</th>
                                <th>Heridas Leves</th>
                                <th>Muertos</th>
                                <th>Total Individuos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lance.incidencias.map((incidencia, index) => (
                                <tr key={index}>
                                  <td>{incidencia.nombre_cientifico}</td>
                                  <td>{incidencia.herida_grave}</td>
                                  <td>{incidencia.herida_leve}</td>
                                  <td>{incidencia.muerto}</td>
                                  <td>{incidencia.total_individuos}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    )}
                  </TabPane>
                ))}
              </TabContent>
            </div>
          ) : (
            <p className="text-center mt-4">No hay lances disponibles para esta actividad.</p>
          )}

          <div className="text-center">
            <Button color="secondary" onClick={() => navigate('/actividades')}>
              Volver a la Lista
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default DetalleActividadPesquera;

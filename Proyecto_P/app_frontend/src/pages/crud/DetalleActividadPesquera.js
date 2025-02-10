// DetalleActividadPesquera.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Table,
  Card,
  CardBody,
  CardHeader,
} from 'reactstrap';
import classnames from 'classnames';
import './style/DetalleActividad.css'; // Archivo CSS para estilos personalizados
import api from '../../routes/api';

const DetalleActividadPesquera = () => {
  const { id } = useParams(); // ID de la actividad
  const [actividad, setActividad] = useState(null);
  const [lances, setLances] = useState([]);
  const [activeTab, setActiveTab] = useState('0'); // Tab activa
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetalleActividad = async () => {
      try {
        const response = await api.get(`/crud/actividades/${id}/details/`);
        setActividad(response.data);
        setLances(response.data.lances || []);
      } catch (error) {
        console.error('Error al obtener los detalles de la actividad:', error);
      }
    };
    fetchDetalleActividad();
  }, [id]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // Componentes para detalles específicos
  const DetallesPalangre = ({ detalles }) => (
    <>
      <h5>Detalles Específicos del Lance - Palangre</h5>
      <Table bordered>
        <thead>
          <tr>
            <th>Tamaño del Anzuelo</th>
            <th>Cantidad de Anzuelos</th>
            <th>Línea Madre (m)</th>
            <th>Profundidad del Anzuelo (m)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{detalles.tamano_anzuelo}</td>
            <td>{detalles.cantidad_anzuelos}</td>
            <td>{detalles.linea_madre_metros}</td>
            <td>{detalles.profundidad_anzuelo_metros}</td>
          </tr>
        </tbody>
      </Table>

      {/* Detalles de Carnadas si existen */}
      {detalles.carnadas && detalles.carnadas.length > 0 && (
        <>
          <h5>Detalles de Carnadas</h5>
          <Table bordered hover responsive className="table-striped text-center align-middle">
            <thead>
              <tr>
                <th>Nombre de Carnada</th>
                <th>Porcentaje de Carnada</th>
              </tr>
            </thead>
            <tbody>
              {detalles.carnadas.map((carnada, index) => (
                <tr key={index}>
                  <td>{carnada.nombre_carnada}</td>
                  <td>{carnada.porcentaje_carnada}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );

  const DetallesCerco = ({ detalles }) => (
    <>
      <h5>Detalles Específicos del Lance - Cerco</h5>
      <Table bordered>
        <thead>
          <tr>
            <th>Altura de la Red (m)</th>
            <th>Longitud de la Red (m)</th>
            <th>Malla Cabecero</th>
            <th>Malla Cuerpo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{detalles.altura_red}</td>
            <td>{detalles.longitud_red}</td>
            <td>{detalles.malla_cabecero}</td>
            <td>{detalles.malla_cuerpo}</td>
          </tr>
        </tbody>
      </Table>
    </>
  );

  const DetallesArrastre = ({ detalles }) => (
    <>
      <h5>Detalles Específicos del Lance - Arrastre</h5>
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
            <td>{detalles.ted ? 'Sí' : 'No'}</td>
            <td>{detalles.copo}</td>
            <td>{detalles.tunel}</td>
            <td>{detalles.pico}</td>
          </tr>
        </tbody>
      </Table>
    </>
  );

  const renderLanceDetalles = (lance) => {
    return (
      <>
        <h5>Detalles Generales del Lance</h5>
        <Table bordered hover responsive className="table-striped text-center align-middle">
          <thead>
            <tr>
              <th rowSpan={2}>Número <br />de Lance</th>
              <th rowSpan={2}>Fecha <br />de Calado</th>
              <th rowSpan={2}>Hora <br />de Calado</th>
              <th rowSpan={2}>Profundidad<br /> del Suelo Marino (m)</th>
              <th colSpan={2}>Coordenadas</th>
            </tr>
            <tr>
              <th>Latitud</th>
              <th>Longitud</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{lance.numero_lance}</td>
              <td>{lance.calado_fecha}</td>
              <td>{lance.calado_hora}</td>
              <td>{lance.profundidad_suelo_marino}</td>
              <td>
                {lance.coordenadas
                  ? `${lance.coordenadas.latitud}°`
                  : 'Sin Latitud'}
              </td>
              <td>
                {lance.coordenadas
                  ? `${lance.coordenadas.longitud}°`
                  : 'Sin Longitud'}
              </td>
            </tr>
          </tbody>
        </Table>

        {/* Detalles Específicos del Lance */}
        {lance.detalles?.palangre && (
          <DetallesPalangre detalles={lance.detalles.palangre} />
        )}
        {lance.detalles?.cerco && (
          <DetallesCerco detalles={lance.detalles.cerco} />
        )}
        {lance.detalles?.arrastre && (
          <DetallesArrastre detalles={lance.detalles.arrastre} />
        )}

        {/* Datos de Capturas */}
        {lance.capturas && lance.capturas.length > 0 && (
          <>
            <h5>Capturas</h5>
            <Table bordered>
              <thead>
                <tr>
                  <th>Especie</th>
                  <th>Individuos<br />Retenidos</th>
                  <th>Individuos<br />Descartados</th>
                  <th>Individuos<br />Total</th>
                  <th>Peso<br />Retenido (kg)</th>
                  <th>Peso<br />Descartado (kg)</th>
                  <th>Peso<br />Total</th>
                </tr>
              </thead>
              <tbody>
                {lance.capturas.map((captura, index) => (
                  <tr key={index}>
                    <td>{captura.especie.nombre_cientifico}</td>
                    <td>{captura.individuos_retenidos}</td>
                    <td>{captura.individuos_descarte}</td>
                    <td>{captura.individuos_retenidos - captura.individuos_descarte}</td>
                    <td>{captura.peso_retenido}</td>
                    <td>{captura.peso_descarte}</td>
                    <td>{captura.peso_retenido - captura.peso_descarte}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* Avistamientos */}
        {lance.avistamientos && lance.avistamientos.length > 0 && (
          <>
            <h5>Avistamientos</h5>
            <Table bordered>
              <thead>
                <tr>
                  <th>Especie</th>
                  <th>Grupos</th>
                  <th>Alimentándose</th>
                  <th>Deambulando</th>
                  <th>En Reposo</th>
                </tr>
              </thead>
              <tbody>
                {lance.avistamientos.map((avistamiento, index) => (
                  <tr key={index}>
                    <td>{avistamiento.especie.nombre_cientifico}</td>
                    <td>{avistamiento.grupos_avi_int}</td>
                    <td>{avistamiento.alimentandose}</td>
                    <td>{avistamiento.deambulando}</td>
                    <td>{avistamiento.en_reposo}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* Incidencias */}
        {lance.incidencias && lance.incidencias.length > 0 && (
          <>
            <h5 className="mt-4">Incidencias</h5>
            <Table bordered hover responsive className="table-striped text-center align-middle">
              <thead>
                <tr>
                  <th>Especie</th>
                  <th>Grupos</th>
                  <th>Heridas Graves</th>
                  <th>Heridas Leves</th>
                  <th>Muertos</th>
                  <th>Total Individuos</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {lance.incidencias.map((incidencia, index) => (
                  <React.Fragment key={index}>
                    {/* Fila principal de Incidencia */}
                    <tr>
                      <td>{incidencia.especie?.nombre_cientifico || "Sin Especie"}</td>
                      <td>{incidencia.grupos_avi_int}</td>
                      <td>{incidencia.herida_grave}</td>
                      <td>{incidencia.herida_leve}</td>
                      <td>{incidencia.muerto}</td>
                      <td>{incidencia.Totalindividuos}</td>
                      <td>{incidencia.observacion || "Sin Observación"}</td>
                    </tr>

                    {/* Detalles adicionales alineados (solo si existen) */}
                    {incidencia.detalles_aves && (
                      <tr>
                        <td colSpan="7">
                          <Table bordered hover responsive>
                            <thead>
                              <tr>
                                <th colSpan="3" className="text-center bg-light">
                                  Interacción con las Aves
                                </th>
                              </tr>
                              <tr>
                                <th>Pico</th>
                                <th>Patas</th>
                                <th>Alas</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{incidencia.detalles_aves.aves_pico}</td>
                                <td>{incidencia.detalles_aves.aves_patas}</td>
                                <td>{incidencia.detalles_aves.aves_alas}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    )}

                    {/* Tabla de Detalles de Tortugas */}
                    {incidencia.detalles_tortugas && (
                      <tr>
                        <td colSpan="7">
                          <Table bordered hover responsive>
                            <thead>
                              <tr>
                                <th colSpan="3" className="text-center bg-light">
                                  Interacción con las Tortugas
                                </th>
                              </tr>
                              <tr>
                                <th>Pico</th>
                                <th>Cuerpo</th>
                                <th>Aleta</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{incidencia.detalles_tortugas.tortugas_pico}</td>
                                <td>{incidencia.detalles_tortugas.tortugas_cuerpo}</td>
                                <td>{incidencia.detalles_tortugas.tortugas_aleta}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    )}

                    {/* Tabla de Detalles de Mamíferos */}
                    {incidencia.detalles_mamiferos && (
                      <tr>
                        <td colSpan="7">
                          <Table bordered hover responsive>
                            <thead>
                              <tr>
                                <th colSpan="3" className="text-center bg-light">
                                  Interacción con los Mamíferos
                                </th>
                              </tr>
                              <tr>
                                <th>Hocico</th>
                                <th>Cuello</th>
                                <th>Cuerpo</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{incidencia.detalles_mamiferos.mamiferos_hocico}</td>
                                <td>{incidencia.detalles_mamiferos.mamiferos_cuello}</td>
                                <td>{incidencia.detalles_mamiferos.mamiferos_cuerpo}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    )}

                    {/* Tabla de Detalles de Palangre */}
                    {incidencia.detalles_Incpalangre && (
                      <tr>
                        <td colSpan="7">
                          <Table bordered hover responsive>
                            <thead>
                              <tr>
                                <th colSpan="4" className="text-center">
                                  Interacción con el Palangre
                                </th>
                              </tr>
                              <tr>
                                <th>Orinque</th>
                                <th>Reinal</th>
                                <th>Anzuelo</th>
                                <th>Línea Madre</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{incidencia.detalles_Incpalangre.palangre_orinque}</td>
                                <td>{incidencia.detalles_Incpalangre.palangre_reinal}</td>
                                <td>{incidencia.detalles_Incpalangre.palangre_anzuelo}</td>
                                <td>{incidencia.detalles_Incpalangre.palangre_linea_madre}</td>
                              </tr>
                            </tbody>
                          </Table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </>
    );
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Detalle de Actividad Pesquera</h1>

      {actividad ? (
        <>
          {/* Card con Detalles de la Actividad */}
          <Card className="mb-5 shadow-lg border-0 rounded">
            <CardHeader className="bg-dark text-white text-center p-3">
              <h4 className="mb-0">Detalles de la Actividad</h4>
            </CardHeader>
            <CardBody className="bg-light">
              <Table bordered hover responsive className="table-striped text-center align-middle">
                <thead>
                  <tr>
                    <th>Fecha de Salida</th>
                    <th>Puerto de Salida</th>
                    <th>Fecha de Entrada</th>
                    <th>Puerto de Entrada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{actividad.fecha_salida}</td>
                    <td>{actividad.puerto_salida?.nombre}</td>
                    <td>{actividad.fecha_entrada}</td>
                    <td>{actividad.puerto_entrada?.nombre}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th>Embarcación</th>
                    <th>Capitán</th>
                    <th>Armador</th>
                    <th>Observador</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{actividad.embarcacion?.nombre_embarcacion}</td>
                    <td>{actividad.capitan?.nombre}</td>
                    <td>{actividad.armador?.nombre}</td>
                    <td>{actividad.observador?.nombre}</td>
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th>Matrícula</th>
                    <th>Tipo de Arte</th>
                    <th>Pesca Objetivo</th>
                    <th>Ingresado por</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{actividad.embarcacion?.matricula}</td>
                    <td>{actividad.tipo_arte_pesca}</td>
                    <td>{actividad.pesca_objetivo}</td>
                    <td>{actividad.ingresado?.nombre}</td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Pestañas de Lances */}
          {lances.length > 0 && (
            <div className="mt-4">
              {/* Ordenar los lances por numero_lance antes de renderizarlos */}
              <Nav tabs className="custom-tabs mb-3">
                {lances
                  .sort((a, b) => a.numero_lance - b.numero_lance) // Orden ascendente
                  .map((lance, index) => (
                    <NavItem key={index}>
                      <NavLink
                        className={classnames('fw-bold', {
                          active: activeTab === `${index}`,
                        })}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleTab(`${index}`)}
                      >
                        Lance {lance.numero_lance} {/* Mostrar el valor real del número de lance */}
                      </NavLink>
                    </NavItem>
                  ))}
              </Nav>

              {/* Contenido de las Pestañas */}
              <TabContent activeTab={activeTab} className="border rounded bg-white shadow-sm">
                {lances
                  .sort((a, b) => a.numero_lance - b.numero_lance) // Asegurar orden también aquí
                  .map((lance, index) => (
                    <TabPane key={index} tabId={`${index}`} className="p-3">
                      <div className="p-3 border rounded bg-light">
                        {renderLanceDetalles(lance)}
                      </div>
                    </TabPane>
                  ))}
              </TabContent>
            </div>
          )}

          {/* Botón para Volver */}
          <div className="text-center mt-4">
            <Button color="secondary" onClick={() => navigate('/actividadeslist')}>
              Volver a la Lista
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center">Cargando detalles de la actividad...</p>
      )}
    </div>
  );
};

export default DetalleActividadPesquera;

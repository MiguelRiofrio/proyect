import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TabContent, TabPane, Nav, NavItem, NavLink, Table } from 'reactstrap';
import classnames from 'classnames';

const DetalleActividadPesquera = () => {
  const { id } = useParams(); // Obtiene el ID de la actividad desde la URL
  const [actividad, setActividad] = useState(null);
  const [lances, setLances] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const navigate = useNavigate();

  // Llamar al API para obtener los detalles de la actividad
  useEffect(() => {
    fetchDetalleActividad();
  }, []);

  const fetchDetalleActividad = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/register/actividadDetalle/${id}/`);
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

  return (
    <div className="container mt-5">
      <h1>Detalle de Actividad Pesquera</h1>
      {actividad && (
        <>
          {/* Detalles generales de la actividad */}
          <div className="mb-4">
            <h3>Actividad</h3>
            <p><strong>Código de Ingreso:</strong> {actividad.codigo_de_ingreso}</p>
            <p><strong>Puerto de Salida:</strong> {actividad.puerto_de_salida}</p>
            <p><strong>Puerto de Entrada:</strong> {actividad.puerto_de_entrada}</p>
            <p><strong>Embarcación:</strong> {actividad.embarcacion}</p>
          </div>

          {/* Tabs para cada lance */}
          <div className="mb-4">
            <h3>Lances</h3>
            <Nav tabs>
              {lances.map((lance, index) => (
                <NavItem key={lance.lance.codigo_lance}>
                  <NavLink
                    className={classnames({ active: activeTab === `lance-${index + 1}` })}
                    onClick={() => toggle(`lance-${index + 1}`)}
                  >
                    Lance {index + 1} ({lance.tipo_lance})
                  </NavLink>
                </NavItem>
              ))}
            </Nav>

            {/* Contenido de cada tab de lance */}
            <TabContent activeTab={activeTab}>
              {lances.map((lance, index) => (
                <TabPane key={lance.lance.codigo_lance} tabId={`lance-${index + 1}`}>
                  <h4>Detalles del Lance {index + 1} ({lance.tipo_lance})</h4>
                  
                  {/* Tabla de detalles básicos del lance */}
                  <Table bordered className="mt-3">
                    <thead>
                      <tr>
                        <th>Código Lance</th>
                        <th>Calado</th>
                        <th>Latitud</th>
                        <th>Longitud</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{lance.lance.codigo_lance}</td>
                        <td>{lance.lance.calado}</td>
                        <td>{lance.lance.latitud}</td>
                        <td>{lance.lance.longitud}</td>
                      </tr>
                    </tbody>
                  </Table>

                  {/* Detalles según el tipo de lance */}
                  {lance.tipo_lance === 'cerco' && (
                    <Table bordered className="mt-3">
                      <thead>
                        <tr>
                          <th>Red Altura</th>
                          <th>Red Longitud</th>
                          <th>Malla Cabecero</th>
                          <th>Malla Cuerpo</th>
                          <th>Profundidad Suelo Marino</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{lance.detalles.red_altura}</td>
                          <td>{lance.detalles.red_longitud}</td>
                          <td>{lance.detalles.malla_cabecero}</td>
                          <td>{lance.detalles.malla_cuerpo}</td>
                          <td>{lance.detalles.profundidad_suelo_marino}</td>
                        </tr>
                      </tbody>
                    </Table>
                  )}

                  {lance.tipo_lance === 'arrastre' && (
                    <Table bordered className="mt-3">
                      <thead>
                        <tr>
                          <th>Calado Final Fecha</th>
                          <th>Calado Final Hora</th>
                          <th>Altura</th>
                          <th>Longitud</th>
                          <th>Profundidad Suelo Marino</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{lance.detalles.calado_final_fecha}</td>
                          <td>{lance.detalles.calado_final_hora}</td>
                          <td>{lance.detalles.altura}</td>
                          <td>{lance.detalles.longitud}</td>
                          <td>{lance.detalles.profundidad_suelo_marino}</td>
                        </tr>
                      </tbody>
                    </Table>
                  )}

                  {lance.tipo_lance === 'palangre' && (
                    <Table bordered className="mt-3">
                      <thead>
                        <tr>
                          <th>Nombre Científico 1</th>
                          <th>Tipo de Anzuelo</th>
                          <th>Cantidad de Anzuelos</th>
                          <th>Línea Madre (m)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{lance.detalles.nombre_cientifico_1}</td>
                          <td>{lance.detalles.tipo_anzuelo}</td>
                          <td>{lance.detalles.cantidad_anzuelos}</td>
                          <td>{lance.detalles.linea_madre_metros}</td>
                        </tr>
                      </tbody>
                    </Table>
                  )}

                  {/* Capturas asociadas al lance */}
                  <h5 className="mt-4">Capturas</h5>
                  <Table bordered className="mt-3">
                    <thead>
                      <tr>
                        <th>Taxa</th>
                        <th>Género</th>
                        <th>Especie</th>
                        <th>Nombre Científico</th>
                        <th>Peso Retenido</th>
                        <th>Peso Descartado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lance.capturas.map((captura, index) => (
                        <tr key={index}>
                          <td>{captura.taxa}</td>
                          <td>{captura.genero}</td>
                          <td>{captura.especie}</td>
                          <td>{captura.nombre_cientifico}</td>
                          <td>{captura.peso_retenido}</td>
                          <td>{captura.peso_descartado}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Avistamientos asociados al lance */}
                  <h5 className="mt-4">Avistamientos</h5>
                  <Table bordered className="mt-3">
                    <thead>
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

                  {/* Incidencias asociadas al lance */}
                  <h5 className="mt-4">Incidencias</h5>
                  <Table bordered className="mt-3">
                    <thead>
                      <tr>
                        <th>Nombre Científico</th>
                        <th>Estado</th>
                        <th>Total Individuos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lance.incidencias.map((incidencia, index) => (
                        <tr key={index}>
                          <td>{incidencia.nombre_cientifico}</td>
                          <td>{incidencia.estado}</td>
                          <td>{incidencia.total_individuos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TabPane>
              ))}
            </TabContent>
          </div>

          <Button color="secondary" onClick={() => navigate('/actividades')}>
            Volver a la Lista
          </Button>
        </>
      )}
    </div>
  );
};

export default DetalleActividadPesquera;

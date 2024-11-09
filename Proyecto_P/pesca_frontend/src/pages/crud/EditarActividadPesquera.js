import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TabContent, TabPane, Nav, NavItem, NavLink, Table, Input, FormGroup } from 'reactstrap';
import classnames from 'classnames';

const EditarActividadPesquera = () => {
  const { id } = useParams(); // Obtén el ID de la actividad desde la URL
  const [actividad, setActividad] = useState(null);
  const [lances, setLances] = useState([]);
  const [capturas, setCapturas] = useState([]);
  const [avistamientos, setAvistamientos] = useState([]);
  const [incidentes, setIncidentes] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [activeSubTab, setActiveSubTab] = useState('capturas');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDetalleActividad();
  }, []);

  const fetchDetalleActividad = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/actividades-pesqueras/${id}/`);
      setActividad(response.data.actividad);
      setLances(response.data.lances || []);
      setCapturas(response.data.capturas || []);
      setAvistamientos(response.data.avistamientos || []);
      setIncidentes(response.data.incidentes || []);
    } catch (error) {
      console.error('Error al obtener los detalles de la actividad pesquera:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActividad({ ...actividad, [name]: value });
  };

  const handleLanceChange = (codigo_lance, e) => {
    const { name, value } = e.target;
    const updatedLances = lances.map((lance) => 
      lance.codigo_lance === codigo_lance ? { ...lance, [name]: value } : lance
    );
    setLances(updatedLances);
  };

  const handleCapturaChange = (codigo_captura, e) => {
    const { name, value } = e.target;
    const updatedCapturas = capturas.map((captura) => 
      captura.codigo_captura === codigo_captura ? { ...captura, [name]: value } : captura
    );
    setCapturas(updatedCapturas);
  };

  const handleAvistamientoChange = (codigo_avistamiento, e) => {
    const { name, value } = e.target;
    const updatedAvistamientos = avistamientos.map((avistamiento) => 
      avistamiento.codigo_avistamiento === codigo_avistamiento ? { ...avistamiento, [name]: value } : avistamiento
    );
    setAvistamientos(updatedAvistamientos);
  };

  const handleIncidenteChange = (codigo_incidencia, e) => {
    const { name, value } = e.target;
    const updatedIncidentes = incidentes.map((incidente) => 
      incidente.codigo_incidencia === codigo_incidencia ? { ...incidente, [name]: value } : incidente
    );
    setIncidentes(updatedIncidentes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Actualizar la actividad
      await axios.put(`http://localhost:8000/api/actividades-pesqueras/${id}/`, actividad);

      // Actualizar los lances
      for (const lance of lances) {
        await axios.put(`http://localhost:8000/api/lances/${lance.codigo_lance}/`, lance);
      }

      // Actualizar las capturas
      for (const captura of capturas) {
        await axios.put(`http://localhost:8000/api/datos-captura/${captura.codigo_captura}/`, captura);
      }

      // Actualizar los avistamientos
      for (const avistamiento of avistamientos) {
        await axios.put(`http://localhost:8000/api/avistamientos/${avistamiento.codigo_avistamiento}/`, avistamiento);
      }

      // Actualizar los incidentes
      for (const incidente of incidentes) {
        await axios.put(`http://localhost:8000/api/incidencias/${incidente.codigo_incidencia}/`, incidente);
      }

      alert('Actividad pesquera actualizada con éxito');
      navigate('/');
    } catch (error) {
      console.error('Error al actualizar la actividad pesquera:', error);
    }
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setActiveSubTab('capturas'); // Reset sub-tab to 'capturas' when switching lances
    }
  };

  const toggleSubTab = (subTab) => {
    if (activeSubTab !== subTab) {
      setActiveSubTab(subTab);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Editar Actividad Pesquera</h1>
      {actividad && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3>Actividad</h3>
            <FormGroup>
              <label><strong>Código de Ingreso:</strong></label>
              <Input
                type="text"
                name="codigo_de_ingreso"
                value={actividad.codigo_de_ingreso || ''}
                onChange={handleChange}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <label><strong>Puerto de Salida:</strong></label>
              <Input
                type="text"
                name="puerto_de_salida"
                value={actividad.puerto_de_salida || ''}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label><strong>Puerto de Entrada:</strong></label>
              <Input
                type="text"
                name="puerto_de_entrada"
                value={actividad.puerto_de_entrada || ''}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label><strong>Embarcación:</strong></label>
              <Input
                type="text"
                name="embarcacion"
                value={actividad.embarcacion || ''}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label><strong>Armador:</strong></label>
              <Input
                type="text"
                name="armador"
                value={actividad.armador || ''}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label><strong>Capitán de Pesca:</strong></label>
              <Input
                type="text"
                name="capitan_de_pesca"
                value={actividad.capitan_de_pesca || ''}
                onChange={handleChange}
              />
            </FormGroup>
            <FormGroup>
              <label><strong>Observador:</strong></label>
              <Input
                type="text"
                name="observador"
                value={actividad.observador || ''}
                onChange={handleChange}
              />
            </FormGroup>
          </div>

          <div className="mb-4">
            <h3>Lances y Detalles</h3>
            {lances.length > 0 ? (
              <>
                <Nav tabs>
                  {lances.map((lance, index) => (
                    <NavItem key={lance.codigo_lance}>
                      <NavLink
                        className={classnames({ active: activeTab === `lance-${lance.codigo_lance}` })}
                        onClick={() => toggle(`lance-${lance.codigo_lance}`)}
                      >
                        Lance {index + 1}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>
                <TabContent activeTab={activeTab}>
                  {lances.map((lance, index) => (
                    <TabPane key={lance.codigo_lance} tabId={`lance-${lance.codigo_lance}`}>
                      <Table bordered className="mt-3">
                        <tbody>
                          
                          <tr>
                            <td>Latitud</td>
                            <td>
                              <Input
                                type="text"
                                name="latitud_grados"
                                value={lance.latitud_grados || ''}
                                onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Longitud</td>
                            <td>
                              <Input
                                type="text"
                                name="longitud_grados"
                                value={lance.longitud_grados || ''}
                                onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Nombre Científico Carnada 1</td>
                            <td>
                              <Input
                                type="text"
                                name="nombre_cientifico_1"
                                value={lance.nombre_cientifico_1 || ''}
                                onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Porcentaje Carnada 1</td>
                            <td>
                              <Input
                                type="text"
                                name="porcentaje_carnada_1"
                                value={lance.porcentaje_carnada_1 || ''}
                                onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Tipo de Anzuelo</td>
                            <td>
                              <Input
                                type="text"
                                name="tipo_anzuelo"
                                value={lance.tipo_anzuelo || ''}
                                onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>Cantidad de Anzuelos</td>
                            <td>
                              <Input
                                type="number"
                                name="cantidad_anzuelos"
                                value={lance.cantidad_anzuelos || ''}
                                onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
                              />
                            </td>
                          </tr>
                          {/* Agregar más campos según sea necesario */}
                        </tbody>
                      </Table>

                      <Nav tabs className="mt-4">
                        <NavItem>
                          <NavLink
                            className={classnames({ active: activeSubTab === 'capturas' })}
                            onClick={() => toggleSubTab('capturas')}
                          >
                            Capturas
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames({ active: activeSubTab === 'avistamientos' })}
                            onClick={() => toggleSubTab('avistamientos')}
                          >
                            Avistamientos
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames({ active: activeSubTab === 'incidentes' })}
                            onClick={() => toggleSubTab('incidentes')}
                          >
                            Incidentes
                          </NavLink>
                        </NavItem>
                      </Nav>

                      <TabContent activeTab={activeSubTab}>
                        {/* Capturas */}
                        <TabPane tabId="capturas">
                          <h4>Capturas para el Lance {index + 1}</h4>
                          <Table bordered className="mt-3">
                            <tbody>
                              {capturas
                                .filter((captura) => captura.codigo_lance === lance.codigo_lance)
                                .map((captura) => (
                                  <tr key={captura.codigo_captura}>
                                    <td>{captura.codigo_captura}</td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="taxa"
                                        value={captura.taxa || ''}
                                        onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="genero"
                                        value={captura.genero || ''}
                                        onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="nombre_cientifico"
                                        value={captura.nombre_cientifico || ''}
                                        onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="number"
                                        name="individuos_retenidos"
                                        value={captura.individuos_retenidos || ''}
                                        onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="number"
                                        name="peso_retenido"
                                        value={captura.peso_retenido || ''}
                                        onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                                      />
                                    </td>
                                    {/* Otros campos de captura */}
                                  </tr>
                                ))}
                            </tbody>
                          </Table>
                        </TabPane>

                        {/* Avistamientos */}
                        <TabPane tabId="avistamientos">
                          <h4>Avistamientos para el Lance {index + 1}</h4>
                          <Table bordered className="mt-3">
                            <tbody>
                              {avistamientos
                                .filter((avistamiento) => avistamiento.codigo_lance === lance.codigo_lance)
                                .map((avistamiento) => (
                                  <tr key={avistamiento.codigo_avistamiento}>
                                    <td>{avistamiento.codigo_avistamiento}</td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="nombre_cientifico"
                                        value={avistamiento.nombre_cientifico || ''}
                                        onChange={(e) => handleAvistamientoChange(avistamiento.codigo_avistamiento, e)}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="number"
                                        name="total_individuos"
                                        value={avistamiento.total_individuos || ''}
                                        onChange={(e) => handleAvistamientoChange(avistamiento.codigo_avistamiento, e)}
                                      />
                                    </td>
                                    {/* Otros campos de avistamiento */}
                                  </tr>
                                ))}
                            </tbody>
                          </Table>
                        </TabPane>

                        {/* Incidentes */}
                        <TabPane tabId="incidentes">
                          <h4>Incidentes para el Lance {index + 1}</h4>
                          <Table bordered className="mt-3">
                            <tbody>
                              {incidentes
                                .filter((incidente) => incidente.codigo_lance === lance.codigo_lance)
                                .map((incidente) => (
                                  <tr key={incidente.codigo_incidencia}>
                                    <td>{incidente.codigo_incidencia}</td>
                                    <td>
                                      <Input
                                        type="text"
                                        name="nombre_cientifico"
                                        value={incidente.nombre_cientifico || ''}
                                        onChange={(e) => handleIncidenteChange(incidente.codigo_incidencia, e)}
                                      />
                                    </td>
                                    <td>
                                      <Input
                                        type="number"
                                        name="total_individuos"
                                        value={incidente.total_individuos || ''}
                                        onChange={(e) => handleIncidenteChange(incidente.codigo_incidencia, e)}
                                      />
                                    </td>
                                    {/* Otros campos de incidente */}
                                  </tr>
                                ))}
                            </tbody>
                          </Table>
                        </TabPane>
                      </TabContent>
                    </TabPane>
                  ))}
                </TabContent>
              </>
            ) : (
              <p>No hay lances disponibles para esta actividad pesquera.</p>
            )}
          </div>

          <Button color="primary" type="submit">
            Guardar Cambios
          </Button>
          <Button color="secondary" onClick={() => navigate('/actividades')}>
            Volver a la Lista
          </Button>
        </form>
      )}
    </div>
  );
};

export default EditarActividadPesquera;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TabContent, TabPane, Nav, NavItem, NavLink, Card, CardBody, CardHeader, FormGroup, Label, Input, Table } from 'reactstrap';
import classnames from 'classnames';
import './style/DetalleActividad.css'; // Archivo CSS personalizado

const EditarActividadPesquera = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actividad, setActividad] = useState(null);
  const [lances, setLances] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActividad();
  }, []);

  const fetchActividad = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/actividad_c/${id}/`);
      setActividad(response.data.actividad);
      setLances(response.data.lances || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar la actividad pesquera:', error);
      setIsLoading(false);
    }
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handleActividadChange = (e) => {
    const { name, value } = e.target;
    setActividad({ ...actividad, [name]: value });
  };

  const handleLanceChange = (index, field, value) => {
    const updatedLances = [...lances];
    updatedLances[index][field] = value;
    setLances(updatedLances);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/actividad/${id}/`, {
        actividad,
        lances,
      });
      alert('Datos actualizados exitosamente.');
      navigate('/actividades');
    } catch (error) {
      console.error('Error al actualizar la actividad pesquera:', error);
      alert('Hubo un error al guardar los cambios.');
    }
  };

  if (isLoading) {
    return <p className="text-center">Cargando datos...</p>;
  }

  return (
    <div className="container mt-5 editar-actividad">
      <h1 className="text-center mb-4">Editar Actividad Pesquera</h1>
      <FormGroup>
        <Card className="mb-5 shadow">
          <CardHeader className="bg-primary text-white">
            <h3 className="mb-0">Detalles de la Actividad</h3>
          </CardHeader>
          <CardBody>
            <FormGroup>
              <Label for="codigo_actividad">Código de Actividad</Label>
              <Input
                type="text"
                name="codigo_actividad"
                id="codigo_actividad"
                value={actividad.codigo_actividad || ''}
                onChange={handleActividadChange}
                readOnly
              />
            </FormGroup>
            <FormGroup>
              <Label for="fecha_salida">Fecha de Salida</Label>
              <Input
                type="date"
                name="fecha_salida"
                id="fecha_salida"
                value={actividad.fecha_salida || ''}
                onChange={handleActividadChange}
              />
            </FormGroup>
            <FormGroup>
              <Label for="puerto_salida">Puerto de Salida</Label>
              <Input
                type="text"
                name="puerto_salida"
                id="puerto_salida"
                value={actividad.puerto_salida || ''}
                onChange={handleActividadChange}
              />
            </FormGroup>
          </CardBody>
        </Card>
      </FormGroup>

      <h3 className="text-center mb-4">Editar Lances</h3>
      <Nav tabs className="mb-3">
        {lances.map((lance, index) => (
          <NavItem key={index}>
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
          <TabPane key={index} tabId={`lance-${index + 1}`}>
            <Card className="mb-4 shadow">
              <CardHeader className="bg-secondary text-white">
                <h4>Editar Lance {index + 1}</h4>
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <Label for={`numero_lance_${index}`}>Número de Lance</Label>
                  <Input
                    type="number"
                    id={`numero_lance_${index}`}
                    value={lance.numero_lance || ''}
                    onChange={(e) => handleLanceChange(index, 'numero_lance', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for={`latitud_${index}`}>Latitud</Label>
                  <Input
                    type="text"
                    id={`latitud_${index}`}
                    value={lance.latitud || ''}
                    onChange={(e) => handleLanceChange(index, 'latitud', e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for={`longitud_${index}`}>Longitud</Label>
                  <Input
                    type="text"
                    id={`longitud_${index}`}
                    value={lance.longitud || ''}
                    onChange={(e) => handleLanceChange(index, 'longitud', e.target.value)}
                  />
                </FormGroup>

                <h5 className="mt-4">Capturas</h5>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Nombre Científico</th>
                      <th>Total Individuos</th>
                      <th>Peso Retenido</th>
                      <th>Peso Descartado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lance.capturas.map((captura, capturaIndex) => (
                      <tr key={capturaIndex}>
                        <td>{captura.nombre_cientifico}</td>
                        <td>{captura.total_individuos}</td>
                        <td>{captura.peso_retenido}</td>
                        <td>{captura.peso_descartado}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <h5 className="mt-4">Avistamientos</h5>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Nombre Científico</th>
                      <th>Total Individuos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lance.avistamientos.map((avistamiento, avistamientoIndex) => (
                      <tr key={avistamientoIndex}>
                        <td>{avistamiento.nombre_cientifico}</td>
                        <td>{avistamiento.total_individuos}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <h5 className="mt-4">Incidencias</h5>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Nombre Científico</th>
                      <th>Heridas Graves</th>
                      <th>Heridas Leves</th>
                      <th>Muertos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lance.incidencias.map((incidencia, incidenciaIndex) => (
                      <tr key={incidenciaIndex}>
                        <td>{incidencia.nombre_cientifico}</td>
                        <td>{incidencia.herida_grave}</td>
                        <td>{incidencia.herida_leve}</td>
                        <td>{incidencia.muerto}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPane>
        ))}
      </TabContent>

      <div className="text-center">
        <Button color="primary" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
        <Button color="secondary" className="ms-3" onClick={() => navigate('/actividades')}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default EditarActividadPesquera;

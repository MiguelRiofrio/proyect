import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Card, CardBody, CardHeader, Input } from 'reactstrap';
import './style/DetalleActividad.css'; // Archivo CSS para estilos personalizados

const EditarActividadPesquera = () => {
  const { id } = useParams(); // ID de la actividad
  const [actividad, setActividad] = useState(null);
  const [editedActividad, setEditedActividad] = useState({});
  const navigate = useNavigate();

  const fetchDetalleActividad = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/crud/actividades/${id}/details/`);
      setActividad(response.data);
      setEditedActividad(response.data); // Copia inicial para edición
    } catch (error) {
      console.error('Error al obtener los detalles de la actividad:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedActividad({ ...editedActividad, [name]: value });
  };

  const saveChanges = async () => {
    try {
      await axios.put(`http://localhost:8000/api/crud/actividades/${id}/update/`, editedActividad);
      alert('Cambios guardados con éxito');
      navigate(`/detalle/${id}`);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      alert('Error al guardar los cambios');
    }
  };

  useEffect(() => {
    fetchDetalleActividad();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Editar Actividad Pesquera</h1>

      {actividad && (
        <Card className="mb-5 shadow-lg border-0 rounded">
          <CardHeader className="bg-dark text-white text-center p-3">
            <h4 className="mb-0">Formulario de Edición</h4>
          </CardHeader>
          <CardBody className="bg-light">
            <Table bordered hover responsive className="table-striped text-center align-middle">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Valor Actual</th>
                  <th>Nuevo Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fecha de Salida</td>
                  <td>{actividad.fecha_salida}</td>
                  <td>
                    <Input
                      type="date"
                      name="fecha_salida"
                      value={editedActividad.fecha_salida || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Puerto de Salida</td>
                  <td>{actividad.puerto_salida?.nombre}</td>
                  <td>
                    <Input
                      type="text"
                      name="puerto_salida"
                      value={editedActividad.puerto_salida?.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Fecha de Entrada</td>
                  <td>{actividad.fecha_entrada}</td>
                  <td>
                    <Input
                      type="date"
                      name="fecha_entrada"
                      value={editedActividad.fecha_entrada || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Puerto de Entrada</td>
                  <td>{actividad.puerto_entrada?.nombre}</td>
                  <td>
                    <Input
                      type="text"
                      name="puerto_entrada"
                      value={editedActividad.puerto_entrada?.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Capitán</td>
                  <td>{actividad.capitan?.nombre}</td>
                  <td>
                    <Input
                      type="text"
                      name="capitan"
                      value={editedActividad.capitan?.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Armador</td>
                  <td>{actividad.armador?.nombre}</td>
                  <td>
                    <Input
                      type="text"
                      name="armador"
                      value={editedActividad.armador?.nombre || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Embarcación</td>
                  <td>{actividad.embarcacion?.nombre_embarcacion}</td>
                  <td>
                    <Input
                      type="text"
                      name="embarcacion"
                      value={editedActividad.embarcacion?.nombre_embarcacion || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Matrícula</td>
                  <td>{actividad.embarcacion?.matricula}</td>
                  <td>
                    <Input
                      type="text"
                      name="matricula"
                      value={editedActividad.embarcacion?.matricula || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Tipo de Arte</td>
                  <td>{actividad.tipo_arte_pesca}</td>
                  <td>
                    <Input
                      type="text"
                      name="tipo_arte_pesca"
                      value={editedActividad.tipo_arte_pesca || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Pesca Objetivo</td>
                  <td>{actividad.pesca_objetivo}</td>
                  <td>
                    <Input
                      type="text"
                      name="pesca_objetivo"
                      value={editedActividad.pesca_objetivo || ''}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </CardBody>
        </Card>
      )}

      {/* Botones para guardar cambios o volver */}
      <div className="text-center mt-4">
        <Button color="success" className="me-3" onClick={saveChanges}>
          Guardar Cambios
        </Button>
        <Button color="secondary" onClick={() => navigate('/actividadeslist')}>
          Volver a la Lista
        </Button>
      </div>
    </div>
  );
};

export default EditarActividadPesquera;

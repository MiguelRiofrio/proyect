import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Alert } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ActividadPesqueraList = () => {
  const [actividades, setActividades] = useState([]);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/actividad/');
      setActividades(response.data);
      setError(null);
    } catch (error) {
      setError('Error al obtener las actividades pesqueras. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/actividad/${id}/`);
      alert('Actividad pesquera eliminada con éxito');
      fetchActividades(); // Recargar actividades después de eliminar
    } catch (error) {
      setError('Error al eliminar la actividad pesquera. Inténtalo nuevamente.');
    }
  };

  const toggleModal = (actividad) => {
    setSelectedActividad(actividad);
    setModalOpen(!modalOpen);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Lista de Actividades Pesqueras</h1>

      {/* Botón para agregar nueva actividad */}
      <Button color="primary" className="mb-3" onClick={() => navigate('/agregar')}>
        Agregar Actividad
      </Button>

      {/* Mostrar error si ocurre */}
      {error && <Alert color="danger" className="text-center">{error}</Alert>}

      {/* Mostrar spinner mientras se cargan los datos */}
      {loading ? (
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      ) : (
        <Table bordered>
          <thead>
            <tr>
              <th>Código de Ingreso</th>
              <th>Embarcación</th>
              <th>Tipo de Arte Pesca</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((actividad) => (
              <tr key={actividad.codigo_actividad}>
                <td>{actividad.codigo_actividad}</td>
                <td>{actividad.nombre_embarcacion}</td>
                <td>{actividad.arte_pesca}</td>
                <td>
                  <Button
                    color="secondary"
                    className="me-2"
                    onClick={() => navigate(`/detalle/${actividad.codigo_actividad}`)}
                  >
                    Ver
                  </Button>
                  <Button
                    color="warning"
                    className="me-2"
                    onClick={() => navigate(`/editar/${actividad.codigo_actividad}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    color="danger"
                    onClick={() => toggleModal(actividad)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal de Confirmación para Eliminar */}
      <Modal isOpen={modalOpen} toggle={() => toggleModal(null)}>
        <ModalHeader toggle={() => toggleModal(null)}>Eliminar Actividad</ModalHeader>
        <ModalBody>
          ¿Está seguro que desea eliminar la actividad pesquera con el código{' '}
          {selectedActividad?.codigo_actividad}?
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={() => {
              handleDelete(selectedActividad.codigo_actividad);
              toggleModal(null);
            }}
          >
            Sí, Eliminar
          </Button>
          <Button color="secondary" onClick={() => toggleModal(null)}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ActividadPesqueraList;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Spinner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert
} from 'reactstrap';
import EditarActividadForms from './formsE/EditarActividadForms';
import api from '../../routes/api';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

const EditarActividadPesquera = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data para el formulario
  const [data, setData] = useState({
    personas: [],
    puertos: [],
    embarcaciones: [],
    especies: [],
    carnadas: [],
  });

  // Data de la actividad (lo que se envía al PUT)
  const [actividadData, setActividadData] = useState({});
  
  // Estados de carga y guardado
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados para el pop-up (modal)
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Mensajes para los pop-ups
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar data inicial de la actividad, personas, puertos, etc.
  const fetchDatos = async () => {
    try {
      const [
        personasRes,
        puertosRes,
        embarcacionesRes,
        especiesRes,
        carnadaRes,
        actividadRes
      ] = await Promise.all([
        api.get("/crud/personas/"),
        api.get("/crud/puertos/"),
        api.get("/crud/embarcaciones/"),
        api.get("/crud/especies/"),
        api.get("/crud/tipo-carnada/"),
        api.get(`/crud/actividades/${id}/details-raw/`)
      ]);

      setData({
        personas: personasRes.data,
        puertos: puertosRes.data,
        embarcaciones: embarcacionesRes.data,
        especies: especiesRes.data,
        carnadas: carnadaRes.data,
        // actividad la agregamos después
      });
      
      // Agregar la actividad para que el formulario la precargue
      setData(prev => ({ ...prev, actividad: actividadRes.data }));
    } catch (err) {
      // Si ocurre un error al cargar, lo mostramos en un pop-up
      setErrorMessage("Hubo un problema al cargar los datos. Inténtalo nuevamente.");
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar la data cuando se monta el componente o cambia el id
  useEffect(() => {
    fetchDatos();
  }, [id]);

  // Maneja la acción de guardar la actividad
  const handleGuardar = async () => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      await api.put(`/crud/actividades/${id}/edit/`, actividadData);

      // Mostrar pop-up de éxito
      setSuccessMessage(`Los cambios en la actividad con ID ${id} se han guardado exitosamente.`);
      setSuccessModalOpen(true);

    } catch (err) {
      // Mostrar pop-up de error
      setErrorMessage("Hubo un error al guardar la actividad. Revisa los datos e inténtalo de nuevo.");
      setErrorModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  // Si todavía está cargando la data, mostramos un spinner de pantalla completa
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <Card className="mb-4 shadow-lg border-0 rounded">
        <CardHeader className="bg-black text-white text-center p-3">
          <h4 className="mb-0">Editar Actividad Pesquera</h4>
        </CardHeader>
        <CardBody className="bg-light">
          {/* Componente de edición de actividad, recibiendo la data y guardando en actividadData */}
          <EditarActividadForms data={data} onSave={setActividadData} />
        </CardBody>
      </Card>

      <div className="d-flex justify-content-center">
        <Button
          className="btn-black d-flex align-items-center justify-content-center me-3"
          onClick={handleGuardar}
          disabled={saving}
        >
          {saving ? (
            <Spinner size="sm" color="light" />
          ) : (
            <>
              <FaSave className="me-2" />
              Guardar Cambios
            </>
          )}
        </Button>
        <Button
          className="btn-secondary-custom d-flex align-items-center justify-content-center"
          onClick={() => navigate("/actividadeslist")}
        >
          <FaArrowLeft className="me-2" />
          Volver a la Lista
        </Button>
      </div>

      {/* Modal de Error */}
      <Modal isOpen={errorModalOpen} toggle={() => setErrorModalOpen(false)}>
        <ModalHeader toggle={() => setErrorModalOpen(false)} className="bg-danger text-white">
          Error
        </ModalHeader>
        <ModalBody>
          {errorMessage ? (
            <Alert color="danger">{errorMessage}</Alert>
          ) : (
            <Alert color="danger">Ocurrió un error desconocido.</Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setErrorModalOpen(false)}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal de Éxito */}
      <Modal isOpen={successModalOpen} toggle={() => setSuccessModalOpen(false)}>
        <ModalHeader toggle={() => setSuccessModalOpen(false)} className="bg-success text-white">
          ¡Operación exitosa!
        </ModalHeader>
        <ModalBody>
          {successMessage ? (
            <Alert color="success">{successMessage}</Alert>
          ) : (
            <Alert color="success">Los cambios se han guardado correctamente.</Alert>
          )}
        </ModalBody>
        <ModalFooter>
          <Button 
            color="primary"
            onClick={() => {
              setSuccessModalOpen(false);
              navigate("/actividadeslist");
            }}
          >
            Volver a la Lista
          </Button>
          <Button color="secondary" onClick={() => setSuccessModalOpen(false)}>
            Seguir editando
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EditarActividadPesquera;

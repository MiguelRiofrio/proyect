// AgregarActividadPesquera.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Row,
  Col,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import ActividadForms from "./forms/ActividadForms";
import api from "../../routes/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSave, FaArrowLeft } from "react-icons/fa";
import "./style/AgregarActividadPesquera.css";

const AgregarActividadPesquera = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    personas: [],
    puertos: [],
    embarcaciones: [],
    especies: [],
    carnadas: [],
  });
  const [actividadData, setActividadData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estado para mostrar el modal de éxito
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Carga de datos inicial
  const fetchDatos = async () => {
    try {
      const [
        personasRes,
        puertosRes,
        embarcacionesRes,
        especiesRes,
        carnadaRes,
      ] = await Promise.all([
        api.get("/crud/personas/"),
        api.get("/crud/puertos/"),
        api.get("/crud/embarcaciones/"),
        api.get("/crud/especies/"),
        api.get("/crud/tipo-carnada/"),
      ]);

      setData({
        personas: personasRes.data,
        puertos: puertosRes.data,
        embarcaciones: embarcacionesRes.data,
        especies: especiesRes.data,
        carnadas: carnadaRes.data,
      });
    } catch (error) {
      setError("Hubo un problema al cargar los datos. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  // Manejo de guardado
  const handleGuardar = async () => {
    if (
      !actividadData.puerto_salida ||
      !actividadData.puerto_entrada ||
      !actividadData.embarcacion ||
      !actividadData.capitan ||
      !actividadData.armador ||
      !actividadData.observador
    ) {
      toast.error("Por favor, completa todos los campos requeridos.");
      return;
    }

    setSaving(true);
    setError(null);

    const procesarDatos = {
      ...actividadData,
      puerto_salida: parseInt(actividadData.puerto_salida, 10),
      puerto_entrada: parseInt(actividadData.puerto_entrada, 10),
      embarcacion: parseInt(actividadData.embarcacion, 10),
      capitan: parseInt(actividadData.capitan, 10),
      armador: parseInt(actividadData.armador, 10),
      observador: parseInt(actividadData.observador, 10),
    };

    try {
      await api.post("/crud/actividades/create/", procesarDatos);

      // Si todo va bien, abre el modal de éxito
      setSuccessModalOpen(true);

    } catch (err) {
      setError("Hubo un error al guardar la actividad. Revisa los datos e inténtalo de nuevo.");
      toast.error("Error al guardar la actividad. Verifica los datos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h1 className="text-center mb-4">Agregar Actividad Pesquera</h1>

      {error && (
        <Alert color="danger" className="text-center">
          {error}
        </Alert>
      )}

      <Card className="mb-4 shadow-lg border-0 rounded">
        <CardHeader className="bg-black text-white text-center p-3">
          <h4 className="mb-0">Formulario de Actividad Pesquera</h4>
        </CardHeader>
        <CardBody className="bg-light">
          <ActividadForms
            data={data}
            onSave={setActividadData}
          />
        </CardBody>
      </Card>

      <Row className="justify-content-center">
        <Col xs="12" sm="6" className="button-group">
          <Button
            className="btn-black d-flex align-items-center justify-content-center"
            onClick={handleGuardar}
            disabled={saving}
            aria-label="Guardar actividad"
          >
            {saving ? (
              <Spinner size="sm" color="light" />
            ) : (
              <>
                <FaSave className="me-2" />
                Guardar
              </>
            )}
          </Button>
          <Button
            className="btn-secondary-custom d-flex align-items-center justify-content-center"
            onClick={() => navigate("/actividadeslist")}
            aria-label="Volver a la lista de actividades"
          >
            <FaArrowLeft className="me-2" />
            Volver a la Lista
          </Button>
        </Col>
      </Row>

      {/* Modal de éxito */}
      <Modal isOpen={successModalOpen} toggle={() => setSuccessModalOpen(false)}>
        <ModalHeader toggle={() => setSuccessModalOpen(false)}>
          ¡Actividad Creada!
        </ModalHeader>
        <ModalBody>
          La actividad ha sido guardada exitosamente.
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => navigate("/actividadeslist")}>
            Ir a la Lista
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AgregarActividadPesquera;

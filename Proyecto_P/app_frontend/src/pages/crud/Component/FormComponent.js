
// FormComponent.jsx
import React, { useState, useEffect } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import api from './ApiService';
import './css/FormComponent.css'; // Archivo CSS para estilos personalizados

const FormComponent = ({ endpoint, title, onSubmitSuccess }) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelModal, setCancelModal] = useState(false);
  const { id } = useParams(); // Obtener el ID de la URL si existe
  const navigate = useNavigate();

  // Obtener dinámicamente los campos desde el backend y cargar datos si es edición
  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      try {
        const response = await api.get(`${endpoint}schema/`);
        const schema = response.data;

        setFields(schema);
        const initialData = schema.reduce((acc, field) => {
          acc[field.name] = field.default || '';
          return acc;
        }, {});

        setFormData(initialData);

        if (id) {
          const dataResponse = await api.get(`${endpoint}${id}/`);
          setFormData(dataResponse.data);
        }

        setError(null);
      } catch (error) {
        setError('Error al cargar el formulario.');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [endpoint, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;
    if (type === 'checkbox') {
      newValue = checked;
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const validateForm = () => {
    // Implementa aquí las validaciones necesarias según tu esquema
    // Por ejemplo, verificar campos requeridos
    for (let field of fields) {
      if (field.required && !formData[field.name]) {
        setError(`El campo "${field.label || field.name}" es obligatorio.`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      if (id) {
        await api.put(`${endpoint}${id}/`, formData); // Actualización
        setSuccessMessage('Registro actualizado exitosamente.');
      } else {
        await api.post(endpoint, formData); // Creación
        setSuccessMessage('Registro creado exitosamente.');
      }
      if (onSubmitSuccess) onSubmitSuccess();
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      if (error.response && error.response.data) {
        setError(
          `Error: ${
            error.response.data.message || 'Error al procesar el formulario.'
          }`
        );
      } else {
        setError('Error al procesar el formulario.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const toggleCancelModal = () => setCancelModal(!cancelModal);

  const confirmCancel = () => {
    setCancelModal(false);
    navigate(-1);
  };

  if (loading) {
    return (
      <Card className="form-card">
        <CardBody className="text-center">
          <Spinner color="primary" />
          <p className="mt-2">Cargando formulario...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="form-card">
      <CardHeader className="form-card-header d-flex justify-content-between align-items-center">
        <h2>{id ? `Editar ${title}` : `Crear ${title}`}</h2>
      </CardHeader>
      <CardBody>
        {successMessage && <Alert color="success">{successMessage}</Alert>}
        {error && <Alert color="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          {fields
            .filter((field) => !field.name.includes('codigo'))
            .map((field) => (
              <FormGroup key={field.name} className="form-group">
                <Label for={field.name}>
                  {field.label || field.name}
                  {field.required && <span className="text-danger"> *</span>}
                </Label>
                {field.type === 'select' ? (
                  <Input
                    type="select"
                    name={field.name}
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Seleccione una opción</option>
                    {field.options &&
                      field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Input>
                ) : field.type === 'textarea' ? (
                  <Input
                    type="textarea"
                    name={field.name}
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={`Ingrese ${field.label || field.name}`}
                    className="form-input"
                  />
                ) : field.type === 'checkbox' ? (
                  <div className="form-check">
                    <Input
                      type="checkbox"
                      name={field.name}
                      id={field.name}
                      checked={formData[field.name] || false}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <Label for={field.name} className="form-check-label">
                      {field.label || field.name}
                    </Label>
                  </div>
                ) : (
                  <Input
                    type={
                      field.type === 'integer'
                        ? 'number'
                        : field.type === 'date'
                        ? 'date'
                        : 'text'
                    }
                    name={field.name}
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={`Ingrese ${field.label || field.name}`}
                    className="form-input"
                  />
                )}
              </FormGroup>
            ))}
          <div className="form-buttons d-flex justify-content-end mt-4">
            <Button
              color="primary"
              type="submit"
              className="me-2"
              disabled={submitLoading}
            >
              <FaSave className="me-2" />
              {submitLoading ? 'Guardando...' : id ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button
              color="secondary"
              onClick={toggleCancelModal}
              className="cancel-button"
            >
              <FaTimes className="me-2" />
              Cancelar
            </Button>
          </div>
        </Form>
        {/* Modal de Confirmación de Cancelación */}
        <Modal isOpen={cancelModal} toggle={toggleCancelModal}>
          <ModalHeader toggle={toggleCancelModal}>
            <FaExclamationTriangle className="me-2 text-warning" />
            Confirmar Cancelación
          </ModalHeader>
          <ModalBody>
            ¿Estás seguro de que deseas cancelar? Los cambios no se guardarán.
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={confirmCancel}>
              Sí, cancelar
            </Button>{' '}
            <Button color="secondary" onClick={toggleCancelModal}>
              No, continuar editando
            </Button>
          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default FormComponent;


import React, { useState, useEffect } from 'react';
import {
  Button,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import classnames from 'classnames';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Importar formularios
import ActividadForm from './forms/ActividadForm';
import LanceForm from './forms/LanceForm';

const AgregarActividadPesquera = () => {
  const [actividad, setActividad] = useState({ codigo_actividad: '' });
  const [schema, setSchema] = useState([]);
  const [lances, setLances] = useState([]); // Estado para los lances
  const [nuevoLance, setNuevoLance] = useState({});
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('0');
  const navigate = useNavigate();

  // Obtener esquema de la API al cargar el componente
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/crud/actividades/schema/');
        const fields = response.data;
        const defaultValues = fields.reduce((acc, field) => {
          acc[field.name] = field.type === 'DateField' ? '' : ''; // Default para fechas y otros tipos
          return acc;
        }, {});
        setSchema(fields);
        setActividad(defaultValues); // Inicializar con valores predeterminados
      } catch (error) {
        console.error('Error al obtener el esquema:', error);
        setMensajeError('Error al cargar el esquema de la actividad.');
      }
    };

    fetchSchema();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActividad({ ...actividad, [name]: value });
  };

  const handleLanceChange = (e) => {
    const { name, value } = e.target;
    setNuevoLance({ ...nuevoLance, [name]: value });
  };

  const agregarLance = () => {
    const codigoLance = `${actividad.codigo_actividad}-${lances.length + 1}`; // Generar codigo_lance
    setLances([...lances, { ...nuevoLance, numero_lance: lances.length + 1, codigo_lance: codigoLance }]);
    setNuevoLance({}); // Limpiar el formulario de lance
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handleSubmit = async () => {
    const camposFaltantes = schema.filter((field) => field.type !== 'AutoField' && !actividad[field.name]);
    if (camposFaltantes.length > 0) {
      setMensajeError(
        `Faltan datos obligatorios: ${camposFaltantes.map((field) => field.name).join(', ')}`
      );
      setModalOpen(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/crud/actividades/', actividad);
      const actividadId = response.data.id;

      // Guardar cada lance asociado a la actividad
      for (const lance of lances) {
        let endpoint = 'http://localhost:8000/api/crud/lances/';

        // Validar tipo de arte de pesca y determinar tipo de lance
        if (actividad.tipo_arte_pesca === 'palangre') {
          endpoint = 'http://localhost:8000/api/crud/lances-palangre/';
        } else if (actividad.tipo_arte_pesca === 'cerco') {
          endpoint = 'http://localhost:8000/api/crud/lances-cerco/';
        } else if (actividad.tipo_arte_pesca === 'arrastre') {
          endpoint = 'http://localhost:8000/api/crud/lances-arrastre/';
        }

        await axios.post(endpoint, {
          ...lance,
          actividad: actividadId,
        });
      }

      setMensajeExito('Actividad y lances guardados exitosamente.');
      setTimeout(() => {
        setMensajeExito('');
        navigate('/actividadeslist');
      }, 2000);
    } catch (error) {
      console.error('Error al guardar:', error.response?.data || error.message);
      setMensajeError('Error al guardar la actividad y los lances.');
    } finally {
      setModalOpen(false);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    toggleModal();
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Agregar Actividad Pesquera</h1>

      {mensajeExito && <Alert color="success">{mensajeExito}</Alert>}
      {mensajeError && <Alert color="danger">{mensajeError}</Alert>}

      <form onSubmit={handleConfirm}>
        {schema.length > 0 && (
          <ActividadForm actividad={actividad} handleChange={handleChange} />
        )}

        {/* Sección para Agregar Lances */}
        <h3 className="mt-4">Agregar Lances</h3>
        <LanceForm lance={nuevoLance} handleChange={handleLanceChange} agregarLance={agregarLance} />

        {/* Tabs para mostrar lances agregados */}
        <Nav tabs className="custom-tabs mb-3">
          {lances.map((lance, index) => (
            <NavItem key={index}>
              <NavLink
                className={classnames("fw-bold", {
                  active: activeTab === `${index}`,
                })}
                style={{ cursor: "pointer" }}
                onClick={() => toggleTab(`${index}`)}
              >
                Lance {lance.numero_lance} - {lance.codigo_lance}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <Button color="primary" type="submit" disabled={schema.length === 0} className="mt-3">
          Guardar Actividad
        </Button>
      </form>

      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Confirmación</ModalHeader>
        <ModalBody>¿Estás seguro de que deseas guardar esta actividad y sus lances?</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleSubmit}>Sí</Button>
          <Button color="secondary" onClick={toggleModal}>No</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AgregarActividadPesquera;

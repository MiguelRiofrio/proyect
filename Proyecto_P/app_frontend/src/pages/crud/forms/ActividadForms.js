// src/pages/crud/forms/ActividadForms.js

import React, { useState, useEffect } from 'react';
import {Table,Input,TabContent,TabPane,Button}
from 'reactstrap';
import { FaPlus } from 'react-icons/fa'; // Importar el icono
import LanceForms from './LanceForms';
import RegisterPuertoModal from './models/RegisterPuertoModal'; // Importar el modal de Puerto
import RegisterPersonaModal from './models/RegisterPersonaModal'; // Importar el modal de Persona
import RegisterEmbarcacionModal from './models/RegisterEmbarcacionModal'; // Importar el modal de Embarcación
import '../style/ActividadForms.css'; // Importar el archivo CSS personalizado

const ActividadForms = ({ data, onSave }) => {
  const [formValues, setFormValues] = useState({
    codigo_actividad: '',
    fecha_salida: '',
    fecha_entrada: '',
    puerto_salida: '',
    puerto_entrada: '',
    embarcacion: '',
    tipo_arte_pesca: '',
    pesca_objetivo: '',
    observador: '',
    ingresado: 100,
    lances: [],
  });


  const [activeTab] = useState('lances');
  const [armadores, setArmadores] = useState([]);
  const [capitanes, setCapitanes] = useState([]);
  const [observadores, setObservadores] = useState([]);
  const [puertos, setPuertos] = useState([]);
  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [carnadas, setCarnadas] = useState([]);

  // Estados para los Modales
  const [isPuertoModalOpen, setIsPuertoModalOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isEmbarcacionModalOpen, setIsEmbarcacionModalOpen] = useState(false);

  // Estado para almacenar el rol de persona a agregar
  const [personaRol, setPersonaRol] = useState(null);

  // Funciones para alternar la visibilidad de los modales
  const togglePuertoModal = () => {
    setIsPuertoModalOpen(!isPuertoModalOpen);
  };

  const togglePersonaModal = () => {
    setIsPersonaModalOpen(!isPersonaModalOpen);
    // Reset personaRol cuando se cierra el modal
    if (isPersonaModalOpen) {
      setPersonaRol(null);
    }
  };

  const toggleEmbarcacionModal = () => {
    setIsEmbarcacionModalOpen(!isEmbarcacionModalOpen);
  };

  // Función para abrir el modal de persona con un rol específico
  const openPersonaModalWithRol = (rol) => {
    setPersonaRol(rol);
    setIsPersonaModalOpen(true);
  };

  // Funciones para manejar la adición de nuevos elementos
  const handlePuertoRegistrado = (nuevoPuerto) => {
    setPuertos([...puertos, nuevoPuerto]);
  };

  const handlePersonaRegistrada = (nuevaPersona) => {
    // Dependiendo del rol de la persona, añadirla a la lista correspondiente
    if (nuevaPersona.rol === 'Armador') {
      setArmadores([...armadores, nuevaPersona]);
    } else if (nuevaPersona.rol === 'CAPITAN') {
      setCapitanes([...capitanes, nuevaPersona]);
    } else if (nuevaPersona.rol === 'Observador') {
      setObservadores([...observadores, nuevaPersona]);
    }
  };

  const handleEmbarcacionRegistrada = (nuevaEmbarcacion) => {
    setEmbarcaciones([...embarcaciones, nuevaEmbarcacion]);
  };

  // Función para extraer las iniciales del Observador
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
  };

  // Función para formatear la fecha de salida
  const formatFechaSalida = (fechaSalida) => {
    if (!fechaSalida) return '';
    const date = new Date(fechaSalida);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JS van de 0 a 11
    const year = date.getFullYear();
    return `D${day}M${month}A${year}`;
  };

  // useEffect para cargar los datos iniciales
  useEffect(() => {
    if (data) {
      setArmadores(data.personas?.filter((persona) => persona.rol === "Armador") || []);
      setCapitanes(data.personas?.filter((persona) => persona.rol === "CAPITAN") || []);
      setObservadores(data.personas?.filter((persona) => persona.rol === "Observador") || []);
      setPuertos(data.puertos || []);
      setEspecies(data.especies || []);
      setCarnadas(data.carnadas || []);
      setEmbarcaciones(data.embarcaciones || []);
    }
  }, [data]);

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedValues = {
      ...formValues,
      [name]: value,
    };

    setFormValues(updatedValues);

    // Enviar datos actualizados al componente padre
    if (onSave) {
      onSave(updatedValues);
    }
  };

  // Renderizar opciones de select
  const renderOptions = (items, key, label) => {
    return items.map((item) => (
      <option key={item[key]} value={item[key]}>
        {item[label]}
      </option>
    ));
  };

  // useEffect para generar el codigo_actividad automáticamente
  useEffect(() => {
    const selectedObservador = observadores.find(persona => String(persona.codigo_persona) === String(formValues.observador));
    const fechaSalida = formValues.fecha_salida;

    if (selectedObservador && fechaSalida) {
      const initials = getInitials(selectedObservador.nombre);
      const formattedDate = formatFechaSalida(fechaSalida);
      const codigo = `${initials}${formattedDate}`; // Formato: [Iniciales][Día][Mes][Año]

      const updatedValues = {
        ...formValues,
        codigo_actividad: codigo,
      };

      setFormValues(updatedValues);

      // Enviar el nuevo codigo_actividad al padre
      if (onSave) {
        onSave(updatedValues);
      }
    } else {
      // Si falta alguno de los campos, limpiar el codigo_actividad
      const updatedValues = {
        ...formValues,
        codigo_actividad: '',
      };

      setFormValues(updatedValues);

      // Enviar el cambio al padre
      if (onSave) {
        onSave(updatedValues);
      }
    }
  }, [formValues.observador, formValues.fecha_salida, observadores, onSave]);

  return (
    <>
      <Table bordered>
        <thead>
          <tr>
            <th>Código Actividad</th>
            <th>Fecha de Salida</th>
            <th>Puerto de Salida</th>
            <th>Fecha de Entrada</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Input
                type="text"
                name="codigo_actividad"
                value={formValues.codigo_actividad || 'Seleccione fecha de salida y observador'}
                readOnly
                className={!formValues.codigo_actividad ? 'placeholder-text' : ''}
                style={!formValues.codigo_actividad ? { color: '#6c757d', fontStyle: 'italic' } : {}}
              />
            </td>
            <td>
              <Input
                type="date"
                name="fecha_salida"
                value={formValues.fecha_salida}
                onChange={handleInputChange}
              />
            </td>
            <td>
              <div className="d-flex align-items-center">
                <Input
                  type="select"
                  name="puerto_salida"
                  value={formValues.puerto_salida}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione una Opción</option>
                  {renderOptions(puertos, "codigo_puerto", "nombre_puerto")}
                </Input>
                {/* Botón para abrir el modal de registrar puerto */}
                <Button
                  color="black"
                  size="sm"
                  className="ms-2 custom-button"
                  onClick={togglePuertoModal}
                  aria-label="Añadir Puerto de Salida"
                >
                  <FaPlus className="me-1" />
                </Button>
              </div>
            </td>
            <td>
              <Input
                type="date"
                name="fecha_entrada"
                value={formValues.fecha_entrada}
                onChange={handleInputChange}
              />
            </td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th>Puerto de Entrada</th>
            <th>Embarcación</th>
            <th>Capitán</th>
            <th>Armador</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="d-flex align-items-center">
                <Input
                  type="select"
                  name="puerto_entrada"
                  value={formValues.puerto_entrada}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione una Opción</option>
                  {renderOptions(puertos, "codigo_puerto", "nombre_puerto")}
                </Input>
                {/* Botón para abrir el modal de registrar puerto */}
                <Button
                  color="black"
                  size="sm"
                  className="ms-2 custom-button"
                  onClick={togglePuertoModal}
                  aria-label="Añadir Puerto de Entrada"
                >
                  <FaPlus className="me-1" />
                </Button>
              </div>
            </td>
            <td>
              <div className="d-flex align-items-center">
                <Input
                  type="select"
                  name="embarcacion"
                  value={formValues.embarcacion}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione una Opción</option>
                  {renderOptions(embarcaciones, "codigo_embarcacion", "nombre_embarcacion")}
                </Input>
                {/* Botón para abrir el modal de registrar embarcación */}
                <Button
                  color="black"
                  size="sm"
                  className="ms-2 custom-button"
                  onClick={toggleEmbarcacionModal}
                  aria-label="Añadir Embarcación"
                >
                  <FaPlus className="me-1" />
                </Button>
              </div>
            </td>
            <td>
              <div className="d-flex align-items-center">
                <Input
                  type="select"
                  name="capitan"
                  value={formValues.capitan}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione una Opción</option>
                  {renderOptions(capitanes, "codigo_persona", "nombre")}
                </Input>
                {/* Botón para abrir el modal de registrar persona con rol 'CAPITAN' */}
                <Button
                  color="black"
                  size="sm"
                  className="ms-2 custom-button"
                  onClick={() => openPersonaModalWithRol('CAPITAN')}
                  aria-label="Añadir Capitán"
                >
                  <FaPlus className="me-1" />
                </Button>
              </div>
            </td>
            <td>
              <div className="d-flex align-items-center">
                <Input
                  type="select"
                  name="armador"
                  value={formValues.armador}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione una Opción</option>
                  {renderOptions(armadores, "codigo_persona", "nombre")}
                </Input>
                {/* Botón para abrir el modal de registrar persona con rol 'Armador' */}
                <Button
                  color="black"
                  size="sm"
                  className="ms-2 custom-button"
                  onClick={() => openPersonaModalWithRol('Armador')}
                  aria-label="Añadir Armador"
                >
                  <FaPlus className="me-1" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th>Tipo de Arte</th>
            <th>Pesca Objetivo</th>
            <th>Observador</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Input
                type="select"
                name="tipo_arte_pesca"
                value={formValues.tipo_arte_pesca}
                onChange={handleInputChange}
              >
                <option value="">Seleccione una Opción</option>
                <option value="Palangre">Palangre</option>
                <option value="Cerco">Cerco</option>
                <option value="Arrastre">Arrastre</option>
              </Input>
            </td>
            <td>
              <Input
                type="select"
                name="pesca_objetivo"
                value={formValues.pesca_objetivo}
                onChange={handleInputChange}
              >
                <option value="">Seleccione una Opción</option>
                <option value="PPP">PPP</option>
                <option value="PPG">PPG</option>
              </Input>
            </td>
            <td>
              <div className="d-flex align-items-center">
                <Input
                  type="select"
                  name="observador"
                  value={formValues.observador}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccione una Opción</option>
                  {renderOptions(observadores, "codigo_persona", "nombre")}
                </Input>
                {/* Botón para abrir el modal de registrar persona con rol 'Observador' */}
                <Button
                  color="black"
                  size="sm"
                  className="ms-2 custom-button"
                  onClick={() => openPersonaModalWithRol('Observador')}
                  aria-label="Añadir Observador"
                >
                  <FaPlus className="me-1" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </Table>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="lances">
          <LanceForms
            lances={formValues.lances || []}
            tipo={formValues.tipo_arte_pesca}
            setLances={(nuevosLances) => {
              const updatedValues = { ...formValues, lances: nuevosLances };
              setFormValues(updatedValues);

              // Asegúrate de enviar los datos actualizados al padre
              if (onSave) {
                onSave(updatedValues);
              }
            }}
            carnadas={carnadas || []}
            especies={especies || []}
            codigoActividad={formValues.codigo_actividad} // Pasar el código de actividad
          />
        </TabPane>
      </TabContent>

      {/* Modales para Registrar Entidades */}
      <RegisterPuertoModal
        isOpen={isPuertoModalOpen}
        toggle={togglePuertoModal}
        onPuertoRegistrado={handlePuertoRegistrado}
      />

      <RegisterPersonaModal
        isOpen={isPersonaModalOpen}
        toggle={togglePersonaModal}
        onPersonaRegistrada={handlePersonaRegistrada}
        rol={personaRol} // Pasar el rol al modal
      />

      <RegisterEmbarcacionModal
        isOpen={isEmbarcacionModalOpen}
        toggle={toggleEmbarcacionModal}
        onEmbarcacionRegistrada={handleEmbarcacionRegistrada}
      />
    </>
  );
};

export default ActividadForms;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Input, TabContent, TabPane, Button } from 'reactstrap';
import { FaPlus } from 'react-icons/fa';
import LanceForms from './LanceForms';
import RegisterPuertoModal from './models/RegisterPuertoModal';
import RegisterPersonaModal from './models/RegisterPersonaModal';
import RegisterEmbarcacionModal from './models/RegisterEmbarcacionModal';
import '../style/ActividadForms.css';

const ActividadForms = ({ data, onSave }) => {
  // Estado para los valores del formulario
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
    capitan: '',
    armador: '',
  });

  // Estados para las listas
  const [listas, setListas] = useState({
    armadores: [],
    capitanes: [],
    observadores: [],
    puertos: [],
    embarcaciones: [],
    especies: [],
    carnadas: [],
  });

  // Estados para los modales
  const [modales, setModales] = useState({
    puerto: false,
    persona: false,
    embarcacion: false,
  });

  const [personaRol, setPersonaRol] = useState(null);

  // Estado para manejar la validación del formulario
  const [isFormValid, setIsFormValid] = useState(false);

  // Extraer las listas para facilitar su uso
  const { armadores, capitanes, observadores, puertos, embarcaciones, especies, carnadas } = listas;

  // Uso de useMemo para evitar recalcular listas filtradas en cada render
  useEffect(() => {
    if (data) {
      setListas({
        armadores: data.personas?.filter(persona => persona.rol === "Armador") || [],
        capitanes: data.personas?.filter(persona => persona.rol === "CAPITAN") || [],
        observadores: data.personas?.filter(persona => persona.rol === "Observador") || [],
        puertos: data.puertos || [],
        especies: data.especies || [],
        carnadas: data.carnadas || [],
        embarcaciones: data.embarcaciones || [],
      });
    }
  }, [data]);

  // Funciones para alternar la visibilidad de los modales usando useCallback
  const toggleModal = useCallback((modal) => {
    setModales(prev => ({ ...prev, [modal]: !prev[modal] }));
    if (modal === 'persona') {
      setPersonaRol(null);
    }
  }, []);

  // Función para abrir el modal de persona con rol específico
  const openPersonaModalWithRol = useCallback((rol) => {
    setPersonaRol(rol);
    setModales(prev => ({ ...prev, persona: true }));
  }, []);

  // Handlers para registrar nuevas entidades
  const handlePuertoRegistrado = useCallback((nuevoPuerto) => {
    setListas(prev => ({ ...prev, puertos: [...prev.puertos, nuevoPuerto] }));
  }, []);

  const handlePersonaRegistrada = useCallback((nuevaPersona) => {
    setListas(prev => {
      let updatedList = { ...prev };
      switch (nuevaPersona.rol) {
        case 'Armador':
          updatedList.armadores = [...updatedList.armadores, nuevaPersona];
          break;
        case 'CAPITAN':
          updatedList.capitanes = [...updatedList.capitanes, nuevaPersona];
          break;
        case 'Observador':
          updatedList.observadores = [...updatedList.observadores, nuevaPersona];
          break;
        default:
          break;
      }
      return updatedList;
    });
  }, []);

  const handleEmbarcacionRegistrada = useCallback((nuevaEmbarcacion) => {
    setListas(prev => ({ ...prev, embarcaciones: [...prev.embarcaciones, nuevaEmbarcacion] }));
  }, []);

  // Funciones auxiliares
  const getInitials = (fullName) => {
    if (!fullName) return '';
    return fullName
      .trim()
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  };

  const formatFechaSalida = (fechaSalida) => {
    if (!fechaSalida) return '';
    const date = new Date(fechaSalida);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `D${day}M${month}A${year}`;
  };

  // Actualizar codigo_actividad cuando observador o fecha_salida cambian
  useEffect(() => {
    const actualizarCodigoActividad = () => {
      const selectedObservador = observadores.find(persona => String(persona.codigo_persona) === String(formValues.observador));
      const { fecha_salida } = formValues;

      if (selectedObservador && fecha_salida) {
        const initials = getInitials(selectedObservador.nombre);
        const formattedDate = formatFechaSalida(fecha_salida);
        const codigo = `${initials}${formattedDate}`;

        setFormValues(prev => {
          const updated = { ...prev, codigo_actividad: codigo };
          onSave && onSave(updated);
          return updated;
        });
      } else {
        setFormValues(prev => {
          const updated = { ...prev, codigo_actividad: '' };
          onSave && onSave(updated);
          return updated;
        });
      }
    };

    actualizarCodigoActividad();
  }, [formValues.observador, formValues.fecha_salida, observadores, onSave]);

  // Manejar cambios en los inputs
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues(prev => {
      const updated = { ...prev, [name]: value };
      onSave && onSave(updated);
      return updated;
    });
  }, [onSave]);

  // Renderizar opciones para selects usando useMemo
  const renderOptions = useCallback((items, key, label) => (
    items.map(item => (
      <option key={item[key]} value={item[key]}>
        {item[label]}
      </option>
    ))
  ), []);

  // Validación del formulario
  const validateForm = useCallback(() => {
    const requiredFields = [
      'fecha_salida',
      'puerto_salida',
      'fecha_entrada',
      'puerto_entrada',
      'embarcacion',
      'capitan',
      'armador',
      'tipo_arte_pesca',
      'pesca_objetivo',
      'observador',
    ];

    return requiredFields.every(field => formValues[field] && formValues[field].toString().trim() !== '');
  }, [formValues]);

  // Actualizar el estado de validación cada vez que cambien los campos
  useEffect(() => {
    setIsFormValid(validateForm());
  }, [validateForm]);

  // Constante para la pestaña activa
  const activeTab = 'lances';

  // Componente reutilizable para select con botón de agregar
  const SelectWithAddButton = ({ name, value, onChange, options, onAdd, ariaLabel }) => (
    <div className="d-flex align-items-center">
      <Input type="select" name={name} value={value} onChange={onChange}>
        <option value="">Seleccione una Opción</option>
        {renderOptions(options, Object.keys(options[0] || {})[0], Object.keys(options[0] || {})[1])}
      </Input>
      <Button
        color="black"
        size="sm"
        className="ms-2 custom-button"
        onClick={onAdd}
        aria-label={ariaLabel}
      >
        <FaPlus className="me-1" />
      </Button>
    </div>
  );

  return (
    <>
      <Table bordered>
        {/* Encabezados de la tabla */}
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
              <SelectWithAddButton
                name="puerto_salida"
                value={formValues.puerto_salida}
                onChange={handleInputChange}
                options={puertos}
                onAdd={() => toggleModal('puerto')}
                ariaLabel="Añadir Puerto de Salida"
              />
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
              <SelectWithAddButton
                name="puerto_entrada"
                value={formValues.puerto_entrada}
                onChange={handleInputChange}
                options={puertos}
                onAdd={() => toggleModal('puerto')}
                ariaLabel="Añadir Puerto de Entrada"
              />
            </td>
            <td>
              <SelectWithAddButton
                name="embarcacion"
                value={formValues.embarcacion}
                onChange={handleInputChange}
                options={embarcaciones}
                onAdd={() => toggleModal('embarcacion')}
                ariaLabel="Añadir Embarcación"
              />
            </td>
            <td>
              <SelectWithAddButton
                name="capitan"
                value={formValues.capitan}
                onChange={handleInputChange}
                options={capitanes}
                onAdd={() => openPersonaModalWithRol('CAPITAN')}
                ariaLabel="Añadir Capitán"
              />
            </td>
            <td>
              <SelectWithAddButton
                name="armador"
                value={formValues.armador}
                onChange={handleInputChange}
                options={armadores}
                onAdd={() => openPersonaModalWithRol('Armador')}
                ariaLabel="Añadir Armador"
              />
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
              <SelectWithAddButton
                name="observador"
                value={formValues.observador}
                onChange={handleInputChange}
                options={observadores}
                onAdd={() => openPersonaModalWithRol('Observador')}
                ariaLabel="Añadir Observador"
              />
            </td>
          </tr>
        </tbody>
      </Table>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="lances">
          <LanceForms
            lances={formValues.lances}
            tipo={formValues.tipo_arte_pesca}
            setLances={(nuevosLances) => {
              setFormValues(prev => {
                const updated = { ...prev, lances: nuevosLances };
                onSave && onSave(updated);
                return updated;
              });
            }}
            carnadas={carnadas}
            especies={especies}
            codigoActividad={formValues.codigo_actividad}
            isFormValid={isFormValid}
            fecha_salida={formValues.fecha_salida}
            fecha_entrada={formValues.fecha_entrada}
          />
        </TabPane>
      </TabContent>

      {/* Modales para Registrar Entidades */}
      <RegisterPuertoModal
        isOpen={modales.puerto}
        toggle={() => toggleModal('puerto')}
        onPuertoRegistrado={handlePuertoRegistrado}
      />

      <RegisterPersonaModal
        isOpen={modales.persona}
        toggle={() => toggleModal('persona')}
        onPersonaRegistrada={handlePersonaRegistrada}
        rol={personaRol}
      />

      <RegisterEmbarcacionModal
        isOpen={modales.embarcacion}
        toggle={() => toggleModal('embarcacion')}
        onEmbarcacionRegistrada={handleEmbarcacionRegistrada}
      />
    </>
  );
};

export default ActividadForms;

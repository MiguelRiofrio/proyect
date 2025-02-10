import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, TabContent, TabPane, Button } from 'reactstrap';
import { FaPlus } from 'react-icons/fa';
import EditarLanceForms from './EditarLanceForms';
import RegisterPuertoModal from '../forms/models/RegisterPuertoModal';
import RegisterPersonaModal from '../forms/models/RegisterPersonaModal';
import RegisterEmbarcacionModal from '../forms/models/RegisterEmbarcacionModal';
import '../style/ActividadForms.css';

const EditarActividadForms = ({ data, onSave }) => {
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
    ingresado: '100',
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
  // Estado para la validación del formulario
  const [isFormValid, setIsFormValid] = useState(false);
  // Bandera para evitar reprecargar la data si ya se cargó
  const [dataLoaded, setDataLoaded] = useState(false);

  // Para los puertos, en la lista se espera que los objetos tengan:
  // { codigo_puerto: "1", nombre_puerto: "Jaramijo" }
  // Mientras que en la actividad se devuelve un objeto con { id: 1, nombre: "Jaramijo" }
  // Por ello, usaremos "codigo_puerto" como keyField y "nombre_puerto" como labelField en los selects de puertos.
  const puertoKeyField = "codigo_puerto";
  const puertoLabelField = "nombre_puerto";

  // Extraer listas
  const { armadores, capitanes, observadores, puertos, embarcaciones, especies, carnadas } = listas;

  // Precargar listas y datos de la actividad
  useEffect(() => {
    if (data) {
      console.log("Data recibida:", data);

      setListas({
        armadores: data.personas?.filter(persona => persona.rol === "Armador") || [],
        capitanes: data.personas?.filter(persona => persona.rol === "CAPITAN") || [],
        observadores: data.personas?.filter(persona => persona.rol === "Observador") || [],
        puertos: data.puertos || [],
        especies: data.especies || [],
        carnadas: data.carnadas || [],
        embarcaciones: data.embarcaciones || [],
      });
      // Precargar solo una vez los datos de la actividad
      if (data.actividad && !dataLoaded) {
        setFormValues({
          codigo_actividad: data.actividad.codigo_actividad || '',
          fecha_salida: data.actividad.fecha_salida || '',
          fecha_entrada: data.actividad.fecha_entrada || '',
          // Para puerto_salida y puerto_entrada
          puerto_salida: data.actividad.puerto_salida?.id
            ? String(data.actividad.puerto_salida.id)
            : data.actividad.puerto_salida
            ? String(data.actividad.puerto_salida)
            : '',
          puerto_entrada: data.actividad.puerto_entrada?.id
            ? String(data.actividad.puerto_entrada.id)
            : data.actividad.puerto_entrada
            ? String(data.actividad.puerto_entrada)
            : '',
          // Embarcacion
          embarcacion: data.actividad.embarcacion?.codigo_embarcacion
            ? String(data.actividad.embarcacion.codigo_embarcacion)
            : data.actividad.embarcacion
            ? String(data.actividad.embarcacion)
            : '',
          tipo_arte_pesca: data.actividad.tipo_arte_pesca || '',
          pesca_objetivo: data.actividad.pesca_objetivo || '',
          observador: data.actividad.observador?.id
            ? String(data.actividad.observador.id)
            : data.actividad.observador
            ? String(data.actividad.observador)
            : '',
          ingresado: data.actividad.ingresado?.id
            ? String(data.actividad.ingresado.id)
            : data.actividad.ingresado
            ? String(data.actividad.ingresado)
            : '100',
          capitan: data.actividad.capitan?.id
            ? String(data.actividad.capitan.id)
            : data.actividad.capitan
            ? String(data.actividad.capitan)
            : '',
          armador: data.actividad.armador?.id
            ? String(data.actividad.armador.id)
            : data.actividad.armador
            ? String(data.actividad.armador)
            : '',
          lances: data.actividad.lances || [],
        });
        setDataLoaded(true);
      }
    }
  }, [data, dataLoaded]);

  // Funciones para modales y registro de nuevas entidades
  const toggleModal = useCallback((modal) => {
    setModales(prev => ({ ...prev, [modal]: !prev[modal] }));
    if (modal === 'persona') setPersonaRol(null);
  }, []);

  const openPersonaModalWithRol = useCallback((rol) => {
    setPersonaRol(rol);
    setModales(prev => ({ ...prev, persona: true }));
  }, []);

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

  // Handler para cambios en los inputs
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormValues(prev => {
      const updated = { ...prev, [name]: value };
      onSave && onSave(updated);
      return updated;
    });
  }, [onSave]);

  // Componente select reutilizable con opción de agregar.
  // Se fuerza que tanto el value del select como el de cada opción sean cadenas.
  // Se ajusta la key de cada `<option>` concatenando con `index` para evitar el warning
  // "Encountered two children with the same key".
  const SelectWithAddButton = ({
    name,
    value,
    onChange,
    options,
    onAdd,
    ariaLabel,
    keyField = 'id',
    labelField = 'nombre'
  }) => (
    <div className="d-flex align-items-center">
      <Input type="select" name={name} value={String(value || '')} onChange={onChange}>
        <option value="">Seleccione una Opción</option>
        {options.map((item, index) => (
          <option key={`${String(item[keyField])}-${index}`} value={String(item[keyField])}>
            {item[labelField]}
          </option>
        ))}
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

  // Validación de campos requeridos
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

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [validateForm]);

  const activeTab = 'lances';

  return (
    <>
      <Table bordered>
        {/* Primera sección: Código de actividad, Fecha de Salida, Puerto de Salida y Fecha de Entrada */}
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
                value={formValues.codigo_actividad || 'Código automático'}
                readOnly
                className={!formValues.codigo_actividad ? 'placeholder-text' : ''}
                style={!formValues.codigo_actividad ? { color: '#6c757d', fontStyle: 'italic' } : {}}
              />
            </td>
            <td>
              <Input type="date" name="fecha_salida" value={formValues.fecha_salida} onChange={handleInputChange} />
            </td>
            <td>
              <SelectWithAddButton
                name="puerto_salida"
                value={formValues.puerto_salida}
                onChange={handleInputChange}
                options={puertos}
                onAdd={() => toggleModal('puerto')}
                ariaLabel="Añadir Puerto de Salida"
                keyField="codigo_puerto"
                labelField="nombre_puerto"
              />
            </td>
            <td>
              <Input type="date" name="fecha_entrada" value={formValues.fecha_entrada} onChange={handleInputChange} />
            </td>
          </tr>
        </tbody>

        {/* Segunda sección: Puerto de Entrada, Embarcación, Capitán y Armador */}
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
                keyField="codigo_puerto"
                labelField="nombre_puerto"
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
                keyField="codigo_embarcacion"
                labelField="nombre_embarcacion"
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
                keyField="codigo_persona"
                labelField="nombre"
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
                keyField="codigo_persona"
                labelField="nombre"
              />
            </td>
          </tr>
        </tbody>

        {/* Tercera sección: Tipo de Arte, Pesca Objetivo y Observador */}
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
                keyField="codigo_persona"
                labelField="nombre"
              />
            </td>
          </tr>
        </tbody>
      </Table>

      {/* Sección para Lances (pestaña "lances") */}
      <TabContent activeTab="lances">
        <TabPane tabId="lances">
          <EditarLanceForms
            lances={formValues.lances}
            setLances={(nuevosLances) => {
              // actualizas el estado de la actividad
              setFormValues(prev => ({ ...prev, lances: nuevosLances }));
            }}
            especies={especies}
            tipo={formValues.tipo_arte_pesca}
            carnadas={carnadas}
            isFormValid={isFormValid}
            fecha_salida={formValues.fecha_salida}
            fecha_entrada={formValues.fecha_entrada}
          />
        </TabPane>
      </TabContent>

      {/* Modales */}
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

export default EditarActividadForms;

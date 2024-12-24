import React, { useState,useEffect  } from 'react';
import { Table, Input, TabContent, TabPane } from 'reactstrap';
import LanceForms from './LanceForms';

const ActividadForms = ({ data, onSave  }) => {
  const [formValues, setFormValues] = useState({
    codigo_actividad: '',
    fecha_salida: '',
    fecha_entrada: '',
    puerto_salida: '',
    puerto_entrada: '',
    embarcacion: '',
    tipo_arte_pesca : '',
    ingresado:100,
    lances: [],
  });
  const [activeTab, setActiveTab] = useState('lances');
  const [armadores, setArmadores] = useState([]);
  const [capitanes, setCapitanes] = useState([]);
  const [observadores, setObservadores] = useState([]);
  const [puertos, setPuertos] = useState([]);
  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [especies, setespecies] = useState([]);
  const [carnadas,setCarnadas]= useState([]);

  useEffect(() => {
    if (data) {
      setArmadores(data.personas?.filter((persona) => persona.rol === "Armador") || []);
      setCapitanes(data.personas?.filter((persona) => persona.rol === "CAPITAN") || []);
      setObservadores(data.personas?.filter((persona) => persona.rol === "Observador") || []);
      setPuertos(data.puertos || []);
      setespecies(data.especies || []);
      setCarnadas(data.carnadas || []); 
      setEmbarcaciones(data.embarcaciones || []);
    }
  }, [data]);

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
  

  const renderOptions = (items, key, label) => {
    return items.map((item) => (
      <option key={item[key]} value={item[key]}>
        {item[label]}
      </option>
    ));
  };

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
              value={formValues.codigo_actividad}
              onChange={handleInputChange}
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
            <Input
              type="select"
              name="puerto_salida"
              value={formValues.puerto_salida}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una Opción</option>
              {renderOptions(puertos, "codigo_puerto", "nombre_puerto")}
            </Input>
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
            <Input
              type="select"
              name="puerto_entrada"
              value={formValues.puerto_entrada}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una Opción</option>
              {renderOptions(puertos, "codigo_puerto", "nombre_puerto")}
            </Input>
          </td>
          <td>
            <Input
              type="select"
              name="embarcacion"
              value={formValues.embarcacion}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una Opción</option>
              {renderOptions(embarcaciones, "codigo_embarcacion", "nombre_embarcacion")}
            </Input>
          </td>
          <td>
            <Input
              type="select"
              name="capitan"
              value={formValues.capitan}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una Opción</option>
              {renderOptions(capitanes, "codigo_persona", "nombre")}
            </Input>
          </td>
          <td>
            <Input
              type="select"
              name="armador"
              value={formValues.armador}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una Opción</option>
              {renderOptions(armadores, "codigo_persona", "nombre")}
            </Input>
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
            <Input
              type="select"
              name="observador"
              value={formValues.observador}
              onChange={handleInputChange}
            >
              <option value="">Seleccione una Opción</option>
              {renderOptions(observadores, "codigo_persona", "nombre")}
            </Input>
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
    </>
  );
};

export default ActividadForms;

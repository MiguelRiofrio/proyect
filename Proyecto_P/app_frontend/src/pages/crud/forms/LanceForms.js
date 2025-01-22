import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';
import CapturaForms from './CapturaForms';
import AvistamientoForms from './AvistamientoForms';
import IncidenciaForms from './IncidenciaForms';
import renderDetalles from './LancePForms';

const LanceForms = ({ lances, setLances, especies, tipo, carnadas, codigoActividad }) => {
  const [activeTab, setActiveTab] = useState('0');

  const agregarLance = () => {
    // Extrae el número más alto de los códigos existentes
    const numerosExistentes = lances.map((lance) => {
      const match = lance.codigo_lance.match(/-L-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
  
    const nuevoNumero = Math.max(0, ...numerosExistentes) + 1;
    const codigo_lance = `${codigoActividad}-L-${nuevoNumero}`;
  
    const nuevoLance = {
      codigo_lance,
      numero_lance: nuevoNumero,
      calado_fecha: '',
      calado_hora: '',
      tipo:"palangre",
      coordenadas: {
        latitud_grados: 0,
        latitud_minutos: 0,
        latitud_ns: '',
        longitud_grados: 0,
        longitud_minutos: 0,
        longitud_w: 'W',
      },
      profundidad_suelo_marino: 0,
      detalles: {
        // Inicializa los detalles según el tipo de lance
        Tipo_anzuelo: '',
        tamano_anzuelo: 0.0,
        cantidad_anzuelos: 0,
        linea_madre_metros: 0.0,
        profundidad_anzuelo_metros: 0.0,
        carnadas: [],
        // Agrega campos para otros tipos de lance si es necesario
      },
      capturas: [],
      avistamientos: [],
      incidencias: [],
    };
  
    setLances([...lances, nuevoLance]);
    setActiveTab(`${lances.length}`);
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const eliminarLance = (index) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este lance?');
    if (confirmacion) {
      const nuevosLances = lances.filter((_, i) => i !== index);
      setLances(nuevosLances);
      if (activeTab === `${index}` && nuevosLances.length > 0) {
        setActiveTab('0');
      } else if (nuevosLances.length === 0) {
        setActiveTab('');
      }
    }
  };

  const handleLanceChange = (index, name, value) => {
    // Verifica si el valor debería ser un número
    const numericFields = [
      "profundidad_suelo_marino",
      "latitud_grados",
      "latitud_minutos",
      "longitud_grados",
      "longitud_minutos",
    ];
  
    const processedValue = numericFields.includes(name) && value !== ""
      ? parseFloat(value)
      : value;
  
    const nuevosLances = lances.map((lance, i) =>
      i === index ? { ...lance, [name]: processedValue } : lance
    );
  
    setLances(nuevosLances);
  };

  return (
    <>
      <Button color="primary" onClick={agregarLance} className="mb-3">
        Agregar Lance
      </Button>
      <Nav tabs>
        {lances.map((lance, index) => (
          <NavItem key={lance.codigo_lance}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Lance {lance.codigo_lance}
              <Button close aria-label="Cancel" onClick={() => eliminarLance(index)} />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {lances.map((lance, index) => (
          <TabPane key={lance.codigo_lance} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <thead>
                <tr>
                  <th colSpan={6} className="text-center">Detalles del Lance</th>
                </tr>
                <tr>
                  <th colSpan="2">Fecha de Calado</th>
                  <th colSpan="2">Hora de Calado</th>
                  <th colSpan="2">Profundidad del Suelo Marino</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2">
                    <Input
                      type="date"
                      name="calado_fecha"
                      value={lance.calado_fecha || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
                    />
                  </td>
                  <td colSpan="2">
                    <Input
                      type="time"
                      name="calado_hora"
                      value={lance.calado_hora || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
                    />
                  </td>
                  <td colSpan="2">
                    <Input
                      type="number"
                      name="profundidad_suelo_marino"
                      value={lance.profundidad_suelo_marino || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
                    />
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th colSpan="3" className="text-center">Coordenadas Latitud</th>
                  <th colSpan="3" className="text-center">Coordenadas Longitud</th>
                </tr>
                <tr>
                  <th>NS</th>
                  <th>Grados</th>
                  <th>Minutos</th>
                  <th>Grados</th>
                  <th>Minutos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="select"
                      name="latitud_ns"
                      value={lance.coordenadas.latitud_ns || ''}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const nuevosLances = [...lances];
                        nuevosLances[index].coordenadas[name] = value;
                        setLances(nuevosLances);
                      }}
                    >
                      <option value="">Seleccione una Opción</option>
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="latitud_grados"
                      value={lance.coordenadas.latitud_grados || ''}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const nuevosLances = [...lances];
                        nuevosLances[index].coordenadas[name] = parseFloat(value) || 0;
                        setLances(nuevosLances);
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="latitud_minutos"
                      value={lance.coordenadas.latitud_minutos || ''}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const nuevosLances = [...lances];
                        nuevosLances[index].coordenadas[name] = parseFloat(value) || 0;
                        setLances(nuevosLances);
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="longitud_grados"
                      value={lance.coordenadas.longitud_grados || ''}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const nuevosLances = [...lances];
                        nuevosLances[index].coordenadas[name] = parseFloat(value) || 0;
                        setLances(nuevosLances);
                      }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="longitud_minutos"
                      value={lance.coordenadas.longitud_minutos || ''}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        const nuevosLances = [...lances];
                        nuevosLances[index].coordenadas[name] = parseFloat(value) || 0;
                        setLances(nuevosLances);
                      }}
                    />
                  </td>
                  
                </tr>
              </tbody>            
            </Table>
          
            {tipo && renderDetalles[tipo] && renderDetalles[tipo](lance, index, handleLanceChange, carnadas)}

            <CapturaForms
              capturas={lance.capturas}
              setCapturas={(nuevasCapturas) => {
                const nuevosLances = [...lances];
                nuevosLances[index].capturas = nuevasCapturas;
                setLances(nuevosLances);
              }}
              especies={especies}
            />
            <AvistamientoForms
              avistamientos={lance.avistamientos}
              setAvistamientos={(nuevosAvistamientos) => {
                const nuevosLances = [...lances];
                nuevosLances[index].avistamientos = nuevosAvistamientos;
                setLances(nuevosLances);
              }}
              especies={especies}
            />
            <IncidenciaForms
              incidencias={lance.incidencias}
              setIncidencias={(nuevasIncidencias) => {
                const nuevosLances = [...lances];
                nuevosLances[index].incidencias = nuevasIncidencias;
                setLances(nuevosLances);
              }}
              especies={especies}

            />
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default LanceForms;

import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';
import CapturaForms from './CapturaForms';
import AvistamientoForms from './AvistamientoForms';
import IncidenciaForms from './IncidenciaForms';
import renderDetalles from './LancePForms';

const LanceForms = ({ lances, setLances, especies, tipo, carnadas ,codigoActividad }) => {
  const [activeTab, setActiveTab] = useState('0');

  const agregarLance = () => {
    const numerosExistentes = lances.map((lance) => lance.codigo_lance);
    const codigo_lance = codigoActividad + "-L-"+Math.max(0, ...numerosExistentes) + 1;

    const nuevoLance = {
      codigo_lance,
      calado_fecha: '',
      calado_hora: '',
      profundidad_suelo_marino: 0,
      coordenadas_lat_grados: 0,
      coordenadas_lat_minutos: 0,
      coordenadas_lat_ns: '',
      coordenadas_log_grados: 0,
      coordenadas_log_minutos: 0,
      coordenadas_log_w: 'w',
      detalles: {
        palangre: {
          carnadas: [],
        },
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
    const nuevosLances = lances.map((lance, i) =>
      i === index ? { ...lance, [name]: value } : lance
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
                  <th colSpan={6} className="text-center">Detalles del Lances</th>
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
                  <th> NS  </th>
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
                      name="coordenadas_lat_ns"
                      value={lance.coordenadas_lat_ns || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
                    >
                       <option value="">Seleccione una Opción</option>
                        <option value="n">N</option>
                        <option value="s">S</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="coordenadas_lat_grados"
                      value={lance.coordenadas_lat_grados || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="coordenadas_lat_minutos"
                      value={lance.coordenadas_lat_minutos || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
                    />
                  </td>
                
                  <td>
                    <Input
                      type="number"
                      name="coordenadas_log_grados"
                      value={lance.coordenadas_log_grados || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="coordenadas_log_minutos"
                      value={lance.coordenadas_log_minutos || ''}
                      onChange={(e) => handleLanceChange(index, e.target.name, e.target.value)}
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
            />
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default LanceForms;

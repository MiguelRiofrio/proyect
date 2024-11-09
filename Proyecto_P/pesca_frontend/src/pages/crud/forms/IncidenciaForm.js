import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';
import './css/Button.css'; // Importar el archivo CSS

const IncidenciaForm = ({ incidencias, setIncidencias, handleIncidenciaChange }) => {
  const [activeTab, setActiveTab] = useState('0');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const eliminarIncidencia = (index) => {
    const nuevasIncidencias = incidencias.filter((_, i) => i !== index);
    setIncidencias(nuevasIncidencias);
    if (activeTab === `${index}` && nuevasIncidencias.length > 0) {
      setActiveTab('0');
    } else if (nuevasIncidencias.length === 0) {
      setActiveTab('');
    }
  };

  return (
    <>
      <Nav tabs>
        {incidencias.map((incidencia, index) => (
          <NavItem key={incidencia.codigo_incidencia}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Incidencia {index + 1}{' '}
              <Button close aria-label="Cancel"className='close-button' onClick={() => eliminarIncidencia(index)} />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {incidencias.map((incidencia, index) => (
          <TabPane key={incidencia.codigo_incidencia} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <tbody>
                <tr>
                  <td>
                    <label>Grupos de Avistamiento</label>
                    <Input
                      type="text"
                      name="grupos_avi_int"
                      value={incidencia.grupos_avi_int || ''}
                      onChange={(e) => handleIncidenciaChange(incidencia.codigo_incidencia, e)}
                    />
                  </td>
                  <td>
                    <label>Nombre Científico</label>
                    <Input
                      type="text"
                      name="nombre_cientifico"
                      value={incidencia.nombre_cientifico || ''}
                      onChange={(e) => handleIncidenciaChange(incidencia.codigo_incidencia, e)}
                    />
                  </td>
                  <td>
                    <label>Herida Grave</label>
                    <Input
                      type="number"
                      name="herida_grave"
                      value={incidencia.herida_grave || 0}
                      onChange={(e) => handleIncidenciaChange(incidencia.codigo_incidencia, e)}
                    />
                  </td>
                  {/* Continúa con los demás campos */}
                </tr>
              </tbody>
            </Table>
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default IncidenciaForm;

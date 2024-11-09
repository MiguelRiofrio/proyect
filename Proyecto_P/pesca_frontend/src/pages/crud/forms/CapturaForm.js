import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';

const CapturaForm = ({ capturas, setCapturas, handleCapturaChange }) => {
  const [activeTab, setActiveTab] = useState('0');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const eliminarCaptura = (index) => {
    const nuevasCapturas = capturas.filter((_, i) => i !== index);
    setCapturas(nuevasCapturas);
    if (activeTab === `${index}` && nuevasCapturas.length > 0) {
      setActiveTab('0');
    } else if (nuevasCapturas.length === 0) {
      setActiveTab('');
    }
  };

  return (
    <>
      <Nav tabs>
        {capturas.map((captura, index) => (
          <NavItem key={captura.codigo_captura}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Captura {index + 1}{' '}
              <Button close aria-label="Cancel" onClick={() => eliminarCaptura(index)} />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {capturas.map((captura, index) => (
          <TabPane key={captura.codigo_captura} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <tbody>
                <tr>
                  <td>
                    <label>Taxa</label>
                    <Input
                      type="text"
                      name="taxa"
                      value={captura.taxa || ''}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                  <td>
                    <label>Género</label>
                    <Input
                      type="text"
                      name="genero"
                      value={captura.genero || ''}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                  <td>
                    <label>Especie</label>
                    <Input
                      type="text"
                      name="especie"
                      value={captura.especie || ''}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Nombre Científico</label>
                    <Input
                      type="text"
                      name="nombre_cientifico"
                      value={captura.nombre_cientifico || ''}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                  <td>
                    <label>Nombre Común</label>
                    <Input
                      type="text"
                      name="nombre_comun"
                      value={captura.nombre_comun || ''}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                  <td>
                    <label>Individuos Retenidos</label>
                    <Input
                      type="number"
                      name="individuos_retenidos"
                      value={captura.individuos_retenidos || 0}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Individuos Descarte</label>
                    <Input
                      type="number"
                      name="individuos_descarte"
                      value={captura.individuos_descarte || 0}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                  <td>
                    <label>Peso Retenido (lb)</label>
                    <Input
                      type="number"
                      step="0.01"
                      name="peso_retenido"
                      value={captura.peso_retenido || 0}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                  <td>
                    <label>Peso Descartado (lb)</label>
                    <Input
                      type="number"
                      step="0.01"
                      name="peso_descarte"
                      value={captura.peso_descarte || 0}
                      onChange={(e) => handleCapturaChange(captura.codigo_captura, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Total Individuos</label>
                    <Input
                      type="number"
                      name="total_individuos"
                      value={captura.total_individuos || 0}
                      disabled
                    />
                  </td>
                  <td>
                    <label>Total Peso (lb)</label>
                    <Input
                      type="number"
                      step="0.01"
                      name="total_peso_lb"
                      value={captura.total_peso_lb || 0}
                      disabled
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default CapturaForm;

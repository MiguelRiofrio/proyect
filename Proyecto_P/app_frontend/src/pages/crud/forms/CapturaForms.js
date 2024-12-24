import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';

const CapturaForms = ({ capturas, setCapturas, especies }) => {
  const [activeTab, setActiveTab] = useState('0');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const agregarCaptura = () => {
    const nuevaCaptura = {
      codigo_captura: Date.now(),
      especie: '',
      individuos_retenidos: 0,
      individuos_descarte: 0,
      peso_retenido: 0,
      peso_descarte: 0,
    };
    setCapturas([...capturas, nuevaCaptura]);
    setActiveTab(`${capturas.length}`);
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

  const handleCapturaChange = (index, e) => {
    const { name, value } = e.target;
    const nuevasCapturas = capturas.map((captura, i) =>
      i === index
        ? {
            ...captura,
            [name]: name.includes('individuos') || name.includes('peso')
              ? parseFloat(value) || 0 // Convertir a número
              : value,
          }
        : captura
    );
    setCapturas(nuevasCapturas);
  };

  return (
    <>
      <Button color="primary" onClick={agregarCaptura} className="mb-3">
        Agregar Captura
      </Button>

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
              <thead>
               
              </thead>
              <tbody>
               <tr>
                  <td>Especies</td>
                
                  <td colSpan={2}>
                    <Input
                      type="select"
                      name="especie"
                      value={captura.especie || ''}
                      onChange={(e) => handleCapturaChange(index, e)}
                    >
                      <option value="">Seleccione una especie</option>
                      {especies.map((especie) => (
                        <option key={especie.codigo_especie} value={especie.codigo_especie}>
                          {especie.nombre_cientifico} - {especie.nombre_comun}  - {especie.especie}
                        </option>
                      ))}
                    </Input>
                  </td>

                </tr>
              </tbody>
              <thead>
                <tr>
                  <td>Individuos Retenidos</td>
                  <td>Individuos Descarte</td>
                  <td>Total Individuos</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="number"
                      name="individuos_retenidos"
                      value={captura.individuos_retenidos || 0}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="individuos_descarte"
                      value={captura.individuos_descarte || 0}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                  <Input
                      type="number"
                      value={parseInt(captura.individuos_retenidos || 0) -
                            parseInt(captura.individuos_descarte || 0)} disabled/>
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <td>Peso Retenido (lb)</td>
                  <td>Peso Descartado (lb)</td>
                  <td>Total Peso</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="number"
                      step="0.01"
                      name="peso_retenido"
                      value={captura.peso_retenido || 0}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      step="0.01"
                      name="peso_descarte"
                      value={captura.peso_descarte || 0}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                  <Input
                      type="number"
                      step="0.01"
                      value={parseFloat(captura.peso_retenido || 0) -
                      parseFloat(captura.peso_descarte || 0)} disabled/>
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

export default CapturaForms;

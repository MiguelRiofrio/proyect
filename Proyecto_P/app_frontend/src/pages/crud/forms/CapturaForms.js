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
      especie: { codigo_especie: 0 }, // Inicializado como objeto
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
    const nuevosCampos = { ...capturas[index] };

    if (name === 'especie') {
      nuevosCampos[name] = { codigo_especie: parseInt(value, 10) || 0 }; // Convertir a objeto
    } else if (
      name.includes('individuos') ||
      name.includes('peso')
    ) {
      nuevosCampos[name] = parseFloat(value) || 0; // Convertir a número
    } else {
      nuevosCampos[name] = value;
    }

    const nuevasCapturas = capturas.map((captura, i) =>
      i === index ? nuevosCampos : captura
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
          <NavItem key={index}>
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
          <TabPane key={index} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <thead>
                <tr>
                  <th colSpan={4} className="text-center">Detalles de la Captura</th>
                </tr>
                <tr>
                  <th>Especie</th>
                  <th>Individuos Retenidos</th>
                  <th>Individuos Descarte</th>
                  <th>Total Individuos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="select"
                      name="especie"
                      value={captura.especie.codigo_especie}
                      onChange={(e) => handleCapturaChange(index, e)}
                    >
                      <option value={0}>Seleccione una especie</option>
                      {especies.map((especie) => (
                        <option key={especie.codigo_especie} value={especie.codigo_especie}>
                          {especie.nombre_cientifico} - {especie.nombre_comun} - {especie.especie}
                        </option>
                      ))}
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="individuos_retenidos"
                      value={captura.individuos_retenidos}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="individuos_descarte"
                      value={captura.individuos_descarte}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={
                        captura.individuos_retenidos - captura.individuos_descarte
                      }
                      disabled
                    />
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th>Peso Retenido (lb)</th>
                  <th>Peso Descartado (lb)</th>
                  <th>Total Peso</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="number"
                      step="0.01"
                      name="peso_retenido"
                      value={captura.peso_retenido}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      step="0.01"
                      name="peso_descarte"
                      value={captura.peso_descarte}
                      onChange={(e) => handleCapturaChange(index, e)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      step="0.01"
                      value={
                        parseFloat(captura.peso_retenido) -
                        parseFloat(captura.peso_descarte)
                      }
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

export default CapturaForms;

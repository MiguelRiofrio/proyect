import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';

const AvistamientoForms = ({ avistamientos, setAvistamientos, especies = [] }) => {
  const [activeTab, setActiveTab] = useState('0');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const agregarAvistamiento = () => {
    const nuevoAvistamiento = {
      codigo_avistamiento: Date.now(),
      especie: '',
      grupos_avi_int: '',
      alimentandose: 0,
      deambulando: 0,
      en_reposo: 0,
    };
    setAvistamientos([...avistamientos, nuevoAvistamiento]);
    setActiveTab(`${avistamientos.length}`);
  };

  const eliminarAvistamiento = (index) => {
    const nuevosAvistamientos = avistamientos.filter((_, i) => i !== index);
    setAvistamientos(nuevosAvistamientos);
    if (activeTab === `${index}` && nuevosAvistamientos.length > 0) {
      setActiveTab('0');
    } else if (nuevosAvistamientos.length === 0) {
      setActiveTab('');
    }
  };

  const handleAvistamientoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosAvistamientos = avistamientos.map((avistamiento, i) =>
      i === index ? { ...avistamiento, [name]: value } : avistamiento
    );
    setAvistamientos(nuevosAvistamientos);
  };

  return (
    <>
      <Button color="primary" onClick={agregarAvistamiento} className="mb-3">
        Agregar Avistamiento
      </Button>

      <Nav tabs>
        {avistamientos.map((avistamiento, index) => (
          <NavItem key={avistamiento.codigo_avistamiento}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Avistamiento {index + 1}{' '}
              <Button close aria-label="Cancel" onClick={() => eliminarAvistamiento(index)} />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {avistamientos.map((avistamiento, index) => (
          <TabPane key={avistamiento.codigo_avistamiento} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <tbody>
                <tr>
                  <td>
                    <label>Especie</label>
                    <Input
                      type="select"
                      name="especie"
                      value={avistamiento.especie || ''}
                      onChange={(e) => handleAvistamientoChange(index, e)}
                    >
                      <option value="">Seleccione una especie</option>
                      {especies.map((especie) => (
                        <option key={especie.codigo_especie} value={especie.codigo_especie}>
                          {especie.nombre_cientifico}
                        </option>
                      ))}
                    </Input>
                  </td>
                  <td>
                    <label>Grupos de Avistamiento</label>
                    <Input
                      type="text"
                      name="grupos_avi_int"
                      value={avistamiento.grupos_avi_int || ''}
                      onChange={(e) => handleAvistamientoChange(index, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Individuos Alimentándose</label>
                    <Input
                      type="number"
                      name="alimentandose"
                      value={avistamiento.alimentandose || 0}
                      onChange={(e) => handleAvistamientoChange(index, e)}
                    />
                  </td>
                  <td>
                    <label>Individuos Deambulando</label>
                    <Input
                      type="number"
                      name="deambulando"
                      value={avistamiento.deambulando || 0}
                      onChange={(e) => handleAvistamientoChange(index, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Individuos en Reposo</label>
                    <Input
                      type="number"
                      name="en_reposo"
                      value={avistamiento.en_reposo || 0}
                      onChange={(e) => handleAvistamientoChange(index, e)}
                    />
                  </td>
                  <td>
                    <label>Total Individuos</label>
                    <Input
                      type="number"
                      name="total_individuos"
                      value={
                        parseInt(avistamiento.alimentandose || 0) +
                        parseInt(avistamiento.deambulando || 0) +
                        parseInt(avistamiento.en_reposo || 0)
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

export default AvistamientoForms;

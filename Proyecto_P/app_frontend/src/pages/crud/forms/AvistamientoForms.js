import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button, FormGroup, Label } from 'reactstrap';
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
      especie: { codigo_especie: 0 }, // Inicializado como objeto
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
    const nuevosAvistamientos = [...avistamientos];
    const avistamientoActual = { ...nuevosAvistamientos[index] };

    if (name === 'especie') {
      avistamientoActual.especie = { codigo_especie: parseInt(value, 10) || 0 };
    } else if (
      name === 'alimentandose' ||
      name === 'deambulando' ||
      name === 'en_reposo'
    ) {
      avistamientoActual[name] = parseInt(value, 10) || 0;
    } else {
      avistamientoActual[name] = value;
    }

    nuevosAvistamientos[index] = avistamientoActual;
    setAvistamientos(nuevosAvistamientos);
  };

  return (
    <>
      <Button color="dark" onClick={agregarAvistamiento} className="mb-3">
        Agregar Avistamiento
      </Button>

      <Nav tabs>
        {avistamientos.map((avistamiento, index) => (
          <NavItem key={index}>
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
          <TabPane key={index} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <tbody>
                <tr>
                  <td>
                    <FormGroup>
                      <Label for={`especie-${index}`}>Especie</Label>
                      <Input
                        type="select"
                        name="especie"
                        id={`especie-${index}`}
                        value={avistamiento.especie.codigo_especie}
                        onChange={(e) => handleAvistamientoChange(index, e)}
                      >
                        <option value={0}>Seleccione una especie</option>
                        {especies.map((especie) => (
                          <option key={especie.codigo_especie} value={especie.codigo_especie}>
                            {especie.nombre_cientifico} - {especie.nombre_comun} - {especie.especie}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Label for={`grupos_avi_int-${index}`}>Grupos de Avistamiento</Label>
                      <Input
                        type="text"
                        name="grupos_avi_int"
                        id={`grupos_avi_int-${index}`}
                        value={avistamiento.grupos_avi_int}
                        onChange={(e) => handleAvistamientoChange(index, e)}
                        placeholder="Ingrese grupos de avistamiento"
                      />
                    </FormGroup>
                  </td>
                </tr>
                <tr>
                  <td>
                    <FormGroup>
                      <Label for={`alimentandose-${index}`}>Individuos Alimentándose</Label>
                      <Input
                        type="number"
                        name="alimentandose"
                        id={`alimentandose-${index}`}
                        value={avistamiento.alimentandose}
                        onChange={(e) => handleAvistamientoChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Label for={`deambulando-${index}`}>Individuos Deambulando</Label>
                      <Input
                        type="number"
                        name="deambulando"
                        id={`deambulando-${index}`}
                        value={avistamiento.deambulando}
                        onChange={(e) => handleAvistamientoChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </td>
                </tr>
                <tr>
                  <td>
                    <FormGroup>
                      <Label for={`en_reposo-${index}`}>Individuos en Reposo</Label>
                      <Input
                        type="number"
                        name="en_reposo"
                        id={`en_reposo-${index}`}
                        value={avistamiento.en_reposo}
                        onChange={(e) => handleAvistamientoChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Label for={`total_individuos-${index}`}>Total Individuos</Label>
                      <Input
                        type="number"
                        name="total_individuos"
                        id={`total_individuos-${index}`}
                        value={
                          (avistamiento.alimentandose || 0) +
                          (avistamiento.deambulando || 0) +
                          (avistamiento.en_reposo || 0)
                        }
                        disabled
                      />
                    </FormGroup>
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

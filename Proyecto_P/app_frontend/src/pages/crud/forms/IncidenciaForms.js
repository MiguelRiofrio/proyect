import React, { useState } from 'react';
import {
  Table,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Button,
  FormGroup,
  Label,
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Alert
} from 'reactstrap';
import classnames from 'classnames';

const IncidenciaForms = ({ incidencias, setIncidencias, especies = [] }, codigo_lance) => {
  const [activeTab, setActiveTab] = useState('0');
  const [alertMessage, setAlertMessage] = useState('');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const agregarIncidencia = () => {
    const nuevoNumeroIncidencia =
      incidencias.length > 0
        ? Math.max(...incidencias.map((c) => c.numero_incidencia)) + 1
        : 1;

    const codigo_incidencia = `A-${nuevoNumeroIncidencia}-${codigo_lance}`;
    const nuevaIncidencia = {
      codigo_incidencia,
      especie: { codigo_especie: 0 },
      herida_grave: 0,
      herida_leve: 0,
      muerto: 0,
      total_individuos: 0,
      observacion: '',
      detalles: {} // Se inicializa como objeto
    };

    setIncidencias([...incidencias, nuevaIncidencia]);
    setActiveTab(`${incidencias.length}`);
  };

  const agregarDetalle = (index, tipo) => {
    // Valores iniciales para cada tipo de detalle
    const detalleInitialValues = {
      aves: { pico: 0, patas: 0, alas: 0 },
      mamiferos: { hocico: 0, cuello: 0, cuerpo: 0 },
      tortugas: { pico: 0, cuerpo: 0, aleta: 0 },
      palangre: { orinque: 0, reinal: 0, anzuelo: 0, linea_madre: 0 }
    };

    const nuevasIncidencias = incidencias.map((incidencia, i) => {
      if (i === index) {
        // Exclusividad entre aves, mamiferos y tortugas
        if (["aves", "mamiferos", "tortugas"].includes(tipo)) {
          const groupKeys = ["aves", "mamiferos", "tortugas"];
          for (const key of groupKeys) {
            if (incidencia.detalles[key] !== undefined) {
              setAlertMessage("Solo se puede agregar un detalle entre aves, mamiferos o tortugas.");
              return incidencia;
            }
          }
        }
        // Exclusividad para palangre
        if (tipo === "palangre" && incidencia.detalles["palangre"] !== undefined) {
          setAlertMessage("Solo se puede agregar un detalle de palangre.");
          return incidencia;
        }
        return {
          ...incidencia,
          detalles: {
            ...incidencia.detalles,
            [tipo]: detalleInitialValues[tipo]
          }
        };
      }
      return incidencia;
    });

    setIncidencias(nuevasIncidencias);
  };

  const handleDetalleFieldChange = (index, tipo, field, e) => {
    const { value } = e.target;
    const nuevasIncidencias = incidencias.map((incidencia, i) => {
      if (i === index) {
        return {
          ...incidencia,
          detalles: {
            ...incidencia.detalles,
            [tipo]: {
              ...incidencia.detalles[tipo],
              [field]: parseInt(value, 10) || 0,
            }
          }
        };
      }
      return incidencia;
    });
    setIncidencias(nuevasIncidencias);
  };

  const eliminarDetalle = (index, tipo) => {
    const nuevasIncidencias = incidencias.map((incidencia, i) => {
      if (i === index) {
        const newDetalles = { ...incidencia.detalles };
        delete newDetalles[tipo];
        return { ...incidencia, detalles: newDetalles };
      }
      return incidencia;
    });
    setIncidencias(nuevasIncidencias);
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

  const handleIncidenciaChange = (index, e) => {
    const { name, value } = e.target;
    const nuevasIncidencias = incidencias.map((incidencia, i) =>
      i === index
        ? {
            ...incidencia,
            [name]:
              name === 'especie'
                ? { codigo_especie: parseInt(value, 10) || 0 }
                : name === 'herida_grave' ||
                  name === 'herida_leve' ||
                  name === 'muerto'
                ? parseInt(value, 10) || 0
                : value,
          }
        : incidencia
    );

    // Actualizar total de individuos
    const incidenciaActualizada = nuevasIncidencias[index];
    if (['herida_grave', 'herida_leve', 'muerto'].includes(name)) {
      incidenciaActualizada.total_individuos =
        (parseInt(incidenciaActualizada.herida_grave, 10) || 0) +
        (parseInt(incidenciaActualizada.herida_leve, 10) || 0) +
        (parseInt(incidenciaActualizada.muerto, 10) || 0);
      nuevasIncidencias[index] = incidenciaActualizada;
    }

    setIncidencias(nuevasIncidencias);
  };

  return (
    <>
      {alertMessage && (
        <Alert color="danger" toggle={() => setAlertMessage('')}>
          {alertMessage}
        </Alert>
      )}

      <div className="mb-4">
        <Button color="dark" onClick={agregarIncidencia}>
          <i className="fa fa-plus mr-2" />
          Agregar Incidencia
        </Button>
      </div>

      <Nav tabs>
        {incidencias.map((incidencia, index) => (
          <NavItem key={incidencia.codigo_incidencia}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Incidencia {index + 1}{' '}
              <Button
                close
                aria-label="Eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarIncidencia(index);
                }}
              />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {incidencias.map((incidencia, index) => (
          <TabPane key={incidencia.codigo_incidencia} tabId={`${index}`}>
            <Card className="mt-3">
              <CardHeader>Detalles de la Incidencia</CardHeader>
              <CardBody>
                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for={`especie-${index}`}>Especie</Label>
                      <Input
                        type="select"
                        name="especie"
                        id={`especie-${index}`}
                        value={incidencia.especie.codigo_especie}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                      >
                        <option value={0}>Seleccione una especie</option>
                        {especies.map((especie) => (
                          <option
                            key={especie.codigo_especie}
                            value={especie.codigo_especie}
                          >
                            {especie.nombre_cientifico} - {especie.nombre_comun} - {especie.especie}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup>
                      <Label for={`observacion-${index}`}>Observación</Label>
                      <Input
                        type="textarea"
                        name="observacion"
                        id={`observacion-${index}`}
                        value={incidencia.observacion || ''}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        placeholder="Ingrese observaciones"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row form>
                  <Col md={4}>
                    <FormGroup>
                      <Label for={`herida_grave-${index}`}>Herida Grave</Label>
                      <Input
                        type="number"
                        name="herida_grave"
                        id={`herida_grave-${index}`}
                        value={incidencia.herida_grave || 0}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for={`herida_leve-${index}`}>Herida Leve</Label>
                      <Input
                        type="number"
                        name="herida_leve"
                        id={`herida_leve-${index}`}
                        value={incidencia.herida_leve || 0}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup>
                      <Label for={`muerto-${index}`}>Muerto</Label>
                      <Input
                        type="number"
                        name="muerto"
                        id={`muerto-${index}`}
                        value={incidencia.muerto || 0}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row form>
                  <Col md={6}>
                    <FormGroup>
                      <Label for={`total_individuos-${index}`}>Total Individuos</Label>
                      <Input
                        type="number"
                        name="total_individuos"
                        id={`total_individuos-${index}`}
                        value={incidencia.total_individuos || 0}
                        disabled
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <hr />

                <div className="mb-3">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => agregarDetalle(index, 'aves')}
                    className="mr-2"
                  >
                    Agregar Detalle de Aves
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => agregarDetalle(index, 'mamiferos')}
                    className="mr-2"
                  >
                    Agregar Detalle de Mamíferos
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => agregarDetalle(index, 'tortugas')}
                    className="mr-2"
                  >
                    Agregar Detalle de Tortugas
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => agregarDetalle(index, 'palangre')}
                  >
                    Agregar Detalle de Palangre
                  </Button>
                </div>

                {Object.keys(incidencia.detalles).length > 0 && (
                  <>
                    {Object.entries(incidencia.detalles).map(([tipo, detalle]) => (
                      <Card className="mt-3" key={tipo}>
                        <CardHeader>
                          Detalle: {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => eliminarDetalle(index, tipo)}
                            className="float-right"
                          >
                            Eliminar
                          </Button>
                        </CardHeader>
                        <CardBody>
                          <Table bordered>
                            <tbody>
                              {Object.entries(detalle).map(([field, value]) => (
                                <tr key={field}>
                                  <td>{field}</td>
                                  <td>
                                    <Input
                                      type="number"
                                      value={value}
                                      onChange={(e) =>
                                        handleDetalleFieldChange(index, tipo, field, e)
                                      }
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </CardBody>
                      </Card>
                    ))}
                  </>
                )}
              </CardBody>
            </Card>
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default IncidenciaForms;

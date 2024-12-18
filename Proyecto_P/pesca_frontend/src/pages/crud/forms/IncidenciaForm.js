import React, { useState } from 'react';
import { Row, Col, FormGroup, Input, Label, Button } from 'reactstrap';

const IncidenciaForm = ({ especies, agregarIncidencia }) => {
  const [incidencia, setIncidencia] = useState({
    especie: '',
    grupos_avi_int: '',
    herida_grave: 0,
    herida_leve: 0,
    muerto: 0,
    total_individuos: 0,
    observacion: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIncidencia({ ...incidencia, [name]: value });
  };

  const handleSubmit = () => {
    agregarIncidencia(incidencia);
    setIncidencia({
      especie: '',
      grupos_avi_int: '',
      herida_grave: 0,
      herida_leve: 0,
      muerto: 0,
      total_individuos: 0,
      observacion: '',
    });
  };

  return (
    <>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Especie</Label>
            <Input
              type="select"
              name="especie"
              value={incidencia.especie}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {especies.map((e) => (
                <option key={e.codigo_especie} value={e.codigo_especie}>
                  {e.nombre_cientifico}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Grupos Afectados</Label>
            <Input
              type="text"
              name="grupos_avi_int"
              value={incidencia.grupos_avi_int}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="3">
          <FormGroup>
            <Label>Herida Grave</Label>
            <Input
              type="number"
              name="herida_grave"
              value={incidencia.herida_grave}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label>Herida Leve</Label>
            <Input
              type="number"
              name="herida_leve"
              value={incidencia.herida_leve}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label>Muerto</Label>
            <Input
              type="number"
              name="muerto"
              value={incidencia.muerto}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
        <Col md="3">
          <FormGroup>
            <Label>Total de Individuos</Label>
            <Input
              type="number"
              name="total_individuos"
              value={incidencia.total_individuos}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="12">
          <FormGroup>
            <Label>Observación</Label>
            <Input
              type="textarea"
              name="observacion"
              value={incidencia.observacion}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Button color="success" onClick={handleSubmit} className="mt-3">
        Agregar Incidencia
      </Button>
    </>
  );
};

export default IncidenciaForm;

import React, { useState } from 'react';
import { Row, Col, FormGroup, Input, Label, Button } from 'reactstrap';

const AvistamientoForm = ({ especies, agregarAvistamiento }) => {
  const [avistamiento, setAvistamiento] = useState({
    especie: '',
    grupos_avi_int: '',
    alimentandose: 0,
    deambulando: 0,
    en_reposo: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAvistamiento({ ...avistamiento, [name]: value });
  };

  const handleSubmit = () => {
    agregarAvistamiento(avistamiento);
    setAvistamiento({
      especie: '',
      grupos_avi_int: '',
      alimentandose: 0,
      deambulando: 0,
      en_reposo: 0,
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
              value={avistamiento.especie}
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
            <Label>Grupos Avistados</Label>
            <Input
              type="text"
              name="grupos_avi_int"
              value={avistamiento.grupos_avi_int}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <FormGroup>
            <Label>Alimentándose</Label>
            <Input
              type="number"
              name="alimentandose"
              value={avistamiento.alimentandose}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label>Deambulando</Label>
            <Input
              type="number"
              name="deambulando"
              value={avistamiento.deambulando}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label>En Reposo</Label>
            <Input
              type="number"
              name="en_reposo"
              value={avistamiento.en_reposo}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
      </Row>
      <Button color="success" onClick={handleSubmit} className="mt-3">
        Agregar Avistamiento
      </Button>
    </>
  );
};

export default AvistamientoForm;

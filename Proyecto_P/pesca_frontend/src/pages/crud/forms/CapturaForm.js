import React, { useState } from 'react';
import { Row, Col, FormGroup, Input, Label, Button } from 'reactstrap';

const CapturaForm = ({ especies, agregarCaptura }) => {
  const [captura, setCaptura] = useState({
    especie: '',
    individuos_retenidos: 0,
    individuos_descarte: 0,
    peso_retenido: 0,
    peso_descarte: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaptura({ ...captura, [name]: value });
  };

  const handleSubmit = () => {
    agregarCaptura(captura);
    setCaptura({
      especie: '',
      individuos_retenidos: 0,
      individuos_descarte: 0,
      peso_retenido: 0,
      peso_descarte: 0,
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
              value={captura.especie}
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
            <Label>Individuos Retenidos</Label>
            <Input
              type="number"
              name="individuos_retenidos"
              value={captura.individuos_retenidos}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Individuos de Descarte</Label>
            <Input
              type="number"
              name="individuos_descarte"
              value={captura.individuos_descarte}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Peso Retenido (kg)</Label>
            <Input
              type="number"
              name="peso_retenido"
              value={captura.peso_retenido}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Peso de Descarte (kg)</Label>
            <Input
              type="number"
              name="peso_descarte"
              value={captura.peso_descarte}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </FormGroup>
        </Col>
      </Row>
      <Button color="success" onClick={handleSubmit} className="mt-3">
        Agregar Captura
      </Button>
    </>
  );
};

export default CapturaForm;

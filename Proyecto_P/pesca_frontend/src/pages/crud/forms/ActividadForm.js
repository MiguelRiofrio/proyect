import React from 'react';
import { Row, Col, FormGroup, Input, Label } from 'reactstrap';

const ActividadForm = ({ actividad, handleChange }) => {
  return (
    <>
      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="codigo_de_ingreso"><strong>Código de Ingreso:</strong></Label>
            <Input
              type="text"
              name="codigo_de_ingreso"
              value={actividad.codigo_de_ingreso}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="puerto_de_salida"><strong>Puerto de Salida:</strong></Label>
            <Input
              type="text"
              name="puerto_de_salida"
              value={actividad.puerto_de_salida}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="dia"><strong>Día de Salida:</strong></Label>
            <Input
              type="number"
              name="dia"
              value={actividad.dia}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="mes"><strong>Mes de Salida:</strong></Label>
            <Input
              type="number"
              name="mes"
              value={actividad.mes}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="ano"><strong>Año de Salida:</strong></Label>
            <Input
              type="number"
              name="ano"
              value={actividad.ano}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="puerto_de_entrada"><strong>Puerto de Entrada:</strong></Label>
            <Input
              type="text"
              name="puerto_de_entrada"
              value={actividad.puerto_de_entrada}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="dia_entrada"><strong>Día de Entrada:</strong></Label>
            <Input
              type="number"
              name="dia_entrada"
              value={actividad.dia_entrada}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="mes_entrada"><strong>Mes de Entrada:</strong></Label>
            <Input
              type="number"
              name="mes_entrada"
              value={actividad.mes_entrada}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="ano_entrada"><strong>Año de Entrada:</strong></Label>
            <Input
              type="number"
              name="ano_entrada"
              value={actividad.ano_entrada}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="observador"><strong>Observador:</strong></Label>
            <Input
              type="text"
              name="observador"
              value={actividad.observador}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="embarcacion"><strong>Embarcación:</strong></Label>
            <Input
              type="text"
              name="embarcacion"
              value={actividad.embarcacion}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="armador"><strong>Armador:</strong></Label>
            <Input
              type="text"
              name="armador"
              value={actividad.armador}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="capitan_de_pesca"><strong>Capitán de Pesca:</strong></Label>
            <Input
              type="text"
              name="capitan_de_pesca"
              value={actividad.capitan_de_pesca}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="matricula"><strong>Matrícula:</strong></Label>
            <Input
              type="text"
              name="matricula"
              value={actividad.matricula}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="tipo_de_palangre"><strong>Tipo de Palangre:</strong></Label>
            <Input
              type="text"
              name="tipo_de_palangre"
              value={actividad.tipo_de_palangre}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="tipo_de_flota"><strong>Tipo de Flota:</strong></Label>
            <Input
              type="text"
              name="tipo_de_flota"
              value={actividad.tipo_de_flota}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="pesca_objetivo"><strong>Pesca Objetivo:</strong></Label>
            <Input
              type="text"
              name="pesca_objetivo"
              value={actividad.pesca_objetivo}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>
    </>
  );
};

export default ActividadForm;

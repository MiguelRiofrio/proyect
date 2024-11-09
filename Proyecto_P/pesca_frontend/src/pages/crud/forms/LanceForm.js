import React from 'react';
import { Row, Col, FormGroup, Input, Label } from 'reactstrap';

const LanceForm = ({ lance, handleLanceChange }) => {
  return (
    <div>
      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="calado_inicial_dia">Calado Inicial Día</Label>
            <Input
              type="number"
              name="calado_inicial_dia"
              value={lance.calado_inicial_dia || 0}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="calado_inicial_mes">Calado Inicial Mes</Label>
            <Input
              type="number"
              name="calado_inicial_mes"
              value={lance.calado_inicial_mes || 0}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="calado_inicial_ano">Calado Inicial Año</Label>
            <Input
              type="number"
              name="calado_inicial_ano"
              value={lance.calado_inicial_ano || 0}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="calado_inicial_hora">Calado Inicial Hora</Label>
            <Input
              type="time"
              name="calado_inicial_hora"
              value={lance.calado_inicial_hora || ''}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="latitud_ns">Latitud NS</Label>
            <Input
              type="text"
              name="latitud_ns"
              value={lance.latitud_ns || ''}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="latitud_grados">Latitud Grados</Label>
            <Input
              type="number"
              name="latitud_grados"
              value={lance.latitud_grados || 0}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="latitud_minutos">Latitud Minutos</Label>
            <Input
              type="number"
              name="latitud_minutos"
              value={lance.latitud_minutos || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="longitud_w">Longitud W</Label>
            <Input
              type="text"
              name="longitud_w"
              value={lance.longitud_w || ''}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="longitud_grados">Longitud Grados</Label>
            <Input
              type="number"
              name="longitud_grados"
              value={lance.longitud_grados || 0}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="longitud_minutos">Longitud Minutos</Label>
            <Input
              type="number"
              name="longitud_minutos"
              value={lance.longitud_minutos || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="nombre_cientifico_1">Nombre Científico 1</Label>
            <Input
              type="text"
              name="nombre_cientifico_1"
              value={lance.nombre_cientifico_1 || ''}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="porcentaje_carnada_1">Porcentaje Carnada 1</Label>
            <Input
              type="number"
              name="porcentaje_carnada_1"
              value={lance.porcentaje_carnada_1 || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="nombre_cientifico_2">Nombre Científico 2</Label>
            <Input
              type="text"
              name="nombre_cientifico_2"
              value={lance.nombre_cientifico_2 || ''}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="porcentaje_carnada_2">Porcentaje Carnada 2</Label>
            <Input
              type="number"
              name="porcentaje_carnada_2"
              value={lance.porcentaje_carnada_2 || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="nombre_cientifico_3">Nombre Científico 3</Label>
            <Input
              type="text"
              name="nombre_cientifico_3"
              value={lance.nombre_cientifico_3 || ''}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="porcentaje_carnada_3">Porcentaje Carnada 3</Label>
            <Input
              type="number"
              name="porcentaje_carnada_3"
              value={lance.porcentaje_carnada_3 || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="2">
          <FormGroup>
            <Label for="tipo_anzuelo">Tipo de Anzuelo</Label>
            <Input
              type="text"
              name="tipo_anzuelo"
              value={lance.tipo_anzuelo || ''}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="tamano_anzuelo">Tamaño del Anzuelo</Label>
            <Input
              type="number"
              name="tamano_anzuelo"
              value={lance.tamano_anzuelo || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="cantidad_anzuelos">Cantidad de Anzuelos</Label>
            <Input
              type="number"
              name="cantidad_anzuelos"
              value={lance.cantidad_anzuelos || 0}
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="linea_madre_metros">Línea Madre (m)</Label>
            <Input
              type="number"
              name="linea_madre_metros"
              value={lance.linea_madre_metros || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
        <Col md="2">
          <FormGroup>
            <Label for="profundidad_anzuelo_metros">Profundidad del Anzuelo (m)</Label>
            <Input
              type="number"
              name="profundidad_anzuelo_metros"
              value={lance.profundidad_anzuelo_metros || 0}
              step="0.01"
              onChange={(e) => handleLanceChange(lance.codigo_lance, e)}
            />
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

export default LanceForm;

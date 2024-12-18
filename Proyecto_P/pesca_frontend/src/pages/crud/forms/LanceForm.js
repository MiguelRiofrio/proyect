import React from 'react';
import { Row, Col, FormGroup, Input, Label, Button } from 'reactstrap';

const LanceForm = ({ lance, handleChange, agregarLance, tipoLance, handleCarnadaChange, carnadas }) => {
  return (
    <>
      {/* Campos Generales del Lance */}
      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Número de Lance</Label>
            <Input
              type="number"
              name="numero_lance"
              value={lance.numero_lance || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Profundidad del Suelo Marino (m)</Label>
            <Input
              type="number"
              name="profundidad_suelo_marino"
              value={lance.profundidad_suelo_marino || ''}
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
            <Label>Fecha del Calado</Label>
            <Input
              type="date"
              name="calado_fecha"
              value={lance.calado_fecha || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Hora del Calado</Label>
            <Input
              type="time"
              name="calado_hora"
              value={lance.calado_hora || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Actividad</Label>
            <Input
              type="text"
              name="actividad"
              value={lance.actividad || ''}
              onChange={handleChange}
              placeholder="ID de la Actividad"
            />
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Coordenadas</Label>
            <Input
              type="text"
              name="coordenadas"
              value={lance.coordenadas || ''}
              onChange={handleChange}
              placeholder="ID de las Coordenadas"
            />
          </FormGroup>
        </Col>
      </Row>

      {/* Campos Específicos según el Tipo de Lance */}
      {tipoLance === 'arrastre' && (
        <Row>
          <Col md="6">
            <FormGroup>
              <Label>TED</Label>
              <Input
                type="checkbox"
                name="ted"
                checked={lance.ted || false}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: 'ted',
                      value: e.target.checked,
                    },
                  })
                }
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>Copo</Label>
              <Input
                type="number"
                name="copo"
                value={lance.copo || ''}
                onChange={handleChange}
                min="0"
              />
            </FormGroup>
          </Col>
        </Row>
      )}

      {tipoLance === 'cerco' && (
        <Row>
          <Col md="6">
            <FormGroup>
              <Label>Altura de la Red</Label>
              <Input
                type="number"
                name="altura_red"
                value={lance.altura_red || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </FormGroup>
          </Col>
          <Col md="6">
            <FormGroup>
              <Label>Longitud de la Red</Label>
              <Input
                type="number"
                name="longitud_red"
                value={lance.longitud_red || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </FormGroup>
          </Col>
        </Row>
      )}

      {tipoLance === 'palangre' && (
        <>
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Tamaño del Anzuelo</Label>
                <Input
                  type="number"
                  name="tamano_anzuelo"
                  value={lance.tamano_anzuelo || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>Cantidad de Anzuelos</Label>
                <Input
                  type="number"
                  name="cantidad_anzuelos"
                  value={lance.cantidad_anzuelos || ''}
                  onChange={handleChange}
                  min="0"
                />
              </FormGroup>
            </Col>
          </Row>

          {/* Carnadas */}
          <Row>
            <Col md="12">
              <Label>Carnadas</Label>
              {carnadas.map((carnada, index) => (
                <Row key={index} className="mb-2">
                  <Col md="4">
                    <Input
                      type="number"
                      placeholder="ID Carnada"
                      value={carnada.codigo_carnada}
                      onChange={(e) => handleCarnadaChange(index, 'codigo_carnada', e.target.value)}
                    />
                  </Col>
                  <Col md="4">
                    <Input
                      type="number"
                      placeholder="Porcentaje"
                      value={carnada.porcentaje_carnada}
                      onChange={(e) => handleCarnadaChange(index, 'porcentaje_carnada', e.target.value)}
                      step="0.01"
                    />
                  </Col>
                  <Col md="4">
                    <Input
                      type="text"
                      placeholder="ID Tipo Carnada"
                      value={carnada.codigo_tipo_carnada}
                      onChange={(e) => handleCarnadaChange(index, 'codigo_tipo_carnada', e.target.value)}
                    />
                  </Col>
                </Row>
              ))}
            </Col>
          </Row>
        </>
      )}

      {/* Botón para Agregar el Lance */}
      <Button color="primary" onClick={agregarLance} className="mt-3">
        Agregar Lance
      </Button>
    </>
  );
};

export default LanceForm;

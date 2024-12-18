import React, { useState, useEffect } from 'react';
import { Row, Col, FormGroup, Input, Label } from 'reactstrap';
import axios from 'axios';

const ActividadForm = ({ actividad, handleChange }) => {
  const [puertos, setPuertos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [embarcaciones, setEmbarcaciones] = useState([]);

  useEffect(() => {
    // Cargar datos dinámicos desde la API
    const fetchData = async () => {
      try {
        const [puertosData, personasData, embarcacionesData] = await Promise.all([
          axios.get('http://localhost:8000/api/crud/puertos/'),
          axios.get('http://localhost:8000/api/crud/personas/'),
          axios.get('http://localhost:8000/api/crud/embarcaciones/'),
        ]);

        setPuertos(puertosData.data);
        setPersonas(personasData.data);
        setEmbarcaciones(embarcacionesData.data);
      } catch (error) {
        console.error('Error al cargar datos:', error.message);
      }
    };

    fetchData();
  }, []);

  // Filtrar roles para personas
  const capitanes = personas.filter((p) => p.rol.toLowerCase() === 'capitan');
  const armadores = personas.filter((p) => p.rol.toLowerCase() === 'armador');
  const observadores = personas.filter((p) => p.rol.toLowerCase() === 'observador');

  return (
    <div>
      <Row>
        <Col md="4">
          <FormGroup>
            <Label>Código de Actividad</Label>
            <Input
              type="text"
              name="codigo_actividad"
              value={actividad.codigo_actividad || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label>Fecha de Salida</Label>
            <Input
              type="date"
              name="fecha_salida"
              value={actividad.fecha_salida || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label>Fecha de Entrada</Label>
            <Input
              type="date"
              name="fecha_entrada"
              value={actividad.fecha_entrada || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Puerto de Salida</Label>
            <Input
              type="select"
              name="puerto_salida"
              value={actividad.puerto_salida || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {puertos.map((p) => (
                <option key={p.codigo_puerto} value={p.codigo_puerto}>
                  {p.nombre_puerto}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Puerto de Entrada</Label>
            <Input
              type="select"
              name="puerto_entrada"
              value={actividad.puerto_entrada || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {puertos.map((p) => (
                <option key={p.codigo_puerto} value={p.codigo_puerto}>
                  {p.nombre_puerto}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="4">
          <FormGroup>
            <Label>Armador</Label>
            <Input
              type="select"
              name="armador"
              value={actividad.armador || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {armadores.map((p) => (
                <option key={p.codigo_persona} value={p.codigo_persona}>
                  {p.nombre}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label>Capitán</Label>
            <Input
              type="select"
              name="capitan"
              value={actividad.capitan || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {capitanes.map((p) => (
                <option key={p.codigo_persona} value={p.codigo_persona}>
                  {p.nombre}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="4">
          <FormGroup>
            <Label>Observador</Label>
            <Input
              type="select"
              name="observador"
              value={actividad.observador || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {observadores.map((p) => (
                <option key={p.codigo_persona} value={p.codigo_persona}>
                  {p.nombre}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Embarcación</Label>
            <Input
              type="select"
              name="embarcacion"
              value={actividad.embarcacion || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              {embarcaciones.map((e) => (
                <option key={e.codigo_embarcacion} value={e.codigo_embarcacion}>
                  {e.nombre_embarcacion}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
        <Col md="6">
          <FormGroup>
            <Label>Pesca Objetivo</Label>
            <Input
              type="text"
              name="pesca_objetivo"
              value={actividad.pesca_objetivo || ''}
              onChange={handleChange}
            />
          </FormGroup>
        </Col>
      </Row>

      <Row>
        <Col md="6">
          <FormGroup>
            <Label>Tipo de Arte de Pesca</Label>
            <Input
              type="select"
              name="tipo_arte_pesca"
              value={actividad.tipo_arte_pesca || ''}
              onChange={handleChange}
            >
              <option value="">Seleccione</option>
              <option value="cerco">Cerco</option>
              <option value="arrastre">Arrastre</option>
              <option value="palangre">Palangre</option>
            </Input>
          </FormGroup>
        </Col>
      </Row>
    </div>
  );
};

export default ActividadForm;

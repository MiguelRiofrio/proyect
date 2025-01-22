// src/components/FiltroMapa.jsx

import React from 'react';
import { Form, FormGroup, Label, Input, Button, Row, Col } from 'reactstrap';

const FiltroMapa = ({
  filtros,
  setFiltros,
  taxas,
  especies,
  profundidadMin,
  profundidadMax,
  rangoProfundidad,
  aplicarFiltro,
}) => {
  const handleTipoFiltroChange = (e) => {
    const nuevoTipo = e.target.value;
    setFiltros(prev => ({
      ...prev,
      tipoFiltro: nuevoTipo,
      taxaFiltro: '', // Resetear taxaFiltro al cambiar tipoFiltro
      especieFiltro: '', // Resetear especieFiltro al cambiar tipoFiltro
    }));
  };

  const handleTaxaFiltroChange = (e) => {
    const nuevaTaxa = e.target.value;
    setFiltros(prev => ({
      ...prev,
      taxaFiltro: nuevaTaxa,
      especieFiltro: '', // Resetear especieFiltro al cambiar taxaFiltro
    }));
  };

  const handleEspecieFiltroChange = (e) => {
    const nuevaEspecie = e.target.value;
    setFiltros(prev => ({
      ...prev,
      especieFiltro: nuevaEspecie,
    }));
  };

  const handleProfundidadMinChange = (e) => {
    const nuevaProfundidadMin = e.target.value;
    setFiltros(prev => ({
      ...prev,
      profundidadMin: nuevaProfundidadMin,
    }));
  };

  const handleProfundidadMaxChange = (e) => {
    const nuevaProfundidadMax = e.target.value;
    setFiltros(prev => ({
      ...prev,
      profundidadMax: nuevaProfundidadMax,
    }));
  };

  return (
    <Form>
      {/* Filtro de Tipo de Datos */}
      <FormGroup>
        <Label for="tipo">Tipo de Datos</Label>
        <Input
          type="select"
          id="tipo"
          value={filtros.tipoFiltro}
          onChange={handleTipoFiltroChange}
        >
          <option value="todos">Todos</option>
          <option value="capturas">Capturas</option>
          <option value="avistamientos">Avistamientos</option>
          <option value="incidencias">Incidencias</option>
        </Input>
      </FormGroup>

      {/* Filtros de Taxa y Especie en una misma fila */}
      <Row form>
        {/* Filtro de Taxa */}
        <Col md={6}>
          <FormGroup>
            <Label for="taxa">Taxa</Label>
            <Input
              type="select"
              id="taxa"
              value={filtros.taxaFiltro}
              onChange={handleTaxaFiltroChange}
            >
              <option value="">Seleccione un taxa</option>
              {taxas.map((taxa, index) => (
                <option key={index} value={taxa}>
                  {taxa}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>

        {/* Filtro de Especie */}
        <Col md={6}>
          <FormGroup>
            <Label for="especie">Especie</Label>
            <Input
              type="select"
              id="especie"
              value={filtros.especieFiltro}
              onChange={handleEspecieFiltroChange}
              disabled={!filtros.taxaFiltro} // Deshabilitar si no se ha seleccionado una taxa
            >
              <option value="">Seleccione una especie</option>
              {especies.map((especie, index) => (
                <option key={index} value={especie}>
                  {especie}
                </option>
              ))}
            </Input>
          </FormGroup>
        </Col>
      </Row>

      {/* Filtros de Profundidad en una misma fila */}
      <Row form>
        {/* Filtro de Profundidad Mínima */}
        <Col md={6}>
          <FormGroup>
            
            <Label for="profundidadMin">Profundidad Mínima</Label>
            <Input
              type="number"
              id="profundidadMin"
              value={profundidadMin}
              onChange={handleProfundidadMinChange}
              placeholder={`Mínimo (${rangoProfundidad.min})`}
              min={rangoProfundidad.min}
              max={rangoProfundidad.max}
            />
          </FormGroup>
        </Col>

        {/* Filtro de Profundidad Máxima */}
        <Col md={6}>
          <FormGroup>
            <Label for="profundidadMax">Profundidad Máxima</Label>
            <Input
              type="number"
              id="profundidadMax"
              value={profundidadMax}
              onChange={handleProfundidadMaxChange}
              placeholder={`Máximo (${rangoProfundidad.max})`}
              min={rangoProfundidad.min}
              max={rangoProfundidad.max}
            />
          </FormGroup>
          
        </Col>
        <small className="form-text text-muted">
              Rango permitido: {rangoProfundidad.min} - {rangoProfundidad.max} metros
            </small>
      </Row>

      {/* Botón para Aplicar Filtros */}
      <Button color="primary" block onClick={aplicarFiltro}>
        Aplicar Filtro
      </Button>
    </Form>
  );
};

export default FiltroMapa;

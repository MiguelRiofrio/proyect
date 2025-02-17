// src/components/FiltroMapa.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Row,
  Col,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
  FormFeedback,
  Alert,
} from 'reactstrap';
import './css/FiltroMapa.css'; // Archivo CSS para estilos

const DEFAULT_RANGO = { min: 0, max: 100 };

const FiltroMapa = ({
  filtros,
  setFiltros,
  taxas,
  especies,
  puertos,
  embarcaciones,
  rangoProfundidad, // Se espera: { min: 0, max: 30 }
  años,
}) => {
  const finalRango = rangoProfundidad || DEFAULT_RANGO;
  const [openAccordion, setOpenAccordion] = useState('1');
  const [localFilters, setLocalFilters] = useState({ ...filtros });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Sincroniza los valores de profundidad con el rango final
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      profundidadMin: String(finalRango.min),
      profundidadMax: String(finalRango.max),
    }));
  }, [finalRango]);

  const toggleAccordion = id => {
    setOpenAccordion(openAccordion === id ? '' : id);
  };

  // Reinicia campos dependientes de acuerdo al campo modificado
  const resetDependentFields = field => {
    const mapping = {
      tipoFiltro: { taxaFiltro: '', especieFiltro: '' },
      taxaFiltro: { especieFiltro: '' },
      puerto: { embarcacion: '' },
    };
    return mapping[field] || {};
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'profundidadMin' || name === 'profundidadMax') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (name === 'profundidadMin' && numValue < finalRango.min) {
          newValue = String(finalRango.min);
        }
        if (name === 'profundidadMax' && numValue > finalRango.max) {
          newValue = String(finalRango.max);
        }
      }
    }
    setLocalFilters(prev => ({
      ...prev,
      [name]: newValue,
      ...resetDependentFields(name),
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSubmitError('');
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    if (name === 'profundidadMin' && numValue < finalRango.min) {
      setLocalFilters(prev => ({ ...prev, [name]: String(finalRango.min) }));
    }
    if (name === 'profundidadMax' && numValue > finalRango.max) {
      setLocalFilters(prev => ({ ...prev, [name]: String(finalRango.max) }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const minVal = parseFloat(localFilters.profundidadMin);
    const maxVal = parseFloat(localFilters.profundidadMax);

    if (localFilters.profundidadMin && isNaN(minVal)) {
      newErrors.profundidadMin = 'Debe ser un número válido.';
    }
    if (localFilters.profundidadMax && isNaN(maxVal)) {
      newErrors.profundidadMax = 'Debe ser un número válido.';
    }
    if (!isNaN(minVal) && !isNaN(maxVal)) {
      if (minVal > maxVal) {
        newErrors.profundidadMin = 'La profundidad mínima no puede ser mayor que la máxima.';
        newErrors.profundidadMax = 'La profundidad máxima no puede ser menor que la mínima.';
      }
      if (minVal < finalRango.min || maxVal > finalRango.max) {
        if (minVal < finalRango.min) {
          newErrors.profundidadMin = `La profundidad mínima debe ser al menos ${finalRango.min} m.`;
        }
        if (maxVal > finalRango.max) {
          newErrors.profundidadMax = `La profundidad máxima no puede exceder ${finalRango.max} m.`;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const aplicarFiltros = () => {
    if (validate()) {
      setFiltros(localFilters);
      setSubmitError('');
    } else {
      setSubmitError('Por favor, corrige los errores antes de aplicar el filtro.');
    }
  };

  // Actualiza el estado local si cambian los filtros globales
  useEffect(() => {
    setLocalFilters({ ...filtros });
    setErrors({});
    setSubmitError('');
  }, [filtros]);

  const filteredEspecies = useMemo(() => especies || [], [especies]);

  return (
    <div className="filtro-mapa-container">
      <Form>
        <Accordion open={openAccordion} toggle={toggleAccordion}>
          {/* Sección 1: Tipo de Interacción y Año */}
          <AccordionItem>
            <AccordionHeader targetId="1">Tipo de Interacción y Año</AccordionHeader>
            <AccordionBody accordionId="1">
              <FormGroup>
                <Label for="tipoFiltro">Tipo de Interacción</Label>
                <Input
                  type="select"
                  id="tipoFiltro"
                  name="tipoFiltro"
                  value={localFilters.tipoFiltro}
                  onChange={handleInputChange}
                >
                  <option value="capturas">Capturas</option>
                  <option value="avistamientos">Avistamientos</option>
                  <option value="incidencias">Incidencias</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="year">Año</Label>
                <Input
                  type="select"
                  id="year"
                  name="year"
                  value={localFilters.year}
                  onChange={handleInputChange}
                >
                  {años.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </AccordionBody>
          </AccordionItem>

          {/* Sección 2: Puerto y Embarcación */}
          <AccordionItem>
            <AccordionHeader targetId="2">Puerto y Embarcación</AccordionHeader>
            <AccordionBody accordionId="2">
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="puerto">Puerto</Label>
                    <Input
                      type="select"
                      id="puerto"
                      name="puerto"
                      value={localFilters.puerto}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleccione un puerto</option>
                      {puertos.map((puerto, index) => (
                        <option key={index} value={puerto}>
                          {puerto}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="embarcacion">Embarcación</Label>
                    <Input
                      type="select"
                      id="embarcacion"
                      name="embarcacion"
                      value={localFilters.embarcacion}
                      onChange={handleInputChange}
                      disabled={!localFilters.puerto}
                    >
                      <option value="">Seleccione una embarcación</option>
                      {embarcaciones.map((embarcacion, index) => (
                        <option key={index} value={embarcacion.nombre_embarcacion}>
                          {embarcacion.nombre_embarcacion}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </AccordionBody>
          </AccordionItem>

          {/* Sección 3: Taxa y Especie */}
          <AccordionItem>
            <AccordionHeader targetId="3">Taxa y Especie</AccordionHeader>
            <AccordionBody accordionId="3">
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="taxaFiltro">Taxa</Label>
                    <Input
                      type="select"
                      id="taxaFiltro"
                      name="taxaFiltro"
                      value={localFilters.taxaFiltro}
                      onChange={handleInputChange}
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
                <Col md={6}>
                  <FormGroup>
                    <Label for="especieFiltro">Especie</Label>
                    <Input
                      type="select"
                      id="especieFiltro"
                      name="especieFiltro"
                      value={localFilters.especieFiltro}
                      onChange={handleInputChange}
                      disabled={!localFilters.taxaFiltro}
                    >
                      <option value="">Seleccione una especie</option>
                      {filteredEspecies.map((item, index) => (
                        <option key={index} value={item.nombre_comun || item}>
                          {item.nombre_comun || item}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </AccordionBody>
          </AccordionItem>

          {/* Sección 4: Rango de Profundidad */}
          <AccordionItem>
            <AccordionHeader targetId="4">Rango de Profundidad</AccordionHeader>
            <AccordionBody accordionId="4">
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="profundidadMin">Profundidad Mínima (m)</Label>
                    <Input
                      type="number"
                      id="profundidadMin"
                      name="profundidadMin"
                      value={localFilters.profundidadMin}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder={`Mínimo (${finalRango.min}m)`}
                      invalid={!!errors.profundidadMin}
                      min={finalRango.min}
                      max={localFilters.profundidadMax || finalRango.max}
                    />
                    {errors.profundidadMin && <FormFeedback>{errors.profundidadMin}</FormFeedback>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="profundidadMax">Profundidad Máxima (m)</Label>
                    <Input
                      type="number"
                      id="profundidadMax"
                      name="profundidadMax"
                      value={localFilters.profundidadMax}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder={`Máximo (${finalRango.max}m)`}
                      invalid={!!errors.profundidadMax}
                      min={localFilters.profundidadMin || finalRango.min}
                      max={finalRango.max}
                    />
                    {errors.profundidadMax && <FormFeedback>{errors.profundidadMax}</FormFeedback>}
                  </FormGroup>
                </Col>
              </Row>
            </AccordionBody>
          </AccordionItem>
        </Accordion>

        {submitError && <Alert color="danger" className="mt-3">{submitError}</Alert>}

        <Button color="primary" block className="mt-3" onClick={aplicarFiltros}>
          Aplicar Filtro
        </Button>
      </Form>
    </div>
  );
};

export default FiltroMapa;

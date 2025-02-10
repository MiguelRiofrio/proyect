// src/components/FiltroMapa.jsx

import React, { useState, useEffect } from 'react';
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

const FiltroMapa = ({
  filtros,
  setFiltros,
  taxas,
  especies,
  puertos,
  embarcaciones,
  rangoProfundidad,
  años,
}) => {
  // Estado local para controlar qué sección del acordeón está abierta
  const [openAccordion, setOpenAccordion] = useState('1');

  // Estado local para almacenar los cambios de los filtros antes de aplicar
  const [localFilters, setLocalFilters] = useState({ ...filtros });

  // Estado para manejar errores de validación
  const [errors, setErrors] = useState({});

  // Estado para mostrar mensajes de error al aplicar filtro
  const [submitError, setSubmitError] = useState('');

  // Función para alternar la sección abierta del acordeón
  const toggleAccordion = (id) => {
    if (openAccordion === id) {
      setOpenAccordion('');
    } else {
      setOpenAccordion(id);
    }
  };

  // Función para resetear campos dependientes
  const resetDependentFields = (field) => {
    switch (field) {
      case 'tipoFiltro':
        return { taxaFiltro: '', especieFiltro: '' };
      case 'taxaFiltro':
        return { especieFiltro: '' };
      case 'puerto':
        return { embarcacion: '' };
      default:
        return {};
    }
  };

  // Manejadores de eventos (guardan cambios en localFilters)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
      ...resetDependentFields(name),
    }));
    // Limpiar errores al modificar un campo
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
    setSubmitError('');
  };

  // Validación de los datos del formulario
  const validate = () => {
    const newErrors = {};

    const minVal = parseFloat(localFilters.profundidadMin);
    const maxVal = parseFloat(localFilters.profundidadMax);

    // Validar profundidades si se ingresan
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

      if (minVal < rangoProfundidad.min || maxVal > rangoProfundidad.max) {
        if (minVal < rangoProfundidad.min) {
          newErrors.profundidadMin = `La profundidad mínima debe ser al menos ${rangoProfundidad.min} metros.`;
        }
        if (maxVal > rangoProfundidad.max) {
          newErrors.profundidadMax = `La profundidad máxima no puede exceder ${rangoProfundidad.max} metros.`;
        }
      }
    }

    setErrors(newErrors);

    // Retornar verdadero si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  // Lógica de validación al dar clic en "Aplicar Filtro"
  const validarYAplicar = () => {
    if (validate()) {
      // Si la validación pasa, actualizamos los filtros en el padre
      setFiltros(localFilters);
      setSubmitError('');
    } else {
      setSubmitError('Por favor, corrige los errores antes de aplicar el filtro.');
    }
  };

  // Limpiar errores al cambiar filtros externos
  useEffect(() => {
    setLocalFilters({ ...filtros });
    setErrors({});
    setSubmitError('');
  }, [filtros]);

  return (
    <Form>
      <Accordion open={openAccordion} toggle={toggleAccordion}>
        {/* Sección 1: Tipo de Datos y Año */}
        <AccordionItem>
          <AccordionHeader targetId="1">Tipo de Interracion y Año</AccordionHeader>
          <AccordionBody accordionId="1">
            <FormGroup>
              <Label for="tipo">Tipo de Interracion </Label>
              <Input
                type="select"
                id="tipo"
                name="tipoFiltro"
                value={localFilters.tipoFiltro}
                onChange={handleInputChange}
              >
                <option value="todos">Todos</option>
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
                <option value="">Seleccione un año</option>
                {años.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </AccordionBody>
        </AccordionItem>

        {/* Sección 2: Taxa y Especie */}
        <AccordionItem>
          <AccordionHeader targetId="2">Taxa y Especie</AccordionHeader>
          <AccordionBody accordionId="2">
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="taxa">Taxa</Label>
                  <Input
                    type="select"
                    id="taxa"
                    name="taxaFiltro"
                    value={localFilters.taxaFiltro}
                    onChange={handleInputChange}
                    disabled={localFilters.tipoFiltro === 'todos' || !localFilters.tipoFiltro}
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
                  <Label for="especie">Especie</Label>
                  <Input
                    type="select"
                    id="especie"
                    name="especieFiltro"
                    value={localFilters.especieFiltro}
                    onChange={handleInputChange}
                    disabled={!localFilters.taxaFiltro}
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
          </AccordionBody>
        </AccordionItem>

        {/* Sección 3: Puerto y Embarcación */}
        <AccordionItem>
          <AccordionHeader targetId="3">Puerto y Embarcación</AccordionHeader>
          <AccordionBody accordionId="3">
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
                    placeholder={`Mínimo (${rangoProfundidad.min_profundidad}m)`}
                    invalid={!!errors.profundidadMin}
                    min={rangoProfundidad.min_profundidad} // Establecer límite mínimo
                    max={localFilters.profundidadMax || rangoProfundidad.max_profundidad } // Establecer un límite máximo más alto
   
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
                    placeholder={`Máximo (${rangoProfundidad.max_profundidad}m)`}
                    invalid={!!errors.profundidadMax}
                    min={localFilters.profundidadMin || rangoProfundidad.min_profundidad} // Evitar ser menor que profundidad mínima
                    max={rangoProfundidad.max_profundidad } // Establecer un límite máximo más alto
  
                  />
                  {errors.profundidadMax && <FormFeedback>{errors.profundidadMax}</FormFeedback>}
                </FormGroup>
              </Col>
            </Row>
          </AccordionBody>
        </AccordionItem>
      </Accordion>

      {/* Mostrar mensaje de error al aplicar filtro */}
      {submitError && <Alert color="danger" className="mt-3">{submitError}</Alert>}

      {/* Botón para Aplicar los Filtros */}
      <Button
        color="primary"
        block
        className="mt-3"
        onClick={validarYAplicar}
      >
        Aplicar Filtro
      </Button>
    </Form>
  );
};

export default FiltroMapa;

import React, { useState } from 'react';
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
  AccordionBody
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
  aplicarFiltro,
}) => {
  // Estado local para controlar qué sección del acordeón está abierta
  const [openAccordion, setOpenAccordion] = useState('1');

  // Estado local para almacenar los cambios de los filtros antes de aplicar
  const [localFilters, setLocalFilters] = useState({ ...filtros });

  // Función para alternar la sección abierta del acordeón
  const toggleAccordion = (id) => {
    if (openAccordion === id) {
      setOpenAccordion('');
    } else {
      setOpenAccordion(id);
    }
  };

  // Manejadores de eventos (guardan cambios en localFilters)
  const handleTipoFiltroChange = (e) => {
    setLocalFilters((prev) => ({
      ...prev,
      tipoFiltro: e.target.value,
      taxaFiltro: '',
      especieFiltro: '',
      puerto: '',
      embarcacion: '',
      year: '',
    }));
  };

  const handleTaxaFiltroChange = (e) => {
    setLocalFilters((prev) => ({
      ...prev,
      taxaFiltro: e.target.value,
      especieFiltro: '',
    }));
  };

  const handleEspecieFiltroChange = (e) => {
    setLocalFilters((prev) => ({
      ...prev,
      especieFiltro: e.target.value,
    }));
  };

  const handlePuertoChange = (e) => {
    setLocalFilters((prev) => ({
      ...prev,
      puerto: e.target.value,
      embarcacion: '',
    }));
  };

  const handleEmbarcacionChange = (e) => {
    setLocalFilters((prev) => ({
      ...prev,
      embarcacion: e.target.value,
    }));
  };

  // Ahora permitimos que el usuario escriba cualquier valor de profundidad,
  // y validamos solo al aplicar el filtro.
  const handleProfundidadMinChange = (e) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({
      ...prev,
      profundidadMin: value,
    }));
  };

  const handleProfundidadMaxChange = (e) => {
    const value = e.target.value;
    setLocalFilters((prev) => ({
      ...prev,
      profundidadMax: value,
    }));
  };

  const handleYearChange = (e) => {
    setLocalFilters((prev) => ({
      ...prev,
      year: e.target.value,
    }));
  };

  // Lógica de validación al dar clic en "Aplicar Filtro"
  const validarYAplicar = () => {
    const minVal = parseFloat(localFilters.profundidadMin);
    const maxVal = parseFloat(localFilters.profundidadMax);

    // Si no se han ingresado ambos valores, se permite aplicar el filtro (o maneja según tu preferencia)
    if (isNaN(minVal) || isNaN(maxVal)) {
      console.log('Filtros aplicados sin profundidades definidas:', localFilters);
      // Actualizamos los filtros en el padre
      setFiltros(localFilters);
      aplicarFiltro();
      return;
    }

    // Validar que minVal <= maxVal
    if (minVal > maxVal) {
      alert("La profundidad mínima no puede ser mayor que la máxima.");
      return;
    }

    // Validar que estén dentro del rango permitido por "rangoProfundidad"
    if (minVal < rangoProfundidad.min || maxVal > rangoProfundidad.max) {
      alert(`Las profundidades deben estar entre ${rangoProfundidad.min} y ${rangoProfundidad.max}.`);
      return;
    }

    // Si todas las validaciones pasan, actualizamos el estado global y aplicamos el filtro
    console.log('Filtros aplicados:', localFilters);
    setFiltros(localFilters);
    aplicarFiltro();
  };

  return (
    <Form>
      <Accordion open={openAccordion} toggle={toggleAccordion}>
        {/* Sección 1: Tipo de Datos y Año */}
        <AccordionItem>
          <AccordionHeader targetId="1">
            Tipo de Datos y Año
          </AccordionHeader>
          <AccordionBody accordionId="1">
            <FormGroup>
              <Label for="tipo">Tipo de Datos</Label>
              <Input
                type="select"
                id="tipo"
                value={localFilters.tipoFiltro}
                onChange={handleTipoFiltroChange}
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
                value={localFilters.year}
                onChange={handleYearChange}
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

        {/* Sección 2: Taxa y Especie */}
        <AccordionItem>
          <AccordionHeader targetId="2">
            Taxa y Especie
          </AccordionHeader>
          <AccordionBody accordionId="2">
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="taxa">Taxa</Label>
                  <Input
                    type="select"
                    id="taxa"
                    value={localFilters.taxaFiltro}
                    onChange={handleTaxaFiltroChange}
                    disabled={!localFilters.tipoFiltro}
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
                    value={localFilters.especieFiltro}
                    onChange={handleEspecieFiltroChange}
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
          <AccordionHeader targetId="3">
            Puerto y Embarcación
          </AccordionHeader>
          <AccordionBody accordionId="3">
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="puerto">Puerto</Label>
                  <Input
                    type="select"
                    id="puerto"
                    value={localFilters.puerto}
                    onChange={handlePuertoChange}
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
                    value={localFilters.embarcacion}
                    onChange={handleEmbarcacionChange}
                    disabled={!localFilters.puerto}
                  >
                    <option value="">Seleccione una embarcación</option>
                    {embarcaciones.map((embarcacion, index) => (
                      <option
                        key={index}
                        value={embarcacion.nombre_embarcacion}
                      >
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
          <AccordionHeader targetId="4">
            Rango de Profundidad
          </AccordionHeader>
          <AccordionBody accordionId="4">
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label for="profundidadMin">Profundidad Mínima</Label>
                  <Input
                    type="number"
                    id="profundidadMin"
                    value={localFilters.profundidadMin}
                    onChange={handleProfundidadMinChange}
                    placeholder={`Mínimo (${rangoProfundidad.min})`}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label for="profundidadMax">Profundidad Máxima</Label>
                  <Input
                    type="number"
                    id="profundidadMax"
                    value={localFilters.profundidadMax}
                    onChange={handleProfundidadMaxChange}
                    placeholder={`Máximo (${rangoProfundidad.max})`}
                  />
                </FormGroup>
              </Col>
            </Row>
          </AccordionBody>
        </AccordionItem>
      </Accordion>

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

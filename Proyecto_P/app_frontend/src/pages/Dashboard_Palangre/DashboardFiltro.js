import React from 'react';
import { Card, CardBody, Input, Row, Col } from 'reactstrap';

const DashboardFiltro = ({
  embarcacion,
  setEmbarcacion,
  embarcacionesList,
  puerto,
  setPuerto,
  puertosList,
  year,
  setYear,
  yearsList
}) => {
  return (
    <div
      className="sticky-top bg-white shadow-sm p-3"
      style={{ zIndex: 1000 }}
    >
      <Row>
        {/* Filtro de Puerto */}
        <Col md="4" sm="12" className="mb-3">
          <Card>
            <CardBody>
              <h5>Filtrar por Puerto</h5>
              <Input
                type="select"
                value={puerto}
                onChange={(e) => setPuerto(e.target.value)}
              >
                <option value="">Todos los Puertos</option>
                {puertosList.map((pu) => (
                  <option key={pu.nombre_puerto} value={pu.nombre_puerto}>
                    {pu.nombre_puerto} 
                  </option>
                ))}
              </Input>
            </CardBody>
          </Card>
        </Col>

        {/* Filtro de Año */}
        <Col md="4" sm="12" className="mb-3">
          <Card>
            <CardBody>
              <h5>Filtrar por Año</h5>
              <Input
                type="select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Todos los Años</option>
                {yearsList.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </Input>
            </CardBody>
          </Card>
        </Col>

        {/* Filtro de Embarcación */}
        <Col md="4" sm="12" className="mb-3">
          <Card>
            <CardBody>
              <h5>Filtrar por Embarcación</h5>
              <Input
                type="select"
                value={embarcacion}
                onChange={(e) => setEmbarcacion(e.target.value)}
                disabled={!puerto && !year} // Opcional: Deshabilitar si no se ha seleccionado puerto o año
              >
                <option value="">Todas las Embarcaciones</option>
                {embarcacionesList.map((emb) => (
                  <option key={emb.matricula} value={emb.nombre_embarcacion}>
                    {emb.nombre_embarcacion}
                  </option>
                ))}
              </Input>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardFiltro;

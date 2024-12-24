import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import GenerarReporte from './GenerarReporte';
import ReporteVistaPrevia from './ReporteVistaPrevia'; // Importa el componente de vista previa

const Reporte = () => {
  return (
    <Container className="mt-5">
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Home</h1>
      <Row>
        <Col md="12">
          <ReporteVistaPrevia /> {/* Agrega el componente de vista previa */}
        </Col>
      </Row>
      <Row>
        <Col md="12" className="mb-4">
          <GenerarReporte />
        </Col>
      </Row>
      
    </Container>
  );
};

export default Reporte;

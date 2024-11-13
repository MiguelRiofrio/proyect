import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'reactstrap';
import CapturasPorEspecie from './charts_dashboard/CapturasPorEspecie';
import PesoCapturas from './charts_dashboard/PesoCapturas';
import AvistamientosPorGrupo from './charts_dashboard/AvistamientosPorGrupo';

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    
    fetch('http://localhost:8000/api/dashboard-data/')
      .then((response) => response.json())
      .then((data) => {
        console.log("Datos del backend:", data);
        setData(data);
      })
      
      .catch((error) => console.error('Error fetching data:', error));
      
  }, []);

  if (!data) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <Spinner color="primary" />
        <p>Cargando datos del dashboard...</p>
      </div>
    );
  }

  return (
    <Container className="mt-5">
    <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Dashboard de Pesca</h1>

    {/* Primera Fila: Capturas por Especie */}
    <Row className="mb-4">
      <Col md="12">
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <CapturasPorEspecie datos={data.capturas_por_especie} />
        </div>
      </Col>
    </Row>

    {/* Segunda Fila: Peso Capturado y Avistamientos por Grupo */}
    <Row>
      <Col md="6" className="mb-4">
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <PesoCapturas datos={data.peso_capturas} />
        </div>
      </Col>
      <Col md="6">
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <AvistamientosPorGrupo datos={data.avistamientos_por_grupo} />
        </div>
      </Col>
    </Row>
  </Container>
  );
};

export default Dashboard;

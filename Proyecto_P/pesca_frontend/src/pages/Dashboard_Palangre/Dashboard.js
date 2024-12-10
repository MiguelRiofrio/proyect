import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto'; // Habilita gráficos dinámicos
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center mt-5">No hay datos disponibles</div>;
  }

  // Configuración de gráficos
  const capturasPorEspecie = {
    labels: dashboardData.capturas_por_especie.map((item) => item.nombre_cientifico),
    datasets: [
      {
        label: 'Capturas',
        data: dashboardData.capturas_por_especie.map((item) => item.total_captura),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const incidenciasPorTipo = {
    labels: ['Heridas Graves', 'Heridas Leves', 'Muertos'],
    datasets: [
      {
        data: [
          dashboardData.incidencias_por_tipo.herida_grave,
          dashboardData.incidencias_por_tipo.herida_leve,
          dashboardData.incidencias_por_tipo.muerto,
        ],
        backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
      },
    ],
  };

  const lancesPorMes = {
    labels: dashboardData.lances_por_mes.map((item) => item.mes),
    datasets: [
      {
        label: 'Lances',
        data: dashboardData.lances_por_mes.map((item) => item.total_lances),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dashboard Pesquero</h1>

      {/* Tarjetas resumen */}
      <Row className="mb-4">
        <Col md="4">
          <Card className="shadow">
            <CardBody>
              <h5>Total Capturas Retenidas</h5>
              <h3>{dashboardData.peso_capturas.total_retenido.toFixed(2)} kg</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="shadow">
            <CardBody>
              <h5>Total Capturas Descartadas</h5>
              <h3>{dashboardData.peso_capturas.total_descarte.toFixed(2)} kg</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="shadow">
            <CardBody>
              <h5>Total Avistamientos</h5>
              <h3>{dashboardData.avistamientos_por_grupo.length}</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row>
        <Col md="6">
          <Card className="shadow">
            <CardHeader className="bg-primary text-white">Capturas por Especie</CardHeader>
            <CardBody>
              <Bar data={capturasPorEspecie} />
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card className="shadow">
            <CardHeader className="bg-danger text-white">Incidencias por Tipo</CardHeader>
            <CardBody>
              <Doughnut data={incidenciasPorTipo} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md="12">
          <Card className="shadow">
            <CardHeader className="bg-success text-white">Lances por Mes</CardHeader>
            <CardBody>
              <Bar data={lancesPorMes} />
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tabla de avistamientos */}
      <Row className="mt-4">
        <Col md="12">
          <Card className="shadow">
            <CardHeader className="bg-secondary text-white">Avistamientos por Grupo</CardHeader>
            <CardBody>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.avistamientos_por_grupo.map((grupo, index) => (
                    <tr key={index}>
                      <td>{grupo.grupos_avi_int}</td>
                      <td>{grupo.total}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

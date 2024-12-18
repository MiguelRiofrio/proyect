import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Col, Card, CardBody, CardHeader, Table, Input } from 'reactstrap';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [embarcacion, setEmbarcacion] = useState('');
  const [embaracionesList, setEmbarcacionesList] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchEmbarcaciones();
  }, [embarcacion]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/dashboard/?embarcacion=${embarcacion}`);
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      setLoading(false);
    }
  };

  const fetchEmbarcaciones = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/crud/embarcaciones/');
      setEmbarcacionesList(response.data);
    } catch (error) {
      console.error('Error al obtener embarcaciones:', error);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center mt-5">No hay datos disponibles</div>;
  }

  // Configuración de gráficos
  const capturasPorMes = {
    labels: dashboardData.capturas_por_mes.map((item) => `Mes ${item.lance__calado_fecha__month}`),
    datasets: [
      {
        label: 'Capturas Retenidas',
        data: dashboardData.capturas_por_mes.map((item) => item.total_retenido),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dashboard Avanzado Pesquero</h1>

      {/* Filtro de embarcación */}
      <Row className="mb-4">
        <Col md="12">
          <Card className="shadow">
            <CardBody>
              <h5>Filtrar por Embarcación</h5>
              <Input
                type="select"
                value={embarcacion}
                onChange={(e) => setEmbarcacion(e.target.value)}
              >
                <option value="">Todas las Embarcaciones</option>
                {embaracionesList.map((embarcacion) => (
                  <option key={embarcacion.codigo_embarcacion} value={embarcacion.nombre_embarcacion}>
                    {embarcacion.nombre_embarcacion}
                  </option>
                ))}
              </Input>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tarjetas resumen */}
      <Row className="mb-4">
        <Col md="4">
          <Card className="shadow">
            <CardBody>
              <h5>Total Actividades Pesqueras</h5>
              <h3>{dashboardData.total_actividades}</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="shadow">
            <CardBody>
              <h5>Total Capturas Retenidas</h5>
              <h3>{dashboardData.total_retenido.toFixed(2)} kg</h3>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="shadow">
            <CardBody>
              <h5>Promedio Capturas Retenidas por Lance</h5>
              <h3>{dashboardData.promedio_retenido.toFixed(2)} kg</h3>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row>
        <Col md="6">
          <Card className="shadow">
            <CardHeader className="bg-primary text-white">Capturas Retenidas por Mes</CardHeader>
            <CardBody>
              <Bar data={capturasPorMes} />
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card className="shadow">
            <CardHeader className="bg-success text-white">Tendencia (Regresión Lineal)</CardHeader>
            <CardBody>
              <h5>{dashboardData.tendencia_retenido !== null 
                ? `Pendiente: ${dashboardData.tendencia_retenido.toFixed(2)}`
                : 'Datos insuficientes para regresión.'}</h5>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

// DashboardContenido.jsx
import React from 'react';
import { Row, Col, Card, CardBody, CardHeader } from 'reactstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ContenidoDashboard = ({ dashboardData }) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const capturasPorMes = {
    labels: dashboardData.capturas_por_mes.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'Capturas Retenidas',
        data: dashboardData.capturas_por_mes.map((item) => item.total_retenido),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const artesPesca = {
    labels: dashboardData.artes_pesca.map((item) => item.tipo_arte || 'Desconocido'),
    datasets: [
      {
        label: 'Uso de Artes de Pesca',
        data: dashboardData.artes_pesca.map((item) => item.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
      },
    ],
  };

  const capturasPorAno = {
    labels: dashboardData.capturas_por_ano.map((item) => item.year),
    datasets: [
      {
        label: 'Capturas Retenidas',
        data: dashboardData.capturas_por_ano.map((item) => item.retenido),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Capturas Descartadas',
        data: dashboardData.capturas_por_ano.map((item) => item.descartado),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const avistamientos = {
    labels: dashboardData.avistamientos.map((item) => item.especie),
    datasets: [
      {
        label: 'Avistamientos',
        data: dashboardData.avistamientos.map((item) => item.total_avistamientos),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const regresionLineal = {
    labels: dashboardData.capturas_por_mes.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'Proyección Lineal',
        data: dashboardData.regresion_lineal,
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const carnadas = {
    labels: dashboardData.carnadas.map((item) => item.nombre_carnada),
    datasets: [
      {
        label: 'Porcentaje de Uso de Carnadas',
        data: dashboardData.carnadas.map((item) => item.total_porcentaje),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
      },
    ],
  };

  const incidencias = {
    labels: ['Heridas Graves', 'Heridas Leves', 'Muertos'],
    datasets: [
      {
        label: 'Incidencias',
        data: [
          dashboardData.incidencias.total_graves,
          dashboardData.incidencias.total_leves,
          dashboardData.incidencias.total_muertos,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
      },
    ],
  };

  return (
    <div>
      <Row className="mb-4">
        <Col md="6">
          <Card className="shadow" style={{ height: '400px' }}>
            <CardHeader className="bg-primary text-white">Capturas Retenidas por Mes</CardHeader>
            <CardBody>
              <Bar data={capturasPorMes} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card className="shadow" style={{ height: '400px' }}>
            <CardHeader className="bg-secondary text-white">Uso de Artes de Pesca</CardHeader>
            <CardBody>
              <Pie data={artesPesca} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md="6">
          <Card className="shadow" style={{ height: '400px' }}>
            <CardHeader className="bg-success text-white">Capturas por Año</CardHeader>
            <CardBody>
              <Bar data={capturasPorAno} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card className="shadow" style={{ height: '400px' }}>
            <CardHeader className="bg-warning text-white">Proyección Lineal de Capturas</CardHeader>
            <CardBody>
              <Line data={regresionLineal} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md="6">
          <Card className="shadow" style={{ height: '400px' }}>
            <CardHeader className="bg-info text-white">Avistamientos por Especie</CardHeader>
            <CardBody>
              <Bar data={avistamientos} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardBody>
          </Card>
        </Col>
        <Col md="6">
          <Card className="shadow" style={{ height: '400px' }}>
            <CardHeader className="bg-danger text-white">Distribución de Carnadas</CardHeader>
            <CardBody>
              <Pie data={carnadas} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md="12">
          <Card className="shadow" style={{ height: '400px' }}>
            <CardHeader className="bg-dark text-white">Incidencias</CardHeader>
            <CardBody>
              <Bar data={incidencias} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContenidoDashboard;

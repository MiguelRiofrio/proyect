// ContenidoDashboard.jsx
import React from 'react';
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './ContenidoDashboard.css'; // Asegúrate de tener este archivo

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Componente para manejar gráficos o mostrar un mensaje alternativo
const ChartWithFallback = ({ data, options, renderChart }) => {
  const hasData =
    data &&
    data.datasets &&
    data.datasets.some(dataset =>
      dataset.data.some(value => value !== null && value !== undefined)
    );

  return hasData ? (
    <div className="chart-container">
      {renderChart()}
    </div>
  ) : (
    <div className="text-center py-5">No hay información disponible.</div>
  );
};

const ContenidoDashboard = ({ dashboardData }) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  // Función para formatear números con comas
  const formatNumber = (num) => {
    if (num === null || num === undefined) {
      return 'N/A';
    }
    return num.toLocaleString('es-ES');
  };

  // Función para renderizar una tabla con opción de scroll
  const renderTable = (headers, data, formatters = {}, scrollable = false) => (
    data.length > 0 ? (
      <div className={scrollable ? 'scrollable-table' : ''}>
        <Table bordered hover responsive className="mt-3 table-striped">
          <thead className="thead-dark">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx}>
                    {formatters[cellIdx] ? formatters[cellIdx](cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    ) : (
      <div className="text-center py-3">No hay información disponible.</div>
    )
  );

  // 1. Capturas Retenidas por Mes
  const capturasPorMes = {
    labels: dashboardData.capturas_por_mes.map(item => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'Capturas Retenidas',
        data: dashboardData.capturas_por_mes.map(item => item.total_retenido),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const capturasPorMesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 14 } },
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#000',
        font: { weight: 'bold', size: 12 },
        formatter: (value) => formatNumber(value),
      },
      tooltip: {
        enabled: true,
        callbacks: { label: (context) => `${formatNumber(context.parsed.y)}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          callback: (value) => formatNumber(value),
        },
      },
      x: { ticks: { font: { size: 12 } } },
    },
  };

  // 2. Uso de Artes de Pesca
  const artesPesca = {
    labels: dashboardData.artes_pesca.map(item => item.tipo_arte || 'Desconocido'),
    datasets: [
      {
        label: 'Uso de Artes de Pesca',
        data: dashboardData.artes_pesca.map(item => item.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
      },
    ],
  };

  const artesPescaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 14 } },
      },
      datalabels: {
        color: '#000',
        formatter: (value) => `${value}`,
        font: { weight: 'bold', size: 12 },
      },
      tooltip: {
        enabled: true,
        callbacks: { label: (context) => `${context.label}: ${context.parsed}` },
      },
    },
  };

  // 3. Capturas por Año
  const capturasPorAno = {
    labels: dashboardData.capturas_por_ano.map(item => item.year),
    datasets: [
      {
        label: 'Capturas Retenidas',
        data: dashboardData.capturas_por_ano.map(item => item.retenido),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Capturas Descartadas',
        data: dashboardData.capturas_por_ano.map(item => item.descartado),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const capturasPorAnoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 14 } },
      },
      datalabels: {
        color: '#000',
        formatter: (value) => formatNumber(value),
        font: { weight: 'bold', size: 12 },
      },
      tooltip: {
        enabled: true,
        callbacks: { label: (context) => `${formatNumber(context.parsed.y)}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          callback: (value) => formatNumber(value),
        },
      },
      x: { ticks: { font: { size: 12 } } },
    },
  };

  // 4. Proyección Lineal de Capturas
  const regresionLineal = {
    labels: dashboardData.capturas_por_mes.map(item => monthNames[item.month - 1]),
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

  const regresionLinealOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 14 } },
      },
      datalabels: { display: false },
      tooltip: {
        enabled: true,
        callbacks: { label: (context) => `${formatNumber(context.parsed.y)}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          callback: (value) => formatNumber(value),
        },
      },
      x: { ticks: { font: { size: 12 } } },
    },
  };

  // 5. Avistamientos por Especie
  const avistamientos = {
    labels: dashboardData.avistamientos.map(item => item.especie),
    datasets: [
      {
        label: 'Avistamientos',
        data: dashboardData.avistamientos.map(item => item.total_avistamientos),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const avistamientosOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 14 } },
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: '#000',
        font: { weight: 'bold', size: 12 },
        formatter: (value) => formatNumber(value),
      },
      tooltip: {
        enabled: true,
        callbacks: { label: (context) => `${formatNumber(context.parsed.y)}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          callback: (value) => formatNumber(value),
        },
      },
      x: { ticks: { font: { size: 12 } } },
    },
  };

  // 6. Distribución de Carnadas - Normalizar porcentajes
  const totalCarnadas = dashboardData.carnadas.reduce(
    (acc, item) => acc + item.total_porcentaje,
    0
  );
  const normalizedCarnadas = dashboardData.carnadas.map(item => ({
    ...item,
    porcentaje_normalizado: totalCarnadas
      ? (item.total_porcentaje / totalCarnadas) * 100
      : 0,
  }));

  const carnadas = {
    labels: normalizedCarnadas.map(item => item.nombre_carnada),
    datasets: [
      {
        label: 'Porcentaje de Uso de Carnadas',
        data: normalizedCarnadas.map(item => item.porcentaje_normalizado),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const carnadasOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: { size: 14 },
        },
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        offset: 10,
        color: '#000',
        backgroundColor: '#fff',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 4,
        font: { weight: 'bold', size: 14 },
        formatter: (value) => `${value.toFixed(1)}%`,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.toFixed(1)}%`,
        },
      },
    },
  };

  // 7. Incidencias
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

  const incidenciasOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { font: { size: 14 } },
      },
      datalabels: {
        color: '#000',
        formatter: (value) => formatNumber(value),
        font: { weight: 'bold', size: 12 },
      },
      tooltip: {
        enabled: true,
        callbacks: { label: (context) => `${formatNumber(context.parsed.y)}` },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 },
          callback: (value) => formatNumber(value),
        },
      },
      x: { ticks: { font: { size: 12 } } },
    },
  };

  return (
    <div className="dashboard-container">
      {/* 1. Capturas Retenidas por Mes */}
      <Row className="mb-5">
        <Col xs="12">
          <Card className="shadow dashboard-card">
            <CardHeader className="bg-primary text-white">
              Capturas Retenidas por Mes
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" md="6" className="mb-3 mb-md-0">
                  <ChartWithFallback
                    data={capturasPorMes}
                    options={capturasPorMesOptions}
                    renderChart={() => (
                      <Bar data={capturasPorMes} options={capturasPorMesOptions} />
                    )}
                  />
                </Col>
                <Col xs="12" md="6">
                  {dashboardData.capturas_por_mes.length > 0 ? (
                    renderTable(
                      ['Mes', 'Capturas Retenidas'],
                      dashboardData.capturas_por_mes.map(item => [
                        monthNames[item.month - 1],
                        formatNumber(item.total_retenido),
                      ]),
                      [null, formatNumber],
                      false
                    )
                  ) : (
                    <div className="text-center py-3">No hay información disponible.</div>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 2. Uso de Artes de Pesca */}
      <Row className="mb-5">
        <Col xs="12">
          <Card className="shadow dashboard-card">
            <CardHeader className="bg-secondary text-white">
              Uso de Artes de Pesca
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" md="6" className="mb-3 mb-md-0">
                  <ChartWithFallback
                    data={artesPesca}
                    options={artesPescaOptions}
                    renderChart={() => (
                      <Pie data={artesPesca} options={artesPescaOptions} />
                    )}
                  />
                </Col>
                <Col xs="12" md="6">
                  {dashboardData.artes_pesca.length > 0 ? (
                    renderTable(
                      ['Tipo de Arte de Pesca', 'Total (%)'],
                      dashboardData.artes_pesca.map(item => [
                        item.tipo_arte || 'Desconocido',
                        `${item.total}%`,
                      ]),
                      [null, (value) => `${value}`],
                      false
                    )
                  ) : (
                    <div className="text-center py-3">No hay información disponible.</div>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 3. Capturas por Año */}
      <Row className="mb-5">
        <Col xs="12">
          <Card className="shadow dashboard-card">
            <CardHeader className="bg-success text-white">
              Capturas por Año
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" md="6" className="mb-3 mb-md-0">
                  <ChartWithFallback
                    data={capturasPorAno}
                    options={capturasPorAnoOptions}
                    renderChart={() => (
                      <Bar data={capturasPorAno} options={capturasPorAnoOptions} />
                    )}
                  />
                </Col>
                <Col xs="12" md="6">
                  {dashboardData.capturas_por_ano.length > 0 ? (
                    renderTable(
                      ['Año', 'Capturas Retenidas', 'Capturas Descartadas'],
                      dashboardData.capturas_por_ano.map(item => [
                        item.year,
                        formatNumber(item.retenido),
                        formatNumber(item.descartado),
                      ]),
                      [null, formatNumber, formatNumber],
                      false
                    )
                  ) : (
                    <div className="text-center py-3">No hay información disponible.</div>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 4. Proyección Lineal de Capturas */}
      <Row className="mb-5">
        <Col xs="12">
          <Card className="shadow dashboard-card">
            <CardHeader className="bg-warning text-white">
              Proyección Lineal de Capturas
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" md="6" className="mb-3 mb-md-0">
                  <ChartWithFallback
                    data={regresionLineal}
                    options={regresionLinealOptions}
                    renderChart={() => (
                      <Line data={regresionLineal} options={regresionLinealOptions} />
                    )}
                  />
                </Col>
                <Col xs="12" md="6">
                  {dashboardData.capturas_por_mes.length > 0 &&
                  dashboardData.regresion_lineal.length > 0 ? (
                    renderTable(
                      ['Mes', 'Proyección'],
                      dashboardData.capturas_por_mes.map((item, index) => [
                        monthNames[item.month - 1],
                        formatNumber(dashboardData.regresion_lineal[index]),
                      ]),
                      [null, formatNumber],
                      false
                    )
                  ) : (
                    <div className="text-center py-3">No hay información disponible.</div>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 5. Avistamientos por Especie */}
      <Row className="mb-5">
        <Col xs="12">
          <Card className="shadow dashboard-card">
            <CardHeader className="bg-info text-white">
              Avistamientos por Especie
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" md="6" className="mb-3 mb-md-0">
                  <ChartWithFallback
                    data={avistamientos}
                    options={avistamientosOptions}
                    renderChart={() => (
                      <Bar data={avistamientos} options={avistamientosOptions} />
                    )}
                  />
                </Col>
                <Col xs="12" md="6">
                  {dashboardData.avistamientos.length > 0 ? (
                    renderTable(
                      ['Especie', 'Total Avistamientos'],
                      dashboardData.avistamientos.map(item => [
                        item.especie,
                        formatNumber(item.total_avistamientos),
                      ]),
                      [null, formatNumber],
                      true
                    )
                  ) : (
                    <div className="text-center py-3">No hay información disponible.</div>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* 6. Distribución de Carnadas */}
      <Row className="mb-5">
        <Col xs="25">
          <Card className="dashboard-card-carnadas" >
            <CardHeader className="bg-danger text-white">
              Distribución de Carnadas
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="14" md="6" className=".carnadas-container">
                    <ChartWithFallback
                      data={carnadas}
                      options={carnadasOptions}
                      renderChart={() => (
                        <Pie data={carnadas} options={carnadasOptions} />
                      )}
                    />
                 
                </Col>
                <Col xs="12" md="6">
                  {dashboardData.carnadas.length > 0 ? (
                    renderTable(
                      ['Nombre de Carnada', 'Porcentaje de Uso'],
                      normalizedCarnadas.map(item => [
                        item.nombre_carnada,
                        `${item.porcentaje_normalizado.toFixed(2)}%`,
                      ]),
                      [null, (value) => `${value}`],
                      false
                    )
                  ) : (
                    <div className="text-center py-3">No hay información disponible.</div>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
      {/* 7. Incidencias */}
      <Row className="mb-5">
        <Col xs="12">
          <Card className="shadow dashboard-card">
            <CardHeader className="bg-dark text-white">
              Incidencias
            </CardHeader>
            <CardBody>
              <Row>
                <Col xs="12" md="6" className="mb-3 mb-md-0">
                  <ChartWithFallback
                    data={incidencias}
                    options={incidenciasOptions}
                    renderChart={() => (
                      <Bar data={incidencias} options={incidenciasOptions} />
                    )}
                  />
                </Col>
                <Col xs="12" md="6">
                  {dashboardData.incidencias ? (
                    (dashboardData.incidencias.total_graves !== null ||
                     dashboardData.incidencias.total_leves !== null ||
                     dashboardData.incidencias.total_muertos !== null) ? (
                      renderTable(
                        ['Tipo de Incidencia', 'Total'],
                        [
                          ['Heridas Graves', formatNumber(dashboardData.incidencias.total_graves)],
                          ['Heridas Leves', formatNumber(dashboardData.incidencias.total_leves)],
                          ['Muertos', formatNumber(dashboardData.incidencias.total_muertos)],
                        ],
                        [null, formatNumber],
                        false
                      )
                    ) : (
                      <div className="text-center py-3">No hay información disponible.</div>
                    )
                  ) : (
                    <div className="text-center py-3">No hay información disponible.</div>
                  )}
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ContenidoDashboard;

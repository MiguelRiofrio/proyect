import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import ChartComponent from './charts/ChartComponent';
import AnotherChartComponent from './charts/AnotherChartComponent';
import GrowthChartComponent from './charts/GrowthChartComponent';

const ChartsSection = ({ datos }) => {
  return (
    <Container className="mt-5">
      {/* Primera fila de gráficos */}
      <Row className="mb-4">
        <Col md="6">
          <div className="chart-container">
            <ChartComponent datos={datos} />
          </div>
        </Col>
        <Col md="6">
          <div className="chart-container">
            <AnotherChartComponent datos={datos} />
          </div>
        </Col>
      </Row>

      {/* Segunda fila de gráficos */}
      <Row>
        <Col md="12">
          <div className="chart-container">
            <GrowthChartComponent datos={datos} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ChartsSection;

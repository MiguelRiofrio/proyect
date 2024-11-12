import React from 'react';
import ChartComponent from '../pages/charts/ChartComponent';
import AnotherChartComponent from '../pages/charts/AnotherChartComponent';
import GrowthChartComponent from '../pages/charts/GrowthChartComponent';

const ChartsSection = ({ datos }) => {
  return (
    <div className="chart-section">
      {/* Gráfico 1 */}
      <div className="chart-container">
        <ChartComponent datos={datos} />
      </div>

      {/* Gráfico 2 */}
      <div className="chart-container">
        <AnotherChartComponent datos={datos} />
      </div>

      {/* Gráfico 3 */}
      <div className="chart-container">
        <GrowthChartComponent datos={datos} />
      </div>
    </div>
  );
};

export default ChartsSection;

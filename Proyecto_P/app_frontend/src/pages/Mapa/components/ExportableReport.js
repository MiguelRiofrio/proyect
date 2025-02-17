// src/components/ExportableReport.jsx
import React from 'react';
import { Card, CardBody, CardHeader, Table, Row, Col } from 'reactstrap';
import MapWithHeatmap from './Contenido_Mapa';

const ExportableReport = ({
  combinedData,
  center,
  zoom,
  species,
  resumenFiltros,
  areasPorEspecie, // si tienes análisis de áreas por especie
}) => {
  // Convertir el string de resumen de filtros en un arreglo de pares clave/valor
  const filtroLines = resumenFiltros
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const cleaned = line.replace(/^- /, '');
      const [key, ...rest] = cleaned.split(':');
      return { key: key.trim(), value: rest.join(':').trim() };
    });

  return (
    <Card
      className="shadow custom-card"
      style={{ fontFamily: 'Helvetica, Arial, sans-serif', margin: '1rem' }}
    >
      {/* ENCABEZADO */}
      <CardHeader
        className="custom-card-header"
        style={{
          background: 'linear-gradient(135deg, #004080, #007bff)',
          color: '#fff',
          padding: '1.5rem',
          textAlign: 'center',
          borderBottom: '2px solid #0056b3',
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '1px' }}>
          Informe de Actividades Pesqueras
        </h3>
      </CardHeader>

      {/* CUERPO */}
      <CardBody
        className="custom-card-body"
        style={{ padding: '2rem', backgroundColor: '#f9f9f9' }}
      >
        {/* FILA 1: MAPA (8 columnas) + FILTROS (4 columnas) */}
        <Row>
          <Col md={8}>
            <section style={{ marginBottom: '2rem' }}>
              <h5 style={{ marginBottom: '1rem', color: '#333' }}>
                Visualización del Mapa
              </h5>
              <div
                style={{
                  height: '400px',
                  width: '100%',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <MapWithHeatmap
                  datos={combinedData}
                  center={center}
                  zoom={zoom}
                  species={species}
                  info={resumenFiltros}
                />
              </div>
            </section>
          </Col>

          <Col md={4}>
            <section style={{ marginBottom: '2rem' }}>
              <h5
                style={{
                  marginBottom: '1rem',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '0.5rem',
                  color: '#333',
                }}
              >
                Resumen de Filtros Aplicados
              </h5>
              <Table borderless size="sm" style={{ backgroundColor: '#fff' }}>
                <tbody>
                  {filtroLines.map((line, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td
                        style={{
                          fontWeight: 'bold',
                          padding: '0.5rem',
                          width: '40%',
                        }}
                      >
                        {line.key}:
                      </td>
                      <td style={{ padding: '0.5rem' }}>{line.value}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </section>
          </Col>
        </Row>

        {/* FILA 2: ANÁLISIS DE ÁREAS POR ESPECIE (OCUPA TODO EL ANCHO) */}
        {areasPorEspecie && Object.keys(areasPorEspecie).length > 0 && (
          <Row>
            <Col md={12}>
              <section style={{ marginBottom: '2rem' }}>
                <h5
                  style={{
                    marginBottom: '1rem',
                    borderBottom: '1px solid #ccc',
                    paddingBottom: '0.5rem',
                    color: '#333',
                  }}
                >
                  Análisis de Áreas por Especie
                </h5>
                <Table borderless size="sm" style={{ backgroundColor: '#fff' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem' }}>Especie</th>
                      <th style={{ padding: '0.5rem' }}>Nombre Común</th>
                      <th style={{ padding: '0.5rem' }}>Cantidad</th>
                      <th style={{ padding: '0.5rem' }}>Lat. Mín</th>
                      <th style={{ padding: '0.5rem' }}>Lat. Máx</th>
                      <th style={{ padding: '0.5rem' }}>Long. Mín</th>
                      <th style={{ padding: '0.5rem' }}>Long. Máx</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(areasPorEspecie).map(([especie, data], index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.5rem' }}>{especie}</td>
                        <td style={{ padding: '0.5rem' }}>{data.nombre_comun}</td>
                        <td style={{ padding: '0.5rem' }}>{data.count}</td>
                        <td style={{ padding: '0.5rem' }}>{data.min_lat}</td>
                        <td style={{ padding: '0.5rem' }}>{data.max_lat}</td>
                        <td style={{ padding: '0.5rem' }}>{data.min_long}</td>
                        <td style={{ padding: '0.5rem' }}>{data.max_long}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </section>
            </Col>
          </Row>
        )}

        {/* PIE DEL INFORME */}
        <footer
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: '0.8rem',
            color: '#666',
          }}
        >
          <p style={{ margin: 0 }}>
            Informe generado el {new Date().toLocaleString()}
          </p>
        </footer>
      </CardBody>
    </Card>
  );
};

export default ExportableReport;

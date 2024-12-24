import React, { useEffect, useState } from 'react';
import { Table } from 'reactstrap';

const TopEspecies = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/top-especies/');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div>
      <h2>Top 10 Especies</h2>

      {/* Tabla de capturas */}
      <h3>Especies Más Capturadas</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Científico</th>
            <th>Nombre Común</th>
            <th>Total Capturas</th>
          </tr>
        </thead>
        <tbody>
          {data.top_capturas.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.especie__nombre_cientifico}</td>
              <td>{item.especie__nombre_comun}</td>
              <td>{item.total_captura}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Tabla de avistamientos */}
      <h3>Especies Más Avistadas</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Científico</th>
            <th>Nombre Común</th>
            <th>Total Avistamientos</th>
          </tr>
        </thead>
        <tbody>
          {data.top_avistamientos.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.especie__nombre_cientifico}</td>
              <td>{item.especie__nombre_comun}</td>
              <td>{item.total_avistamientos}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Tabla de incidencias */}
      <h3>Especies con Más Incidencias</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre Científico</th>
            <th>Nombre Común</th>
            <th>Total Incidencias</th>
          </tr>
        </thead>
        <tbody>
          {data.top_incidencias.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.especie__nombre_cientifico}</td>
              <td>{item.especie__nombre_comun}</td>
              <td>{item.total_incidencias}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TopEspecies;

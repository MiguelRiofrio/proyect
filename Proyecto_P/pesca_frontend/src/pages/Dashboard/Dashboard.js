import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import ChartsG1 from '../charts/ChartsG1';  // Importa correctamente ChartsG1

const Dashboard = () => {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/')
      .then((response) => response.json())
      .then((data) => {
        setDatos(data);  // Guardar los datos en el estado
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (!datos) {
    return <p>Cargando datos...</p>;
  }

  return (
    <Container className="mt-5">
      <h1>Dashboard de Pesca</h1>
      <div className="charts-grid">
        <ChartsG1 datos={datos} />
      </div>
    </Container>
  );
};

export default Dashboard;

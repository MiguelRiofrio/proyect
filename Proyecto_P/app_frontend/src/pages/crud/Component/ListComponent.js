import React, { useState, useEffect } from 'react';
import { Table, Button, Card, CardBody, CardHeader, Spinner, Alert } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import api from './ApiService';
import './css/ListComponent.css'; // Archivo CSS para estilos personalizados

const ListComponent = ({ endpoint, title }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(endpoint);
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await api.delete(`${endpoint}${id}/`);
        fetchData();
      } catch (error) {
        console.error('Error al eliminar el registro:', error);
        setError('Error al eliminar el registro.');
      }
    }
  };

  return (
    <Card className="list-card">
      <CardHeader className="list-card-header">
        <h2>{title}</h2>
        <Button color="primary" onClick={() => navigate(`${endpoint}create`)}>
          Agregar Nuevo
        </Button>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="text-center">
            <Spinner color="primary" />
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : (
          <Table bordered striped hover responsive>
            <thead>
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((key) => <th key={key}>{key.toUpperCase()}</th>)}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id || item.codigo || Object.values(item)[0]}>
                  {Object.values(item).map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                  <td>
                    <Button
                      color="warning"
                      className="action-button"
                      onClick={() =>
                        navigate(`${endpoint}edit/${item.id || item.codigo || Object.values(item)[0]}`)
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      color="danger"
                      className="action-button"
                      onClick={() => deleteItem(item.id || item.codigo || Object.values(item)[0])}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </CardBody>
    </Card>
  );
};

export default ListComponent;

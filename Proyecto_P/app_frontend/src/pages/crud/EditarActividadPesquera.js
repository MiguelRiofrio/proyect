import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import api from '../../routes/api';

const EditarActividadPesquera = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actividad, setActividad] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActividad = async () => {
      try {
        const response = await api.get(`/crud/actividades/${id}/details/`);
        setActividad(response.data);
      } catch (error) {
        setError('Error al cargar los datos de la actividad.');
      } finally {
        setLoading(false);
      }
    };
    fetchActividad();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActividad({ ...actividad, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/crud/actividades/${id}/edit/`, actividad);
      navigate('/actividades');
    } catch (error) {
      setError('Error al guardar los cambios.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <Alert color="danger">{error}</Alert>;

  return (
    <div className="container mt-5">
      <h1 className="text-center">Editar Actividad Pesquera</h1>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="fecha_salida">Fecha de Salida</Label>
          <Input
            type="date"
            name="fecha_salida"
            value={actividad.fecha_salida || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="fecha_entrada">Fecha de Entrada</Label>
          <Input
            type="date"
            name="fecha_entrada"
            value={actividad.fecha_entrada || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="matricula">Matrícula</Label>
          <Input
            type="text"
            name="matricula"
            value={actividad.matricula || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="tipo_de_palangre">Tipo de Palangre</Label>
          <Input
            type="text"
            name="tipo_de_palangre"
            value={actividad.tipo_de_palangre || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="tipo_de_flota">Tipo de Flota</Label>
          <Input
            type="text"
            name="tipo_de_flota"
            value={actividad.tipo_de_flota || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="puerto_salida">Puerto de Salida</Label>
          <Input
            type="text"
            name="puerto_salida"
            value={actividad.puerto_salida || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="puerto_entrada">Puerto de Entrada</Label>
          <Input
            type="text"
            name="puerto_entrada"
            value={actividad.puerto_entrada || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="tipo_arte_pesca">Tipo de Arte de Pesca</Label>
          <Input
            type="text"
            name="tipo_arte_pesca"
            value={actividad.tipo_arte_pesca || ''}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="pesca_objetivo">Pesca Objetivo</Label>
          <Input
            type="text"
            name="pesca_objetivo"
            value={actividad.pesca_objetivo || ''}
            onChange={handleChange}
          />
        </FormGroup>
        {/* Agregar más campos según sea necesario */}
        <Button color="primary" type="submit">
          Guardar Cambios
        </Button>
        <Button color="secondary" onClick={() => navigate('/actividades')} className="ms-3">
          Cancelar
        </Button>
      </Form>
    </div>
  );
};

export default EditarActividadPesquera;

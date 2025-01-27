// src/components/RegisterPersona.js

import React, { useState, useEffect } from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
} from 'reactstrap';
import api from '../../../../routes/api'; // Asegúrate de que la ruta sea correcta

const RegisterPersona = ({ handleClose, onPersonaRegistrada, rol }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    rol: rol || '',
    // Añade otros campos necesarios según tu modelo de Persona
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Si el rol se actualiza desde el prop, actualiza el estado
  useEffect(() => {
    if (rol) {
      setFormData(prevData => ({
        ...prevData,
        rol: rol,
      }));
    }
  }, [rol]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.nombre) {
      setError('El nombre es obligatorio.');
      return false;
    }

    if (!formData.rol) {
      setError('El rol es obligatorio.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('access_token');
      const response = await api.post(
        'crud/personas/', 
        {
          nombre: formData.nombre,
          rol: formData.rol,
          // Incluye otros campos necesarios
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('Persona registrada con éxito.');
      setFormData({ nombre: '', rol: rol || '' });

      // Notificar al componente padre que se ha registrado una nueva persona
      if (onPersonaRegistrada) {
        onPersonaRegistrada(response.data);
      }

      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);

      if (error.response?.status === 400) {
        setError('Datos inválidos. Verifica los campos.');
      } else if (error.response?.status === 409) {
        setError('La persona ya existe.');
      } else {
        setError('Error al registrar la persona. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert color="danger">{error}</Alert>}
      {success && <Alert color="success">{success}</Alert>}

      <FormGroup>
        <Label for="nombre">Nombre</Label>
        <Input
          type="text"
          name="nombre"
          id="nombre"
          placeholder="Ingrese el nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          maxLength={100}
        />
      </FormGroup>

      <FormGroup>
        <Label for="rol">Rol</Label>
        <Input
          type="text"
          name="rol"
          id="rol"
          placeholder="Ingrese el rol"
          value={formData.rol}
          onChange={handleChange}
          required
          maxLength={50}
          disabled={rol ? true : false} // Deshabilitar si 'rol' está predefinido
        />
      </FormGroup>

      {/* Añade más campos según sea necesario */}

      <div className="text-center">
        <Button color="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Registrar Persona'}
        </Button>
      </div>
    </Form>
  );
};

export default RegisterPersona;

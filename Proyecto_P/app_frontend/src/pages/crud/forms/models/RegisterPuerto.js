// src/components/RegisterPuerto.js

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../../../../routes/api'; // Asegúrate de que la ruta sea correcta

const RegisterPuerto = ({ handleClose, onPuertoRegistrado }) => {
  const [formData, setFormData] = useState({
    nombre_puerto: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.nombre_puerto) {
      setError('El nombre del puerto es obligatorio.');
      return false;
    }

    if (formData.nombre_puerto.length > 100) {
      setError('El nombre del puerto no debe exceder los 100 caracteres.');
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
        'crud/puertos/', 
        {
          nombre_puerto: formData.nombre_puerto,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('Puerto registrado con éxito.');
      setFormData({ nombre_puerto: '' });

      // Notificar al componente padre que se ha registrado un nuevo puerto
      if (onPuertoRegistrado) {
        onPuertoRegistrado(response.data);
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
        setError('El puerto ya existe.');
      } else {
        setError('Error al registrar el puerto. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <TextField
            label="Nombre Puerto"
            variant="outlined"
            fullWidth
            name="nombre_puerto"
            value={formData.nombre_puerto}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
      </Grid>

      <Grid container justifyContent="center" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Puerto'}
        </Button>
      </Grid>
    </form>
  );
};

export default RegisterPuerto;

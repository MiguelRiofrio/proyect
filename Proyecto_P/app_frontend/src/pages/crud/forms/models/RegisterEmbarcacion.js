// src/components/RegisterEmbarcacion.js

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../../../../routes/api'; // Asegúrate de que la ruta sea correcta

const RegisterEmbarcacion = ({ handleClose, onEmbarcacionRegistrada }) => {
  const [formData, setFormData] = useState({
    nombre_embarcacion: '',
    matricula: '',
    // Añade otros campos necesarios según tu modelo de Embarcacion
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
    if (!formData.nombre_embarcacion) {
      setError('El nombre de la embarcación es obligatorio.');
      return false;
    }

    if (!formData.matricula) { // Corrección aquí
      setError('La Matricula es obligatoria.');
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
        '/crud/embarcaciones/', 
        {
          nombre_embarcacion: formData.nombre_embarcacion,
          matricula: formData.matricula,
          // Incluye otros campos necesarios
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('Embarcación registrada con éxito.');
      setFormData({ nombre_embarcacion: '', matricula: '' }); // Corrección aquí

      // Notificar al componente padre que se ha registrado una nueva embarcación
      if (onEmbarcacionRegistrada) {
        onEmbarcacionRegistrada(response.data);
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
        setError('La embarcación ya existe.');
      } else {
        setError('Error al registrar la embarcación. Intenta nuevamente.');
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
            label="Nombre Embarcación"
            variant="outlined"
            fullWidth
            name="nombre_embarcacion"
            value={formData.nombre_embarcacion}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Matricula"
            variant="outlined"
            fullWidth
            name="matricula"
            value={formData.matricula}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 50 }}
          />
        </Grid>
        {/* Añade más campos según sea necesario */}
      </Grid>

      <Grid container justifyContent="center" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Embarcación'}
        </Button>
      </Grid>
    </form>
  );
};

export default RegisterEmbarcacion;

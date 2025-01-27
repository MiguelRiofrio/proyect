import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../../routes/api'; // Asegúrate de que la ruta sea correcta

const roles = [
  { value: true, label: 'Administrador' },
  { value: false, label: 'Usuario Estándar' },
  { value: false, label: 'editor' },
];

const RegisterUser = ({ handleClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_superuser: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'is_superuser' ? value === 'true' : value,  // Convertir string a boolean
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(formData.email)) {
      setError('El correo electrónico no es válido.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
      api.post(
        '/users/register/', 
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          is_superuser: formData.is_superuser,
          is_active: true,  // Se establece activo por defecto
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('Usuario registrado con éxito.');
      setFormData({ username: '', email: '', password: '', is_superuser: false });

      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);

      if (error.response?.status === 400) {
        setError('Datos inválidos. Verifica los campos.');
      } else if (error.response?.status === 409) {
        setError('El usuario ya existe.');
      } else {
        setError('Error al registrar el usuario. Intenta nuevamente.');
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
        <Grid item xs={12} sm={6}>
          <TextField
            label="Nombre de Usuario"
            variant="outlined"
            fullWidth
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            fullWidth
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Contraseña"
            variant="outlined"
            fullWidth
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            label="Rol de Usuario"
            variant="outlined"
            fullWidth
            name="is_superuser"
            value={formData.is_superuser.toString()}
            onChange={handleChange}
            required
          >
            {roles.map((option) => (
              <MenuItem key={option.value} value={option.value.toString()}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Grid container justifyContent="center" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar Usuario'}
        </Button>
      </Grid>
    </form>
  );
};

export default RegisterUser;

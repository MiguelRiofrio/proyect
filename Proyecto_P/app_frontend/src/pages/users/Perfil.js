import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import axios from 'axios';

const Perfil = () => {
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    role: '',
  });

  // Carga de datos del perfil desde la API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/users/perfil/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        const { username, email } = response.data;

        setUserData({
          nombre: username,
          email: email,
          role: localStorage.getItem('user_role'),
        });
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put('http://localhost:8000/api/users/perfil/', {
        username: userData.nombre,
        email: userData.email,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      alert('Perfil actualizado con éxito');
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      alert('Error al guardar los cambios');
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Perfil de Usuario
      </Typography>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <TextField
          label="Nombre"
          name="nombre"
          value={userData.nombre}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Correo Electrónico"
          name="email"
          value={userData.email}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Rol"
          name="role"
          value={userData.role}
          disabled
          fullWidth
          margin="normal"
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveChanges}
          sx={{ mt: 2 }}
        >
          Guardar Cambios
        </Button>
      </Paper>
    </Box>
  );
};

export default Perfil;

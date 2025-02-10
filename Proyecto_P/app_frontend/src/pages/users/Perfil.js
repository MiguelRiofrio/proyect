// src/components/Perfil.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Avatar,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions as DialogActionsFooter,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import api from '../../routes/api';
import { roles } from '../../constants/roles'; // Asegúrate de que la ruta sea correcta

const Perfil = () => {
  // Estado para almacenar los datos del usuario
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    role: '',
  });

  // Estados para manejar la carga, guardado, mensajes y modal
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para manejar los datos editados en el modal
  const [editData, setEditData] = useState({
    nombre: '',
    email: '',
    role: '',
    password: '', // Añadido para manejar la contraseña
  });

  // Función para obtener el token de localStorage
  const getToken = () => localStorage.getItem('access_token');

  // Función para obtener los datos del perfil del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/perfil/', {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const { username, email, role } = response.data;

        setUserData({
          nombre: username,
          email: email,
          role: role || '',
        });
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
        setError('No se pudo cargar el perfil. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Maneja los cambios en los campos del formulario de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Validación de los datos del formulario
  const validate = () => {
    const { nombre, email } = editData;
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Introduce un correo electrónico válido.');
      return false;
    }
    // Validación opcional para la contraseña
    if (editData.password && editData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    return true;
  };

  // Maneja el guardado de los cambios realizados
  const handleSaveChanges = async () => {
    if (!validate()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        username: editData.nombre,
        email: editData.email,
        role: editData.role,
      };

      // Incluir la contraseña solo si se está cambiando
      if (editData.password) {
        payload.password = editData.password;
      }

      await api.patch(
        '/users/perfil/',
        payload,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      setUserData((prevData) => ({
        ...prevData,
        nombre: editData.nombre,
        email: editData.email,
        role: editData.role,
      }));

      setSuccess('Perfil actualizado con éxito.');
      setIsModalOpen(false);
      setEditData({
        nombre: '',
        email: '',
        role: '',
        password: '',
      });
    } catch (err) {
      console.error('Error al guardar los cambios:', err);
      setError('No se pudieron guardar los cambios. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Abre el modal de edición y carga los datos actuales
  const handleOpenModal = () => {
    setEditData({
      nombre: userData.nombre,
      email: userData.email,
      role: userData.role,
      password: '',
    });
    setIsModalOpen(true);
  };

  // Cierra el modal de edición
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData({
      nombre: '',
      email: '',
      role: '',
      password: '',
    });
  };

  // Cierra los mensajes de Snackbar
  const handleCloseSnackbar = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Perfil de Usuario
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        {/* Avatar y Nombre */}
        <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{ width: 150, height: 150, margin: '0 auto' }}
            src="/static/images/avatar/1.jpg" // Puedes reemplazar esto con una imagen dinámica si está disponible
            alt={userData.nombre}
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {userData.nombre}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {userData.role === 'superuser'
              ? 'Superusuario'
              : userData.role === 'editor'
              ? 'Editor'
              : 'Usuario Normal'}
          </Typography>
        </Grid>

        {/* Información del Perfil */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              {/* Nombre */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <PersonIcon color="action" />
                </Grid>
                <Grid item xs={12} sm={10}>
                  <Typography variant="body1">{userData.nombre}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />

              {/* Correo Electrónico */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <EmailIcon color="action" />
                </Grid>
                <Grid item xs={12} sm={10}>
                  <Typography variant="body1">{userData.email}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />

              {/* Rol */}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <VpnKeyIcon color="action" />
                </Grid>
                <Grid item xs={12} sm={10}>
                  <Typography variant="body1">
                    {userData.role === 'superuser'
                      ? 'Superusuario'
                      : userData.role === 'editor'
                      ? 'Editor'
                      : 'Usuario Normal'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleOpenModal}
              >
                Editar Perfil
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Ventana Modal para Editar Perfil */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent dividers>
          <Box component="form" noValidate>
            {/* Nombre */}
            <TextField
              margin="normal"
              label="Nombre"
              name="nombre"
              value={editData.nombre}
              onChange={handleEditInputChange}
              fullWidth
              required
            />

            {/* Correo Electrónico */}
            <TextField
              margin="normal"
              label="Correo Electrónico"
              name="email"
              type="email"
              value={editData.email}
              onChange={handleEditInputChange}
              fullWidth
              required
            />

            {/* Selección de Rol */}
            <FormControl fullWidth variant="outlined" margin="normal" required>
              <InputLabel id="edit-role-label">Rol</InputLabel>
              <Select
                labelId="edit-role-label"
                label="Rol"
                name="role"
                value={editData.role}
                onChange={handleEditInputChange}
              >
                {roles.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Campo Opcional para Cambiar la Contraseña */}
            <TextField
              margin="normal"
              label="Nueva Contraseña"
              name="password"
              type="password"
              value={editData.password}
              onChange={handleEditInputChange}
              fullWidth
              helperText="Dejar en blanco si no deseas cambiar la contraseña."
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActionsFooter>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSaveChanges}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
          </Button>
        </DialogActionsFooter>
      </Dialog>

      {/* Snackbar para mensajes de éxito */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Snackbar para mensajes de error */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Perfil;

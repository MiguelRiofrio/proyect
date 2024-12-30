import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from '@mui/material';
import api from '../../routes/api';


const RegisterUser = ({ open, handleClose }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      await api.post(
        '/users/register/',
        { username, email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Usuario creado exitosamente');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      handleClose();
    } catch (error) {
      console.error('Detalles del error:', error.response?.data || error.message);

      if (error.response?.status === 500) {
        setError('Error del servidor. Por favor, contacta al administrador.');
      } else if (error.response?.data?.username) {
        setError('El nombre de usuario ya está en uso');
      } else if (error.response?.data?.email) {
        setError('El correo electrónico ya está en uso');
      } else if (error.response?.data?.password) {
        setError('Contraseña no válida.');
      } else {
        setError('Error al crear el usuario');
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar Usuario</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form id="register-form" onSubmit={handleSubmit}>
          <TextField
            label="Nombre de usuario"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Confirmar Contraseña"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button form="register-form" type="submit" color="primary">
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterUser;

import React, { useState } from 'react';
import UserList from './UserList';
import RegisterUser from './RegisterUser';
import { Container, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const GestionUsuarios = () => {
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Gestión de Usuarios
      </Typography>

      <Button variant="contained" color="primary" onClick={handleOpenModal} sx={{ mb: 2 }}>
        Agregar Usuario
      </Button>

      <UserList />

      <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
        <DialogContent dividers>
          <RegisterUser open={open} handleClose={handleCloseModal} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionUsuarios;

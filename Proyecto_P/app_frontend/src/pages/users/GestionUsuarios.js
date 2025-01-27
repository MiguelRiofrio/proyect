import React, { useState } from 'react';
import UserList from './UserList';
import RegisterUser from './RegisterUser';
import AddIcon from '@mui/icons-material/PersonAdd';

import {
  Container,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from '@mui/material';

const GestionUsuarios = () => {
  const [open, setOpen] = useState(false);

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, backgroundColor: '#f4f6f8', p: 4, borderRadius: 2 }}>
         <Typography variant="h3" gutterBottom align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                Gestión de Usuarios
              </Typography>

      <Box textAlign="center">
        <Button variant="contained" color="primary" onClick={handleOpenModal} 
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#1565c0' },
          }}>
          Agregar Usuario
        </Button>
      </Box>

      <UserList />

      <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Registrar Nuevo Usuario</DialogTitle>
        <DialogContent dividers>
          <RegisterUser open={open} handleClose={handleCloseModal} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary" variant="outlined">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GestionUsuarios;

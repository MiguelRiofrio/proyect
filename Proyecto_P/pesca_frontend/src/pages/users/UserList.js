import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Checkbox } from '@mui/material';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:8000/api/users/listusers/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Error al obtener los usuarios');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (id, isActive) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`http://localhost:8000/api/users/toggle-active/${id}/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prevUsers) => 
        prevUsers.map((user) => 
          user.id === id ? { ...user, is_active: !isActive } : user
        )
      );
      setError(null);
    } catch (err) {
      setError('Error al actualizar el estado del usuario');
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`http://localhost:8000/api/users/delete-user/${selectedUserId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUserId));
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      setError('Error al eliminar el usuario');
      console.error(err);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedUserId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserId(null);
  };

  const handleCheckboxChange = (id, isActive) => {
    handleToggleActive(id, isActive);
  };

  const displayValue = (value) => (value ? value : 'N/A');

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Lista de Usuarios
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><strong>ID</strong></TableCell>
              <TableCell align="center"><strong>Nombre de Usuario</strong></TableCell>
              <TableCell align="center"><strong>Correo Electrónico</strong></TableCell>
              <TableCell align="center"><strong>Rol</strong></TableCell>
              <TableCell align="center"><strong>Estado</strong></TableCell>
              <TableCell align="center"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center">{displayValue(user.id)}</TableCell>
                <TableCell align="center">{displayValue(user.username)}</TableCell>
                <TableCell align="center">{displayValue(user.email)}</TableCell>
                <TableCell align="center">{user.is_superuser ? 'Administrador' : 'Usuario'}</TableCell>
                <TableCell align="center">
                  <Checkbox
                    checked={user.is_active}
                    onChange={() => handleCheckboxChange(user.id, user.is_active)}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleOpenDialog(user.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirmación de eliminación */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserList;

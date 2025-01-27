import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  CircularProgress,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../routes/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/users/listusers/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Error al obtener la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const token = localStorage.getItem('access_token');
      await api.patch(`/users/toggle-active/${id}/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, is_active: !isActive } : user
        )
      );
    } catch (err) {
      setError('Error al actualizar el estado del usuario.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/users/delete-user/${selectedUserId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUserId));
      handleCloseDialog();
    } catch (err) {
      setError('Error al eliminar el usuario.');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, p: 4, borderRadius: 2, backgroundColor: '#eef2f5' }}>
     


      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#1565c0' }}>
              <TableRow>
                <TableCell sx={{ color: '#000000', fontWeight: 'bold' }} align="center">ID</TableCell>
                <TableCell sx={{ color: '#000000', fontWeight: 'bold' }} align="center">Nombre</TableCell>
                <TableCell sx={{ color: '#000000', fontWeight: 'bold' }} align="center">Correo Electrónico</TableCell>
                <TableCell sx={{ color: '#000000', fontWeight: 'bold' }} align="center">Rol</TableCell>
                <TableCell sx={{ color: '#000000', fontWeight: 'bold' }} align="center">Estado</TableCell>
                <TableCell sx={{ color: '#000000', fontWeight: 'bold' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell align="center">{user.id}</TableCell>
                    <TableCell align="center">{user.username || 'N/A'}</TableCell>
                    <TableCell align="center">{user.email || 'N/A'}</TableCell>
                    <TableCell align="center">{user.is_superuser ? 'Administrador' : 'Usuario'}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={user.is_active}
                        onChange={() => handleToggleActive(user.id, user.is_active)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleOpenDialog(user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay usuarios disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserList;

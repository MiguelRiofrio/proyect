// src/components/UserList.js

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
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../routes/api';
import EditUserDialog from './EditUserDialog'; // Ajusta la ruta según tu estructura de carpetas

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Estados para la edición
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editUserData, setEditUserData] = useState({
    id: null,
    username: '',
    email: '',
    role: 'user', // Valor por defecto
    is_active: false,
    password: '', // Opcional: si deseas permitir cambiar la contraseña
  });

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
      await api.patch(
        `/users/toggle-active/${id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Error al eliminar el usuario.');
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setSelectedUserId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedUserId(null);
  };

  // Funciones para la edición
  const handleOpenEditDialog = (user) => {
    setEditUserData({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role, // Asegúrate de que el backend envía el campo 'role'
      is_active: user.is_active,
      password: '', // Opcional: dejar vacío si no se desea cambiar la contraseña
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditUserData({
      id: null,
      username: '',
      email: '',
      role: 'user',
      is_active: false,
      password: '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUserData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const { id, username, email, role, is_active, password } = editUserData;
      const payload = {
        username,
        email,
        role, // Enviar el rol
        is_active,
      };
      if (password) {
        payload.password = password; // Solo si se desea cambiar la contraseña
      }

      await api.patch(
        `/users/update-user/${id}/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualizar la lista de usuarios localmente
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id
            ? {
                ...user,
                username,
                email,
                role,
                is_active,
              }
            : user
        )
      );
      handleCloseEditDialog();
    } catch (err) {
      setError('Error al actualizar el usuario.');
    }
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
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }} align="center">ID</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }} align="center">Nombre</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }} align="center">Correo Electrónico</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }} align="center">Rol</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }} align="center">Activo</TableCell>
                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }} align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell align="center">{user.id}</TableCell>
                    <TableCell align="center">{user.username || 'N/A'}</TableCell>
                    <TableCell align="center">{user.email || 'N/A'}</TableCell>
                    <TableCell align="center">
                      {user.role === 'superuser'
                        ? 'Superusuario'
                        : user.role === 'editor'
                        ? 'Editor'
                        : 'Usuario Normal'}
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={user.is_active}
                        onChange={() => handleToggleActive(user.id, user.is_active)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton color="primary" onClick={() => handleOpenEditDialog(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton color="error" onClick={() => handleOpenDeleteDialog(user.id)}>
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
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary" variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición de usuario */}
      <EditUserDialog
        open={openEditDialog}
        handleClose={handleCloseEditDialog}
        editUserData={editUserData}
        handleEditChange={handleEditChange}
        handleSaveEdit={handleSaveEdit}
        error={error}
      />
    </Container>
  );
};

export default UserList;

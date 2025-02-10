// src/components/EditUserDialog.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel, // Añadido
  Checkbox,  
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slide,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { roles } from '../../constants/roles'; // Asegúrate de ajustar la ruta según tu estructura de carpetas

// Transición para el diálogo
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const EditUserDialog = ({
  open,
  handleClose,
  editUserData,
  handleEditChange,
  handleSaveEdit,
  error,
}) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (editUserData.password && e.target.value !== editUserData.password) {
      setPasswordError('Las contraseñas no coinciden.');
    } else {
      setPasswordError('');
    }
  };

  const validateAndSave = () => {
    if (editUserData.password && editUserData.password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    setPasswordError('');
    handleSaveEdit();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Editar Usuario
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mt: 1,
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            label="Nombre de Usuario"
            name="username"
            value={editUserData.username}
            onChange={handleEditChange}
            fullWidth
            required
            variant="outlined"
          />
          <TextField
            label="Correo Electrónico"
            name="email"
            type="email"
            value={editUserData.email}
            onChange={handleEditChange}
            fullWidth
            required
            variant="outlined"
          />
          {/* Campos para cambiar la contraseña */}
          <TextField
            label="Nueva Contraseña"
            name="password"
            type="password"
            value={editUserData.password || ''}
            onChange={handleEditChange}
            fullWidth
            helperText="Dejar en blanco si no deseas cambiar la contraseña."
            variant="outlined"
          />
          <TextField
            label="Confirmar Contraseña"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            fullWidth
            error={Boolean(passwordError)}
            helperText={passwordError || 'Debe coincidir con la nueva contraseña.'}
            variant="outlined"
          />
          {/* Selección de rol */}
          <FormControl fullWidth variant="outlined">
            <InputLabel id="role-label">Rol</InputLabel>
            <Select
              labelId="role-label"
              label="Rol"
              name="role"
              value={editUserData.role || 'user'}
              onChange={handleEditChange}
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Activar/Desactivar usuario */}
          <FormControlLabel
            control={
              <Checkbox
                checked={editUserData.is_active}
                onChange={handleEditChange}
                name="is_active"
                color="primary"
              />
            }
            label="Activo"
          />
        </Box>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} color="secondary" variant="outlined">
          Cancelar
        </Button>
        <Button onClick={validateAndSave} color="primary" variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EditUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  editUserData: PropTypes.shape({
    id: PropTypes.number,
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string, // Añadido
    is_active: PropTypes.bool,
    password: PropTypes.string,
  }).isRequired,
  handleEditChange: PropTypes.func.isRequired,
  handleSaveEdit: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default EditUserDialog;

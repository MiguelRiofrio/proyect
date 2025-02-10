// ActividadPesqueraList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
  Pagination,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Edit as EditIcon, 

} from '@mui/icons-material';
import api from '../../routes/api';

const ActividadPesqueraList = () => {
  const [actividades, setActividades] = useState([]);
  const [filteredActividades, setFilteredActividades] = useState([]);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    fetchActividades();
  }, []);

  useEffect(() => {
    handleSearchAndSort();
    // eslint-disable-next-line
  }, [searchTerm, actividades, sortConfig]);

  const fetchActividades = async () => {
    setLoading(true);
    try {
      const response = await api.get('/crud/actividades/list/');
      setActividades(response.data);
      setFilteredActividades(response.data);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al obtener las actividades pesqueras. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedActividad) return;
    try {
      await api.delete(`/crud/actividades/${selectedActividad.codigo_actividad}/`);
      setModalOpen(false);
      setSnackbar({ open: true, message: 'Actividad eliminada exitosamente.', severity: 'success' });
      fetchActividades();
    } catch (error) {
      setError('Error al eliminar la actividad pesquera. Inténtalo nuevamente.');
      setSnackbar({ open: true, message: 'Error al eliminar la actividad.', severity: 'error' });
    }
  };

  const toggleModal = (actividad = null) => {
    setSelectedActividad(actividad);
    setModalOpen(!modalOpen);
  };

  const handleSearchAndSort = () => {
    let data = [...actividades];

    // Filtrado por búsqueda
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      data = data.filter((actividad) =>
        Object.values(actividad).some(
          (value) =>
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(lowercasedTerm)
        )
      );
    }

    // Ordenamiento
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredActividades(data);
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActividades.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredActividades.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
    }
    return '';
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        Lista de Actividades Pesqueras
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/agregar')}
        >
          Agregar Nueva Actividad
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<RefreshIcon />}
          onClick={fetchActividades}
        >
          Refrescar
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon />,
          }}
          sx={{ minWidth: 250 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#1976d2' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff', cursor: 'pointer' }} onClick={() => requestSort('codigo_actividad')}>
                    Código Actividad{getSortIndicator('codigo_actividad')}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', cursor: 'pointer' }} onClick={() => requestSort('embarcacion__nombre_embarcacion')}>
                    Embarcación{getSortIndicator('embarcacion__nombre_embarcacion')}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', cursor: 'pointer' }} onClick={() => requestSort('puerto_salida__nombre_puerto')}>
                    Puerto Salida{getSortIndicator('puerto_salida__nombre_puerto')}
                  </TableCell>
                  <TableCell sx={{ color: '#fff', cursor: 'pointer' }} onClick={() => requestSort('observador__nombre')}>
                    Observador{getSortIndicator('observador__nombre')}
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((actividad) => (
                    <TableRow key={actividad.codigo_actividad}>
                      <TableCell>{actividad.codigo_actividad}</TableCell>
                      <TableCell>{actividad.embarcacion__nombre_embarcacion}</TableCell>
                      <TableCell>{actividad.puerto_salida__nombre_puerto}</TableCell>
                      <TableCell>{actividad.observador__nombre}</TableCell>
                      <TableCell>
                        <Tooltip title="Ver Detalles">
                          <IconButton
                            color="info"
                            onClick={() => navigate(`/detalle/${actividad.codigo_actividad}`)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar Detalle">
                        <IconButton
                            color="edit"
                            onClick={() => navigate(`/editar/${actividad.codigo_actividad}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      
                        <Tooltip title="Eliminar Actividad">
                          <IconButton
                            color="error"
                            onClick={() => toggleModal(actividad)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog
        open={modalOpen}
        onClose={() => toggleModal(null)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Eliminar Actividad</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro que desea eliminar la actividad pesquera con el código{' '}
            <strong>{selectedActividad?.codigo_actividad}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            startIcon={<DeleteIcon />}
          >
            Sí, Eliminar
          </Button>
          <Button variant="outlined" onClick={() => toggleModal(null)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para Mensajes de Éxito y Error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ActividadPesqueraList;

// ListComponent.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import api from './ApiService';
import './css/ListComponent.css'; // Archivo CSS para estilos personalizados

const ListComponent = ({ path, endpoint, title }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoint);
      setData(response.data);
      setFilteredData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const toggleDeleteModal = () => setDeleteModal(!deleteModal);

  const confirmDelete = (item) => {
    setItemToDelete(item);
    toggleDeleteModal();
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`${endpoint}${itemToDelete.id || itemToDelete.codigo}/`);
      setSuccessMessage('Registro eliminado exitosamente.');
      fetchData();
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
      setError('Error al eliminar el registro.');
    } finally {
      toggleDeleteModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleSearch = () => {
    if (searchTerm === '') {
      setFilteredData(data);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = data.filter((item) =>
        Object.values(item).some(
          (value) =>
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(lowercasedTerm)
        )
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    sortData(key, direction);
  };

  const sortData = (key, direction) => {
    const sorted = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setFilteredData(sorted);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Card className="list-card">
      <CardHeader className="d-flex justify-content-between align-items-center">
        <h2>{title}</h2>
        <Button color="primary" onClick={() => navigate(`${path}/create`)}>
          <FaPlus className="me-2" /> Agregar Nuevo
        </Button>
      </CardHeader>
      <CardBody>
        {successMessage && (
          <Alert color="success">{successMessage}</Alert>
        )}
        {error && <Alert color="danger">{error}</Alert>}
        <div className="d-flex justify-content-between mb-3">
          <Input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button color="secondary" onClick={fetchData}>
            <FaSearch className="me-2" /> Refrescar
          </Button>
        </div>
        {loading ? (
          <div className="text-center">
            <Spinner color="primary" />
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <>
            <Table bordered striped hover responsive>
              <thead className="table-dark">
                <tr>
                  {filteredData.length > 0 &&
                    Object.keys(filteredData[0])
                      .filter((key) => key !== 'id' && key !== 'codigo') // Excluir claves si es necesario
                      .map((key) => (
                        <th
                          key={key}
                          onClick={() => requestSort(key)}
                          style={{ cursor: 'pointer' }}
                        >
                          {key.toUpperCase()}
                          {sortConfig.key === key ? (
                            sortConfig.direction === 'ascending' ? (
                              ' 🔼'
                            ) : (
                              ' 🔽'
                            )
                          ) : null}
                        </th>
                      ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id || item.codigo || Object.values(item)[0]}>
                    {Object.entries(item).map(([key, value]) => {
                      if (key === 'id' || key === 'codigo') return null; // Excluir claves si es necesario
                      return <td key={key}>{value}</td>;
                    })}
                    <td>
                      <Button
                        color="warning"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                          navigate(`${path}/edit/${item.id || item.codigo}`)
                        }
                        title="Editar"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => confirmDelete(item)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {/* Paginación */}
            {totalPages > 1 && (
              <Pagination aria-label="Page navigation example">
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink first onClick={() => paginate(1)} />
                </PaginationItem>
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink
                    previous
                    onClick={() => paginate(currentPage - 1)}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem
                    active={currentPage === index + 1}
                    key={index + 1}
                  >
                    <PaginationLink onClick={() => paginate(index + 1)}>
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem disabled={currentPage === totalPages}>
                  <PaginationLink
                    next
                    onClick={() => paginate(currentPage + 1)}
                  />
                </PaginationItem>
                <PaginationItem disabled={currentPage === totalPages}>
                  <PaginationLink last onClick={() => paginate(totalPages)} />
                </PaginationItem>
              </Pagination>
            )}
          </>
        )}
        {/* Modal de Confirmación de Eliminación */}
        <Modal isOpen={deleteModal} toggle={toggleDeleteModal}>
          <ModalHeader toggle={toggleDeleteModal}>
            Confirmar Eliminación
          </ModalHeader>
          <ModalBody>
            ¿Estás seguro de eliminar este registro?
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={deleteItem}>
              Eliminar
            </Button>{' '}
            <Button color="secondary" onClick={toggleDeleteModal}>
              Cancelar
            </Button>
          </ModalFooter>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default ListComponent;

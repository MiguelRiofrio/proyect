import React from 'react';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';
import { useNavigate } from 'react-router-dom';

const LoadingModal = ({ isOpen }) => {
  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} centered>
      <ModalBody>
        <div style={{ textAlign: 'center' }}>
          <p>Cargando datos del mapa...</p>
          <p>Por favor espere o presione "Cancelar" para regresar a la página principal.</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => navigate('/')}>Cancelar</Button>
      </ModalFooter>
    </Modal>
  );
};

export default LoadingModal;

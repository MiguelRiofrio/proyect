// src/components/RegisterPuertoModal.js

import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';
import RegisterPuerto from './RegisterPuerto';

const RegisterPuertoModal = ({ isOpen, toggle, onPuertoRegistrado }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Registrar Nuevo Puerto</ModalHeader>
      <ModalBody>
        <RegisterPuerto handleClose={toggle} onPuertoRegistrado={onPuertoRegistrado} />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RegisterPuertoModal;

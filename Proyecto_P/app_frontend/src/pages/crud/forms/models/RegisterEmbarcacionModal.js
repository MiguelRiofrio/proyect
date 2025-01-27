// src/components/RegisterEmbarcacionModal.js

import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';
import RegisterEmbarcacion from './RegisterEmbarcacion';

const RegisterEmbarcacionModal = ({ isOpen, toggle, onEmbarcacionRegistrada }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Registrar Nueva Embarcación</ModalHeader>
      <ModalBody>
        <RegisterEmbarcacion handleClose={toggle} onEmbarcacionRegistrada={onEmbarcacionRegistrada} />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RegisterEmbarcacionModal;

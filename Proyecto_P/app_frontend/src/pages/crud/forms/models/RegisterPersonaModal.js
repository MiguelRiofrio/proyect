// src/components/RegisterPersonaModal.js

import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from 'reactstrap';
import RegisterPersona from './RegisterPersona';

const RegisterPersonaModal = ({ isOpen, toggle, onPersonaRegistrada, rol }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Registrar Nueva Persona</ModalHeader>
      <ModalBody>
        <RegisterPersona handleClose={toggle} onPersonaRegistrada={onPersonaRegistrada} rol={rol} />
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default RegisterPersonaModal;

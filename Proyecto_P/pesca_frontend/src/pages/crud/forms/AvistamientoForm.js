import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';
import './css/Button.css'; // Importar el archivo CSS

const AvistamientoForm = ({ avistamientos, setAvistamientos, handleAvistamientoChange }) => {
  const [activeTab, setActiveTab] = useState('0');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // Función para eliminar un avistamiento
  const eliminarAvistamiento = (index) => {
    const nuevosAvistamientos = avistamientos.filter((_, i) => i !== index);
    setAvistamientos(nuevosAvistamientos);
    if (activeTab === `${index}` && nuevosAvistamientos.length > 0) {
      setActiveTab('0');
    } else if (nuevosAvistamientos.length === 0) {
      setActiveTab('');
    }
  };

  return (
    <>
      <Nav tabs>
        {avistamientos.map((avistamiento, index) => (
          <NavItem key={avistamiento.codigo_avistamiento}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Avistamiento {index + 1}{' '}
              <Button close aria-label="Cancel" className='close-button' onClick={() => eliminarAvistamiento(index)} />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {avistamientos.map((avistamiento, index) => (
          <TabPane key={avistamiento.codigo_avistamiento} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <tbody>
                <tr>
                  <td>
                    <label>Grupos de Avistamiento</label>
                    <Input
                      type="text"
                      name="grupos_avi_int"
                      value={avistamiento.grupos_avi_int || ''}
                      onChange={(e) => handleAvistamientoChange(avistamiento.codigo_avistamiento, e)}
                    />
                  </td>
                  <td>
                    <label>Nombre Científico</label>
                    <Input
                      type="text"
                      name="nombre_cientifico"
                      value={avistamiento.nombre_cientifico || ''}
                      onChange={(e) => handleAvistamientoChange(avistamiento.codigo_avistamiento, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Individuos Alimentándose</label>
                    <Input
                      type="number"
                      name="alimentandose"
                      value={avistamiento.alimentandose || 0}
                      onChange={(e) => handleAvistamientoChange(avistamiento.codigo_avistamiento, e)}
                    />
                  </td>
                  <td>
                    <label>Individuos Deambulando</label>
                    <Input
                      type="number"
                      name="deambulando"
                      value={avistamiento.deambulando || 0}
                      onChange={(e) => handleAvistamientoChange(avistamiento.codigo_avistamiento, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Individuos en Reposo</label>
                    <Input
                      type="number"
                      name="en_reposo"
                      value={avistamiento.en_reposo || 0}
                      onChange={(e) => handleAvistamientoChange(avistamiento.codigo_avistamiento, e)}
                    />
                  </td>
                  <td>
                    <label>Total de Individuos</label>
                    <Input
                      type="number"
                      name="total_individuos"
                      value={avistamiento.total_individuos || 0}
                      disabled
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default AvistamientoForm;


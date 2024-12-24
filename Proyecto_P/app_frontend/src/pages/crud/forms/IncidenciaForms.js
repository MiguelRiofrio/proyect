import React, { useState } from 'react';
import { Table, Input, Nav, NavItem, NavLink, TabContent, TabPane, Button } from 'reactstrap';
import classnames from 'classnames';

const IncidenciaForms = ({ incidencias, setIncidencias }) => {
  const [activeTab, setActiveTab] = useState('0');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const agregarIncidencia = () => {
    const nuevaIncidencia = {
      codigo_incidencia: Date.now(),
      herida_grave: 0,
      herida_leve: 0,
      muerto: 0,
      total_individuos: 0,
      observacion: '',
      detalles: [], // Lista para almacenar detalles por tipo (aves, mamíferos, tortugas, palangre)
    };
    setIncidencias([...incidencias, nuevaIncidencia]);
    setActiveTab(`${incidencias.length}`);
  };

  const agregarDetalle = (index, tipo) => {
    const nuevasIncidencias = incidencias.map((incidencia, i) => {
      if (i === index) {
        const detallesExistentes = incidencia.detalles;
  
        // Verificar la lógica de exclusividad
        if (['aves', 'mamiferos', 'tortugas'].includes(tipo)) {
          const yaExisteOtroTipo = detallesExistentes.some((detalle) =>
            ['aves', 'mamiferos', 'tortugas'].includes(detalle.tipo)
          );
          if (yaExisteOtroTipo) {
            alert('Solo se puede agregar un detalle entre aves, mamíferos o tortugas.');
            return incidencia;
          }
        }
  
        // Verificar la exclusividad de palangre
        if (tipo === 'palangre') {
          const yaExistePalangre = detallesExistentes.some((detalle) => detalle.tipo === 'palangre');
          if (yaExistePalangre) {
            alert('Solo se puede agregar un detalle de palangre.');
            return incidencia;
          }
        }
  
        // Agregar el nuevo detalle
        return {
          ...incidencia,
          detalles: [...detallesExistentes, { tipo, cantidad: 0 }],
        };
      }
      return incidencia;
    });
  
    setIncidencias(nuevasIncidencias);
  };
  

  const handleDetalleChange = (index, detalleIndex, e) => {
    const { name, value } = e.target;
    const nuevasIncidencias = incidencias.map((incidencia, i) => {
      if (i === index) {
        const nuevosDetalles = incidencia.detalles.map((detalle, j) => {
          if (j === detalleIndex) {
            return { ...detalle, [name]: value };
          }
          return detalle;
        });
        return { ...incidencia, detalles: nuevosDetalles };
      }
      return incidencia;
    });
    setIncidencias(nuevasIncidencias);
  };

  const eliminarDetalle = (index, detalleIndex) => {
    const nuevasIncidencias = incidencias.map((incidencia, i) => {
      if (i === index) {
        const nuevosDetalles = incidencia.detalles.filter((_, j) => j !== detalleIndex);
        return { ...incidencia, detalles: nuevosDetalles };
      }
      return incidencia;
    });
    setIncidencias(nuevasIncidencias);
  };

  const eliminarIncidencia = (index) => {
    const nuevasIncidencias = incidencias.filter((_, i) => i !== index);
    setIncidencias(nuevasIncidencias);
    if (activeTab === `${index}` && nuevasIncidencias.length > 0) {
      setActiveTab('0');
    } else if (nuevasIncidencias.length === 0) {
      setActiveTab('');
    }
  };

  const handleIncidenciaChange = (index, e) => {
    const { name, value } = e.target;
    const nuevasIncidencias = incidencias.map((incidencia, i) =>
      i === index ? { ...incidencia, [name]: value } : incidencia
    );
    setIncidencias(nuevasIncidencias);
  };

  return (
    <>
      <Button color="primary" onClick={agregarIncidencia} className="mb-3">
        Agregar Incidencia
      </Button>

      <Nav tabs>
        {incidencias.map((incidencia, index) => (
          <NavItem key={incidencia.codigo_incidencia}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Incidencia {index + 1}{' '}
              <Button close aria-label="Cancel" onClick={() => eliminarIncidencia(index)} />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {incidencias.map((incidencia, index) => (
          <TabPane key={incidencia.codigo_incidencia} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <tbody>
                <tr>
                  <td>
                    <label>Herida Grave</label>
                    <Input
                      type="number"
                      name="herida_grave"
                      value={incidencia.herida_grave || 0}
                      onChange={(e) => handleIncidenciaChange(index, e)}
                    />
                  </td>
                  <td>
                    <label>Herida Leve</label>
                    <Input
                      type="number"
                      name="herida_leve"
                      value={incidencia.herida_leve || 0}
                      onChange={(e) => handleIncidenciaChange(index, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Muerto</label>
                    <Input
                      type="number"
                      name="muerto"
                      value={incidencia.muerto || 0}
                      onChange={(e) => handleIncidenciaChange(index, e)}
                    />
                  </td>
                  <td>
                    <label>Total Individuos</label>
                    <Input
                      type="number"
                      name="total_individuos"
                      value={incidencia.total_individuos || 0}
                      onChange={(e) => handleIncidenciaChange(index, e)}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Observación</label>
                    <Input
                      type="textarea"
                      name="observacion"
                      value={incidencia.observacion || ''}
                      onChange={(e) => handleIncidenciaChange(index, e)}
                    />
                  </td>
                </tr>
              </tbody>
            </Table>

            <Button color="success" onClick={() => agregarDetalle(index, 'aves')} className="mb-3">
              Agregar Detalle de Aves
            </Button>
            <Button color="info" onClick={() => agregarDetalle(index, 'mamiferos')} className="mb-3">
              Agregar Detalle de Mamíferos
            </Button>
            <Button color="warning" onClick={() => agregarDetalle(index, 'tortugas')} className="mb-3">
              Agregar Detalle de Tortugas
            </Button>
            <Button color="primary" onClick={() => agregarDetalle(index, 'palangre')} className="mb-3">
              Agregar Detalle de Palangre
            </Button>
            {incidencia.detalles.map((detalle, detalleIndex) => (
              <Table bordered key={detalleIndex} className="mt-3">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{detalle.tipo}</td>
                    <td>
                      <Input
                        type="number"
                        name="cantidad"
                        value={detalle.cantidad || 0}
                        onChange={(e) => handleDetalleChange(index, detalleIndex, e)}
                      />
                    </td>
                    <td>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => eliminarDetalle(index, detalleIndex)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            ))}
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default IncidenciaForms;

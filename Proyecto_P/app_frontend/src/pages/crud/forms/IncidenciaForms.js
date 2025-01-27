import React from 'react';
import { Table, Input, Nav,NavItem,NavLink,TabContent, TabPane, Button, FormGroup, Label,} 
from 'reactstrap';
import classnames from 'classnames';

const IncidenciaForms = ({ incidencias, setIncidencias, especies = [] }) => {
  const [activeTab, setActiveTab] = React.useState('0');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const agregarIncidencia = () => {
    const nuevaIncidencia = {
      codigo_incidencia: Date.now(),
      especie: { codigo_especie: 0 }, // Inicializado como objeto
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
            return { ...detalle, [name]: parseInt(value, 10) || 0 };
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
      i === index
        ? {
            ...incidencia,
            [name]:
              name === 'especie'
                ? { codigo_especie: parseInt(value, 10) || 0 }
                : name === 'herida_grave' || name === 'herida_leve' || name === 'muerto'
                ? parseInt(value, 10) || 0
                : value,
          }
        : incidencia
    );

    // Actualizar el total_individuos automáticamente si cambian los campos relacionados
    const incidenciaActualizada = nuevasIncidencias[index];
    if (['herida_grave', 'herida_leve', 'muerto'].includes(name)) {
      incidenciaActualizada.total_individuos =
        (parseInt(incidenciaActualizada.herida_grave, 10) || 0) +
        (parseInt(incidenciaActualizada.herida_leve, 10) || 0) +
        (parseInt(incidenciaActualizada.muerto, 10) || 0);
      nuevasIncidencias[index] = incidenciaActualizada;
    }

    setIncidencias(nuevasIncidencias);
  };

  return (
    <>
      <Button color="dark" onClick={agregarIncidencia} className="mb-3">
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
                    <FormGroup>
                      <Label for={`especie-${index}`}>Especie</Label>
                      <Input
                        type="select"
                        name="especie"
                        id={`especie-${index}`}
                        value={incidencia.especie.codigo_especie}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                      >
                        <option value={0}>Seleccione una especie</option>
                        {especies.map((especie) => (
                          <option
                            key={especie.codigo_especie}
                            value={especie.codigo_especie}
                          >
                            {especie.nombre_cientifico} - {especie.nombre_comun} - {especie.especie}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Label for={`observacion-${index}`}>Observación</Label>
                      <Input
                        type="textarea"
                        name="observacion"
                        id={`observacion-${index}`}
                        value={incidencia.observacion || ''}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        placeholder="Ingrese observaciones"
                      />
                    </FormGroup>
                  </td>
                </tr>
                <tr>
                  <td>
                    <FormGroup>
                      <Label for={`herida_grave-${index}`}>Herida Grave</Label>
                      <Input
                        type="number"
                        name="herida_grave"
                        id={`herida_grave-${index}`}
                        value={incidencia.herida_grave || 0}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Label for={`herida_leve-${index}`}>Herida Leve</Label>
                      <Input
                        type="number"
                        name="herida_leve"
                        id={`herida_leve-${index}`}
                        value={incidencia.herida_leve || 0}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </td>
                </tr>
                <tr>
                  <td>
                    <FormGroup>
                      <Label for={`muerto-${index}`}>Muerto</Label>
                      <Input
                        type="number"
                        name="muerto"
                        id={`muerto-${index}`}
                        value={incidencia.muerto || 0}
                        onChange={(e) => handleIncidenciaChange(index, e)}
                        min={0}
                      />
                    </FormGroup>
                  </td>
                  <td>
                    <FormGroup>
                      <Label for={`total_individuos-${index}`}>Total Individuos</Label>
                      <Input
                        type="number"
                        name="total_individuos"
                        id={`total_individuos-${index}`}
                        value={incidencia.total_individuos || 0}
                        disabled
                      />
                    </FormGroup>
                  </td>
                </tr>
              </tbody>
            </Table>

            <div className="mb-3">
              <Button
                color="dark"
                onClick={() => agregarDetalle(index, 'aves')}
                className="mr-2"
              >
                Agregar Detalle de Aves
              </Button>
              <Button
                color="dark"
                onClick={() => agregarDetalle(index, 'mamiferos')}
                className="mr-2"
              >
                Agregar Detalle de Mamíferos
              </Button>
              <Button
                color="dark"
                onClick={() => agregarDetalle(index, 'tortugas')}
                className="mr-2"
              >
                Agregar Detalle de Tortugas
              </Button>
              <Button
                color="dark"
                onClick={() => agregarDetalle(index, 'palangre')}
              >
                Agregar Detalle de Palangre
              </Button>
            </div>

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
                    <td>{detalle.tipo.charAt(0).toUpperCase() + detalle.tipo.slice(1)}</td>
                    <td>
                      <Input
                        type="number"
                        name="cantidad"
                        value={detalle.cantidad || 0}
                        onChange={(e) => handleDetalleChange(index, detalleIndex, e)}
                        min={0}
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

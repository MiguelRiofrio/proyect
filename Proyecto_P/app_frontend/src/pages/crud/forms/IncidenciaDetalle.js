// Incidencia.js
import React from 'react';
import {
  Table,
  Input,
  Button,
  FormGroup,
  Label,
} from 'reactstrap';
import DetalleIncidencia from './DetalleIncidencia';

const Incidencia = ({
  incidencia,
  index,
  especies,
  onIncidenciaChange,
  onAgregarDetalle,
  onDetalleChange,
  onEliminarDetalle,
  onEliminarIncidencia,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onIncidenciaChange(index, name, value);
  };

  return (
    <>
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
          onClick={() => onAgregarDetalle(index, 'aves')}
          className="mr-2"
        >
          Agregar Detalle de Aves
        </Button>
        <Button
          color="dark"
          onClick={() => onAgregarDetalle(index, 'mamiferos')}
          className="mr-2"
        >
          Agregar Detalle de Mamíferos
        </Button>
        <Button
          color="dark"
          onClick={() => onAgregarDetalle(index, 'tortugas')}
          className="mr-2"
        >
          Agregar Detalle de Tortugas
        </Button>
        <Button
          color="dark"
          onClick={() => onAgregarDetalle(index, 'palangre')}
        >
          Agregar Detalle de Palangre
        </Button>
      </div>

      {incidencia.detalles.map((detalle, detalleIndex) => (
        <DetalleIncidencia
          key={detalleIndex}
          detalle={detalle}
          onChange={(name, value) => onDetalleChange(index, detalleIndex, name, value)}
          onEliminar={() => onEliminarDetalle(index, detalleIndex)}
        />
      ))}

      <Button
        color="danger"
        onClick={() => onEliminarIncidencia(index)}
        className="mt-3"
      >
        Eliminar Incidencia
      </Button>
    </>
  );
};

export default Incidencia;

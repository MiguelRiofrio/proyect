// LancePForms.jsx
import React from 'react';
import { Table, Input, Button } from 'reactstrap';

const renderDetalles = {
  palangre: (lance = {}, index, handleLanceChange, carnadas = []) => {
    const detalles = lance.detalles || {};
    const carnadasList = Array.isArray(detalles.carnadas) ? detalles.carnadas : [];

    return (
      <>
        <h5>Detalles Específicos del Lance - Palangre</h5>
        <Table bordered>
          <thead>
            <tr>
              <th>Tipo de Anzuelo</th>
              <th>Tamaño del Anzuelo</th>
              <th>Cantidad de Anzuelos</th>
              <th>Línea Madre (m)</th>
              <th>Profundidad del Anzuelo (m)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  type="text"
                  name="tipo_de_anzuelo"
                  value={detalles.tipo_de_anzuelo || 'N'}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.tipo_de_anzuelo', e.target.value)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="tamano_anzuelo"
                  value={detalles.tamano_anzuelo || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.tamano_anzuelo', parseFloat(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="cantidad_anzuelos"
                  value={detalles.cantidad_anzuelos || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.cantidad_anzuelos', parseInt(e.target.value, 10) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="linea_madre_metros"
                  value={detalles.linea_madre_metros || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.linea_madre_metros', parseFloat(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="profundidad_anzuelo_metros"
                  value={detalles.profundidad_anzuelo_metros || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.profundidad_anzuelo_metros', parseFloat(e.target.value) || 0)
                  }
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <h5>Detalles de Carnadas</h5>
        <Table bordered hover responsive className="table-striped text-center align-middle">
          <thead>
            <tr>
              <th>Nombre de Carnada</th>
              <th>Porcentaje de Carnada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {carnadasList.map((carnada, carnadaIndex) => (
              <tr key={carnada.codigo_tipo_carnada || `carnada-${carnadaIndex}`}>
                <td>
                  <Input
                    type="select"
                    value={carnada.codigo_tipo_carnada || ''}
                    onChange={(e) => {
                      const codigo = parseInt(e.target.value, 10);
                      const nombre = carnadas.find(c => c.codigo_tipo_carnada === codigo)?.nombre_carnada || 'Sin nombre';
                      const updatedCarnadas = [...carnadasList];
                      updatedCarnadas[carnadaIndex] = {
                        ...updatedCarnadas[carnadaIndex],
                        codigo_tipo_carnada: codigo,
                        nombre_carnada: nombre,
                      };
                      handleLanceChange(index, 'detalles.carnadas', updatedCarnadas);
                    }}
                  >
                    <option value="">Seleccione una carnada</option>
                    {carnadas.map((carnadaOption) => (
                      <option
                        key={`${carnadaOption.codigo_tipo_carnada}-${carnadaOption.nombre_carnada}`}
                        value={carnadaOption.codigo_tipo_carnada}
                      >
                        {carnadaOption.nombre_carnada}
                      </option>
                    ))}
                  </Input>
                </td>
                <td>
                  <Input
                    type="number"
                    name="porcentaje_carnada"
                    value={carnada.porcentaje_carnada || ''}
                    onChange={(e) => {
                      const porcentaje = parseFloat(e.target.value) || 0;
                      const updatedCarnadas = [...carnadasList];
                      updatedCarnadas[carnadaIndex] = {
                        ...updatedCarnadas[carnadaIndex],
                        porcentaje_carnada: porcentaje,
                      };
                      handleLanceChange(index, 'detalles.carnadas', updatedCarnadas);
                    }}
                  />
                </td>
                <td>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => {
                      const updatedCarnadas = carnadasList.filter((_, i) => i !== carnadaIndex);
                      handleLanceChange(index, 'detalles.carnadas', updatedCarnadas);
                    }}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3">
                <Button
                  color='primary'
                  onClick={() => {
                    const updatedCarnadas = [
                      ...carnadasList,
                      { codigo_tipo_carnada: '', porcentaje_carnada: 0 },
                    ];
                    handleLanceChange(index, 'detalles.carnadas', updatedCarnadas);
                  }}
                >
                  Agregar Carnada
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </>
    ); // Cambio aquí: reemplazar la coma con punto y coma
  }, // Cerrar la función y agregar coma para la siguiente propiedad

  cerco: (lance = {}, index, handleLanceChange) => {
    const detalles = lance.detalles || {};

    return (
      <>
        <h5>Detalles Específicos del Lance - Cerco</h5>
        <Table bordered>
          <thead>
            <tr>
              <th>Altura de la Red</th>
              <th>Longitud de la Red</th>
              <th>Malla Cabecero</th>
              <th>Malla Cuerpo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  type="number"
                  name="altura_red"
                  value={detalles.altura_red || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.altura_red', parseFloat(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="longitud_red"
                  value={detalles.longitud_red || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.longitud_red', parseFloat(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="malla_cabecero"
                  value={detalles.malla_cabecero || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.malla_cabecero', parseFloat(e.target.value) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="malla_cuerpo"
                  value={detalles.malla_cuerpo || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.malla_cuerpo', parseFloat(e.target.value) || 0)
                  }
                />
              </td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }, // Cerrar la función y agregar coma para la siguiente propiedad

  arrastre: (lance = {}, index, handleLanceChange) => {
    const detalles = lance.detalles || {};

    return (
      <>
        <h5>Detalles Específicos del Lance - Arrastre</h5>
        <Table bordered>
          <thead>
            <tr>
              <th>TED</th>
              <th>Copo</th>
              <th>Túnel</th>
              <th>Pico</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Input
                  type="checkbox"
                  name="ted"
                  checked={detalles.ted || false}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.ted', e.target.checked)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="copo"
                  value={detalles.copo || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.copo', parseInt(e.target.value, 10) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="tunel"
                  value={detalles.tunel || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.tunel', parseInt(e.target.value, 10) || 0)
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  name="pico"
                  value={detalles.pico || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles.pico', parseInt(e.target.value, 10) || 0)
                  }
                />
              </td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }, // Cerrar la función
};

export default renderDetalles;

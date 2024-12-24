

import { Table, Input, Button } from 'reactstrap';

const renderDetalles = {
  Palangre: (lance = {}, index, handleLanceChange, carnadas = []) => {
    const detalles = lance.detalles || {};
    const palangre = detalles.palangre || {};
    const carnadasList = Array.isArray(palangre.carnadas) ? palangre.carnadas : [];

    return (
      <>
        <h5>Detalles Específicos del Lance</h5>
        <Table bordered>
          <thead>
            <tr>
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
                  type="number"
                  value={palangre.tamano_anzuelo || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles', {
                      ...detalles,
                      palangre: {
                        ...palangre,
                        tamano_anzuelo: parseFloat(e.target.value),
                      },
                    })
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  value={palangre.cantidad_anzuelos || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles', {
                      ...detalles,
                      palangre: {
                        ...palangre,
                        cantidad_anzuelos: parseInt(e.target.value, 10),
                      },
                    })
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  value={palangre.linea_madre_metros || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles', {
                      ...detalles,
                      palangre: {
                        ...palangre,
                        linea_madre_metros: parseFloat(e.target.value),
                      },
                    })
                  }
                />
              </td>
              <td>
                <Input
                  type="number"
                  value={palangre.profundidad_anzuelo_metros || ''}
                  onChange={(e) =>
                    handleLanceChange(index, 'detalles', {
                      ...detalles,
                      palangre: {
                        ...palangre,
                        profundidad_anzuelo_metros: parseFloat(e.target.value),
                      },
                    })
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
              <tr key={carnada.codigo_carnada || `carnada-${carnadaIndex}`}>
                <td>
                  <Input
                    type="select"
                    value={carnada.codigo_carnada || ''}
                    onChange={(e) => {
                      const updatedCarnadas = [...carnadasList];
                      updatedCarnadas[carnadaIndex] = {
                        ...updatedCarnadas[carnadaIndex],
                        codigo_carnada: parseInt(e.target.value, 10),
                        nombre_carnada: carnadas.find(
                          (c) => c.codigo_carnada === parseInt(e.target.value, 10)
                        )?.nombre_carnada,
                      };
                      handleLanceChange(index, 'detalles', {
                        ...detalles,
                        palangre: {
                          ...palangre,
                          carnadas: updatedCarnadas,
                        },
                      });
                    }}
                  >
                    <option value="">Seleccione una especie</option>
                    {carnadas.map((carnadaOption, index) => (
                      <option
                        key={`${carnadaOption.codigo_carnada}-${index}`} // Uso de key único
                        value={carnadaOption.codigo_carnada}
                      >
                        {carnadaOption.nombre_carnada}
                      </option>
                    ))}
                  </Input>
                </td>
                <td>
                  <Input
                    type="number"
                    value={carnada.porcentaje_carnada || ''}
                    onChange={(e) => {
                      const updatedCarnadas = [...carnadasList];
                      updatedCarnadas[carnadaIndex] = {
                        ...updatedCarnadas[carnadaIndex],
                        porcentaje_carnada: parseFloat(e.target.value),
                      };
                      handleLanceChange(index, 'detalles', {
                        ...detalles,
                        palangre: {
                          ...palangre,
                          carnadas: updatedCarnadas,
                        },
                      });
                    }}
                  />
                </td>
                <td>
                  <Button
                    color="danger"
                    size="sm"
                    onClick={() => {
                      const updatedCarnadas = carnadasList.filter((_, i) => i !== carnadaIndex);
                      handleLanceChange(index, 'detalles', {
                        ...detalles,
                        palangre: {
                          ...palangre,
                          carnadas: updatedCarnadas,
                        },
                      });
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
                  onClick={() => {
                    const updatedCarnadas = [
                      ...carnadasList,
                      { codigo_carnada: '', nombre_carnada: '', porcentaje_carnada: 0 },
                    ];
                    handleLanceChange(index, 'detalles', {
                      ...detalles,
                      palangre: {
                        ...palangre,
                        carnadas: updatedCarnadas,
                      },
                    });
                  }}
                >
                  Agregar Carnada
                </Button>
              </td>
            </tr>
          </tbody>

        </Table>
      </>
    );
  },
  Cerco: (lance = {}, index, handleLanceChange) => {
    return <h1>Detalles Cerco</h1>;
  },
  Arrastre: (lance = {}, index, handleLanceChange) => {
    return <h1>Detalles Arrastre</h1>;
  },
};

export default renderDetalles;

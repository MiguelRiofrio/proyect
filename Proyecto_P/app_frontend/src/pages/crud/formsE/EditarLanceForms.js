import React, { useState, useMemo } from 'react';
import {
  Table,
  Input,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Button
} from 'reactstrap';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import CapturaForms from '../forms/CapturaForms';
import AvistamientoForms from '../forms/AvistamientoForms';
import IncidenciaForms from '../forms/IncidenciaForms';
import renderDetalles from './EditarLanceDForms';

const EditarLanceForms = ({
  lances,
  setLances,
  especies,
  tipo,
  carnadas,
  isFormValid,
  fecha_salida,
  fecha_entrada
}) => {
  /**
   * activeTab se almacena como string para usarse en Nav/TabContent.
   * Por defecto, si hay lances, se comienza con la pestaña "0".
   */
  const [activeTab, setActiveTab] = useState('0');

  /**
   * Ordenar los lances por numero_lance de forma numérica antes de mapearlos.
   * Se usa useMemo para no recalcularlo en cada render si 'lances' no cambia.
   */
  const sortedLances = useMemo(() => {
    return [...lances].sort((a, b) => {
      // Manejar undefined, null, etc. con un valor por defecto
      const na = a.numero_lance || 0;
      const nb = b.numero_lance || 0;
      return na - nb;
    });
  }, [lances]);

  /**
   * Agrega un nuevo lance vacío (opcional).
   */
  const nuevoLance = () => {
    if (!isFormValid) {
      toast.warn("Por favor, completa los campos obligatorios antes de añadir un lance.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Para el nuevo lance, numero_lance será el siguiente entero
    // (o podrías dejarlo en 0 y pedir al usuario que lo asigne).
    const maxNumero = Math.max(...lances.map((l) => l.numero_lance || 0), 0);
    const nuevo = {
      codigo_lance: '',
      numero_lance: maxNumero + 1,
      calado_fecha: '',
      calado_hora: '',
      profundidad_suelo_marino: 0,
      detalles: (() => {
        switch ((tipo || '').toLowerCase()) {
          case 'palangre':
            return {
              Tipo_anzuelo: 'N',
              tamano_anzuelo: 0.0,
              cantidad_anzuelos: 0,
              linea_madre_metros: 0.0,
              profundidad_anzuelo_metros: 0.0,
              carnadas: [],
            };
          case 'arrastre':
            return {
              ted: false,
              copo: 0,
              tunel: 0,
              pico: 0,
            };
          case 'cerco':
            return {
              altura_red: 0.0,
              longitud_red: 0.0,
              malla_cabecero: 0.0,
              malla_cuerpo: 0.0,
            };
          default:
            return {};
        }
      })(),
      coordenadas: {
        latitud_ns: '',
        latitud_grados: 0,
        latitud_minutos: 0,
        longitud_w: 'W',
        longitud_grados: 0,
        longitud_minutos: 0,
      },
      capturas: [],
      avistamientos: [],
      incidencias: [],
    };

    setLances([...lances, nuevo]);
    // Al agregar se reordenará en sortedLances, 
    // pero podemos intentar mover la pestaña al final (que sería el nuevo lance).
    // Para eso, usamos la longitud actual de 'lances'.
    setActiveTab(String(lances.length));
    toast.success("Lance vacío añadido.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  /**
   * Elimina un lance del array.
   */
  const eliminarLance = (indexInSorted) => {
    const confirmacion = window.confirm("¿Estás seguro de eliminar este lance?");
    if (confirmacion) {
      // sortedLances[indexInSorted] es el lance a eliminar.
      const lanceAEliminar = sortedLances[indexInSorted];
      // Buscar su posición en lances original
      const originalIndex = lances.indexOf(lanceAEliminar);
      if (originalIndex >= 0) {
        const nuevos = [...lances];
        nuevos.splice(originalIndex, 1);
        setLances(nuevos);
      }

      // Ajustar pestaña activa
      if (activeTab === String(indexInSorted) && lances.length - 1 > 0) {
        setActiveTab('0');
      } else if (lances.length - 1 === 0) {
        setActiveTab('');
      }
      toast.info("Lance eliminado.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  /**
   * Cambia la pestaña activa.
   */
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  /**
   * Maneja cambios en los lances (field path).
   */
  const handleLanceChange = (lanceIndexInSorted, path, value) => {
    // localizamos el lance en 'lances' original
    const lanceObj = sortedLances[lanceIndexInSorted];
    const originalIndex = lances.indexOf(lanceObj);
    if (originalIndex < 0) return;

    const nuevos = [...lances];
    const fields = path.split('.');
    let current = nuevos[originalIndex];

    for (let i = 0; i < fields.length - 1; i++) {
      if (!current[fields[i]]) current[fields[i]] = {};
      current = current[fields[i]];
    }
    current[fields[fields.length - 1]] = value;
    setLances(nuevos);
  };

  return (
    <>
      <Button color="dark" onClick={nuevoLance} className="mb-3">
        Agregar Lance
      </Button>

      <Nav tabs>
        {sortedLances.map((lance, sortedIndex) => (
          <NavItem key={`lance-tab-${sortedIndex}`}>
            <NavLink
              className={classnames({ active: activeTab === String(sortedIndex) })}
              onClick={() => toggleTab(String(sortedIndex))}
            >
              {`Lance #${lance.numero_lance || (sortedIndex + 1)}`}
              <Button
                close
                aria-label="Cancel"
                onClick={(e) => {
                  e.stopPropagation();
                  eliminarLance(sortedIndex);
                }}
                className="ms-2"
              />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab} className="mt-3">
        {sortedLances.map((lance, sortedIndex) => (
          <TabPane key={`lance-pane-${sortedIndex}`} tabId={String(sortedIndex)}>
            <Table bordered>
              <thead>
                <tr>
                  <th colSpan={3} className="text-center">Detalles del Lance</th>
                </tr>
                <tr>
                  <th>Fecha Calado</th>
                  <th>Hora Calado</th>
                  <th>Profundidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="date"
                      value={lance.calado_fecha || ''}
                      max={fecha_entrada || undefined}
                      min={fecha_salida || undefined}
                      onChange={(e) =>
                        handleLanceChange(sortedIndex, 'calado_fecha', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="time"
                      value={lance.calado_hora || ''}
                      onChange={(e) =>
                        handleLanceChange(sortedIndex, 'calado_hora', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={lance.profundidad_suelo_marino || 0}
                      onChange={(e) =>
                        handleLanceChange(
                          sortedIndex,
                          'profundidad_suelo_marino',
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </Table>

            <Table bordered>
              <thead>
                <tr>
                  <th colSpan={6} className="text-center">Coordenadas</th>
                </tr>
                <tr>
                  <th>Lat N/S</th>
                  <th>Lat Grados</th>
                  <th>Lat Minutos</th>
                  <th>Lon W/E</th>
                  <th>Lon Grados</th>
                  <th>Lon Minutos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="select"
                      value={lance.coordenadas.latitud_ns || ''}
                      onChange={(e) =>
                        handleLanceChange(sortedIndex, 'coordenadas.latitud_ns', e.target.value)
                      }
                    >
                      <option value="">Seleccione</option>
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={lance.coordenadas.latitud_grados || 0}
                      onChange={(e) =>
                        handleLanceChange(
                          sortedIndex,
                          'coordenadas.latitud_grados',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={lance.coordenadas.latitud_minutos || 0}
                      onChange={(e) =>
                        handleLanceChange(
                          sortedIndex,
                          'coordenadas.latitud_minutos',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="select"
                      value={lance.coordenadas.longitud_w || ''}
                      onChange={(e) =>
                        handleLanceChange(sortedIndex, 'coordenadas.longitud_w', e.target.value)
                      }
                    >
                      <option value="W">W</option>
                      <option value="E">E</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={lance.coordenadas.longitud_grados || 0}
                      onChange={(e) =>
                        handleLanceChange(
                          sortedIndex,
                          'coordenadas.longitud_grados',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={lance.coordenadas.longitud_minutos || 0}
                      onChange={(e) =>
                        handleLanceChange(
                          sortedIndex,
                          'coordenadas.longitud_minutos',
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </td>
                </tr>
              </tbody>
            </Table>

            {/* renderDetalles si es Palangre, Arrastre o Cerco */}
            {tipo &&
              renderDetalles[tipo.toLowerCase()] &&
              renderDetalles[tipo.toLowerCase()](
                lance,
                sortedIndex,
                handleLanceChange,
                carnadas
              )}

            <CapturaForms
              capturas={lance.capturas}
              setCapturas={(nuevasCapturas) =>
                handleLanceChange(sortedIndex, 'capturas', nuevasCapturas)
              }
              especies={especies}
              codigo_lance={lance.codigo_lance}
            />

            <AvistamientoForms
              avistamientos={lance.avistamientos}
              setAvistamientos={(nuevosAvistamientos) =>
                handleLanceChange(sortedIndex, 'avistamientos', nuevosAvistamientos)
              }
              especies={especies}
              codigo_lance={lance.codigo_lance}
            />

            <IncidenciaForms
              incidencias={lance.incidencias}
              setIncidencias={(nuevasIncidencias) =>
                handleLanceChange(sortedIndex, 'incidencias', nuevasIncidencias)
              }
              especies={especies}
              codigo_lance={lance.codigo_lance}
            />
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default EditarLanceForms;

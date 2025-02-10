// LanceForms.jsx
import React, { useState } from 'react';
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
import { toast } from 'react-toastify'; // Importar toast
import CapturaForms from './CapturaForms';
import AvistamientoForms from './AvistamientoForms';
import IncidenciaForms from './IncidenciaForms';
import renderDetalles from './LancePForms';

const LanceForms = ({ 
  lances, 
  setLances, 
  especies, 
  tipo, 
  carnadas, 
  codigoActividad,
  isFormValid, // Recibe la prop isFormValid
  fecha_salida,   // Recibir fecha_salida
  fecha_entrada   // Recibir fecha_entrada
}) => {
  const [activeTab, setActiveTab] = useState('0');

  const agregarLance = () => {
    if (!isFormValid) { // Verificar si el formulario es válido
      toast.warn("Por favor, completa todos los campos requeridos antes de añadir lances.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    // Extrae el número más alto de los códigos existentes
    const numerosExistentes = lances.map((lance) => {
      const match = lance.codigo_lance.match(/-L-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const nuevoNumero = Math.max(0, ...numerosExistentes) + 1;
    const codigo_lance = `${codigoActividad}-L-${nuevoNumero}`;

    let detalles = {};
    switch (tipo.toLowerCase()) { // Asegurar que 'tipo' esté en minúsculas
      case 'palangre':
        detalles = {
          Tipo_anzuelo: 'N', // Valor predeterminado según el modelo
          tamano_anzuelo: 0.0,
          cantidad_anzuelos: 0,
          linea_madre_metros: 0.0,
          profundidad_anzuelo_metros: 0.0,
          carnadas: [], // Array de objetos { codigo_tipo_carnada, porcentaje_carnada }
        };
        break;

      case 'arrastre':
        detalles = {
          ted: false,
          copo: 0,
          tunel: 0,
          pico: 0,
        };
        break;

      case 'cerco':
        detalles = {
          altura_red: 0.0,
          longitud_red: 0.0,
          malla_cabecero: 0.0,
          malla_cuerpo: 0.0,
        };
        break;

      default:
        detalles = {}; // Manejar otros tipos si es necesario
    }

    const nuevoLance = {
      codigo_lance,
      numero_lance: nuevoNumero,
      calado_fecha: '',
      calado_hora: '',
      profundidad_suelo_marino: 0,
      detalles: detalles, // Asignar el objeto plano
      coordenadas: { // Asegurarse de que las coordenadas estén presentes
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

    setLances([...lances, nuevoLance]);
    setActiveTab(`${lances.length}`);
    toast.success("Lance agregado exitosamente!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      // Opcional: Podrías querer notificar al usuario al cambiar de pestaña
    }
  };

  const eliminarLance = (index) => {
    const confirmacion = window.confirm('¿Estás seguro de que deseas eliminar este lance?');
    if (confirmacion) {
      const nuevosLances = lances.filter((_, i) => i !== index);
      setLances(nuevosLances);
      if (activeTab === `${index}` && nuevosLances.length > 0) {
        setActiveTab('0');
      } else if (nuevosLances.length === 0) {
        setActiveTab('');
      }
      toast.info("Lance eliminado.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleLanceChange = (index, fieldPath, value) => {
    const nuevosLances = [...lances];
    const fields = fieldPath.split('.'); // Permite rutas como 'detalles.tamano_anzuelo'

    let current = nuevosLances[index];
    for (let i = 0; i < fields.length - 1; i++) {
      if (!current[fields[i]]) current[fields[i]] = {};
      current = current[fields[i]];
    }
    current[fields[fields.length - 1]] = value;

    setLances(nuevosLances);
  };

  return (
    <>
      <Button 
        color="dark" 
        onClick={agregarLance} 
        className="mb-3"
      >
        Agregar Lance
      </Button>
      
      <Nav tabs>
        {lances.map((lance, index) => (
          <NavItem key={lance.codigo_lance}>
            <NavLink
              className={classnames({ active: activeTab === `${index}` })}
              onClick={() => toggle(`${index}`)}
            >
              Lance {lance.numero_lance}
              <Button 
                close 
                aria-label="Cancel" 
                onClick={() => eliminarLance(index)} 
                className="ms-2" // Añadir margen izquierdo para separar el botón del texto
              />
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        {lances.map((lance, index) => (
          <TabPane key={lance.codigo_lance} tabId={`${index}`}>
            <Table bordered className="mt-3">
              <thead>
                <tr>
                  <th colSpan={6} className="text-center">Detalles del Lance</th>
                </tr>
                <tr>
                  <th colSpan="2">Fecha de Calado</th>
                  <th colSpan="2">Hora de Calado</th>
                  <th colSpan="2">Profundidad del Suelo Marino</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2">
                    <Input
                      type="date"
                      name="calado_fecha"
                      value={lance.calado_fecha || ''}
                      onChange={(e) => handleLanceChange(index, 'calado_fecha', e.target.value)}
                      max={fecha_entrada || undefined}
                      min={fecha_salida || undefined}
                    />
                  </td>
                  <td colSpan="2">
                    <Input
                      type="time"
                      name="calado_hora"
                      value={lance.calado_hora || ''}
                      onChange={(e) => handleLanceChange(index, 'calado_hora', e.target.value)}
                    />
                  </td>
                  <td colSpan="2">
                    <Input
                      type="number"
                      name="profundidad_suelo_marino"
                      value={lance.profundidad_suelo_marino || ''}
                      onChange={(e) => handleLanceChange(index, 'profundidad_suelo_marino', parseInt(e.target.value, 10) || 0)}
                    />
                  </td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th colSpan="6" className="text-center">Coordenadas</th>
                </tr>
                <tr>
                  <th>Latitud (N/S)</th>
                  <th>Grados</th>
                  <th>Minutos</th>
                  <th>Grados</th>
                  <th>Minutos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Input
                      type="select"
                      name="latitud_ns"
                      value={lance.coordenadas.latitud_ns || ''}
                      onChange={(e) => handleLanceChange(index, 'coordenadas.latitud_ns', e.target.value)}
                    >
                      <option value="">Seleccione</option>
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </Input>
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="latitud_grados"
                      value={lance.coordenadas.latitud_grados || ''}
                      min="0"  
                      max="90"  
                      onChange={(e) => handleLanceChange(index, 'coordenadas.latitud_grados', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="latitud_minutos"
                      value={lance.coordenadas.latitud_minutos || ''}
                      min="0"  
                      max="60" 
                      onChange={(e) => handleLanceChange(index, 'coordenadas.latitud_minutos', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="longitud_grados"
                      min="0"  
                      max="90" 
                      value={lance.coordenadas.longitud_grados || ''}
                      onChange={(e) => handleLanceChange(index, 'coordenadas.longitud_grados', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      name="longitud_minutos"
                      value={lance.coordenadas.longitud_minutos || ''}
                      min="0"  
                      max="60" 
                      onChange={(e) => handleLanceChange(index, 'coordenadas.longitud_minutos', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                </tr>
              </tbody>            
            </Table>
          
            {tipo && renderDetalles[tipo.toLowerCase()] && renderDetalles[tipo.toLowerCase()](lance, index, handleLanceChange, carnadas)}

            <CapturaForms
              capturas={lance.capturas}
              setCapturas={(nuevasCapturas) => {
                handleLanceChange(index, 'capturas', nuevasCapturas);
              }}
              especies={especies}
              codigo_lance={lance.codigo_lance} // Renombrar a codigo_lance
              />
            <AvistamientoForms
              avistamientos={lance.avistamientos}
              setAvistamientos={(nuevosAvistamientos) => {
                handleLanceChange(index, 'avistamientos', nuevosAvistamientos);
              }}
              especies={especies}
              codigo_lance={lance.codigo_lance} // Renombrar a codigo_lance
            />
            <IncidenciaForms
              incidencias={lance.incidencias}
              setIncidencias={(nuevasIncidencias) => {
                handleLanceChange(index, 'incidencias', nuevasIncidencias);
              }}
              especies={especies}
              codigo_lance={lance.codigo_lance} // Renombrar a codigo_lance
            />
          </TabPane>
        ))}
      </TabContent>
    </>
  );
};

export default LanceForms;

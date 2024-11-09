import React, { useState } from 'react';
import { Button, Alert, Nav, NavItem, NavLink, TabContent, TabPane ,Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import classnames from 'classnames';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa'; // Usa el icono de "plus" de react-icons
import { useNavigate } from 'react-router-dom';


// Importar formularios
import ActividadForm from './forms/ActividadForm';
import LanceForm from './forms/LanceForm';
import CapturaForm from './forms/CapturaForm';
import AvistamientoForm from './forms/AvistamientoForm';
import IncidenciaForm from './forms/IncidenciaForm';
const AgregarActividadPesquera = () => {
  
  const [actividad, setActividad] = useState({
    codigo_de_ingreso: '',     // VARCHAR(50) PRIMARY KEY
    puerto_de_salida: '',      // VARCHAR(100)
    dia: 0,                   // INT
    mes: 0,                   // INT
    ano: 0,                   // INT
    puerto_de_entrada: '',     // VARCHAR(100)
    dia_entrada: 0,           // INT
    mes_entrada: 0,           // INT
    ano_entrada: 0,           // INT
    observador: '',            // VARCHAR(100)
    embarcacion: '',           // VARCHAR(100)
    armador: '',               // VARCHAR(100)
    capitan_de_pesca: '',      // VARCHAR(100)
    matricula: '',             // VARCHAR(50)
    tipo_de_palangre: '',      // VARCHAR(50)
    tipo_de_flota: '',         // VARCHAR(50)
    pesca_objetivo: '' 
  });

  const [lances, setLances] = useState([]);
  const [capturas, setCapturas] = useState([]);
  const [avistamientos, setAvistamientos] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [lanceCreado, setLanceCreado] = useState(false); // Estado para saber si el lance fue creado
  
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const toggleModal = () => setModalOpen(!modalOpen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setActividad({ ...actividad, [name]: value });
    
  };

  // Función para agregar un nuevo lance
  const addLance = () => {
   
    if (!actividad.codigo_de_ingreso) {
      setModalOpen(true); // Abre el modal
      return;
    }
    const lanceCount = lances.length + 1;
    const newLance = {
      codigo_lance: `${actividad.codigo_de_ingreso}-L${lanceCount}`,  // Código generado a partir de actividad
      codigo_de_ingreso: actividad.codigo_de_ingreso,                 // Código de ingreso
      faena: '1',                                                     // Faena (puedes actualizar el valor más tarde)
      lance: lanceCount,                                              // Número del lance
  
      // Calado inicial
      calado_inicial_dia: 0,                                          // INT
      calado_inicial_mes: 0,                                          // INT
      calado_inicial_ano: 0,                                          // INT
      calado_inicial_hora: '00:00',                                        // TIME
  
      // Latitud
      latitud_ns: '',                                                 // CHAR(1)
      latitud_grados: 0,                                              // INT
      latitud_minutos: 0.0,                                           // FLOAT
  
      // Longitud
      longitud_w: '',                                                 // CHAR(1)
      longitud_grados: 0,                                             // INT
      longitud_minutos: 0.0,                                          // FLOAT
  
      // Carnadas (1 a 5)
      nombre_cientifico_1: '',                                        // VARCHAR(100)
      porcentaje_carnada_1: 0.00,                                     // DECIMAL(5,2)
      nombre_cientifico_2: '',                                        // VARCHAR(100)
      porcentaje_carnada_2: 0.00,                                     // DECIMAL(5,2)
      nombre_cientifico_3: '',                                        // VARCHAR(100)
      porcentaje_carnada_3: 0.00,                                     // DECIMAL(5,2)
      
      // Datos de anzuelo y línea
      tipo_anzuelo: '',                                               // VARCHAR(100)
      tamano_anzuelo: 0.00,                                           // DECIMAL(5,2)
      cantidad_anzuelos: 0,                                           // INT
      linea_madre_metros: 0.00,                                       // DECIMAL(7,2)
      profundidad_anzuelo_metros: 0.00                                // DECIMAL(7,2)
    };
    setLances([...lances, newLance]);
    setLanceCreado(true); // Cambiar el estado para ocultar el botón

  };
  // Función para agregar capturas
  const addCaptura = (codigo_lance) => {
    const capturaCount = capturas.filter(c => c.codigo_lance === codigo_lance).length + 1;
    const newCaptura = {
      codigo_captura: `${codigo_lance}-C${capturaCount}`,   // Código de la captura
      codigo_lance,                                        // Código del lance relacionado
      taxa: '',                                            // Taxa (Categoría de clasificación)
      genero: '',                                          // Género
      especie: '',                                         // Especie
      nombre_cientifico: '',                               // Nombre científico
      nombre_comun: '',                                    // Nombre común
      individuos_retenidos: 0,                             // Número de individuos retenidos
      individuos_descarte: 0,                              // Número de individuos descartados
      total_individuos: 0,                                 // Total de individuos (retenidos + descartados)
      peso_retenido: 0.00,                                 // Peso de individuos retenidos
      peso_descarte: 0.00,                                 // Peso de individuos descartados
      total_peso_lb: 0.00     
      };
    setCapturas([...capturas, newCaptura]);
  };

  // Función para agregar avistamientos
  const addAvistamiento = (codigo_lance) => {
    const avistamientoCount = avistamientos.filter(a => a.codigo_lance === codigo_lance).length + 1;
    const newAvistamiento = {
      codigo_avistamiento: `${codigo_lance}-A${avistamientoCount}`,
      codigo_lance,
      grupos_avi_int: '',        // Inicializado como una cadena vacía
      nombre_cientifico: '',     // Inicializado como una cadena vacía
      alimentandose: 0,          // Inicializado como 0
      deambulando: 0,            // Inicializado como 0
      en_reposo: 0,              // Inicializado como 0
      total_individuos: 0        // Inicializado como 0 (calculado después)
    };
    setAvistamientos([...avistamientos, newAvistamiento]);
  };
  // Función para agregar incidencias
  const addIncidencia = (codigo_lance) => {
    const incidenciaCount = incidencias.filter(i => i.codigo_lance === codigo_lance).length + 1;
    const newIncidencia = {
      codigo_incidencia: `${codigo_lance}-I${incidenciaCount}`,   // Código único de la incidencia
      codigo_lance,                                               // Código del lance relacionado
      grupos_avi_int: '',                                         // Grupos de avistamiento
      nombre_cientifico: '',                                      // Nombre científico del animal afectado
      herida_grave: 0,                                            // Número de animales con heridas graves
      herida_leve: 0,                                             // Número de animales con heridas leves
      muerto: 0,                                                  // Número de animales muertos
      aves_pico: 0,                                               // Número de aves con heridas en el pico
      aves_patas: 0,                                              // Número de aves con heridas en las patas
      aves_alas: 0,                                               // Número de aves con heridas en las alas
      mamiferos_hocico: 0,                                         // Número de mamíferos con heridas en el hocico
      mamiferos_cuello: 0,                                         // Número de mamíferos con heridas en el cuello
      mamiferos_cuerpo: 0,                                         // Número de mamíferos con heridas en el cuerpo
      tortugas_pico: 0,                                            // Número de tortugas con heridas en el pico
      tortugas_cuerpo: 0,                                          // Número de tortugas con heridas en el cuerpo
      tortugas_aleta: 0,                                           // Número de tortugas con heridas en las aletas
      palangre_orinque: 0,                                         // Daños en el orinque del palangre
      palangre_reinal: 0,                                          // Daños en el reinal del palangre
      palangre_anzuelo: 0,                                         // Daños en los anzuelos del palangre
      palangre_linea_madre: 0,                                     // Daños en la línea madre del palangre
      total_individuos: 0,                                         // Total de individuos afectados (calculado automáticamente)
      observacion: ''  
    };
    setIncidencias([...incidencias, newIncidencia]);
  };

  // Función para manejar cambios en las capturas
  const handleLanceChange = (codigo_lance, e) => {
    const { name, value } = e.target;
    const updatedLances = lances.map(lance => 
      lance.codigo_lance === codigo_lance ? { ...lance, [name]: value } : lance
    );
    setLances(updatedLances);
    setLanceCreado(true); // Cambia el estado cuando el lance es guardado

  };

  // Función para manejar cambios en las capturas
  const handleCapturaChange = (codigo_captura, e) => {
    const { name, value } = e.target;
    const updatedCapturas = capturas.map((captura) => {
      if (captura.codigo_captura === codigo_captura) {
        const updatedCaptura = { ...captura, [name]: value };
        // Calcular el total de individuos
        updatedCaptura.total_individuos = parseInt(updatedCaptura.individuos_retenidos || 0, 10) + 
                                          parseInt(updatedCaptura.individuos_descarte || 0, 10);
        // Calcular el total de peso
        updatedCaptura.total_peso_lb = parseFloat(updatedCaptura.peso_retenido || 0) + 
                                       parseFloat(updatedCaptura.peso_descarte || 0);
        return updatedCaptura;
      }
      return captura;
    });
    setCapturas(updatedCapturas);
  };
  
  // Función para manejar cambios en los avistamientos
  const handleAvistamientoChange = (codigo_avistamiento, e) => {
    const { name, value } = e.target;
    const updatedAvistamientos = avistamientos.map((avistamiento) => {
      if (avistamiento.codigo_avistamiento === codigo_avistamiento) {
        const updatedAvistamiento = { ...avistamiento, [name]: value };
        // Calcular el total de individuos
        updatedAvistamiento.total_individuos = parseInt(updatedAvistamiento.alimentandose || 0, 10) +
                                               parseInt(updatedAvistamiento.deambulando || 0, 10) +
                                               parseInt(updatedAvistamiento.en_reposo || 0, 10);
        return updatedAvistamiento;
      }
      return avistamiento;
    });
    setAvistamientos(updatedAvistamientos);
  };
  
  // Función para manejar cambios en las incidencias
  const handleIncidenciaChange = (codigo_incidencia, e) => {
    const { name, value } = e.target;
    const updatedIncidencias = incidencias.map((incidencia) =>
      incidencia.codigo_incidencia === codigo_incidencia
        ? {
            ...incidencia,
            [name]: value,
            total_individuos:
              parseInt(incidencia.herida_grave || 0, 10) +
              parseInt(incidencia.herida_leve || 0, 10) +
              parseInt(incidencia.muerto || 0, 10),
          }
        : incidencia
    );
    setIncidencias(updatedIncidencias);
  };

  // Función para enviar la actividad y los lances
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actividad.codigo_de_ingreso ) {
      alert("Faltan datos obligatorios de la actividad pesquera.");
      return;
    }
    try {
      const actividadResponse = await axios.post('http://localhost:8000/api/actividad-pesquera/', actividad);
      console.log(actividad); // o el objeto que estés enviando

      const actividadGuardada = actividadResponse.data;

      const lancesToSubmit = lances.map(lance => ({
        ...lance,
        codigo_de_ingreso: actividadGuardada.codigo_de_ingreso,
      }));

      for (const lance of lancesToSubmit) {
         await axios.post('http://localhost:8000/api/lance/', lance);

        const capturasToSubmit = capturas.filter(c => c.codigo_lance === lance.codigo_lance);
        for (const captura of capturasToSubmit) {
          await axios.post('http://localhost:8000/api/datos-captura/', captura);
        }

        const incidenciasToSubmit = incidencias.filter(i => i.codigo_lance === lance.codigo_lance);
        for (const incidencia of incidenciasToSubmit) {
          await axios.post('http://localhost:8000/api/incidencia/', incidencia);
        }

        const avistamientosToSubmit = avistamientos.filter(a => a.codigo_lance === lance.codigo_lance);
        for (const avistamiento of avistamientosToSubmit) {
          await axios.post('http://localhost:8000/api/avistamiento/', avistamiento);
        }
      }

      setMensajeExito('Actividad pesquera, lances, capturas, incidencias y avistamientos guardados con éxito.');
      setTimeout(() => {
        navigate('/actividades');
      }, 2000);
    } catch (error) {
      console.error('Error al agregar la actividad pesquera:', error.response?.data || error.message);
      setMensajeError('Error al agregar la actividad pesquera..');
    }
  };

  
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Agregar Actividad Pesquera</h1>

      {mensajeExito && <Alert color="success">{mensajeExito}</Alert>}
      {mensajeError && <Alert color="danger">{mensajeError}</Alert>}

      <form onSubmit={handleSubmit}>
        <ActividadForm actividad={actividad} handleChange={handleChange} />

        {/* Mostrar el botón si no se ha creado un lance */}
        {!lanceCreado && (
          <Button color="info" onClick={addLance}>
            Agregar Lance
          </Button>
        )}

        {lances.length > 0 && (
          <>
            {/* Navegación de pestañas para los lances */}
            <Nav tabs className="mb-3">
              {lances.map((lance, index) => (
                <NavItem key={lance.codigo_lance}>
                  <NavLink
                    className={classnames({ active: activeTab === `lance-${lance.codigo_lance}` })}
                    onClick={() => setActiveTab(`lance-${lance.codigo_lance}`)}
                  >
                    Lance {index + 1}
                  </NavLink>
                </NavItem>
              ))}
              
              {/* Agregar nuevo lance con el símbolo "+" */}
              <NavItem>
                <NavLink onClick={addLance} style={{ cursor: 'pointer' }}>
                  <FaPlus /> {/* Icono de "plus" */}
                </NavLink>
              </NavItem>
            </Nav>

            {/* Contenido de las pestañas de cada lance */}
            <TabContent activeTab={activeTab}>
              {lances.map((lance) => (
                <TabPane key={lance.codigo_lance} tabId={`lance-${lance.codigo_lance}`}>
                  <LanceForm lance={lance} handleLanceChange={handleLanceChange} />

                  {/* Formularios de captura, incidencia y avistamiento */}
                  
                  <div className="my-3">
                  
                    <CapturaForm
                    capturas={capturas.filter(captura => captura.codigo_lance === lance.codigo_lance)}
                    setCapturas={setCapturas}
                    handleCapturaChange={handleCapturaChange}
                  />
                    <Button color="primary" className="mr-2" onClick={() => addCaptura(lance.codigo_lance)}>
                        Agregar Captura
                      </Button>
                  </div>

                  <div className="my-3">   
                    <AvistamientoForm
                      avistamientos={avistamientos.filter(avistamiento => avistamiento.codigo_lance === lance.codigo_lance)}
                      setAvistamientos={setAvistamientos}
                      handleAvistamientoChange={handleAvistamientoChange}
                    />
                    <Button color="primary" onClick={() => addAvistamiento(lance.codigo_lance)}>
                      Agregar Avistamiento
                    </Button>
                  </div>

                  {/* Formularios para capturas, avistamientos e incidencias */}
                  <div className="my-3">
                    <IncidenciaForm
                      incidencias={incidencias.filter(incidencia => incidencia.codigo_lance === lance.codigo_lance)}
                      setIncidencias={setIncidencias}
                      handleIncidenciaChange={handleIncidenciaChange}
                    />
                    <Button color="primary" className="mr-2" onClick={() => addIncidencia(lance.codigo_lance)}>
                      Agregar Incidencia
                    </Button>
                  
                  </div>
                  
                  
                </TabPane>
              ))}
            </TabContent>
          </>
        )}

        <div className="mt-4">
          <Button color="primary" type="submit" className="mr-2">
            Guardar Actividad
          </Button>
          <Button color="secondary" onClick={() => navigate('/actividades')}>
            Cancelar
          </Button>
        </div>
      </form>

      <Modal isOpen={modalOpen} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>Error</ModalHeader>
        <ModalBody>
          El código de ingreso es obligatorio antes de agregar un lance.
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggleModal}>Cerrar</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default AgregarActividadPesquera;

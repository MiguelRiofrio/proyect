import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Table, Card, CardBody, CardHeader, Input } from "reactstrap";

const EditarActividadPesquera = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [editedActividad, setEditedActividad] = useState({});
  const [armadores, setArmadores] = useState([]);
  const [puertos, setPuertos] = useState([]);
  const [embarcaciones, setEmbarcaciones] = useState([]);
  const [capitanes, setCapitanes] = useState([]);
  const [observadores, setObservadores] = useState([]);

  const fetchData = async () => {
    try {
      const [actividadRes, personasRes, puertosRes, embarcacionesRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/crud/actividades/${id}/details/`),
        axios.get("http://localhost:8000/api/crud/personas/"),
        axios.get("http://localhost:8000/api/crud/puertos/"),
        axios.get("http://localhost:8000/api/crud/embarcaciones/"),
      ]);

      const actividadData = actividadRes.data;

      setActividad(actividadData);
      setEditedActividad({
        codigo_actividad: actividadData.codigo_actividad,
        fecha_salida: actividadData.fecha_salida,
        fecha_entrada: actividadData.fecha_entrada,
        tipo_arte_pesca: actividadData.tipo_arte_pesca,
        pesca_objetivo: actividadData.pesca_objetivo,
        puerto_salida: actividadData.puerto_salida?.id || null,
        puerto_entrada: actividadData.puerto_entrada?.id || null,
        embarcacion: actividadData.embarcacion?.codigo_embarcacion || null,
        armador: actividadData.armador?.id || null,
        capitan: actividadData.capitan?.id || null,
        observador: actividadData.observador?.id || null,
        puerto_salida_nombre: actividadData.puerto_salida?.nombre || "",
        puerto_entrada_nombre: actividadData.puerto_entrada?.nombre || "",
        ingresado_por: actividadData.ingresado_por || "",
      });

      setArmadores(personasRes.data.filter((persona) => persona.rol === "Armador"));
      setCapitanes(personasRes.data.filter((persona) => persona.rol === "CAPITAN"));
      setObservadores(personasRes.data.filter((persona) => persona.rol === "Observador"));
      setPuertos(puertosRes.data);
      setEmbarcaciones(embarcacionesRes.data);

    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedActividad({
      ...editedActividad,
      [name]: value,
    });
  };

  const saveChanges = async () => {
    try {
      const processedData = {
        codigo_actividad: editedActividad.codigo_actividad,
        fecha_salida: editedActividad.fecha_salida,
        fecha_entrada: editedActividad.fecha_entrada,
        tipo_arte_pesca: editedActividad.tipo_arte_pesca,
        pesca_objetivo: editedActividad.pesca_objetivo,
        puerto_salida: parseInt(editedActividad.puerto_salida),
        puerto_entrada: parseInt(editedActividad.puerto_entrada),
        embarcacion: parseInt(editedActividad.embarcacion),
        armador: parseInt(editedActividad.armador),
        capitan: parseInt(editedActividad.capitan),
        observador: parseInt(editedActividad.observador),
      };
      console.log('Datos procesados que se enviarán:', JSON.stringify(processedData, null, 2));  
      await axios.put(`http://localhost:8000/api/crud/actividades/${id}/edit-details/`, processedData);
      alert("Cambios guardados con éxito");
      navigate(`/detalle/${id}`);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      alert("Error al guardar los cambios");
    }
  };

  if (!actividad || !armadores.length || !puertos.length || !embarcaciones.length || !capitanes.length || !observadores.length) {
    return <div className="text-center">Cargando datos...</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Editar Actividad Pesquera</h1>

      <Card className="mb-5 shadow-lg border-0 rounded">
        <CardHeader className="bg-dark text-white text-center p-3">
          <h4 className="mb-0">Formulario de Edición</h4>
        </CardHeader>
        <CardBody className="bg-light">
          <Table bordered>
            <thead>
              <tr>
                <th>Fecha de Salida</th>
                <th>Puerto de Salida</th>
                <th>Fecha de Entrada</th>
                <th>Puerto de Entrada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Input type="date" name="fecha_salida" value={editedActividad.fecha_salida || ""} onChange={handleInputChange} /></td>
                <td><Input type="select" name="puerto_salida" value={editedActividad.puerto_salida || ""} onChange={handleInputChange}>
                  {puertos.map((puerto) => (
                    <option key={puerto.codigo_puerto} value={puerto.codigo_puerto}>{puerto.nombre_puerto}</option>
                  ))}
                </Input></td>
                <td><Input type="date" name="fecha_entrada" value={editedActividad.fecha_entrada || ""} onChange={handleInputChange} /></td>
                <td><Input type="select" name="puerto_entrada" value={editedActividad.puerto_entrada || ""} onChange={handleInputChange}>
                  {puertos.map((puerto) => (
                    <option key={puerto.codigo_puerto} value={puerto.codigo_puerto}>{puerto.nombre_puerto}</option>
                  ))}
                </Input></td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th>Embarcación</th>
                <th>Capitán</th>
                <th>Armador</th>
                <th>Observador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Input type="select" name="embarcacion" value={editedActividad.embarcacion || ""} onChange={handleInputChange}>
                  {embarcaciones.map((embarcacion) => (
                    <option key={embarcacion.codigo_embarcacion} value={embarcacion.codigo_embarcacion}>{embarcacion.nombre_embarcacion}</option>
                  ))}
                </Input></td>
                <td><Input type="select" name="capitan" value={editedActividad.capitan || ""} onChange={handleInputChange}>
                  {capitanes.map((capitan) => (
                    <option key={capitan.codigo_persona} value={capitan.codigo_persona}>{capitan.nombre}</option>
                  ))}
                </Input></td>
                <td><Input type="select" name="armador" value={editedActividad.armador || ""} onChange={handleInputChange}>
                  {armadores.map((armador) => (
                    <option key={armador.codigo_persona} value={armador.codigo_persona}>{armador.nombre}</option>
                  ))}
                </Input></td>
                <td><Input type="select" name="observador" value={editedActividad.observador || ""} onChange={handleInputChange}>
                  {observadores.map((observador) => (
                    <option key={observador.codigo_persona} value={observador.codigo_persona}>{observador.nombre}</option>
                  ))}
                </Input></td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th>Tipo de Arte</th>
                <th>Pesca Objetivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Input type="select" name="tipo_arte_pesca" value={editedActividad.tipo_arte_pesca || ""} onChange={handleInputChange}>
                  <option value="Palangre">Palangre</option>
                  <option value="Cerco">Cerco</option>
                  <option value="Arrastre">Arrastre</option>
                </Input></td>
                <td><Input type="select" name="pesca_objetivo" value={editedActividad.pesca_objetivo || ""} onChange={handleInputChange}>
                  <option value="PPP">PPP</option>
                  <option value="PPG">PPG</option>
                </Input></td>
               
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Card>

      <div className="text-center mt-4">
        <Button color="success" onClick={saveChanges}>
          Guardar Cambios
        </Button>
        <Button color="secondary" onClick={() => navigate("/actividadeslist")}>
          Volver a la Lista
        </Button>
      </div>
    </div>
  );
};

export default EditarActividadPesquera;

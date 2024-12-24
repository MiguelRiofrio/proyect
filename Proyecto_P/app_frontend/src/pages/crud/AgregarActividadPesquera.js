import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardBody, CardHeader } from "reactstrap";
import ActividadForms from "./forms/ActividadForms";

const AgregarActividadPesquera = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    personas: [],
    puertos: [],
    embarcaciones: [],
    especies: [],
    carnadas: [],
  });

  const [actividadData, setActividadData] = useState({}); // Estado para almacenar los datos del formulario

  const fetchDatos = async () => {
    try {
      const [personasRes, puertosRes, embarcacionesRes, especiesRes, carnadaRes] = await Promise.all([
        axios.get("http://localhost:8000/api/crud/personas/"),
        axios.get("http://localhost:8000/api/crud/puertos/"),
        axios.get("http://localhost:8000/api/crud/embarcaciones/"),
        axios.get("http://localhost:8000/api/crud/especies/"),
        axios.get("http://localhost:8000/api/crud/tipo-carnada/"),
      ]);

      setData({
        personas: personasRes.data,
        puertos: puertosRes.data,
        embarcaciones: embarcacionesRes.data,
        especies: especiesRes.data,
        carnadas: carnadaRes.data,
      });
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  const handleGuardar = async () => {
    const procesarDatos = {
      ...actividadData,
      puerto_salida: parseInt(actividadData.puerto_salida, 10),
      puerto_entrada: parseInt(actividadData.puerto_entrada, 10),
      embarcacion: parseInt(actividadData.embarcacion, 10),
      capitan: parseInt(actividadData.capitan, 10),
      armador: parseInt(actividadData.armador,10),
      observador: parseInt(actividadData.observador, 10),
    };

    console.log("Datos procesados a enviar:", procesarDatos);
    try {
      const response = await axios.post("http://localhost:8000/api/crud/actividades/create_details/", procesarDatos);
      console.log("Respuesta del servidor:", response.data);

      // Redirigir al usuario o mostrar un mensaje de éxito
      navigate("/actividadeslist");
    } catch (error) {
      console.error("Error al guardar la actividad:", error);
      alert("Hubo un error al guardar la actividad. Revisa los datos e inténtalo de nuevo.");
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Agregar Actividad Pesquera</h1>

      <Card className="mb-5 shadow-lg border-0 rounded">
        <CardHeader className="bg-dark text-white text-center p-3">
          Formulario de Actividad Pesquera
        </CardHeader>
        <CardBody className="bg-light">
          <ActividadForms
            data={data}
            onSave={setActividadData} // Permite que el formulario actualice `actividadData`
          />
        </CardBody>
      </Card>

      <div className="text-center mt-4">
        <Button color="success" onClick={handleGuardar}>
          Guardar
        </Button>
        <Button color="secondary" onClick={() => navigate("/actividadeslist")}>
          Volver a la Lista
        </Button>
      </div>
    </div>
  );
};

export default AgregarActividadPesquera;

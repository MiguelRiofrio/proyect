import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Card, CardBody, CardHeader } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import api from './ApiService';
import './css/FormComponent.css'; // Archivo CSS para estilos personalizados

const FormComponent = ({ endpoint, title,onSubmitSuccess  }) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  // Obtener dinámicamente los campos desde el backend
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await api.get(`${endpoint}schema/`);
        const schema = response.data;

        setFields(schema);
        const initialData = schema.reduce((acc, field) => {
          acc[field.name] = '';
          return acc;
        }, {});
        setFormData(initialData);
      } catch (error) {
        console.error('Error al obtener el esquema de campos:', error);
      }
    };

    fetchFields();
  }, [endpoint]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(endpoint, formData);
      navigate(-1);
    } catch (error) {
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data.message || "Error al procesar el formulario."}`);
      } else {
        console.error('Error al enviar el formulario:', error);
      }
    }
  };

  return (
    <Card className="form-card">
      <CardHeader className="form-card-header">
        <h2>{title}</h2>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit}>
          {fields
            .filter((field) => !field.name.includes('codigo'))
            .map((field) => (
              <FormGroup key={field.name} className="form-group">
                <Label for={field.name}>{field.label || field.name}</Label>
                <Input
                  type={field.type === 'integer' ? 'number' : 'text'}
                  name={field.name}
                  id={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={`Ingrese ${field.label || field.name}`}
                  className="form-input"
                />
              </FormGroup>
            ))}
          <div className="form-buttons">
            <Button color="primary" type="submit" className="form-button">
              Guardar
            </Button>
            <Button
              color="secondary"
              onClick={() => navigate(-1)}
              className="form-button cancel-button"
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default FormComponent;

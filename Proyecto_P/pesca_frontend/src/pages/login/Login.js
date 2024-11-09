import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert
} from 'reactstrap';
import './Login.css'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');  // Cambiamos 'email' por 'username'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();  // Evitar el comportamiento predeterminado del formulario

    // Hacer la solicitud al backend para obtener el token JWT
    fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,  // Usamos el nombre de usuario
        password: password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Login fallido');
        }
        return response.json();
      })
      .then((data) => {
        if (data.access && data.role) {
          // Llamar a la función de onLogin pasando el token de acceso y el rol
          onLogin(data.access, data.role);  // Aquí enviamos tanto el token como el rol
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      })
      .catch((error) => {
        console.error('Error en el login:', error);
        setError('Usuario o contraseña incorrectos');
      });
  };

  return (
    <Container className="container mb-2">
        <Row className="justify-content-center">
          <Col md="4">
            <h2 className="text-center mb-4">Iniciar Sesión</h2>

            {/* Mostrar mensaje de error si existe */}
            {error && <Alert color="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label for="username">Nombre de Usuario</Label>
                <Input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Introduce tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="form-input"
                />
              </FormGroup>
              <FormGroup>
                <Label for="password">Contraseña</Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Introduce tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </FormGroup>
              <Button color="primary" block type="submit" className="submit-btn">
                Iniciar Sesión
              </Button>
            </Form>
          </Col>
        </Row>
    </Container>
  );
};

export default Login;

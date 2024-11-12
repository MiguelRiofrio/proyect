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
  Alert,
  Spinner,
} from 'reactstrap';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Por favor, complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData?.detail || 'Usuario o contraseña incorrectos';
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (data.access && data.role) {
        onLogin(data.access, data.role);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="login-container" >
      <div
        className="login-box" >
        <h2 className="text-center mb-4">
          Iniciar Sesión
        </h2>
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
              
            />
          </FormGroup>
          <FormGroup style={{ position: 'relative' }}>
            <Label for="password">Contraseña</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              placeholder="Introduce tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                borderRadius: '8px',
                border: '1px solid #ced4da',
                padding: '10px',
              }}
            />
            <Button
              type="button"
              color="link"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
              }}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </Button>
          </FormGroup>
          <Button
            color="primary"
            block
            type="submit"
            disabled={loading}
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              padding: '10px',
              borderRadius: '8px',
              background: 'linear-gradient(to right, #007bff, #0056b3)',
              marginTop: '20px',
            }}
          >
            {loading ? <Spinner size="sm" /> : 'Iniciar Sesión'}
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default Login;

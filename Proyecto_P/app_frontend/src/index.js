import React from 'react';
import ReactDOM from 'react-dom/client';  // Importa createRoot para React 18
import { BrowserRouter as Router } from 'react-router-dom';  // Importa BrowserRouter
import App from './App';
import './styles/index.css';


const root = ReactDOM.createRoot(document.getElementById('root'));

// Envuelve App en el Router
root.render(
  <React.StrictMode>
    <Router>  {/* Coloca el Router alrededor de App */}
      <App />
    </Router>
  </React.StrictMode>
);
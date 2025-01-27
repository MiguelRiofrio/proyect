// routerCrudRoutes.jsx
import React from 'react';
import { Route } from 'react-router-dom';
import ListComponent from './ListComponent';
import FormComponent from './FormComponent';

export const routerCrudRoutes = [
  { path: '/tipo-carnada', title: 'Tipo Carnada', endpoint: 'crud/tipo-carnada/' },
  { path: '/puertos', title: 'Puertos', endpoint: 'crud/puertos/' },
  { path: '/personas', title: 'Personas', endpoint: 'crud/personas/' },
  { path: '/embarcaciones', title: 'Embarcaciones', endpoint: 'crud/embarcaciones/' },
  { path: '/especies', title: 'Especies', endpoint: 'crud/especies/' },
].map(({ path, title, endpoint }) => (
  <React.Fragment key={path}>
    {/* Ruta para listar los elementos */}
    <Route 
      path={path} 
      element={<ListComponent path={path} endpoint={endpoint} title={`Lista de ${title}`} />} 
    />
    
    {/* Ruta para crear un nuevo elemento */}
    <Route 
      path={`${path}/create`} 
      element={<FormComponent endpoint={endpoint} title={`Crear ${title}`} />} 
    />
    
    {/* Ruta para editar un elemento existente */}
    <Route 
      path={`${path}/edit/:id`} 
      element={<FormComponent endpoint={endpoint} title={`Editar ${title}`} />} 
    />
  </React.Fragment>
));

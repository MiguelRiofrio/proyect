import React from 'react';
import { Route } from 'react-router-dom';
import ListComponent from './ListComponent';
import FormComponent from './FormComponent';

export const routerCrudRoutes = [
  { path: '/tipo-carnada', title: 'Tipo Carnada', endpoint: '/tipo-carnada/' },
  { path: '/puertos', title: 'Puertos', endpoint: '/puertos/' },
  { path: '/personas', title: 'Personas', endpoint: '/personas/' },
  { path: '/embarcaciones', title: 'Embarcaciones', endpoint: '/embarcaciones/' },
  { path: '/coordenadas', title: 'Coordenadas', endpoint: '/coordenadas/' },
  { path: '/especies', title: 'Especies', endpoint: '/especies/' },
  //{ path: '/actividades', title: 'Actividades', endpoint: '/actividades/' },
  //{ path: '/lances', title: 'Lances', endpoint: '/lances/' },
  //{ path: '/capturas', title: 'Capturas', endpoint: '/capturas/' },
  //{ path: '/avistamientos', title: 'Avistamientos', endpoint: '/avistamientos/' },
  //{ path: '/incidencias', title: 'Incidencias', endpoint: '/incidencias/' },
].map(({ path, title, endpoint }) => (
  <React.Fragment key={path}>
    <Route path={path} element={<ListComponent endpoint={endpoint} title={`Lista de ${title}`} />} />
    <Route path={`${path}/create`} element={<FormComponent endpoint={endpoint} title={`Crear ${title}`} />} />
    <Route path={`${path}/edit/:id`} element={<FormComponent endpoint={endpoint} title={`Editar ${title}`} />} />
  </React.Fragment>
));

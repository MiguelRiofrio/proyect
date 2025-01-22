// DashboardFiltro.jsx
import React from 'react';
import { Card, CardBody, Input } from 'reactstrap';

const FiltroEmbarcaciones = ({ embarcacion, setEmbarcacion, embarcacionesList }) => {
  return (
    <Card className="shadow mb-4">
      <CardBody>
        <h5>Filtrar por Embarcación</h5>
        <Input
          type="select"
          value={embarcacion}
          onChange={(e) => setEmbarcacion(e.target.value)}
        >
          <option value="">Todas las Embarcaciones</option>
          {embarcacionesList.map((emb) => (
            <option key={emb.codigo_embarcacion} value={emb.nombre_embarcacion}>
              {emb.nombre_embarcacion}
            </option>
          ))}
        </Input>
      </CardBody>
    </Card>
  );
};

export default FiltroEmbarcaciones;

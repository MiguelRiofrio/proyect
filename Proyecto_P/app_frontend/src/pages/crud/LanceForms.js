import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Table, Button } from 'reactstrap';

const LanceForms = ({ lances, setLances, codigoActividad }) => {
  const agregarLance = () => {
    setLances([
      ...lances,
      {
        calado_fecha: '',
        calado_hora: '',
        profundidad_suelo_marino: 0.0,
        coordenadas: {
          latitud_ns: 'N',
          latitud_grados: 0,
          latitud_minutos: 0.0,
          longitud_w: 'W',
          longitud_grados: 0,
          longitud_minutos: 0.0,
        },
      },
    ]);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <h5>Detalles de la Actividad</h5>
      </CardHeader>
      <CardBody>
        {!codigoActividad ? (
          <p>Puedes agregar lances una vez que hayas creado una actividad.</p>
        ) : (
          <>
            <Button color="primary" onClick={agregarLance} className="mb-3">
              Agregar Lance
            </Button>
            {lances.length > 0 && (
              <Table bordered>
                <thead>
                  <tr>
                    <th>Fecha de Calado</th>
                    <th>Hora de Calado</th>
                    <th>Profundidad Suelo Marino</th>
                    <th>Latitud (N/S, Grados, Minutos)</th>
                    <th>Longitud (E/W, Grados, Minutos)</th>
                  </tr>
                </thead>
                <tbody>
                  {lances.map((lance, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="date"
                          name="calado_fecha"
                          value={lance.calado_fecha}
                          onChange={(e) => {
                            const updatedLances = [...lances];
                            updatedLances[index].calado_fecha = e.target.value;
                            setLances(updatedLances);
                          }}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          name="calado_hora"
                          value={lance.calado_hora}
                          onChange={(e) => {
                            const updatedLances = [...lances];
                            updatedLances[index].calado_hora = e.target.value;
                            setLances(updatedLances);
                          }}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="profundidad_suelo_marino"
                          value={lance.profundidad_suelo_marino}
                          onChange={(e) => {
                            const updatedLances = [...lances];
                            updatedLances[index].profundidad_suelo_marino = e.target.value;
                            setLances(updatedLances);
                          }}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <select
                            name="latitud_ns"
                            value={lance.coordenadas.latitud_ns}
                            onChange={(e) => {
                              const updatedLances = [...lances];
                              updatedLances[index].coordenadas.latitud_ns = e.target.value;
                              setLances(updatedLances);
                            }}
                            className="form-control me-2"
                          >
                            <option value="N">N</option>
                            <option value="S">S</option>
                          </select>
                          <input
                            type="number"
                            name="latitud_grados"
                            value={lance.coordenadas.latitud_grados}
                            onChange={(e) => {
                              const updatedLances = [...lances];
                              updatedLances[index].coordenadas.latitud_grados = e.target.value;
                              setLances(updatedLances);
                            }}
                            className="form-control me-2"
                          />
                          <input
                            type="number"
                            step="0.001"
                            name="latitud_minutos"
                            value={lance.coordenadas.latitud_minutos}
                            onChange={(e) => {
                              const updatedLances = [...lances];
                              updatedLances[index].coordenadas.latitud_minutos = e.target.value;
                              setLances(updatedLances);
                            }}
                            className="form-control"
                          />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <select
                            name="longitud_w"
                            value={lance.coordenadas.longitud_w}
                            onChange={(e) => {
                              const updatedLances = [...lances];
                              updatedLances[index].coordenadas.longitud_w = e.target.value;
                              setLances(updatedLances);
                            }}
                            className="form-control me-2"
                          >
                            <option value="W">W</option>
                            <option value="E">E</option>
                          </select>
                          <input
                            type="number"
                            name="longitud_grados"
                            value={lance.coordenadas.longitud_grados}
                            onChange={(e) => {
                              const updatedLances = [...lances];
                              updatedLances[index].coordenadas.longitud_grados = e.target.value;
                              setLances(updatedLances);
                            }}
                            className="form-control me-2"
                          />
                          <input
                            type="number"
                            step="0.001"
                            name="longitud_minutos"
                            value={lance.coordenadas.longitud_minutos}
                            onChange={(e) => {
                              const updatedLances = [...lances];
                              updatedLances[index].coordenadas.longitud_minutos = e.target.value;
                              setLances(updatedLances);
                            }}
                            className="form-control"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default LanceForms;

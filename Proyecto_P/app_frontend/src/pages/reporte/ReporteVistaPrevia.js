import React, { useState } from 'react';
import { Button, Table, Spinner } from 'reactstrap';

const ReporteVistaPrevia = () => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const obtenerVistaPrevia = () => {
    setCargando(true);
    fetch('http://localhost:8000/api/generar-reporte?formato=vista_previa')
      .then((response) => response.json())
      .then((data) => {
        setDatos(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al obtener la vista previa:', error);
        setCargando(false);
      });
  };

  const generarReporte = (formato) => {
    setCargando(true);
    fetch(`http://localhost:8000/api/generar-reporte?formato=${formato}`, {
      method: 'GET',
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte.${formato}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al generar el reporte:', error);
        setCargando(false);
      });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h3>Vista Previa del Reporte</h3>
      <Button color="primary" onClick={obtenerVistaPrevia} disabled={cargando}>
        {cargando ? <Spinner size="sm" /> : 'Obtener Vista Previa'}
      </Button>

      {datos.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <Table bordered>
            <thead>
              <tr>
                <th>Especie</th>
                <th>Capturas</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, index) => (
                <tr key={index}>
                  <td>{fila.Especie}</td>
                  <td>{fila.Capturas}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div style={{ marginTop: '20px' }}>
            <Button color="success" onClick={() => generarReporte('pdf')} disabled={cargando}>
              {cargando ? <Spinner size="sm" /> : 'Generar PDF'}
            </Button>
            <Button color="info" onClick={() => generarReporte('xlsx')} style={{ marginLeft: '10px' }} disabled={cargando}>
              {cargando ? <Spinner size="sm" /> : 'Generar Excel'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteVistaPrevia;

import React, { useState } from 'react';
import { Button, FormGroup, Label, Input, Spinner } from 'reactstrap';

const GenerarReporte = () => {
  const [formato, setFormato] = useState('pdf');
  const [cargando, setCargando] = useState(false);

  const handleGenerarReporte = () => {
    setCargando(true);

    fetch(`http://localhost:8000/api/generar-reporte?formato=${formato}`, {
      method: 'GET',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Error al generar el reporte');
        return response.blob();
      })
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
        console.error('Error:', error);
        setCargando(false);
      });
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <h3>Generar Reporte</h3>
      <FormGroup>
        <Label for="formato">Formato del Reporte:</Label>
        <Input
          type="select"
          name="formato"
          id="formato"
          value={formato}
          onChange={(e) => setFormato(e.target.value)}
        >
          <option value="pdf">PDF</option>
          <option value="xlsx">Excel</option>
        </Input>
      </FormGroup>
      <Button color="primary" onClick={handleGenerarReporte} disabled={cargando}>
        {cargando ? <Spinner size="sm" /> : 'Generar Reporte'}
      </Button>
    </div>
  );
};

export default GenerarReporte;

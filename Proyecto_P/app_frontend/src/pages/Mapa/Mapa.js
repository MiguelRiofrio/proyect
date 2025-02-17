import React, { useState, useMemo, useRef } from 'react';
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  Row,
  Col,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { FaFilter, FaSyncAlt, FaFileExport } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

import MapWithHeatmap from './components/Contenido_Mapa';
import FiltroMapa from './components/FiltroMapa';
import useFetchMapData from './components/useFetchMapData';
import ExportableReport from './components/ExportableReport';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import './css/Mapa.css'; // Asegúrate de que la ruta sea la correcta

const Mapa = () => {
  /*** Configuración inicial del mapa ***/
  const defaultCenter = [12, -85];
  const defaultZoom = 5.5;

  /*** Estados y manejo de filtros ***/
  const [filtros, setFiltros] = useState({
    tipoFiltro: 'todos',
    taxaFiltro: '',
    especieFiltro: '',
    profundidadMin: '',
    profundidadMax: '',
    puerto: '',
    embarcacion: '',
    year: '',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  /*** Consulta de datos del mapa ***/
  const { datos, filtrosDisponibles, loading, error, refetch } = useFetchMapData(filtros);
  console.log("Filtros Disponibles:", filtrosDisponibles);

  /*** Combina los datos de distintas fuentes ***/
  const combinedData = useMemo(() => {
    return [
      ...(datos.capturas || []),
      ...(datos.avistamientos || []),
      ...(datos.incidencias || []),
    ];
  }, [datos]);

  /*** Resumen de filtros para el informe exportable ***/
  const resumenFiltros = `Filtros Aplicados:
- Tipo de Interacción: ${filtros.tipoFiltro}
- Taxa: ${filtros.taxFiltro || "Ninguno"}
- Especie: ${filtros.especieFiltro || "Ninguno"}
- Puerto: ${filtros.puerto || "Ninguno"}
- Embarcación: ${filtros.embarcacion || "Ninguno"}
- Año: ${filtros.year || "Ninguno"}
- Rango de Profundidad: ${filtros.profundidadMin || (filtrosDisponibles.rangoProfundidad?.min || 0)} m a ${filtros.profundidadMax || (filtrosDisponibles.rangoProfundidad?.max || 100)} m`;

  /*** Funciones de manejo de la interfaz ***/
  const toggleFilter = () => setIsFilterOpen(prev => !prev);
  const handleReload = () => refetch();

  /*** Exportación del informe a PDF ***/
  const exportRef = useRef();

  const handleExport = async () => {
    if (!exportRef.current) return;
    try {
      const canvas = await html2canvas(exportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (pdfWidth * imgProps.height) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save('informe.pdf');
    } catch (err) {
      console.error("Error al exportar el informe", err);
    }
  };

  const confirmExport = () => setShowExportConfirm(true);
  const handleConfirmExport = () => {
    handleExport();
    setShowExportConfirm(false);
  };
  const handleCancelExport = () => setShowExportConfirm(false);

  return (
    <Container fluid className="mt-3 mapa-container">
      {/* Tarjeta principal */}
      <Row className="justify-content-center no-print">
        {/* Usamos lg={8} para que el card sea más pequeño y centrado */}
        <Col lg={9}>
          <Card className="shadow custom-card">
            <CardHeader className="d-flex justify-content-between align-items-center custom-card-header no-print">
              <h5 className="mb-0">Mapa de Actividades Pesqueras</h5>
              <div>
                <Button color="light" onClick={handleReload} outline className="mr-2">
                  <FaSyncAlt /> Recargar
                </Button>
                <Button color="secondary" onClick={confirmExport} outline className="mr-2">
                  <FaFileExport /> Exportar Informe
                </Button>
              </div>
            </CardHeader>
            <CardBody className="custom-card-body">
              {error && (
                <Alert color="danger" fade={false} className="text-center no-print">
                  {error}
                </Alert>
              )}

              {/* Botón para mostrar u ocultar filtros */}
              <Row className="mb-3 no-print">
                <Col xs="12" className="d-flex justify-content-between align-items-center">
                  <Button color="secondary" onClick={toggleFilter} outline>
                    <FaFilter /> {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                  </Button>
                </Col>
              </Row>

              {isFilterOpen ? (
                <Row className="equal-divisions">
                  {/* Panel de filtros: Se asigna lg={4} */}
                  <Col xs={12} md={4} lg={4} className="filter-column">
                    <h6 className="mb-3">Filtros</h6>
                    <FiltroMapa
                      filtros={filtros}
                      setFiltros={setFiltros}
                      taxas={filtrosDisponibles.taxas}
                      especies={filtrosDisponibles.especies}
                      puertos={filtrosDisponibles.puertos}
                      embarcaciones={filtrosDisponibles.embarcaciones}
                      rangoProfundidad={filtrosDisponibles.rangoProfundidad || { min: 0, max: 100 }}
                      años={filtrosDisponibles.años}
                    />
                  </Col>
                  {/* Mapa principal: Se asigna lg={8} */}
                  <Col xs={12} md={8} lg={8} className="map-column">
                    {loading ? (
                      <div className="text-center my-5">
                        <Spinner color="primary" />
                        <p className="mt-3">Cargando datos del mapa...</p>
                      </div>
                    ) : (
                      <MapWithHeatmap
                        datos={combinedData}
                        center={defaultCenter}
                        zoom={defaultZoom}
                      />
                    )}
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col xs={12} className="mapa-responsive">
                    {loading ? (
                      <div className="text-center my-5">
                        <Spinner color="primary" />
                        <p className="mt-3">Cargando datos del mapa...</p>
                      </div>
                    ) : (
                      <MapWithHeatmap
                        datos={combinedData}
                        center={defaultCenter}
                        zoom={defaultZoom}
                      />
                    )}
                  </Col>
                </Row>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmación para exportar informe */}
      <Modal isOpen={showExportConfirm} toggle={handleCancelExport}>
        <ModalHeader toggle={handleCancelExport}>Confirmar Exportación</ModalHeader>
        <ModalBody>¿Desea exportar el informe?</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleConfirmExport}>
            Confirmar
          </Button>
          <Button color="secondary" onClick={handleCancelExport}>
            Cancelar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Contenedor oculto para exportar informe en PDF */}
      <div ref={exportRef} className="export-container" style={{ display: 'none' }}>
        <ExportableReport
          combinedData={combinedData}
          center={defaultCenter}
          zoom={defaultZoom}
          species={filtros.especieFiltro}
          resumenFiltros={resumenFiltros}
        />
      </div>
    </Container>
  );
};

export default Mapa;

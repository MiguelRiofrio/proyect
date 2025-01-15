from rest_framework.test import APITestCase
from rest_framework import status
from app_backend.models import (
    ActividadPesquera, Lance, DatosCaptura, Especie, Avistamiento, Incidencia, Coordenadas, Embarcacion
)

class APITestSuite(APITestCase):
    def setUp(self):
        # Crear una embarcación para asociar con la actividad pesquera
        self.embarcacion = Embarcacion.objects.create(
            codigo_embarcacion=1,
            nombre_embarcacion="Embarcacion1",
            matricula="MAT123"
        )

        # Configuración inicial de datos
        self.especie = Especie.objects.create(
            codigo_especie=1,
            nombre_cientifico="Thunnus albacares",
            nombre_comun="Atún Aleta Amarilla"
        )
        self.actividad = ActividadPesquera.objects.create(
            codigo_actividad="ACT123",
            fecha_salida="2023-01-01",
            fecha_entrada="2023-01-02",
            tipo_arte_pesca="Palangre",
            embarcacion=self.embarcacion
        )
        self.lance = Lance.objects.create(
            codigo_lance="LAN001",
            actividad=self.actividad,
            numero_lance=1,
            calado_fecha="2023-01-01",
            calado_hora="08:00",
            profundidad_suelo_marino=120.5
        )
        self.coordenadas = Coordenadas.objects.create(
            codigo_lance=self.lance,
            latitud_ns="N",
            latitud_grados=10,
            latitud_minutos=30.0,
            longitud_w="W",
            longitud_grados=20,
            longitud_minutos=15.0
        )
        self.captura = DatosCaptura.objects.create(
            codigo_captura="CAP001",
            lance=self.lance,
            peso_retenido=100.0,
            peso_descarte=20.0,
            individuos_retenidos=50,
            individuos_descarte=10,
            especie=self.especie
        )
        self.avistamiento = Avistamiento.objects.create(
            codigo_avistamiento="AVI001",
            lance=self.lance,
            especie=self.especie,
            alimentandose=5,
            deambulando=3,
            en_reposo=2
        )
        self.incidencia = Incidencia.objects.create(
            codigo_incidencia="INC001",
            lance=self.lance,
            especie=self.especie,
            herida_grave=1,
            herida_leve=2,
            muerto=1
        )

    def test_dashboard_data(self):
        """Probar que el endpoint de dashboard devuelva datos correctos"""
        response = self.client.get("/api/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_actividades"], 1)
        self.assertEqual(response.data["total_retenido"], 100.0)
        self.assertEqual(response.data["total_descartado"], 20.0)
        self.assertEqual(len(response.data["capturas_por_mes"]), 1)

    def test_kpi_home(self):
        """Probar que el endpoint de KPI devuelva datos clave"""
        response = self.client.get("/api/kpi-home/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_especies"], 1)
        self.assertEqual(response.data["total_avistamientos"], 10)  # 5 alimentándose + 3 deambulando + 2 en reposo
        self.assertEqual(response.data["total_incidencias"], 4)  # 1 herida grave + 2 leves + 1 muerto
        self.assertIsInstance(response.data["especie_mas_comun"], dict)

    def test_top_especies(self):
        """Probar que el endpoint de top especies devuelva el top esperado"""
        response = self.client.get("/api/top-especies/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["top_capturas"]), 1)
        self.assertEqual(response.data["top_capturas"][0]["especie__nombre_cientifico"], "Thunnus albacares")
        self.assertEqual(response.data["top_capturas"][0]["total_captura"], 50)

    def test_coordenadas_general(self):
        """Probar que el endpoint de localización de especies devuelva las coordenadas correctas"""
        response = self.client.get("/api/localizacion_especies/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["capturas"]), 1)
        self.assertEqual(response.data["capturas"][0]["latitud"], 10.5)
        self.assertEqual(response.data["capturas"][0]["longitud"], -20.25)
        self.assertEqual(response.data["capturas"][0]["total"], 60)

    def test_filtrado_dashboard(self):
        """Probar que el endpoint de dashboard funcione con filtros"""
        response = self.client.get("/api/dashboard/?embarcacion=Embarcacion1")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_actividades"], 1)

    def test_areas_mayor_avistamiento(self):
        """Probar que el endpoint devuelva áreas con mayor número de avistamientos"""
        response = self.client.get("/api/localizacion_especies_a/?geojson=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["areas_mayor_avistamiento"]), 1)
        self.assertEqual(response.data["areas_mayor_avistamiento"][0]["total_avistamientos"], 10)

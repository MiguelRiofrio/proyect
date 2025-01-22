from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from app_backend.models import (
    Embarcacion, ActividadPesquera, Lance, LancePalangre, DatosCaptura, Avistamiento, Incidencia, LancePalangreCarnadas, TipoCarnada
)
from datetime import datetime


class DashboardDataViewTests(APITestCase):

    def setUp(self):
        """
        Configuración inicial de datos de prueba.
        """
        # Crear embarcación
        self.embarcacion = Embarcacion.objects.create(
            codigo_embarcacion=1,
            nombre_embarcacion="Embarcacion A",
            matricula="MAT-001"
        )

        # Crear actividad pesquera
        self.actividad = ActividadPesquera.objects.create(
            codigo_actividad="ACT-001",
            fecha_salida=datetime(2023, 5, 1).date(),
            fecha_entrada=datetime(2023, 5, 10).date(),
            tipo_arte_pesca="Palangre",
            pesca_objetivo="Atún",
            embarcacion=self.embarcacion
        )

        # Crear un lance
        self.lance = Lance.objects.create(
            codigo_lance="L001",
            actividad=self.actividad,
            numero_lance=1,
            calado_fecha=datetime(2023, 5, 5).date(),
            profundidad_suelo_marino=100.0
        )

        # Crear un lance de tipo Palangre usando la instancia de Lance
        self.lance_palangre = LancePalangre.objects.create(
            codigo_lance=self.lance,  # Usar la instancia correcta de Lance
            Tipo_anzuelo="B10",
            tamano_anzuelo=3.5,
            cantidad_anzuelos=100,
            linea_madre_metros=500.0,
            profundidad_anzuelo_metros=30.0
        )

        # Crear tipo de carnada
        self.tipo_carnada = TipoCarnada.objects.create(
            codigo_tipo_carnada=1,
            nombre_carnada="Sardina"
        )

        # Asociar lance de palangre con carnada
        LancePalangreCarnadas.objects.create(
            codigo_lance_palangre=self.lance_palangre,  # Usar la instancia correcta de LancePalangre
            codigo_tipo_carnada=self.tipo_carnada,
            porcentaje_carnada=80.0
        )

        # Crear datos de captura
        DatosCaptura.objects.create(
            codigo_captura="C001",
            lance=self.lance,
            peso_retenido=200.0,
            peso_descarte=50.0
        )

        # Crear avistamiento
        Avistamiento.objects.create(
            codigo_avistamiento="A001",
            lance=self.lance,
            alimentandose=2,
            deambulando=1,
            en_reposo=3
        )

        # Crear incidencia
        Incidencia.objects.create(
            codigo_incidencia="I001",
            lance=self.lance,
            herida_grave=1,
            herida_leve=0,
            muerto=0
        )

    def test_dashboard_sin_filtros(self):
        """
        Prueba el endpoint sin filtros aplicados.
        """
        url = reverse('dashboard')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["total_actividades"], 1)
        self.assertEqual(data["total_retenido"], 200.0)
        self.assertEqual(data["total_descartado"], 50.0)
        self.assertEqual(len(data["capturas_por_mes"]), 1)
        self.assertEqual(len(data["capturas_por_ano"]), 1)
        self.assertIsNone(data["tendencia_retenido"])  # Solo una captura, sin tendencia

    def test_dashboard_con_filtro_embarcacion(self):
        """
        Prueba el filtro por nombre de embarcación.
        """
        url = reverse('dashboard')
        response = self.client.get(url, {'embarcacion': 'Embarcacion A'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["total_actividades"], 1)
        self.assertEqual(data["total_retenido"], 200.0)
        self.assertEqual(data["total_descartado"], 50.0)

    def test_dashboard_con_filtro_embarcacion_invalida(self):
        """
        Prueba el filtro por nombre de embarcación inexistente.
        """
        url = reverse('dashboard')
        response = self.client.get(url, {'embarcacion': 'Embarcacion X'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["total_actividades"], 0)
        self.assertEqual(data["total_retenido"], 0)
        self.assertEqual(data["total_descartado"], 0)

    def test_dashboard_capturas_por_mes(self):
        """
        Prueba que las capturas se devuelvan agrupadas por mes.
        """
        url = reverse('dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data["capturas_por_mes"]), 1)
        self.assertEqual(data["capturas_por_mes"][0]["month"], 5)
        self.assertEqual(data["capturas_por_mes"][0]["total_retenido"], 200.0)

    def test_dashboard_capturas_por_ano(self):
        """
        Prueba que las capturas se devuelvan agrupadas por año.
        """
        url = reverse('dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(len(data["capturas_por_ano"]), 1)
        self.assertEqual(data["capturas_por_ano"][0]["year"], 2023)
        self.assertEqual(data["capturas_por_ano"][0]["retenido"], 200.0)

    def test_dashboard_incidentes(self):
        """
        Prueba que se recuperen correctamente los datos de incidencias.
        """
        url = reverse('dashboard')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data["incidencias"]["total_graves"], 1)
        self.assertEqual(data["incidencias"]["total_leves"], 0)
        self.assertEqual(data["incidencias"]["total_muertos"], 0)

    def test_dashboard_carnadas(self):
        """
        Prueba la recuperación de carnadas utilizadas.
        """
        url = reverse('dashboard')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(len(data["carnadas"]), 1)
        self.assertEqual(data["carnadas"][0]["nombre_carnada"], "Sardina")
        self.assertEqual(data["carnadas"][0]["total_porcentaje"], 80.0)

    def test_dashboard_distribucion_artes_pesca(self):
        """
        Prueba la recuperación de la distribución de artes de pesca.
        """
        url = reverse('dashboard')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(len(data["artes_pesca"]), 1)
        self.assertEqual(data["artes_pesca"][0]["tipo_arte"], "Palangre")

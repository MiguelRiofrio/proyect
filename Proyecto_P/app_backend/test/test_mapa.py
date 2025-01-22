from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from app_backend.models import (
    Especie, Lance, DatosCaptura, Avistamiento, Incidencia, Coordenadas
)
from datetime import datetime

class CoordenadasGeneralAPIViewTests(APITestCase):

    def setUp(self):
        """
        Configura los datos de prueba antes de cada prueba.
        """

        # Crear especie
        self.especie1 = Especie.objects.create(
            codigo_especie=1,
            taxa="Taxa A",
            genero="Género A",
            especie="Especie A",
            nombre_cientifico="Especie Científica A",
            nombre_comun="Especie Común A"
        )

        # Crear lance con coordenadas
        self.lance = Lance.objects.create(
            codigo_lance="L001",
            numero_lance=1,
            calado_fecha=datetime(2023, 5, 5).date(),
            profundidad_suelo_marino=100.0
        )

        self.coordenadas = Coordenadas.objects.create(
            codigo_lance=self.lance,
            latitud_ns="N",
            latitud_grados=1,
            latitud_minutos=30.0,
            longitud_w="W",
            longitud_grados=45,
            longitud_minutos=15.0
        )

        # Crear registros de capturas, avistamientos e incidencias
        self.captura = DatosCaptura.objects.create(
            codigo_captura="C001",
            lance=self.lance,
            especie=self.especie1,
            individuos_retenidos=10,
            peso_retenido=50.0
        )

        self.avistamiento = Avistamiento.objects.create(
            codigo_avistamiento="A001",
            lance=self.lance,
            especie=self.especie1,
            alimentandose=3,
            deambulando=2,
            en_reposo=1
        )

        self.incidencia = Incidencia.objects.create(
            codigo_incidencia="I001",
            lance=self.lance,
            especie=self.especie1,
            herida_grave=1,
            herida_leve=0,
            muerto=0
        )

    def test_obtener_todas_las_coordenadas(self):
        """
        Prueba el endpoint sin filtros, esperando obtener todas las coordenadas.
        """
        url = reverse('localizacion')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()

        self.assertEqual(len(data["capturas"]), 1)
        self.assertEqual(len(data["avistamientos"]), 1)
        self.assertEqual(len(data["incidencias"]), 1)
        self.assertEqual(data["capturas"][0]["especie"], "Especie Científica A")
        self.assertAlmostEqual(data["capturas"][0]["latitud"], 1.5, places=2)
        self.assertAlmostEqual(data["capturas"][0]["longitud"], -45.25, places=2)

    def test_filtrar_por_taxa(self):
        """
        Prueba el filtro por taxa en la consulta.
        """
        url = reverse('localizacion')
        params = {'taxa': 'Taxa A'}
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(len(data["capturas"]), 1)
        self.assertEqual(data["capturas"][0]["taxa"], "Taxa A")

    def test_filtrar_por_rango_profundidad(self):
        """
        Prueba el filtro de profundidad mínima y máxima.
        """
        url = reverse('localizacion')
        params = {'rango_profundidad_min': '50', 'rango_profundidad_max': '150'}
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(len(data["capturas"]), 1)
        self.assertEqual(data["capturas"][0]["profundidad_suelo_marino"], 100.0)

    def test_filtrar_por_tipo_capturas(self):
        """
        Prueba la obtención solo de capturas con el filtro de tipo.
        """
        url = reverse('localizacion')
        params = {'tipo': 'capturas'}
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(len(data["capturas"]), 1)
        self.assertEqual(len(data["avistamientos"]), 0)
        self.assertEqual(len(data["incidencias"]), 0)

    def test_filtrar_por_tipo_avistamientos(self):
        """
        Prueba la obtención solo de avistamientos con el filtro de tipo.
        """
        url = reverse('localizacion')
        params = {'tipo': 'avistamientos'}
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(len(data["capturas"]), 0)
        self.assertEqual(len(data["avistamientos"]), 1)
        self.assertEqual(len(data["incidencias"]), 0)

    def test_filtrar_por_tipo_incidencias(self):
        """
        Prueba la obtención solo de incidencias con el filtro de tipo.
        """
        url = reverse('localizacion')
        params = {'tipo': 'incidencias'}
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(len(data["capturas"]), 0)
        self.assertEqual(len(data["avistamientos"]), 0)
        self.assertEqual(len(data["incidencias"]), 1)

    def test_error_con_valores_invalidos(self):
        """
        Prueba el comportamiento cuando se envían valores inválidos en los parámetros.
        """
        url = reverse('localizacion')
        params = {'rango_profundidad_min': 'abc', 'rango_profundidad_max': 'xyz'}
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("error", response.json())

    def test_conversion_coordenadas(self):
        """
        Prueba la conversión de coordenadas de grados y minutos a formato decimal.
        """
        url = reverse('localizacion')
        response = self.client.get(url)
        data = response.json()

        latitud_decimal = data["capturas"][0]["latitud"]
        longitud_decimal = data["capturas"][0]["longitud"]

        # Verificar la conversión correcta
        self.assertAlmostEqual(latitud_decimal, 1.5, places=2)
        self.assertAlmostEqual(longitud_decimal, -45.25, places=2)

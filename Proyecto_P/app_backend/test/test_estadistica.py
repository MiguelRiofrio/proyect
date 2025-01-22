from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import datetime
from app_backend.models import (
    Especie,
    Lance,
    ActividadPesquera,
    DatosCaptura,
    Avistamiento,
    Incidencia,
    Embarcacion
)


class EstadisticasPesquerasViewTests(APITestCase):

    def setUp(self):
        """
        Configura los datos de prueba antes de cada prueba.
        """

        # Crear embarcación
        self.embarcacion = Embarcacion.objects.create(
            codigo_embarcacion=1,
            nombre_embarcacion="Embarcacion A",
            matricula="MAT-001"
        )

        # Crear especies
        self.especie1 = Especie.objects.create(
            codigo_especie=1,
            taxa="Taxa A",
            genero="Género A",
            especie="Especie A",
            nombre_cientifico="Especie Científica A",
            nombre_comun="Especie Común A"
        )

        self.actividad = ActividadPesquera.objects.create(
            codigo_actividad="ACT-001",
            fecha_salida=datetime(2023, 5, 1).date(),
            fecha_entrada=datetime(2023, 5, 10).date(),
            tipo_arte_pesca="Palangre",
            pesca_objetivo="Atún",
            embarcacion=self.embarcacion  # Relacionando la embarcación
        )

        self.lance = Lance.objects.create(
            codigo_lance="L001",
            actividad=self.actividad,
            numero_lance=1,
            calado_fecha=datetime(2023, 5, 5).date(),
            profundidad_suelo_marino=100.0
        )

        DatosCaptura.objects.create(
            codigo_captura="C001",
            lance=self.lance,
            especie=self.especie1,
            individuos_retenidos=20,
            individuos_descarte=5,
            peso_retenido=200.0,
            peso_descarte=20.0
        )

        Avistamiento.objects.create(
            codigo_avistamiento="A001",
            lance=self.lance,
            especie=self.especie1,
            alimentandose=3,
            deambulando=1,
            en_reposo=2
        )

        Incidencia.objects.create(
            codigo_incidencia="I001",
            lance=self.lance,
            especie=self.especie1,
            herida_grave=1,
            herida_leve=2,
            muerto=0,
            Totalindividuos=3,
            observacion="Herida leve"
        )

    def test_estadisticas_sin_filtros(self):
        """
        Prueba el endpoint sin aplicar filtros.
        """
        url = reverse('estadisticas-pesqueras')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        print(data)  # Imprimir para depuración

        # Validar resumen general
        self.assertEqual(data['resumen_general']['total_especies'], 1)
        self.assertEqual(data['resumen_general']['total_capturas'], 1)
        self.assertEqual(data['resumen_general']['total_avistamientos'], 1)
        self.assertEqual(data['resumen_general']['total_incidencias'], 1)
        self.assertEqual(data['resumen_general']['total_lances'], 1)
        self.assertEqual(data['resumen_general']['profundidad_maxima'], 100.0)
        self.assertEqual(data['resumen_general']['profundidad_minima'], 100.0)

    def test_estadisticas_con_filtros_validos(self):
        """
        Prueba el endpoint aplicando filtros válidos.
        """
        url = reverse('estadisticas-pesqueras')
        params = {
            'fecha_inicio': '2023-05-01',
            'fecha_fin': '2023-05-10',
            'embarcacion': 'Embarcacion A'  # Debe coincidir con la embarcación creada
        }
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        print(data)  # Imprimir para depuración

        self.assertEqual(data['resumen_general']['total_especies'], 1)
        self.assertEqual(data['resumen_general']['total_capturas'], 1)
        self.assertEqual(data['resumen_general']['total_incidencias'], 1)

    def test_estadisticas_con_filtros_invalidos(self):
        """
        Prueba el endpoint con filtros inválidos.
        """
        url = reverse('estadisticas-pesqueras')
        params = {
            'fecha_inicio': '2023-05-XX',  # Fecha inválida
            'fecha_fin': '2023-05-10'
        }
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.json())

    def test_estadisticas_sin_resultados(self):
        """
        Prueba el endpoint cuando no hay resultados con los filtros aplicados.
        """
        url = reverse('estadisticas-pesqueras')
        params = {
            'fecha_inicio': '2025-01-01',
            'fecha_fin': '2025-01-10'
        }
        response = self.client.get(url, params)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(data['resumen_general']['total_especies'], 0)
        self.assertEqual(data['resumen_general']['total_capturas'], 0)
        self.assertEqual(data['resumen_general']['total_incidencias'], 0)

    def test_estadisticas_filtros_aplicados(self):
        """
        Prueba que los filtros aplicados se reflejen correctamente en la respuesta.
        """
        url = reverse('estadisticas-pesqueras')
        params = {
            'profundidad_min': '50',
            'profundidad_max': '150',
        }
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        filtros_aplicados = data['filtros_aplicados']
        print(filtros_aplicados)  # Imprimir para depuración

        self.assertEqual(filtros_aplicados['Profundidad Mínima'], '50')
        self.assertEqual(filtros_aplicados['Profundidad Máxima'], '150')
        self.assertEqual(filtros_aplicados['Embarcación'], "Todas")
        self.assertEqual(filtros_aplicados['Mes de Captura'], "Todos")
        self.assertEqual(filtros_aplicados['Año de Captura'], "Todos")

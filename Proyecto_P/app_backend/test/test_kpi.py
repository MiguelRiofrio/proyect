from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from app_backend.models import Especie, DatosCaptura, Avistamiento, Incidencia
from django.db.models import Sum, F

class KpiHomeViewTests(APITestCase):
    
    def setUp(self):
        # Crear especies
        self.especie1 = Especie.objects.create(
            codigo_especie=1,
            nombre_cientifico="Thunnus albacares",
            nombre_comun="Atún aleta amarilla"
        )
        self.especie2 = Especie.objects.create(
            codigo_especie=2,
            nombre_cientifico="Katsuwonus pelamis",
            nombre_comun="Bonito"
        )
        
        # Crear capturas
        DatosCaptura.objects.create(
            codigo_captura="C001",
            especie=self.especie1,
            individuos_retenidos=50,
            individuos_descarte=10
        )
        DatosCaptura.objects.create(
            codigo_captura="C002",
            especie=self.especie2,
            individuos_retenidos=30,
            individuos_descarte=5
        )
        
        # Crear avistamientos
        Avistamiento.objects.create(
            codigo_avistamiento="A001",
            especie=self.especie1,
            alimentandose=5,
            deambulando=3,
            en_reposo=2
        )
        Avistamiento.objects.create(
            codigo_avistamiento="A002",
            especie=self.especie2,
            alimentandose=2,
            deambulando=1,
            en_reposo=1
        )
        
        # Crear incidencias
        Incidencia.objects.create(
            codigo_incidencia="I001",
            especie=self.especie1,
            herida_grave=1,
            herida_leve=2,
            muerto=0
        )
        Incidencia.objects.create(
            codigo_incidencia="I002",
            especie=self.especie2,
            herida_grave=0,
            herida_leve=1,
            muerto=1
        )

    def test_kpi_home_success(self):
        """
        Prueba que el endpoint devuelva los KPIs correctamente.
        """
        url = reverse('kpi_home')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        self.assertEqual(data['total_especies'], 2)
        self.assertEqual(data['total_avistamientos'], 14)  # 5+3+2+2+1+1
        self.assertEqual(data['total_incidencias'], 5)  # 1+2+0+0+1+1
        self.assertEqual(data['especie_mas_comun']['especie__nombre_cientifico'], "Thunnus albacares")
        self.assertGreater(data['indice_diversidad_shannon'], 0)

    def test_kpi_home_no_data(self):
        """
        Prueba que el endpoint devuelva valores predeterminados cuando no hay datos.
        """
        Especie.objects.all().delete()
        DatosCaptura.objects.all().delete()
        Avistamiento.objects.all().delete()
        Incidencia.objects.all().delete()

        url = reverse('kpi_home')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(data['total_especies'], 0)
        self.assertEqual(data['total_avistamientos'], 0)
        self.assertEqual(data['total_incidencias'], 0)
        self.assertEqual(data['especie_mas_comun']['especie__nombre_cientifico'], "No disponible")
        self.assertEqual(data['indice_diversidad_shannon'], 0)

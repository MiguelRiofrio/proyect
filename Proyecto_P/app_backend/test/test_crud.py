# src/tests.py

from rest_framework.test import APITestCase
from rest_framework import status
from ..models import Puerto, ActividadPesquera, Persona, Embarcacion, Especie, TipoCarnada

class PuertoViewSetTest(APITestCase):
    def setUp(self):
        self.puerto = Puerto.objects.create(nombre_puerto="Puerto Central", codigo_puerto=1)
        self.persona = Persona.objects.create(nombre="Juan Pérez", codigo_persona=1, rol="CAPITAN")
        self.embarcacion = Embarcacion.objects.create(nombre_embarcacion="La Marina", matricula="MAT123", codigo_embarcacion=1)
        self.actividad = ActividadPesquera.objects.create(
            codigo_actividad="ACT001",
            fecha_salida="2023-01-01",
            fecha_entrada="2023-01-10",
            puerto_salida=self.puerto,
            puerto_entrada=self.puerto,
            armador=self.persona,
            capitan=self.persona,
            observador=self.persona,
            embarcacion=self.embarcacion,
            tipo_arte_pesca="Palangre",
            pesca_objetivo="PPP",
            ingresado=self.persona
        )

    def test_create_puerto(self):
        url = "/api/puertos/"
        data = {
            "nombre_puerto": "Puerto Nuevo"
            # Agrega otros campos si es necesario
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['codigo_puerto'], 2)

    def test_create_puerto_duplicate(self):
        url = "/api/puertos/"
        data = {
            "nombre_puerto": "Puerto Central"
            # Agrega otros campos si es necesario
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nombre_puerto', response.data)

    def test_destroy_puerto_asociado_a_actividad(self):
        url = f"/api/puertos/{self.puerto.codigo_puerto}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_destroy_puerto_no_asociado_a_actividad(self):
        puerto_nuevo = Puerto.objects.create(nombre_puerto="Puerto Libre", codigo_puerto=2)
        url = f"/api/puertos/{puerto_nuevo.codigo_puerto}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

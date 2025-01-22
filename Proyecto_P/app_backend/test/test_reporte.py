# tests.py

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import datetime, time
from ..models import (
    TipoCarnada,
    Puerto,
    Persona,
    Embarcacion,
    Especie,
    ActividadPesquera,
    Lance,
    DatosCaptura,
    Avistamiento,
    Incidencia,
    IncidenciaAves,
    IncidenciaMamiferos,
    IncidenciaTortugas,
    IncidenciaPalangre,
)

class ReporteDetalladoViewTests(APITestCase):
    def setUp(self):
        # Crear Embarcaciones
        self.embarcacion1 = Embarcacion.objects.create(
            codigo_embarcacion=1,
            nombre_embarcacion="Embarcacion A",
            matricula="MAT-001"
        )
        self.embarcacion2 = Embarcacion.objects.create(
            codigo_embarcacion=2,
            nombre_embarcacion="Embarcacion B",
            matricula="MAT-002"
        )

        # Crear Puertos
        self.puerto_salida = Puerto.objects.create(
            codigo_puerto=1,
            nombre_puerto="Puerto Salida"
        )
        self.puerto_entrada = Puerto.objects.create(
            codigo_puerto=2,
            nombre_puerto="Puerto Entrada"
        )

        # Crear Personas
        self.armador = Persona.objects.create(
            codigo_persona=1,
            nombre="Armador Uno",
            rol="Armador"
        )
        self.capitan = Persona.objects.create(
            codigo_persona=2,
            nombre="Capitán Uno",
            rol="Capitán"
        )
        self.observador = Persona.objects.create(
            codigo_persona=3,
            nombre="Observador Uno",
            rol="Observador"
        )
        self.ingresado = Persona.objects.create(
            codigo_persona=4,
            nombre="Ingresado Uno",
            rol="Ingresado"
        )

        # Crear Actividades Pesqueras
        self.actividad1 = ActividadPesquera.objects.create(
            codigo_actividad="ACT-001",
            fecha_salida=datetime(2023, 5, 1).date(),
            fecha_entrada=datetime(2023, 5, 10).date(),
            puerto_salida=self.puerto_salida,
            puerto_entrada=self.puerto_entrada,
            armador=self.armador,
            capitan=self.capitan,
            observador=self.observador,
            embarcacion=self.embarcacion1,
            tipo_arte_pesca="Palangre",
            pesca_objetivo="Objetivo A",
            ingresado=self.ingresado
        )
        self.actividad2 = ActividadPesquera.objects.create(
            codigo_actividad="ACT-002",
            fecha_salida=datetime(2023, 6, 5).date(),
            fecha_entrada=datetime(2023, 6, 15).date(),
            puerto_salida=self.puerto_salida,
            puerto_entrada=self.puerto_entrada,
            armador=self.armador,
            capitan=self.capitan,
            observador=self.observador,
            embarcacion=self.embarcacion2,
            tipo_arte_pesca="Arrastre",
            pesca_objetivo="Objetivo B",
            ingresado=self.ingresado
        )

        # Crear Especies
        self.especie1 = Especie.objects.create(
            codigo_especie=1,
            taxa="Taxa A",
            genero="Género A",
            especie="Especie A",
            nombre_cientifico="Especie Científica A",
            nombre_comun="Especie Común A"
        )
        self.especie2 = Especie.objects.create(
            codigo_especie=2,
            taxa="Taxa B",
            genero="Género B",
            especie="Especie B",
            nombre_cientifico="Especie Científica B",
            nombre_comun="Especie Común B"
        )

        # Crear Lances
        self.lance1 = Lance.objects.create(
            codigo_lance="L001",
            actividad=self.actividad1,
            numero_lance=1,
            calado_fecha=datetime(2023, 5, 15).date(),
            calado_hora=time(8, 30),
            profundidad_suelo_marino=50.0
        )
        self.lance2 = Lance.objects.create(
            codigo_lance="L002",
            actividad=self.actividad2,
            numero_lance=2,
            calado_fecha=datetime(2023, 6, 20).date(),
            calado_hora=time(9, 45),
            profundidad_suelo_marino=150.0
        )

        # Crear DatosCaptura
        DatosCaptura.objects.create(
            codigo_captura="C001",
            lance=self.lance1,
            especie=self.especie1,
            individuos_retenidos=10,
            individuos_descarte=2,
            peso_retenido=100.5,
            peso_descarte=20.0
        )
        DatosCaptura.objects.create(
            codigo_captura="C002",
            lance=self.lance2,
            especie=self.especie2,
            individuos_retenidos=5,
            individuos_descarte=1,
            peso_retenido=50.0,
            peso_descarte=10.0
        )

        # Crear Avistamientos
        Avistamiento.objects.create(
            codigo_avistamiento="A001",
            lance=self.lance1,
            especie=self.especie1,
            alimentandose=3,
            deambulando=2,
            en_reposo=1
        )
        Avistamiento.objects.create(
            codigo_avistamiento="A002",
            lance=self.lance2,
            especie=self.especie2,
            alimentandose=1,
            deambulando=1,
            en_reposo=0
        )

        # Crear Incidencias
        incidencia1 = Incidencia.objects.create(
            codigo_incidencia="I001",
            lance=self.lance1,
            especie=self.especie1,
            herida_grave=1,
            herida_leve=0,
            muerto=0,
            Totalindividuos=1,
            observacion="Observación 1"
        )
        IncidenciaAves.objects.create(
            codigo_incidencia=incidencia1,
            aves_pico=0,
            aves_patas=0,
            aves_alas=0
        )
        IncidenciaMamiferos.objects.create(
            codigo_incidencia=incidencia1,
            mamiferos_hocico=0,
            mamiferos_cuello=0,
            mamiferos_cuerpo=0
        )
        IncidenciaTortugas.objects.create(
            codigo_incidencia=incidencia1,
            tortugas_pico=0,
            tortugas_cuerpo=0,
            tortugas_aleta=0
        )
        IncidenciaPalangre.objects.create(
            codigo_incidencia=incidencia1,
            palangre_orinque=0,
            palangre_reinal=0,
            palangre_anzuelo=0,
            palangre_linea_madre=0
        )

        incidencia2 = Incidencia.objects.create(
            codigo_incidencia="I002",
            lance=self.lance2,
            especie=self.especie2,
            herida_grave=0,
            herida_leve=2,
            muerto=1,
            Totalindividuos=3,
            observacion="Observación 2"
        )
        IncidenciaAves.objects.create(
            codigo_incidencia=incidencia2,
            aves_pico=0,
            aves_patas=0,
            aves_alas=0
        )
        IncidenciaMamiferos.objects.create(
            codigo_incidencia=incidencia2,
            mamiferos_hocico=0,
            mamiferos_cuello=0,
            mamiferos_cuerpo=0
        )
        IncidenciaTortugas.objects.create(
            codigo_incidencia=incidencia2,
            tortugas_pico=0,
            tortugas_cuerpo=0,
            tortugas_aleta=0
        )
        IncidenciaPalangre.objects.create(
            codigo_incidencia=incidencia2,
            palangre_orinque=0,
            palangre_reinal=0,
            palangre_anzuelo=0,
            palangre_linea_madre=0
        )

    def test_reporte_sin_filtros(self):
        """
        Prueba el endpoint sin aplicar ningún filtro.
        """
        url = reverse('reporte')  # Asegúrate de que el nombre de la URL es 'reporte'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        
        # Verificar que el resumen general contiene las claves esperadas
        self.assertIn('resumen_general', data)
        resumen = data['resumen_general']
        self.assertEqual(resumen['total_especies'], 2)
        self.assertEqual(resumen['total_capturas'], 2)
        self.assertEqual(resumen['total_avistamientos'], 2)
        self.assertEqual(resumen['total_incidencias'], 2)
        self.assertEqual(resumen['total_lances'], 2)
        self.assertEqual(resumen['profundidad_maxima'], 150.0)
        self.assertEqual(resumen['profundidad_minima'], 50.0)

        # Verificar las estadísticas de capturas
        self.assertIn('capturas_mas_comunes', data)
        self.assertEqual(len(data['capturas_mas_comunes']), 2)

        # Verificar los filtros aplicados
        self.assertIn('filtros_aplicados', data)
        filtros = data['filtros_aplicados']
        self.assertEqual(filtros['Profundidad Mínima'], "No especificada")
        self.assertEqual(filtros['Profundidad Máxima'], "No especificada")
        self.assertEqual(filtros['Embarcación'], "Todas")
        self.assertEqual(filtros['Mes de Captura'], "Todos")
        self.assertEqual(filtros['Año de Captura'], "Todos")

    def test_reporte_con_filtros_validos(self):
        """
        Prueba el endpoint aplicando filtros válidos.
        """
        url = reverse('reporte')
        params = {
            'profundidad_min': '40',
            'profundidad_max': '100',
            'embarcacion': 'Embarcacion A',
            'mes_captura': '5',
            'ano_captura': '2023',
        }
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()

        # Verificar el resumen general
        resumen = data['resumen_general']
        self.assertEqual(resumen['total_especies'], 2)
        self.assertEqual(resumen['total_capturas'], 1)
        self.assertEqual(resumen['total_avistamientos'], 1)
        self.assertEqual(resumen['total_incidencias'], 1)
        self.assertEqual(resumen['total_lances'], 1)
        self.assertEqual(resumen['profundidad_maxima'], 50.0)
        self.assertEqual(resumen['profundidad_minima'], 50.0)

        # Verificar los filtros aplicados
        filtros = data['filtros_aplicados']
        self.assertEqual(filtros['Profundidad Mínima'], '40')
        self.assertEqual(filtros['Profundidad Máxima'], '100')
        self.assertEqual(filtros['Embarcación'], 'Embarcacion A')
        self.assertEqual(filtros['Mes de Captura'], '5')
        self.assertEqual(filtros['Año de Captura'], '2023')

    def test_reporte_con_filtros_invalidos(self):
        """
        Prueba el endpoint aplicando filtros inválidos.
        """
        url = reverse('reporte')
        params = {
            'profundidad_min': 'cincuenta',  # No es un número
            'ano_captura': 'veintitrés',    # No es un año válido
        }
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = response.json()
        self.assertIn('error', data)
        # Dependiendo de cómo maneje Django el orden de las validaciones, puede variar el mensaje de error
        self.assertTrue(
            "El filtro 'profundidad_min' debe ser un número." in data['error'] or
            "El filtro 'ano_captura' debe ser un número válido de año." in data['error']
        )

    def test_reporte_con_mes_invalido(self):
        """
        Prueba el endpoint con un valor de mes inválido.
        """
        url = reverse('reporte')
        params = {
            'mes_captura': '13',  # Mes inválido
        }
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data = response.json()
        self.assertIn('error', data)
        self.assertIn("Los valores de 'mes_captura' deben estar entre 1 y 12.", data['error'])

    def test_reporte_sin_lances(self):
        """
        Prueba el endpoint cuando no hay lances que coincidan con los filtros.
        """
        # Primero, eliminamos todos los lances
        Lance.objects.all().delete()

        url = reverse('reporte')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        resumen = data['resumen_general']
        self.assertEqual(resumen['total_especies'], 2)
        self.assertEqual(resumen['total_capturas'], 0)
        self.assertEqual(resumen['total_avistamientos'], 0)
        self.assertEqual(resumen['total_incidencias'], 0)
        self.assertEqual(resumen['total_lances'], 0)
        self.assertIsNone(resumen['profundidad_maxima'])
        self.assertIsNone(resumen['profundidad_minima'])

    def test_reporte_con_filtros_no_existentes(self):
        """
        Prueba el endpoint con filtros que no corresponden a ningún registro existente.
        """
        url = reverse('reporte')
        params = {
            'embarcacion': 'Embarcacion Z',  # Embarcación que no existe
        }
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        resumen = data['resumen_general']
        self.assertEqual(resumen['total_especies'], 2)
        self.assertEqual(resumen['total_capturas'], 0)
        self.assertEqual(resumen['total_avistamientos'], 0)
        self.assertEqual(resumen['total_incidencias'], 0)
        self.assertEqual(resumen['total_lances'], 0)

    

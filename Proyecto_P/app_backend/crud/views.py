from rest_framework import viewsets,status
from .. import models, serializers
from django.forms.models import model_to_dict 
from django.shortcuts import get_object_or_404
from django.db.models import Max
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.views import APIView
from django.db import transaction

class SchemaMixin:
    @action(detail=False, methods=['get'], url_path='schema')
    def schema(self, request):
        """
        Devuelve el esquema de campos para el modelo asociado.
        """
        fields = [
            {"name": field.name, "type": field.get_internal_type()}
            for field in self.queryset.model._meta.fields
        ]
        return Response(fields)

def taxa_list(request):
    taxonomias = models.Especie.objects.values_list('taxa', flat=True).distinct()
    taxonomias_filtradas = [taxa for taxa in taxonomias if taxa]  # Elimina valores nulos o vacíos
    return JsonResponse(list(taxonomias_filtradas), safe=False)

# CRUD para Actividad Pesquera
class ActividadPesqueraViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.ActividadPesquera.objects.all()
    serializer_class = serializers.ActividadPesqueraSerializer

    @action(detail=False, methods=['get'], url_path='list')
    def Actividad_list(self, request):
        """
        API personalizada para devolver código, tipo de pesca, nombre de embarcación y puerto de salida.
        """
        actividades = models.ActividadPesquera.objects.all()
        data = actividades.values(
            'codigo_actividad', 
            'tipo_arte_pesca', 
            'embarcacion__nombre_embarcacion', 
            'puerto_salida__nombre_puerto',
            'pesca_objetivo'
        )
        return Response(data)

    @action(detail=True, methods=['get'], url_path='details')
    def Detalle_actividad(self, request, pk=None):
        """
        Devuelve los detalles completos de una actividad pesquera, incluyendo datos de claves foráneas y detalles anidados de lances, capturas, avistamientos e incidencias.
        """
        try:
            # Obtener la actividad con todas las relaciones relevantes
            actividad = models.ActividadPesquera.objects.select_related(
                'puerto_salida', 'puerto_entrada', 'embarcacion', 'armador', 'capitan', 'observador','ingresado'
            ).get(pk=pk)

            # Construir JSON automáticamente
            response_data = {
                'codigo_actividad': actividad.codigo_actividad,
                'fecha_salida': actividad.fecha_salida,
                'fecha_entrada': actividad.fecha_entrada,
                'tipo_arte_pesca': actividad.tipo_arte_pesca,
                'pesca_objetivo': actividad.pesca_objetivo,
                'puerto_salida': {
                    "id": actividad.puerto_salida.codigo_puerto,
                    "nombre": actividad.puerto_salida.nombre_puerto
                } if actividad.puerto_salida else None,
                'puerto_entrada': {
                    "id": actividad.puerto_entrada.codigo_puerto,
                    "nombre": actividad.puerto_entrada.nombre_puerto
                } if actividad.puerto_entrada else None,
                'embarcacion': {
                    "codigo_embarcacion": actividad.embarcacion.codigo_embarcacion,
                    "nombre_embarcacion": actividad.embarcacion.nombre_embarcacion,
                    "matricula": actividad.embarcacion.matricula
                } if actividad.embarcacion else None,
                'armador': {
                    "id": actividad.armador.codigo_persona,
                    "nombre": actividad.armador.nombre
                } if actividad.armador else None,
                'capitan': {
                    "id": actividad.capitan.codigo_persona,
                    "nombre": actividad.capitan.nombre
                } if actividad.capitan else None,
                'observador': {
                    "id": actividad.observador.codigo_persona,
                    "nombre": actividad.observador.nombre
                } if actividad.observador else None,
                'ingresado': {
                    "id": actividad.ingresado.codigo_persona,
                    "nombre": actividad.ingresado.nombre
                } if actividad.ingresado else None,
                'lances': []
            }

            # Agregar lances y sus detalles anidados
            lances = models.Lance.objects.filter(actividad=actividad).select_related('coordenadas')
            for lance in lances:
                lance_data = {
                    'codigo_lance': lance.codigo_lance,
                    'numero_lance': lance.numero_lance,
                    'calado_fecha': lance.calado_fecha,
                    'calado_hora': lance.calado_hora,
                    'profundidad_suelo_marino': lance.profundidad_suelo_marino,
                    'coordenadas': {
                        "latitud": convertir_coordenadas(
                            lance.coordenadas.latitud_ns,
                            lance.coordenadas.latitud_grados,
                            lance.coordenadas.latitud_minutos
                        ) if lance.coordenadas else None,
                        "longitud": convertir_coordenadas(
                            lance.coordenadas.longitud_w,
                            lance.coordenadas.longitud_grados,
                            lance.coordenadas.longitud_minutos
                        ) if lance.coordenadas else None
                    } if lance.coordenadas else None,
                    'detalles': {}
                }

                # Detalles de LancePalangre y sus Carnadas
                if hasattr(lance, 'lancepalangre'):
                    lance_palangre = lance.lancepalangre
                    lance_data['detalles']['palangre'] = {
                        "tamano_anzuelo": lance_palangre.tamano_anzuelo,
                        "cantidad_anzuelos": lance_palangre.cantidad_anzuelos,
                        "linea_madre_metros": lance_palangre.linea_madre_metros,
                        "profundidad_anzuelo_metros": lance_palangre.profundidad_anzuelo_metros,
                        "carnadas": [
                            {
                                "codigo_carnada": carnada.codigo_tipo_carnada.codigo_tipo_carnada,
                                "nombre_carnada": carnada.codigo_tipo_carnada.nombre_carnada,
                                "porcentaje_carnada": carnada.porcentaje_carnada
                            } for carnada in models.LancePalangreCarnadas.objects.filter(codigo_lance_palangre=lance_palangre)
                        ]
                    }

                # Detalles de LanceCerco
                elif hasattr(lance, 'lancecerco'):
                    lance_data['detalles']['cerco'] = {
                        "altura_red": lance.lancecerco.altura_red,
                        "longitud_red": lance.lancecerco.longitud_red,
                        "malla_cabecero": lance.lancecerco.malla_cabecero,
                        "malla_cuerpo": lance.lancecerco.malla_cuerpo
                    }

                # Detalles de LanceArrastre
                elif hasattr(lance, 'lancearrastre'):
                    lance_data['detalles']['arrastre'] = {
                        "ted": lance.lancearrastre.ted,
                        "copo": lance.lancearrastre.copo,
                        "tunel": lance.lancearrastre.tunel,
                        "pico": lance.lancearrastre.pico
                    }

                # Capturas relacionadas
                lance_data['capturas'] = [
                    {
                        "codigo_captura": captura.codigo_captura,
                        "individuos_retenidos": captura.individuos_retenidos,
                        "individuos_descarte": captura.individuos_descarte,
                        "peso_retenido": captura.peso_retenido,
                        "peso_descarte": captura.peso_descarte,
                        "especie": {
                            "codigo_especie": captura.especie.codigo_especie,
                            "nombre_cientifico": captura.especie.nombre_cientifico
                        } if captura.especie else None
                    } for captura in models.DatosCaptura.objects.filter(lance=lance)
                ]

                # Avistamientos relacionados
                lance_data['avistamientos'] = [
                    {
                        "codigo_avistamiento": avistamiento.codigo_avistamiento,
                        "alimentandose": avistamiento.alimentandose,
                        "deambulando": avistamiento.deambulando,
                        "en_reposo": avistamiento.en_reposo,
                        "especie": {
                            "codigo_especie": avistamiento.especie.codigo_especie,
                            "nombre_cientifico": avistamiento.especie.nombre_cientifico
                        } if avistamiento.especie else None
                    } for avistamiento in models.Avistamiento.objects.filter(lance=lance)
                ]

                # Incidencias relacionadas
                lance_data['incidencias'] = [
                    {
                        "codigo_incidencia": incidencia.codigo_incidencia,
                        "herida_grave": incidencia.herida_grave,
                        "herida_leve": incidencia.herida_leve,
                        "muerto": incidencia.muerto,
                        "total_individuos": incidencia.Totalindividuos,
                        "observacion": incidencia.observacion,
                        "especie": {
                            "codigo_especie": incidencia.especie.codigo_especie,
                            "nombre_cientifico": incidencia.especie.nombre_cientifico
                        } if incidencia.especie else None,
                        "detalles": {
                            "aves": {
                                "pico": incidencia.incidenciaaves.aves_pico,
                                "patas": incidencia.incidenciaaves.aves_patas,
                                "alas": incidencia.incidenciaaves.aves_alas
                            } if hasattr(incidencia, 'incidenciaaves') else None,
                            "mamiferos": {
                                "hocico": incidencia.incidenciamamiferos.mamiferos_hocico,
                                "cuello": incidencia.incidenciamamiferos.mamiferos_cuello,
                                "cuerpo": incidencia.incidenciamamiferos.mamiferos_cuerpo
                            } if hasattr(incidencia, 'incidenciamamiferos') else None,
                            "tortugas": {
                                "pico": incidencia.incidenciatortugas.tortugas_pico,
                                "cuerpo": incidencia.incidenciatortugas.tortugas_cuerpo,
                                "aleta": incidencia.incidenciatortugas.tortugas_aleta
                            } if hasattr(incidencia, 'incidenciatortugas') else None,
                            "palangre": {
                                "orinque": incidencia.incidenciapalangre.palangre_orinque,
                                "reinal": incidencia.incidenciapalangre.palangre_reinal,
                                "anzuelo": incidencia.incidenciapalangre.palangre_anzuelo,
                                "linea_madre": incidencia.incidenciapalangre.palangre_linea_madre
                            } if hasattr(incidencia, 'incidenciapalangre') else None
                        }
                    } for incidencia in models.Incidencia.objects.filter(lance=lance)
                ]

                response_data['lances'].append(lance_data)

            return Response(response_data, status=status.HTTP_200_OK)

        except models.ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class EditarActividadCompleta(APIView):
    def put(self, request, pk):
        """
        Actualiza una actividad pesquera completa, incluyendo lances, capturas, coordenadas, avistamientos e incidencias.
        """
        try:
            data = request.data

            # Iniciar una transacción para garantizar consistencia
            with transaction.atomic():
                # Actualizar ActividadPesquera
                actividad = models.ActividadPesquera.objects.get(pk=pk)
                actividad.fecha_salida = data.get('fecha_salida', actividad.fecha_salida)
                actividad.fecha_entrada = data.get('fecha_entrada', actividad.fecha_entrada)
                actividad.tipo_arte_pesca = data.get('tipo_arte_pesca', actividad.tipo_arte_pesca)
                actividad.pesca_objetivo = data.get('pesca_objetivo', actividad.pesca_objetivo)
                actividad.puerto_salida_id = data.get('puerto_salida', actividad.puerto_salida_id)
                actividad.puerto_entrada_id = data.get('puerto_entrada', actividad.puerto_entrada_id)
                actividad.embarcacion_id = data.get('embarcacion', actividad.embarcacion_id)
                actividad.armador_id = data.get('armador', actividad.armador_id)
                actividad.capitan_id = data.get('capitan', actividad.capitan_id)
                actividad.observador_id = data.get('observador', actividad.observador_id)
                actividad.save()

                # Actualizar Lances y datos anidados
                for lance_data in data.get('lances', []):
                    lance, created = models.Lance.objects.update_or_create(
                        codigo_lance=lance_data.get('codigo_lance'),
                        actividad=actividad,
                        defaults={
                            'numero_lance': lance_data.get('numero_lance'),
                            'calado_fecha': lance_data.get('calado_fecha'),
                            'calado_hora': lance_data.get('calado_hora'),
                            'profundidad_suelo_marino': lance_data.get('profundidad_suelo_marino'),
                        }
                    )

                    # Actualizar Coordenadas
                    coordenadas_data = lance_data.get('coordenadas')
                    if coordenadas_data:
                        models.Coordenadas.objects.update_or_create(
                            codigo_lance=lance,
                            defaults={
                                'latitud_ns': coordenadas_data.get('latitud_ns'),
                                'latitud_grados': coordenadas_data.get('latitud_grados'),
                                'latitud_minutos': coordenadas_data.get('latitud_minutos'),
                                'longitud_w': coordenadas_data.get('longitud_w'),
                                'longitud_grados': coordenadas_data.get('longitud_grados'),
                                'longitud_minutos': coordenadas_data.get('longitud_minutos'),
                            }
                        )

                    # Actualizar Capturas
                    for captura_data in lance_data.get('capturas', []):
                        models.DatosCaptura.objects.update_or_create(
                            codigo_captura=captura_data.get('codigo_captura'),
                            lance=lance,
                            defaults={
                                'especie_id': captura_data.get('especie'),
                                'individuos_retenidos': captura_data.get('individuos_retenidos'),
                                'individuos_descarte': captura_data.get('individuos_descarte'),
                                'peso_retenido': captura_data.get('peso_retenido'),
                                'peso_descarte': captura_data.get('peso_descarte'),
                            }
                        )

                    # Actualizar Avistamientos
                    for avistamiento_data in lance_data.get('avistamientos', []):
                        models.Avistamiento.objects.update_or_create(
                            codigo_avistamiento=avistamiento_data.get('codigo_avistamiento'),
                            lance=lance,
                            defaults={
                                'especie_id': avistamiento_data.get('especie'),
                                'alimentandose': avistamiento_data.get('alimentandose'),
                                'deambulando': avistamiento_data.get('deambulando'),
                                'en_reposo': avistamiento_data.get('en_reposo'),
                            }
                        )

                    # Actualizar Incidencias
                    for incidencia_data in lance_data.get('incidencias', []):
                        incidencia, created = models.Incidencia.objects.update_or_create(
                            codigo_incidencia=incidencia_data.get('codigo_incidencia'),
                            lance=lance,
                            defaults={
                                'especie_id': incidencia_data.get('especie'),
                                'herida_grave': incidencia_data.get('herida_grave'),
                                'herida_leve': incidencia_data.get('herida_leve'),
                                'muerto': incidencia_data.get('muerto'),
                                'Totalindividuos': incidencia_data.get('total_individuos'),
                                'observacion': incidencia_data.get('observacion'),
                            }
                        )

                        # Actualizar detalles de Incidencia (aves, mamíferos, etc.)
                        if 'aves' in incidencia_data:
                            models.IncidenciaAves.objects.update_or_create(
                                codigo_incidencia=incidencia,
                                defaults=incidencia_data['aves']
                            )
                        if 'mamiferos' in incidencia_data:
                            models.IncidenciaMamiferos.objects.update_or_create(
                                codigo_incidencia=incidencia,
                                defaults=incidencia_data['mamiferos']
                            )
                        if 'tortugas' in incidencia_data:
                            models.IncidenciaTortugas.objects.update_or_create(
                                codigo_incidencia=incidencia,
                                defaults=incidencia_data['tortugas']
                            )
                        if 'palangre' in incidencia_data:
                            models.IncidenciaPalangre.objects.update_or_create(
                                codigo_incidencia=incidencia,
                                defaults=incidencia_data['palangre']
                            )

            return Response({"message": "Actividad y datos relacionados actualizados exitosamente."}, status=status.HTTP_200_OK)

        except models.ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# CRUD para Tipo de Carnada
class TipoCarnadaViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.TipoCarnada.objects.all()
    serializer_class = serializers.TipoCarnadaSerializer

# CRUD para Puerto
class PuertoViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Puerto.objects.all()
    serializer_class = serializers.PuertoSerializer

    def create(self, request, *args, **kwargs):
        try:
            # Obtener el máximo código de puerto y generar el siguiente código
            max_codigo = models.Puerto.objects.aggregate(Max('codigo_puerto'))['codigo_puerto__max'] or 0
            request.data['codigo_puerto'] = max_codigo + 1
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            raise ValidationError({"nombre_puerto": "El nombre del puerto ya existe."})

# CRUD para Persona
class PersonaViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Persona.objects.all()
    serializer_class = serializers.PersonaSerializer


# CRUD para Embarcación
class EmbarcacionViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Embarcacion.objects.all()
    serializer_class = serializers.EmbarcacionSerializer


# CRUD para Coordenadas
class CoordenadasViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Coordenadas.objects.all()
    serializer_class = serializers.CoordenadasSerializer


# CRUD para Especies
class EspecieViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Especie.objects.all()
    serializer_class = serializers.EspecieSerializer


# CRUD para Lances
class LanceViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Lance.objects.all()
    serializer_class = serializers.LanceSerializer
    


# CRUD para Datos de Captura
class DatosCapturaViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.DatosCaptura.objects.all()
    serializer_class = serializers.DatosCapturaSerializer


# CRUD para Avistamientos
class AvistamientoViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Avistamiento.objects.all()
    serializer_class = serializers.AvistamientoSerializer


# CRUD para Incidencias
class IncidenciaViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Incidencia.objects.all()
    serializer_class = serializers.IncidenciaSerializer

def convertir_coordenadas(ns, grados, minutos):
        """
        Convierte las coordenadas en formato NS/EW, Grados y Minutos a decimal.
        Maneja mayúsculas y minúsculas para 'NS/EW'.
        """
        decimal = float(grados) + float(minutos) / 60
        if ns.lower() in ['s', 'w']:  # Convertir a minúsculas para comparar
            decimal = -decimal
        return round(decimal, 4)
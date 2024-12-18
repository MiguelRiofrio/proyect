from rest_framework import viewsets,status
from .. import models, serializers
from django.forms.models import model_to_dict
from django.db.models import Max
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response

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
    
    @action(detail=False, methods=['post'], url_path='create-details')
    def create_with_details(self, request):
        try:
            data = request.data

            # Crear la actividad pesquera
            actividad_serializer = serializers.ActividadPesqueraSerializer(data=data)
            actividad_serializer.is_valid(raise_exception=True)
            actividad = actividad_serializer.save()

            # Crear los lances relacionados
            for lance_data in data.get('lances', []):
                lance_data['actividad'] = actividad.codigo_actividad
                lance_serializer = serializers.LanceSerializer(data=lance_data)
                lance_serializer.is_valid(raise_exception=True)
                lance = lance_serializer.save()

                # Crear capturas asociadas al lance
                for captura_data in lance_data.get('capturas', []):
                    captura_data['lance'] = lance.codigo_lance
                    captura_serializer = serializers.DatosCapturaSerializer(data=captura_data)
                    captura_serializer.is_valid(raise_exception=True)
                    captura_serializer.save()

                # Crear avistamientos asociados al lance
                for avistamiento_data in lance_data.get('avistamientos', []):
                    avistamiento_data['lance'] = lance.codigo_lance
                    avistamiento_serializer = serializers.AvistamientoSerializer(data=avistamiento_data)
                    avistamiento_serializer.is_valid(raise_exception=True)
                    avistamiento_serializer.save()

                # Crear incidencias asociadas al lance
                for incidencia_data in lance_data.get('incidencias', []):
                    incidencia_data['lance'] = lance.codigo_lance
                    incidencia_serializer = serializers.IncidenciaSerializer(data=incidencia_data)
                    incidencia_serializer.is_valid(raise_exception=True)
                    incidencia_serializer.save()

            return Response({"message": "Actividad creada con detalles correctamente."}, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='details')
    def Detalle_actividad(self, request, pk=None):
        """
        Devuelve los detalles completos de una actividad pesquera, incluyendo datos de claves foráneas y detalles anidados de lances, capturas, avistamientos e incidencias.
        """
        try:
            # Obtener la actividad con todas las relaciones relevantes
            actividad = models.ActividadPesquera.objects.select_related(
                'puerto_salida', 'puerto_entrada', 'embarcacion', 'armador', 'capitan', 'observador'
            ).get(pk=pk)

            # Construir JSON automáticamente
            response_data = model_to_dict(actividad, fields=[
                'codigo_actividad', 'fecha_salida', 'fecha_entrada', 'tipo_arte_pesca', 'pesca_objetivo'
            ], exclude=[])

            # Añadir datos de las relaciones foráneas manualmente
            response_data['puerto_salida'] = {
                "id": actividad.puerto_salida.codigo_puerto,
                "nombre": actividad.puerto_salida.nombre_puerto
            } if actividad.puerto_salida else None

            response_data['puerto_entrada'] = {
                "id": actividad.puerto_entrada.codigo_puerto,
                "nombre": actividad.puerto_entrada.nombre_puerto
            } if actividad.puerto_entrada else None

            response_data['embarcacion'] = {
                "codigo_embarcacion": actividad.embarcacion.codigo_embarcacion,
                "nombre_embarcacion": actividad.embarcacion.nombre_embarcacion,
                "Matricula": actividad.embarcacion.matricula
            } if actividad.embarcacion else None

            response_data['armador'] = {
                "id": actividad.armador.codigo_persona,
                "nombre": actividad.armador.nombre
            } if actividad.armador else None

            response_data['capitan'] = {
                "id": actividad.capitan.codigo_persona,
                "nombre": actividad.capitan.nombre
            } if actividad.capitan else None

            response_data['observador'] = {
                "id": actividad.observador.codigo_persona,
                "nombre": actividad.observador.nombre
            } if actividad.observador else None

            # Agregar lances y sus detalles anidados
            lances = models.Lance.objects.filter(actividad=actividad).select_related('coordenadas')
            response_data['lances'] = []
            for lance in lances:
                lance_data = model_to_dict(lance, fields=[
                    'codigo_lance', 'numero_lance', 'calado_fecha', 'calado_hora', 'profundidad_suelo_marino'
                ])

                # Coordenadas relacionadas
                if lance.coordenadas:
                    latitud = convertir_coordenadas(
                        lance.coordenadas.latitud_ns,
                        lance.coordenadas.latitud_grados,
                        lance.coordenadas.latitud_minutos
                    )
                    longitud = convertir_coordenadas(
                        lance.coordenadas.longitud_w,
                        lance.coordenadas.longitud_grados,
                        lance.coordenadas.longitud_minutos
                    )
                    lance_data['coordenadas'] = {
                        "latitud": latitud,
                        "longitud": longitud
                    }

                # Detalles de LancePalangre y sus Carnadas
                if hasattr(lance, 'lancepalangre'):
                    lance_palangre = lance.lancepalangre
                    lance_data['detalles_palangre'] = {
                        "tamano_anzuelo": lance_palangre.tamano_anzuelo,
                        "cantidad_anzuelos": lance_palangre.cantidad_anzuelos,
                        "linea_madre_metros": lance_palangre.linea_madre_metros,
                        "profundidad_anzuelo_metros": lance_palangre.profundidad_anzuelo_metros
                    }

                    # Consultar las carnadas relacionadas con LancePalangreCarnadas
                    carnadas = models.LancePalangreCarnadas.objects.filter(codigo_lance_palangre=lance_palangre).select_related('codigo_tipo_carnada')
                    lance_data['detalles_palangre']['carnadas'] = [
                        {
                            "codigo_carnada": carnada.codigo_carnada,
                            "nombre_carnada": carnada.codigo_tipo_carnada.nombre_carnada,
                            "porcentaje_carnada": carnada.porcentaje_carnada
                        }
                        for carnada in carnadas
                    ]

                # Detalles de Lancecerco
                elif hasattr(lance, 'lancecerco'):
                    lance_data['detalles_lance_cerco'] = model_to_dict(
                        lance.lancecerco,
                        fields=['altura_red', 'longitud_red', 'malla_cabecero', 'malla_cuerpo']
                    )

                # Detalles de Lancearrastre
                elif hasattr(lance, 'lancearrastre'):
                    lance_data['detalles_lance_arrastre'] = model_to_dict(
                        lance.lancearrastre,
                        fields=['ted', 'copo', 'tunel', 'pico']
                    )

                # Capturas relacionadas
                capturas = models.DatosCaptura.objects.filter(lance=lance).select_related('especie')
                lance_data['capturas'] = []
                for captura in capturas:
                    captura_data = model_to_dict(captura, fields=[
                        'codigo_captura', 'individuos_retenidos', 'individuos_descarte', 'peso_retenido', 'peso_descarte'
                    ])
                    if captura.especie:
                        captura_data['especie'] = model_to_dict(captura.especie, fields=['id', 'nombre_cientifico'])
                    lance_data['capturas'].append(captura_data)

                # Avistamientos relacionados
                avistamientos = models.Avistamiento.objects.filter(lance=lance).select_related('especie')
                lance_data['avistamientos'] = []
                for avistamiento in avistamientos:
                    avistamiento_data = model_to_dict(avistamiento, fields=[
                        'codigo_avistamiento', 'grupos_avi_int', 'alimentandose', 'deambulando', 'en_reposo'
                    ])
                    if avistamiento.especie:
                        avistamiento_data['especie'] = model_to_dict(avistamiento.especie, fields=['id', 'nombre_cientifico'])
                    lance_data['avistamientos'].append(avistamiento_data)

                # Incidencias relacionadas
                incidencias = models.Incidencia.objects.filter(lance=lance).select_related('especie')
                lance_data['incidencias'] = []
                for incidencia in incidencias:
                    incidencia_data = model_to_dict(incidencia, fields=[
                        'codigo_incidencia', 'grupos_avi_int', 'herida_grave', 'herida_leve', 'muerto', 'Totalindividuos', 'observacion'
                    ])
                    if incidencia.especie:
                        incidencia_data['especie'] = model_to_dict(incidencia.especie, fields=['id', 'nombre_cientifico'])

                    # Detalles específicos de incidencias
                    if hasattr(incidencia, 'incidenciaaves'):
                        incidencia_data['detalles_aves'] = model_to_dict(
                            incidencia.incidenciaaves,
                            fields=['aves_pico', 'aves_patas', 'aves_alas']
                        )
                    if hasattr(incidencia, 'incidenciamamiferos'):
                        incidencia_data['detalles_mamiferos'] = model_to_dict(
                            incidencia.incidenciamamiferos,
                            fields=['mamiferos_hocico', 'mamiferos_cuello', 'mamiferos_cuerpo']
                        )
                    if hasattr(incidencia, 'incidenciatortugas'):
                        incidencia_data['detalles_tortugas'] = model_to_dict(
                            incidencia.incidenciatortugas,
                            fields=['tortugas_pico', 'tortugas_cuerpo', 'tortugas_aleta']
                        )
                    if hasattr(incidencia, 'incidenciapalangre'):
                        incidencia_data['detalles_Incpalangre'] = model_to_dict(
                            incidencia.incidenciapalangre,
                            fields=['palangre_orinque', 'palangre_reinal', 'palangre_anzuelo', 'palangre_linea_madre']
                        )
                    lance_data['incidencias'].append(incidencia_data)

                response_data['lances'].append(lance_data)

            return Response(response_data, status=status.HTTP_200_OK)
        except models.ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['put'], url_path='update-details')
    def Actualizar_actividad(self, request, pk=None):
        """
        Actualiza los detalles completos de una actividad pesquera, incluyendo datos de claves foráneas y detalles anidados de lances, capturas, avistamientos e incidencias.
        """
        try:
            # Obtener la actividad pesquera existente
            actividad = models.ActividadPesquera.objects.get(pk=pk)

            # Actualizar campos básicos de la actividad
            actividad.codigo_actividad = request.data.get('codigo_actividad', actividad.codigo_actividad)
            actividad.fecha_salida = request.data.get('fecha_salida', actividad.fecha_salida)
            actividad.fecha_entrada = request.data.get('fecha_entrada', actividad.fecha_entrada)
            actividad.tipo_arte_pesca = request.data.get('tipo_arte_pesca', actividad.tipo_arte_pesca)
            actividad.pesca_objetivo = request.data.get('pesca_objetivo', actividad.pesca_objetivo)

            # Actualizar relaciones foráneas de la actividad
            if 'embarcacion' in request.data:
                embarcacion_data = request.data['embarcacion']
                embarcacion, _ = models.Embarcacion.objects.update_or_create(
                    codigo_embarcacion=embarcacion_data.get('codigo_embarcacion'),
                    defaults={
                        'nombre_embarcacion': embarcacion_data.get('nombre_embarcacion'),
                        'matricula': embarcacion_data.get('matricula')
                    }
                )
                actividad.embarcacion = embarcacion

            if 'puerto_salida' in request.data:
                puerto_salida_data = request.data['puerto_salida']
                puerto_salida, _ = models.Puerto.objects.update_or_create(
                    codigo_puerto=puerto_salida_data.get('codigo_puerto'),
                    defaults={'nombre_puerto': puerto_salida_data.get('nombre_puerto')}
                )
                actividad.puerto_salida = puerto_salida

            if 'puerto_entrada' in request.data:
                puerto_entrada_data = request.data['puerto_entrada']
                puerto_entrada, _ = models.Puerto.objects.update_or_create(
                    codigo_puerto=puerto_entrada_data.get('codigo_puerto'),
                    defaults={'nombre_puerto': puerto_entrada_data.get('nombre_puerto')}
                )
                actividad.puerto_entrada = puerto_entrada

            actividad.save()

            # Actualizar lances y sus detalles anidados
            lances_data = request.data.get('lances', [])
            for lance_data in lances_data:
                coordenadas_data = lance_data.get('coordenadas', {})
                coordenadas, _ = models.Coordenadas.objects.update_or_create(
                    latitud_ns=coordenadas_data.get('latitud_ns'),
                    latitud_grados=coordenadas_data.get('latitud_grados'),
                    latitud_minutos=coordenadas_data.get('latitud_minutos'),
                    longitud_w=coordenadas_data.get('longitud_w'),
                    longitud_grados=coordenadas_data.get('longitud_grados'),
                    longitud_minutos=coordenadas_data.get('longitud_minutos'),
                )

                lance, created = models.Lance.objects.update_or_create(
                    codigo_lance=lance_data.get('codigo_lance'),
                    actividad=actividad,
                    defaults={
                        'numero_lance': lance_data.get('numero_lance'),
                        'calado_fecha': lance_data.get('calado_fecha'),
                        'calado_hora': lance_data.get('calado_hora'),
                        'profundidad_suelo_marino': lance_data.get('profundidad_suelo_marino'),
                        'coordenadas': coordenadas,
                    }
                )
                
                # Actualizar detalles de LancePalangre
                if 'detalles_palangre' in lance_data:
                    detalles_palangre = lance_data['detalles_palangre']
                    palangre, _ = models.LancePalangre.objects.update_or_create(
                        lance=lance,
                        defaults={
                            'tamano_anzuelo': detalles_palangre.get('tamano_anzuelo'),
                            'cantidad_anzuelos': detalles_palangre.get('cantidad_anzuelos'),
                            'linea_madre_metros': detalles_palangre.get('linea_madre_metros'),
                            'profundidad_anzuelo_metros': detalles_palangre.get('profundidad_anzuelo_metros'),
                        }
                    )
                    # Actualizar carnadas
                    carnadas_data = detalles_palangre.get('carnadas', [])
                    for carnada_data in carnadas_data:
                        carnada_tipo, _ = models.Carnada.objects.update_or_create(
                            codigo_carnada=carnada_data.get('codigo_carnada'),
                            defaults={'nombre_carnada': carnada_data.get('nombre_carnada')}
                        )
                        models.LancePalangreCarnadas.objects.update_or_create(
                            codigo_lance_palangre=palangre,
                            codigo_tipo_carnada=carnada_tipo,
                            defaults={
                                'porcentaje_carnada': carnada_data.get('porcentaje_carnada')
                            }
                        )

                # Actualizar capturas
                capturas_data = lance_data.get('capturas', [])
                for captura_data in capturas_data:
                    models.DatosCaptura.objects.update_or_create(
                        lance=lance,
                        codigo_captura=captura_data.get('codigo_captura'),
                        defaults={
                            'individuos_retenidos': captura_data.get('individuos_retenidos'),
                            'peso_retenido': captura_data.get('peso_retenido'),
                            'peso_descarte': captura_data.get('peso_descarte'),
                        }
                    )

                # Actualizar incidencias con detalles específicos
                incidencias_data = lance_data.get('incidencias', [])
                for incidencia_data in incidencias_data:
                    incidencia, _ = models.Incidencia.objects.update_or_create(
                        lance=lance,
                        codigo_incidencia=incidencia_data.get('codigo_incidencia'),
                        defaults={
                            'grupos_avi_int': incidencia_data.get('grupos_avi_int'),
                            'herida_grave': incidencia_data.get('herida_grave'),
                            'herida_leve': incidencia_data.get('herida_leve'),
                            'muerto': incidencia_data.get('muerto'),
                            'Totalindividuos': incidencia_data.get('Totalindividuos'),
                            'observacion': incidencia_data.get('observacion'),
                        }
                    )
                    
                    if 'detalles_Incpalangre' in incidencia_data:
                        detalles_palangre = incidencia_data['detalles_Incpalangre']
                        models.IncidenciaPalangre.objects.update_or_create(
                            incidencia=incidencia,
                            defaults={
                                'palangre_orinque': detalles_palangre.get('palangre_orinque'),
                                'palangre_reinal': detalles_palangre.get('palangre_reinal'),
                                'palangre_anzuelo': detalles_palangre.get('palangre_anzuelo'),
                                'palangre_linea_madre': detalles_palangre.get('palangre_linea_madre')
                            }
                        )
                    if 'detalles_aves' in incidencia_data:
                        detalles_aves = incidencia_data['detalles_aves']
                        models.IncidenciaAves.objects.update_or_create(
                            incidencia=incidencia,
                            defaults={
                                'aves_pico': detalles_aves.get('aves_pico'),
                                'aves_patas': detalles_aves.get('aves_patas'),
                                'aves_alas': detalles_aves.get('aves_alas'),
                            }
                        )
                    if 'detalles_mamiferos' in incidencia_data:
                        detalles_mamiferos = incidencia_data['detalles_mamiferos']
                        models.IncidenciaMamiferos.objects.update_or_create(
                            incidencia=incidencia,
                            defaults={
                                'mamiferos_hocico': detalles_mamiferos.get('mamiferos_hocico'),
                                'mamiferos_cuello': detalles_mamiferos.get('mamiferos_cuello'),
                                'mamiferos_cuerpo': detalles_mamiferos.get('mamiferos_cuerpo'),
                            }
                        )
                    if 'detalles_tortugas' in incidencia_data:
                        detalles_tortugas = incidencia_data['detalles_tortugas']
                        models.IncidenciaTortugas.objects.update_or_create(
                            incidencia=incidencia,
                            defaults={
                                'tortugas_pico': detalles_tortugas.get('tortugas_pico'),
                                'tortugas_cuerpo': detalles_tortugas.get('tortugas_cuerpo'),
                                'tortugas_aleta': detalles_tortugas.get('tortugas_aleta'),
                            }
                        )
            
            return Response({"mensaje": "Actividad actualizada correctamente."}, status=status.HTTP_200_OK)
        except models.ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
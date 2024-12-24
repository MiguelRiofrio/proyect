from rest_framework import viewsets,status
from .. import models, serializers
from django.forms.models import model_to_dict 
from django.shortcuts import get_object_or_404
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

    @action(detail=True, methods=['put'], url_path='edit-details')
    def Editar_actividad(self, request, pk=None):
        """
        Permite editar los detalles completos de una actividad pesquera, incluyendo sus relaciones asociadas
        (lances, coordenadas, capturas, incidencias, detalles de lances específicos, y carnadas).
        """
        try:
            # Obtener la actividad
            actividad = models.ActividadPesquera.objects.get(pk=pk)

            # Actualizar la actividad pesquera
            actividad_data = request.data
            actividad_serializer = serializers.ActividadPesqueraSerializer(
                actividad, data=actividad_data, partial=True
            )
            actividad_serializer.is_valid(raise_exception=True)
            actividad_serializer.save()

            # Actualizar lances
            lances_data = actividad_data.get('lances', [])
            for lance_data in lances_data:
                lance_codigo = lance_data.get('codigo_lance')
                if not lance_codigo:
                    continue

                # Buscar o crear el lance
                lance, created = models.Lance.objects.get_or_create(
                    codigo_lance=lance_codigo,
                    defaults={'actividad': actividad}
                )

                # Actualizar los datos del lance
                lance_serializer = serializers.LanceSerializer(lance, data=lance_data, partial=True)
                lance_serializer.is_valid(raise_exception=True)
                lance_serializer.save()

                # Actualizar coordenadas del lance
                if 'coordenadas' in lance_data:
                    coordenadas_data = lance_data['coordenadas']
                    coordenadas, _ = models.Coordenadas.objects.get_or_create(
                        codigo_coordenadas=lance.coordenadas.codigo_coordenadas if lance.coordenadas else None
                    )
                    coordenadas_serializer = serializers.CoordenadasSerializer(
                        coordenadas, data=coordenadas_data, partial=True
                    )
                    coordenadas_serializer.is_valid(raise_exception=True)
                    coordenadas_serializer.save()
                    lance.coordenadas = coordenadas
                    lance.save()

                # Manejar submodelos de Lance
                if 'detalles_palangre' in lance_data:
                    detalles_palangre = lance_data['detalles_palangre']
                    palangre, _ = models.LancePalangre.objects.get_or_create(codigo_lance=lance)
                    palangre_serializer = serializers.LancePalangreSerializer(
                        palangre, data=detalles_palangre, partial=True
                    )
                    palangre_serializer.is_valid(raise_exception=True)
                    palangre_serializer.save()


                    # Manejar carnadas de LancePalangre
                    carnadas_data = detalles_palangre.get('carnadas', [])
                    existing_carnadas = {carnada.codigo_carnada: carnada for carnada in palangre.lancepalangrecarnadas_set.all()}
                    for carnada_data in carnadas_data:
                        carnada_codigo = carnada_data.get('codigo_carnada')
                        if carnada_codigo in existing_carnadas:
                            carnada = existing_carnadas.pop(carnada_codigo)
                            carnada_serializer = serializers.LancePalangreCarnadasSerializer(
                                carnada, data=carnada_data, partial=True
                            )
                        else:
                            carnada_serializer = serializers.LancePalangreCarnadasSerializer(data=carnada_data)
                        carnada_serializer.is_valid(raise_exception=True)
                        carnada_serializer.save()
                    # Eliminar carnadas no incluidas
                    for remaining_carnada in existing_carnadas.values():
                        remaining_carnada.delete()

                # Detalles de LanceCerco
                if 'detalles_lance_cerco' in lance_data:
                    detalles_cerco = lance_data['detalles_lance_cerco']
                    cerco, _ = models.LanceCerco.objects.get_or_create(codigo_lance=lance)
                    cerco_serializer = serializers.LanceCercoSerializer(
                        cerco, data=detalles_cerco, partial=True
                    )
                    cerco_serializer.is_valid(raise_exception=True)
                    cerco_serializer.save()

                # Detalles de LanceArrastre
                if 'detalles_lance_arrastre' in lance_data:
                    detalles_arrastre = lance_data['detalles_lance_arrastre']
                    arrastre, _ = models.LanceArrastre.objects.get_or_create(codigo_lance=lance)
                    arrastre_serializer = serializers.LanceArrastreSerializer(
                        arrastre, data=detalles_arrastre, partial=True
                    )
                    arrastre_serializer.is_valid(raise_exception=True)
                    arrastre_serializer.save()

                # Actualizar capturas relacionadas con el lance
                capturas_data = lance_data.get('capturas', [])
                for captura_data in capturas_data:
                    captura_codigo = captura_data.get('codigo_captura')
                    captura, _ = models.DatosCaptura.objects.get_or_create(
                        codigo_captura=captura_codigo,
                        defaults={'lance': lance}
                    )
                    captura_serializer = serializers.DatosCapturaSerializer(
                        captura, data=captura_data, partial=True
                    )
                    captura_serializer.is_valid(raise_exception=True)
                    captura_serializer.save()

                # Actualizar incidencias relacionadas con el lance
                incidencias_data = lance_data.get('incidencias', [])
                for incidencia_data in incidencias_data:
                    incidencia_codigo = incidencia_data.get('codigo_incidencia')
                    incidencia, _ = models.Incidencia.objects.get_or_create(
                        codigo_incidencia=incidencia_codigo,
                        defaults={'lance': lance}
                    )
                    incidencia_serializer = serializers.IncidenciaSerializer(
                        incidencia, data=incidencia_data, partial=True
                    )
                    incidencia_serializer.is_valid(raise_exception=True)
                    incidencia_serializer.save()

                    # Detalles específicos de incidencias
                    if 'detalles_aves' in incidencia_data:
                        aves_serializer = serializers.IncidenciaAvesSerializer(
                            incidencia.incidenciaaves, data=incidencia_data['detalles_aves'], partial=True
                        )
                        aves_serializer.is_valid(raise_exception=True)
                        aves_serializer.save()

                    if 'detalles_mamiferos' in incidencia_data:
                        mamiferos_serializer = serializers.IncidenciaMamiferosSerializer(
                            incidencia.incidenciamamiferos, data=incidencia_data['detalles_mamiferos'], partial=True
                        )
                        mamiferos_serializer.is_valid(raise_exception=True)
                        mamiferos_serializer.save()

                    if 'detalles_tortugas' in incidencia_data:
                        tortugas_serializer = serializers.IncidenciaTortugasSerializer(
                            incidencia.incidenciatortugas, data=incidencia_data['detalles_tortugas'], partial=True
                        )
                        tortugas_serializer.is_valid(raise_exception=True)
                        tortugas_serializer.save()

                    if 'detalles_incidencia_palangre' in incidencia_data:
                        palangre_serializer = serializers.IncidenciaPalangreSerializer(
                            incidencia.incidenciapalangre, data=incidencia_data['detalles_incidencia_palangre'], partial=True
                        )
                        palangre_serializer.is_valid(raise_exception=True)
                        palangre_serializer.save()


            return Response({"message": "Actividad editada correctamente."}, status=status.HTTP_200_OK)

        except models.ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)              
        except Exception as e:
            return Response({"error": f"Error inesperado: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
                        "grupos_avi_int": avistamiento.grupos_avi_int,
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
                        "grupos_avi_int": incidencia.grupos_avi_int,
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

    @action(detail=False, methods=['post'], url_path='create_details')
    def Añadir_actividad(self, request):
        """
        Añade una nueva actividad pesquera con sus relaciones anidadas.
        """
        try:
            # Datos de la actividad principal
            actividad_data = request.data
            lances_data = actividad_data.pop('lances', [])
            
            # Convertir identificadores en instancias
            actividad_data['puerto_salida'] = models.Puerto.objects.get(pk=actividad_data['puerto_salida'])
            actividad_data['puerto_entrada'] = models.Puerto.objects.get(pk=actividad_data['puerto_entrada'])
            actividad_data['embarcacion'] = models.Embarcacion.objects.get(pk=actividad_data['embarcacion'])
            actividad_data['capitan'] = models.Persona.objects.get(pk=actividad_data['capitan'])
            actividad_data['armador'] = models.Persona.objects.get(pk=actividad_data['armador'])
            actividad_data['observador'] = models.Persona.objects.get(pk=actividad_data['observador'])
            actividad_data['ingresado'] = models.Persona.objects.get(pk=actividad_data['ingresado'])

            # Crear la actividad principal
            actividad = models.ActividadPesquera.objects.create(**actividad_data)

            # Crear lances asociados
            for lance_data in lances_data:
                capturas_data = lance_data.pop('capturas', [])
                avistamientos_data = lance_data.pop('avistamientos', [])
                incidencias_data = lance_data.pop('incidencias', [])
                coordenadas_data = lance_data.pop('coordenadas', None)
                carnadas_data = lance_data.pop('carnadas', [])

                # Crear lance
                lance = models.Lance.objects.create(actividad=actividad, **lance_data)

                # Agregar coordenadas si están presentes
                if coordenadas_data:
                    models.Coordenadas.objects.create(lance=lance, **coordenadas_data)

                # Crear detalles según el tipo de lance
                if 'tipo_lance' in lance_data:
                    if lance_data['tipo_lance'] == 'palangre':
                        lance_palangre = models.LancePalangre.objects.create(lance=lance, **lance_data.get('detalles', {}))
                        for carnada in carnadas_data:
                            models.LancePalangreCarnadas.objects.create(codigo_lance_palangre=lance_palangre, **carnada)
                    elif lance_data['tipo_lance'] == 'cerco':
                        models.LanceCerco.objects.create(lance=lance, **lance_data.get('detalles', {}))
                    elif lance_data['tipo_lance'] == 'arrastre':
                        models.LanceArrastre.objects.create(lance=lance, **lance_data.get('detalles', {}))

                # Crear capturas
                for captura_data in capturas_data:
                    models.DatosCaptura.objects.create(lance=lance, **captura_data)

                # Crear avistamientos
                for avistamiento_data in avistamientos_data:
                    models.Avistamiento.objects.create(lance=lance, **avistamiento_data)

                # Crear incidencias
                for incidencia_data in incidencias_data:
                    detalles_data = incidencia_data.pop('detalles', {})
                    incidencia = models.Incidencia.objects.create(lance=lance, **incidencia_data)

                    # Detalles específicos por tipo
                    if 'aves' in detalles_data:
                        models.IncidenciaAves.objects.create(codigo_incidencia=incidencia, **detalles_data['aves'])
                    if 'mamiferos' in detalles_data:
                        models.IncidenciaMamiferos.objects.create(codigo_incidencia=incidencia, **detalles_data['mamiferos'])
                    if 'tortugas' in detalles_data:
                        models.IncidenciaTortugas.objects.create(codigo_incidencia=incidencia, **detalles_data['tortugas'])
                    if 'palangre' in detalles_data:
                        models.IncidenciaPalangre.objects.create(codigo_incidencia=incidencia, **detalles_data['palangre'])

            return Response({"message": "Actividad pesquera añadida exitosamente."}, status=status.HTTP_201_CREATED)

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
    
@action(detail=True, methods=['post'], url_path='add-lance')
def add_lance(self, request, pk=None):
    """
    Agrega un nuevo lance a una actividad pesquera existente.
    """
    try:
        # Obtener la actividad pesquera existente
        actividad = self.get_object()

        # Validar y guardar los datos del lance
        lance_data = request.data
        lance_data['actividad'] = actividad.codigo_actividad  # Vincular el lance a la actividad
        lance_serializer = serializers.LanceSerializer(data=lance_data)
        lance_serializer.is_valid(raise_exception=True)
        lance = lance_serializer.save()

        # Manejar datos adicionales según el tipo de lance
        if lance_data.get('tipo') == 'palangre':
            palangre_serializer = serializers.LancePalangreSerializer(data=lance_data.get('palangre'))
            palangre_serializer.is_valid(raise_exception=True)
            palangre_serializer.save(codigo_lance=lance)

        elif lance_data.get('tipo') == 'arrastre':
            arrastre_serializer = serializers.LanceArrastreSerializer(data=lance_data.get('arrastre'))
            arrastre_serializer.is_valid(raise_exception=True)
            arrastre_serializer.save(codigo_lance=lance)

        elif lance_data.get('tipo') == 'cerco':
            cerco_serializer = serializers.LanceCercoSerializer(data=lance_data.get('cerco'))
            cerco_serializer.is_valid(raise_exception=True)
            cerco_serializer.save(codigo_lance=lance)

        return Response({"message": "Lance agregado correctamente."}, status=status.HTTP_201_CREATED)

    except ValidationError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except models.ActividadPesquera.DoesNotExist:
        return Response({"error": "Actividad no encontrada."}, status=status.HTTP_404_NOT_FOUND)


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
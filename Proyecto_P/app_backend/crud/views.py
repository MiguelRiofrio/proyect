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


    @action(detail=False, methods=['post'], url_path='create')
    def create_activity(self, request):
        """
        Crear una actividad pesquera con todos los detalles anidados (lances, capturas, avistamientos, incidencias).
        """
        try:
            with transaction.atomic():
                # Extraer datos principales de la actividad
                actividad_data = request.data

                # Validar campos requeridos
                required_fields = ['codigo_actividad', 'fecha_salida', 'fecha_entrada', 'tipo_arte_pesca',
                                   'puerto_salida', 'puerto_entrada', 'embarcacion', 'armador', 'capitan',
                                   'observador', 'ingresado']
                for field in required_fields:
                    if field not in actividad_data:
                        return Response({"error": f"Campo '{field}' es requerido."},
                                        status=status.HTTP_400_BAD_REQUEST)

                # Crear actividad
                actividad = models.ActividadPesquera.objects.create(
                    codigo_actividad=actividad_data['codigo_actividad'],
                    fecha_salida=actividad_data['fecha_salida'],
                    fecha_entrada=actividad_data['fecha_entrada'],
                    tipo_arte_pesca=actividad_data['tipo_arte_pesca'],
                    pesca_objetivo=actividad_data.get('pesca_objetivo', ''),
                    puerto_salida_id=actividad_data.get('puerto_salida'),
                    puerto_entrada_id=actividad_data.get('puerto_entrada'),
                    embarcacion_id=actividad_data.get('embarcacion'),
                    armador_id=actividad_data.get('armador'),
                    capitan_id=actividad_data.get('capitan'),
                    observador_id=actividad_data.get('observador'),
                    ingresado_id=actividad_data.get('ingresado')
                )

                # Obtener el tipo de arte de pesca desde la actividad
                tipo_arte_pesca = actividad.tipo_arte_pesca.lower()

                # Procesar lances
                lances_data = actividad_data.get('lances', [])
                for lance_data in lances_data:
                    # Validar campos requeridos para cada lance (sin 'tipo')
                    lance_required_fields = ['codigo_lance', 'numero_lance', 'calado_fecha',
                                             'calado_hora', 'profundidad_suelo_marino', 'detalles']
                    for field in lance_required_fields:
                        if field not in lance_data:
                            return Response({"error": f"Campo '{field}' es requerido en lances."},
                                            status=status.HTTP_400_BAD_REQUEST)

                    # Crear lance sin el campo 'tipo'
                    lance = models.Lance.objects.create(
                        codigo_lance=lance_data['codigo_lance'],
                        numero_lance=lance_data['numero_lance'],
                        calado_fecha=lance_data['calado_fecha'],
                        calado_hora=lance_data['calado_hora'],
                        profundidad_suelo_marino=lance_data['profundidad_suelo_marino'],
                        actividad=actividad
                    )

                    # Crear coordenadas si existen
                    coordenadas = lance_data.get('coordenadas')
                    if coordenadas:
                        models.Coordenadas.objects.create(
                            codigo_lance=lance,
                            latitud_ns=coordenadas['latitud_ns'],
                            latitud_grados=coordenadas['latitud_grados'],
                            latitud_minutos=coordenadas['latitud_minutos'],
                            longitud_w=coordenadas['longitud_w'],
                            longitud_grados=coordenadas['longitud_grados'],
                            longitud_minutos=coordenadas['longitud_minutos']
                        )

                    # Obtener detalles del lance
                    detalles = lance_data.get('detalles', {})

                    # Manejar detalles basados en el tipo de arte de pesca de la actividad
                    if tipo_arte_pesca == 'palangre':
                        # Validar campos requeridos para palangre
                        palangre_required_fields = ['Tipo_anzuelo', 'tamano_anzuelo',
                                                    'cantidad_anzuelos', 'linea_madre_metros',
                                                    'profundidad_anzuelo_metros', 'carnadas']
                        for field in palangre_required_fields:
                            if field not in detalles:
                                return Response({"error": f"Campo '{field}' es requerido en detalles de palangre."},
                                                status=status.HTTP_400_BAD_REQUEST)

                        lance_palangre = models.LancePalangre.objects.create(
                            codigo_lance=lance,
                            Tipo_anzuelo=detalles.get('Tipo_anzuelo', 'N'),
                            tamano_anzuelo=detalles.get('tamano_anzuelo', 0.0),
                            cantidad_anzuelos=detalles.get('cantidad_anzuelos', 0),
                            linea_madre_metros=detalles.get('linea_madre_metros', 0.0),
                            profundidad_anzuelo_metros=detalles.get('profundidad_anzuelo_metros', 0.0)
                        )

                        # Manejar carnadas
                        carnadas_data = detalles.get('carnadas', [])
                        for carnada_data in carnadas_data:
                            if 'codigo_tipo_carnada' not in carnada_data or 'porcentaje_carnada' not in carnada_data:
                                return Response({"error": "Campos 'codigo_tipo_carnada' y 'porcentaje_carnada' son requeridos en carnadas."},
                                                status=status.HTTP_400_BAD_REQUEST)
                            models.LancePalangreCarnadas.objects.create(
                                codigo_lance_palangre=lance_palangre,
                                codigo_tipo_carnada_id=carnada_data['codigo_tipo_carnada'],
                                porcentaje_carnada=carnada_data['porcentaje_carnada']
                            )

                    elif tipo_arte_pesca == 'arrastre':
                        # Validar campos requeridos para arrastre
                        arrastre_required_fields = ['ted', 'copo', 'tunel', 'pico']
                        for field in arrastre_required_fields:
                            if field not in detalles:
                                return Response({"error": f"Campo '{field}' es requerido en detalles de arrastre."},
                                                status=status.HTTP_400_BAD_REQUEST)

                        models.LanceArrastre.objects.create(
                            codigo_lance=lance,
                            ted=detalles.get('ted', False),
                            copo=detalles.get('copo', 0),
                            tunel=detalles.get('tunel', 0),
                            pico=detalles.get('pico', 0)
                        )

                    elif tipo_arte_pesca == 'cerco':
                        # Validar campos requeridos para cerco
                        cerco_required_fields = ['altura_red', 'longitud_red', 'malla_cabecero', 'malla_cuerpo']
                        for field in cerco_required_fields:
                            if field not in detalles:
                                return Response({"error": f"Campo '{field}' es requerido en detalles de cerco."},
                                                status=status.HTTP_400_BAD_REQUEST)

                        models.LanceCerco.objects.create(
                            codigo_lance=lance,
                            altura_red=detalles.get('altura_red', 0.0),
                            longitud_red=detalles.get('longitud_red', 0.0),
                            malla_cabecero=detalles.get('malla_cabecero', 0.0),
                            malla_cuerpo=detalles.get('malla_cuerpo', 0.0)
                        )

                    else:
                        return Response({"error": f"Tipo de arte de pesca '{tipo_arte_pesca}' no reconocido."},
                                        status=status.HTTP_400_BAD_REQUEST)

                    # Crear capturas
                    capturas = lance_data.get('capturas', [])
                    for captura_data in capturas:
                        if 'especie' not in captura_data or 'codigo_especie' not in captura_data['especie']:
                            return Response({"error": "Campo 'codigo_especie' es requerido en captura."},
                                            status=status.HTTP_400_BAD_REQUEST)
                        models.DatosCaptura.objects.create(
                            lance=lance,
                            individuos_retenidos=captura_data['individuos_retenidos'],
                            individuos_descarte=captura_data['individuos_descarte'],
                            peso_retenido=captura_data['peso_retenido'],
                            peso_descarte=captura_data['peso_descarte'],
                            especie_id=captura_data['especie']['codigo_especie']
                        )

                    # Crear avistamientos
                    avistamientos = lance_data.get('avistamientos', [])
                    for avistamiento_data in avistamientos:
                        if 'especie' not in avistamiento_data or 'codigo_especie' not in avistamiento_data['especie']:
                            return Response({"error": "Campo 'codigo_especie' es requerido en avistamiento."},
                                            status=status.HTTP_400_BAD_REQUEST)
                        models.Avistamiento.objects.create(
                            lance=lance,
                            alimentandose=avistamiento_data['alimentandose'],
                            deambulando=avistamiento_data['deambulando'],
                            en_reposo=avistamiento_data['en_reposo'],
                            especie_id=avistamiento_data['especie']['codigo_especie']
                        )

                    # Crear incidencias
                    incidencias = lance_data.get('incidencias', [])
                    for incidencia_data in incidencias:
                        required_incidencia_fields = ['especie', 'herida_grave', 'herida_leve',
                                                      'muerto', 'total_individuos', 'observacion']
                        for field in required_incidencia_fields:
                            if field not in incidencia_data:
                                return Response({"error": f"Campo '{field}' es requerido en incidencia."},
                                                status=status.HTTP_400_BAD_REQUEST)

                        if 'codigo_especie' not in incidencia_data['especie']:
                            return Response({"error": "Campo 'codigo_especie' es requerido en especie de incidencia."},
                                            status=status.HTTP_400_BAD_REQUEST)

                        incidencia = models.Incidencia.objects.create(
                            lance=lance,
                            herida_grave=incidencia_data['herida_grave'],
                            herida_leve=incidencia_data['herida_leve'],
                            muerto=incidencia_data['muerto'],
                            Totalindividuos=incidencia_data['total_individuos'],
                            observacion=incidencia_data['observacion'],
                            especie_id=incidencia_data['especie']['codigo_especie']
                        )

                        # Crear detalles específicos por tipo de incidencia
                        detalles_incidencia = incidencia_data.get('detalles', {})
                        if 'aves' in detalles_incidencia:
                            aves = detalles_incidencia['aves']
                            models.IncidenciaAves.objects.create(
                                incidencia=incidencia,
                                aves_pico=aves.get('pico', 0),
                                aves_patas=aves.get('patas', 0),
                                aves_alas=aves.get('alas', 0)
                            )
                        if 'mamiferos' in detalles_incidencia:
                            mamiferos = detalles_incidencia['mamiferos']
                            models.IncidenciaMamiferos.objects.create(
                                incidencia=incidencia,
                                mamiferos_hocico=mamiferos.get('hocico', 0),
                                mamiferos_cuello=mamiferos.get('cuello', 0),
                                mamiferos_cuerpo=mamiferos.get('cuerpo', 0)
                            )
                        if 'tortugas' in detalles_incidencia:
                            tortugas = detalles_incidencia['tortugas']
                            models.IncidenciaTortugas.objects.create(
                                incidencia=incidencia,
                                tortugas_pico=tortugas.get('pico', 0),
                                tortugas_cuerpo=tortugas.get('cuerpo', 0),
                                tortugas_aleta=tortugas.get('aleta', 0)
                            )
                        if 'palangre' in detalles_incidencia:
                            palangre = detalles_incidencia['palangre']
                            models.IncidenciaPalangre.objects.create(
                                incidencia=incidencia,
                                palangre_orinque=palangre.get('orinque', 0),
                                palangre_reinal=palangre.get('reinal', 0),
                                palangre_anzuelo=palangre.get('anzuelo', 0),
                                palangre_linea_madre=palangre.get('linea_madre', 0)
                            )

            return Response({"message": "Actividad creada exitosamente."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


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
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
            'fecha_salida', 
            'tipo_arte_pesca', 
            'embarcacion__nombre_embarcacion', 
            'puerto_salida__nombre_puerto',
            'observador__nombre'
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
                required_fields = [
                    'codigo_actividad', 'fecha_salida', 'fecha_entrada', 'tipo_arte_pesca',
                    'puerto_salida', 'puerto_entrada', 'embarcacion', 'armador', 'capitan',
                    'observador', 'ingresado'
                ]
                for field in required_fields:
                    if field not in actividad_data:
                        raise ValidationError(f"Campo '{field}' es requerido.")

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
                    lance_required_fields = [
                        'codigo_lance', 'numero_lance', 'calado_fecha',
                        'calado_hora', 'profundidad_suelo_marino', 'detalles'
                    ]
                    for field in lance_required_fields:
                        if field not in lance_data:
                            raise ValidationError(f"Campo '{field}' es requerido en lances.")

                    # Verificar si el lance ya existe
                    codigo_lance = lance_data['codigo_lance']
                    if models.Lance.objects.filter(codigo_lance=codigo_lance).exists():
                        raise ValidationError(f"Lance con código '{codigo_lance}' ya existe.")

                    # Crear lance sin el campo 'tipo'
                    lance = models.Lance.objects.create(
                        codigo_lance=codigo_lance,
                        numero_lance=lance_data['numero_lance'],
                        calado_fecha=lance_data['calado_fecha'],
                        calado_hora=lance_data['calado_hora'],
                        profundidad_suelo_marino=lance_data['profundidad_suelo_marino'],
                        actividad=actividad
                    )

                    # Crear coordenadas si existen
                    coordenadas = lance_data.get('coordenadas')
                    if coordenadas:
                        coordenadas_required_fields = [
                            'latitud_ns', 'latitud_grados', 'latitud_minutos',
                            'longitud_w', 'longitud_grados', 'longitud_minutos'
                        ]
                        for field in coordenadas_required_fields:
                            if field not in coordenadas:
                                raise ValidationError(f"Campo '{field}' es requerido en coordenadas.")

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
                    
                    if tipo_arte_pesca=='':
                        required_fields = []

                    # Manejar detalles basados en el tipo de arte de pesca de la actividad
                    elif tipo_arte_pesca == 'palangre':
                        # Validar campos requeridos para palangre
                        palangre_required_fields = [
                            'Tipo_anzuelo', 'tamano_anzuelo',
                            'cantidad_anzuelos', 'linea_madre_metros',
                            'profundidad_anzuelo_metros', 'carnadas'
                        ]
                        for field in palangre_required_fields:
                            if field not in detalles:
                                raise ValidationError(f"Campo '{field}' es requerido en detalles de palangre.")

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
                                raise ValidationError("Campos 'codigo_tipo_carnada' y 'porcentaje_carnada' son requeridos en carnadas.")
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
                                raise ValidationError(f"Campo '{field}' es requerido en detalles de arrastre.")

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
                                raise ValidationError(f"Campo '{field}' es requerido en detalles de cerco.")

                        models.LanceCerco.objects.create(
                            codigo_lance=lance,
                            altura_red=detalles.get('altura_red', 0.0),
                            longitud_red=detalles.get('longitud_red', 0.0),
                            malla_cabecero=detalles.get('malla_cabecero', 0.0),
                            malla_cuerpo=detalles.get('malla_cuerpo', 0.0)
                        )

                    else:
                        raise ValidationError(f"Tipo de arte de pesca '{tipo_arte_pesca}' no reconocido.")

                    # Crear capturas
                    capturas = lance_data.get('capturas', [])
                    for captura_data in capturas:
                        if 'especie' not in captura_data or 'codigo_especie' not in captura_data['especie']:
                            raise ValidationError("Campo 'codigo_especie' es requerido en captura.")
                        models.DatosCaptura.objects.create(
                            codigo_captura=captura_data['codigo_captura'],
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
                            raise ValidationError("Campo 'codigo_especie' es requerido en avistamiento.")
                        models.Avistamiento.objects.create(
                            codigo_avistamiento=avistamiento_data['codigo_avistamiento'],
                            lance=lance,
                            alimentandose=avistamiento_data['alimentandose'],
                            deambulando=avistamiento_data['deambulando'],
                            en_reposo=avistamiento_data['en_reposo'],
                            especie_id=avistamiento_data['especie']['codigo_especie']
                        )

                    # Crear incidencias
                    incidencias = lance_data.get('incidencias', [])
                    for incidencia_data in incidencias:
                        required_incidencia_fields = [
                            'especie', 'herida_grave', 'herida_leve',
                            'muerto', 'total_individuos', 'observacion'
                        ]
                        for field in required_incidencia_fields:
                            if field not in incidencia_data:
                                raise ValidationError(f"Campo '{field}' es requerido en incidencia.")

                        if 'codigo_especie' not in incidencia_data['especie']:
                            raise ValidationError("Campo 'codigo_especie' es requerido en especie de incidencia.")

                        incidencia = models.Incidencia.objects.create(
                            codigo_incidencia=incidencia_data['codigo_incidencia'],
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
                                codigo_incidencia=incidencia,
                                aves_pico=aves.get('pico', 0),
                                aves_patas=aves.get('patas', 0),
                                aves_alas=aves.get('alas', 0)
                            )
                        if 'mamiferos' in detalles_incidencia:
                            mamiferos = detalles_incidencia['mamiferos']
                            models.IncidenciaMamiferos.objects.create(
                                codigo_incidencia=incidencia,
                                mamiferos_hocico=mamiferos.get('hocico', 0),
                                mamiferos_cuello=mamiferos.get('cuello', 0),
                                mamiferos_cuerpo=mamiferos.get('cuerpo', 0)
                            )
                        if 'tortugas' in detalles_incidencia:
                            tortugas = detalles_incidencia['tortugas']
                            models.IncidenciaTortugas.objects.create(
                                codigo_incidencia=incidencia,
                                tortugas_pico=tortugas.get('pico', 0),
                                tortugas_cuerpo=tortugas.get('cuerpo', 0),
                                tortugas_aleta=tortugas.get('aleta', 0)
                            )
                        if 'palangre' in detalles_incidencia:
                            palangre = detalles_incidencia['palangre']
                            models.IncidenciaPalangre.objects.create(
                                codigo_incidencia=incidencia,
                                palangre_orinque=palangre.get('orinque', 0),
                                palangre_reinal=palangre.get('reinal', 0),
                                palangre_anzuelo=palangre.get('anzuelo', 0),
                                palangre_linea_madre=palangre.get('linea_madre', 0)
                            )

            return Response({"message": "Actividad creada exitosamente."}, status=status.HTTP_201_CREATED)

        except ValidationError as ve:
            # Manejar errores de validación y asegurar que la transacción se revierta
            return Response({"error": ve.detail}, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as ie:
            # Manejar errores de integridad de la base de datos
            if 'Duplicate entry' in str(ie):
                return Response({"error": "Se detectó un valor duplicado en la inserción. Verifica los campos únicos."},
                                status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Error de integridad de la base de datos: " + str(ie)},
                                status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Manejar cualquier otro error inesperado
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(detail=True, methods=['get'], url_path='details-raw')
    def Detalle_actividad_d(self, request, pk=None):
        """
        Devuelve los detalles completos de una actividad pesquera, incluyendo datos de claves foráneas
        y detalles anidados de lances, capturas, avistamientos e incidencias,
        pero sin convertir las coordenadas (se devuelven tal cual están en la BD).
        """
        try:
            actividad = models.ActividadPesquera.objects.select_related(
                'puerto_salida', 'puerto_entrada', 'embarcacion',
                'armador', 'capitan', 'observador', 'ingresado'
            ).get(pk=pk)

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

            # Se obtienen los lances con el related de coordenadas sin convertir
            lances = models.Lance.objects.filter(actividad=actividad).select_related('coordenadas')

            for lance in lances:
                lance_data = {
                    'codigo_lance': lance.codigo_lance,
                    'numero_lance': lance.numero_lance,
                    'calado_fecha': lance.calado_fecha,
                    'calado_hora': lance.calado_hora,
                    'profundidad_suelo_marino': lance.profundidad_suelo_marino,
                    # En vez de usar convertir_coordenadas, devolvemos los campos crudos
                    'coordenadas': {
                        "latitud_ns": lance.coordenadas.latitud_ns,
                        "latitud_grados": lance.coordenadas.latitud_grados,
                        "latitud_minutos": lance.coordenadas.latitud_minutos,
                        "longitud_w": lance.coordenadas.longitud_w,
                        "longitud_grados": lance.coordenadas.longitud_grados,
                        "longitud_minutos": lance.coordenadas.longitud_minutos
                    } if lance.coordenadas else None,
                    'detalles': {}
                }

                # Detalles de Palangre y sus Carnadas
                if hasattr(lance, 'lancepalangre'):
                    lance_palangre = lance.lancepalangre
                    carnadas_palangre = models.LancePalangreCarnadas.objects.filter(
                        codigo_lance_palangre=lance_palangre
                    )
                    lance_data['detalles']['palangre'] = {
                        "tamano_anzuelo": lance_palangre.tamano_anzuelo,
                        "cantidad_anzuelos": lance_palangre.cantidad_anzuelos,
                        "linea_madre_metros": lance_palangre.linea_madre_metros,
                        "profundidad_anzuelo_metros": lance_palangre.profundidad_anzuelo_metros,
                        "carnadas": [
                            {
                                "codigo_carnada": c.codigo_tipo_carnada.codigo_tipo_carnada,
                                "nombre_carnada": c.codigo_tipo_carnada.nombre_carnada,
                                "porcentaje_carnada": c.porcentaje_carnada
                            }
                            for c in carnadas_palangre
                        ]
                    }

                elif hasattr(lance, 'lancecerco'):
                    lance_data['detalles']['cerco'] = {
                        "altura_red": lance.lancecerco.altura_red,
                        "longitud_red": lance.lancecerco.longitud_red,
                        "malla_cabecero": lance.lancecerco.malla_cabecero,
                        "malla_cuerpo": lance.lancecerco.malla_cuerpo
                    }

                elif hasattr(lance, 'lancearrastre'):
                    lance_data['detalles']['arrastre'] = {
                        "ted": lance.lancearrastre.ted,
                        "copo": lance.lancearrastre.copo,
                        "tunel": lance.lancearrastre.tunel,
                        "pico": lance.lancearrastre.pico
                    }

                # Capturas
                datos_captura = models.DatosCaptura.objects.filter(lance=lance)
                lance_data['capturas'] = [
                    {
                        "codigo_captura": c.codigo_captura,
                        "individuos_retenidos": c.individuos_retenidos,
                        "individuos_descarte": c.individuos_descarte,
                        "peso_retenido": c.peso_retenido,
                        "peso_descarte": c.peso_descarte,
                        "especie": {
                            "codigo_especie": c.especie.codigo_especie,
                            "nombre_cientifico": c.especie.nombre_cientifico
                        } if c.especie else None
                    }
                    for c in datos_captura
                ]

                # Avistamientos
                avistamientos = models.Avistamiento.objects.filter(lance=lance)
                lance_data['avistamientos'] = [
                    {
                        "codigo_avistamiento": a.codigo_avistamiento,
                        "alimentandose": a.alimentandose,
                        "deambulando": a.deambulando,
                        "en_reposo": a.en_reposo,
                        "especie": {
                            "codigo_especie": a.especie.codigo_especie,
                            "nombre_cientifico": a.especie.nombre_cientifico
                        } if a.especie else None
                    }
                    for a in avistamientos
                ]

                # Incidencias
                incidencias = models.Incidencia.objects.filter(lance=lance)
                lance_data['incidencias'] = []
                for inc in incidencias:
                    inc_data = {
                        "codigo_incidencia": inc.codigo_incidencia,
                        "herida_grave": inc.herida_grave,
                        "herida_leve": inc.herida_leve,
                        "muerto": inc.muerto,
                        "total_individuos": inc.Totalindividuos,
                        "observacion": inc.observacion,
                        "especie": {
                            "codigo_especie": inc.especie.codigo_especie,
                            "nombre_cientifico": inc.especie.nombre_cientifico
                        } if inc.especie else None,
                        "detalles": {
                            "aves": None,
                            "mamiferos": None,
                            "tortugas": None,
                            "palangre": None
                        }
                    }
                    # Aves
                    if hasattr(inc, 'incidenciaaves'):
                        inc_data['detalles']['aves'] = {
                            "pico": inc.incidenciaaves.aves_pico,
                            "patas": inc.incidenciaaves.aves_patas,
                            "alas": inc.incidenciaaves.aves_alas
                        }
                    # Mamíferos
                    if hasattr(inc, 'incidenciamamiferos'):
                        inc_data['detalles']['mamiferos'] = {
                            "hocico": inc.incidenciamamiferos.mamiferos_hocico,
                            "cuello": inc.incidenciamamiferos.mamiferos_cuello,
                            "cuerpo": inc.incidenciamamiferos.mamiferos_cuerpo
                        }
                    # Tortugas
                    if hasattr(inc, 'incidenciatortugas'):
                        inc_data['detalles']['tortugas'] = {
                            "pico": inc.incidenciatortugas.tortugas_pico,
                            "cuerpo": inc.incidenciatortugas.tortugas_cuerpo,
                            "aleta": inc.incidenciatortugas.tortugas_aleta
                        }
                    # Palangre
                    if hasattr(inc, 'incidenciapalangre'):
                        inc_data['detalles']['palangre'] = {
                            "orinque": inc.incidenciapalangre.palangre_orinque,
                            "reinal": inc.incidenciapalangre.palangre_reinal,
                            "anzuelo": inc.incidenciapalangre.palangre_anzuelo,
                            "linea_madre": inc.incidenciapalangre.palangre_linea_madre
                        }

                    lance_data['incidencias'].append(inc_data)

                # Agregar el lance al response
                response_data['lances'].append(lance_data)

            return Response(response_data, status=status.HTTP_200_OK)

        except models.ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


    @action(detail=True, methods=['put'], url_path='edit')
    def edit_activity(self, request, pk=None):
        """
        Editar una actividad pesquera y sus registros anidados (lances, capturas, avistamientos, incidencias).
        Para simplificar, se eliminarán los registros anidados actuales y se recrearán con la nueva información.
        """
        try:
            with transaction.atomic():
                # Buscar la actividad a editar
                actividad = get_object_or_404(models.ActividadPesquera, pk=pk)
                actividad_data = request.data

                # Validar campos requeridos de la actividad (esto puede modificarse si se admite actualización parcial)
                required_fields = [
                    'codigo_actividad', 'fecha_salida', 'fecha_entrada', 'tipo_arte_pesca',
                    'puerto_salida', 'puerto_entrada', 'embarcacion', 'armador', 'capitan',
                    'observador', 'ingresado'
                ]
                for field in required_fields:
                    if field not in actividad_data:
                        raise ValidationError(f"Campo '{field}' es requerido.")

                # Actualizar los campos principales de la actividad
                actividad.codigo_actividad = actividad_data['codigo_actividad']
                actividad.fecha_salida = actividad_data['fecha_salida']
                actividad.fecha_entrada = actividad_data['fecha_entrada']
                actividad.tipo_arte_pesca = actividad_data['tipo_arte_pesca']
                actividad.pesca_objetivo = actividad_data.get('pesca_objetivo', '')
                actividad.puerto_salida_id = actividad_data.get('puerto_salida')
                actividad.puerto_entrada_id = actividad_data.get('puerto_entrada')
                actividad.embarcacion_id = actividad_data.get('embarcacion')
                actividad.armador_id = actividad_data.get('armador')
                actividad.capitan_id = actividad_data.get('capitan')
                actividad.observador_id = actividad_data.get('observador')
                actividad.ingresado_id = actividad_data.get('ingresado')
                actividad.save()

                # Eliminar los lances actuales para recrearlos con la nueva información
                actividad.lance_set.all().delete()

                # Obtener el tipo de arte de pesca en minúsculas para facilitar las comparaciones
                tipo_arte_pesca = actividad.tipo_arte_pesca.lower()

                # Procesar y recrear cada lance recibido
                lances_data = actividad_data.get('lances', [])
                for lance_data in lances_data:
                    # Validar campos requeridos para cada lance
                    lance_required_fields = [
                        'codigo_lance', 'numero_lance', 'calado_fecha',
                        'calado_hora', 'profundidad_suelo_marino', 'detalles'
                    ]
                    for field in lance_required_fields:
                        if field not in lance_data:
                            raise ValidationError(f"Campo '{field}' es requerido en lances.")

                    # Crear el lance sin necesidad de verificar duplicados (ya se eliminó la info anterior)
                    lance = models.Lance.objects.create(
                        codigo_lance=lance_data['codigo_lance'],
                        numero_lance=lance_data['numero_lance'],
                        calado_fecha=lance_data['calado_fecha'],
                        calado_hora=lance_data['calado_hora'],
                        profundidad_suelo_marino=lance_data['profundidad_suelo_marino'],
                        actividad=actividad
                    )

                    # Procesar la creación de coordenadas (si se envían)
                    coordenadas = lance_data.get('coordenadas')
                    if coordenadas:
                        coordenadas_required_fields = [
                            'latitud_ns', 'latitud_grados', 'latitud_minutos',
                            'longitud_w', 'longitud_grados', 'longitud_minutos'
                        ]
                        for field in coordenadas_required_fields:
                            if field not in coordenadas:
                                raise ValidationError(f"Campo '{field}' es requerido en coordenadas.")
                        models.Coordenadas.objects.create(
                            codigo_lance=lance,
                            latitud_ns=coordenadas['latitud_ns'],
                            latitud_grados=coordenadas['latitud_grados'],
                            latitud_minutos=coordenadas['latitud_minutos'],
                            longitud_w=coordenadas['longitud_w'],
                            longitud_grados=coordenadas['longitud_grados'],
                            longitud_minutos=coordenadas['longitud_minutos']
                        )

                    # Procesar detalles según el tipo de arte de pesca
                    detalles = lance_data.get('detalles', {})
                    if tipo_arte_pesca == 'palangre':
                        # Validar y crear detalles para palangre
                        palangre_required_fields = [
                            'Tipo_anzuelo', 'tamano_anzuelo',
                            'cantidad_anzuelos', 'linea_madre_metros',
                            'profundidad_anzuelo_metros', 'carnadas'
                        ]
                        for field in palangre_required_fields:
                            if field not in detalles:
                                raise ValidationError(f"Campo '{field}' es requerido en detalles de palangre.")

                        lance_palangre = models.LancePalangre.objects.create(
                            codigo_lance=lance,
                            Tipo_anzuelo=detalles.get('Tipo_anzuelo', 'N'),
                            tamano_anzuelo=detalles.get('tamano_anzuelo', 0.0),
                            cantidad_anzuelos=detalles.get('cantidad_anzuelos', 0),
                            linea_madre_metros=detalles.get('linea_madre_metros', 0.0),
                            profundidad_anzuelo_metros=detalles.get('profundidad_anzuelo_metros', 0.0)
                        )

                        # Crear las carnadas asociadas
                        carnadas_data = detalles.get('carnadas', [])
                        for carnada_data in carnadas_data:
                            if 'codigo_tipo_carnada' not in carnada_data or 'porcentaje_carnada' not in carnada_data:
                                raise ValidationError("Campos 'codigo_tipo_carnada' y 'porcentaje_carnada' son requeridos en carnadas.")
                            models.LancePalangreCarnadas.objects.create(
                                codigo_lance_palangre=lance_palangre,
                                codigo_tipo_carnada_id=carnada_data['codigo_tipo_carnada'],
                                porcentaje_carnada=carnada_data['porcentaje_carnada']
                            )

                    elif tipo_arte_pesca == 'arrastre':
                        # Validar y crear detalles para arrastre
                        arrastre_required_fields = ['ted', 'copo', 'tunel', 'pico']
                        for field in arrastre_required_fields:
                            if field not in detalles:
                                raise ValidationError(f"Campo '{field}' es requerido en detalles de arrastre.")

                        models.LanceArrastre.objects.create(
                            codigo_lance=lance,
                            ted=detalles.get('ted', False),
                            copo=detalles.get('copo', 0),
                            tunel=detalles.get('tunel', 0),
                            pico=detalles.get('pico', 0)
                        )

                    elif tipo_arte_pesca == 'cerco':
                        # Validar y crear detalles para cerco
                        cerco_required_fields = ['altura_red', 'longitud_red', 'malla_cabecero', 'malla_cuerpo']
                        for field in cerco_required_fields:
                            if field not in detalles:
                                raise ValidationError(f"Campo '{field}' es requerido en detalles de cerco.")

                        models.LanceCerco.objects.create(
                            codigo_lance=lance,
                            altura_red=detalles.get('altura_red', 0.0),
                            longitud_red=detalles.get('longitud_red', 0.0),
                            malla_cabecero=detalles.get('malla_cabecero', 0.0),
                            malla_cuerpo=detalles.get('malla_cuerpo', 0.0)
                        )

                    else:
                        raise ValidationError(f"Tipo de arte de pesca '{tipo_arte_pesca}' no reconocido.")

                    # Procesar la creación de capturas, avistamientos e incidencias de manera similar...

                return Response({"message": "Actividad editada exitosamente."}, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response({"error": ve.detail}, status=status.HTTP_400_BAD_REQUEST)

        except IntegrityError as ie:
            if 'Duplicate entry' in str(ie):
                return Response({"error": "Se detectó un valor duplicado en la edición. Verifica los campos únicos."},
                                status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Error de integridad de la base de datos: " + str(ie)},
                                status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        

# CRUD para Tipo de Carnada
class TipoCarnadaViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.TipoCarnada.objects.all()
    serializer_class = serializers.TipoCarnadaSerializer

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            try:
                # Obtener el máximo código de tipo de carnada y generar el siguiente código
                max_codigo = models.TipoCarnada.objects.aggregate(Max('codigo_tipo_carnada'))['codigo_tipo_carnada__max'] or 0
                request.data['codigo_tipo_carnada'] = max_codigo + 1
                return super().create(request, *args, **kwargs)
            except IntegrityError:
                raise ValidationError({"nombre_tipo_carnada": "El nombre del tipo de carnada ya existe."})
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar este tipo de carnada porque está relacionado con otros registros."},
                status=status.HTTP_400_BAD_REQUEST
            )


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
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar este puerto porque está relacionado con otros registros."},
                status=status.HTTP_400_BAD_REQUEST
            )   

# CRUD para Persona
class PersonaViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Persona.objects.all()
    serializer_class = serializers.PersonaSerializer

    def create(self, request, *args, **kwargs):
        try:
            # Obtener el máximo código de persona y generar el siguiente código
            max_codigo = models.Persona.objects.aggregate(Max('codigo_persona'))['codigo_persona__max'] or 0
            request.data['codigo_persona'] = max_codigo + 1
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            raise ValidationError({"nombre_persona": "El nombre de la persona ya existe."})
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar esta persona porque está relacionada con otros registros."},
                status=status.HTTP_400_BAD_REQUEST
            )

# CRUD para Embarcación
class EmbarcacionViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Embarcacion.objects.all()
    serializer_class = serializers.EmbarcacionSerializer

    def create(self, request, *args, **kwargs):
        try:
            max_codigo = models.Embarcacion.objects.aggregate(Max('codigo_embarcacion'))['codigo_embarcacion__max'] or 0
            request.data['codigo_embarcacion'] = max_codigo + 1
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            raise ValidationError({"nombre_embarcacion": "El nombre de la embarcación ya existe."})
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar esta embarcación porque está relacionada con otros registros."},
                status=status.HTTP_400_BAD_REQUEST
            )


# CRUD para Especies
class EspecieViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Especie.objects.all()
    serializer_class = serializers.EspecieSerializer

    def create(self, request, *args, **kwargs):
        try:
            max_codigo = models.Especie.objects.aggregate(Max('codigo_especie'))['codigo_especie__max'] or 0
            request.data['codigo_especie'] = max_codigo + 1
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            raise ValidationError({"nombre_especie": "El nombre de la especie ya existe."})


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar esta especie porque está relacionada con otros registros."},
                status=status.HTTP_400_BAD_REQUEST
            )

# CRUD para Coordenadas
class CoordenadasViewSet(SchemaMixin, viewsets.ModelViewSet):
    queryset = models.Coordenadas.objects.all()
    serializer_class = serializers.CoordenadasSerializer


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
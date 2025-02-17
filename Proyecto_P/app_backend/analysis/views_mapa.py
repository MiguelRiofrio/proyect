from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Min, Max,Count,F
from .. import models
from rest_framework import status
from collections import defaultdict


class CoordenadasGeneralAPIView(APIView):
    """
    API para obtener las coordenadas en formato decimal de especies capturadas, 
    avistamientos e incidencias, y realizar un análisis de áreas por especie.
    """

    @staticmethod
    def convertir_coordenadas(ns, grados, minutos):
        """
        Convierte las coordenadas en formato NS/EW, grados y minutos a decimal.
        """
        try:
            decimal = float(grados) + float(minutos) / 60
            if ns and ns.lower() in ['s', 'w']:
                decimal = -decimal
            return round(decimal, 4)
        except (ValueError, TypeError):
            return None

    def get(self, request):
        try:
            # Obtener filtros de la solicitud
            tipo_filtro = request.query_params.get('tipo', 'todos').lower()
            taxa_filtro = request.query_params.get('taxa', '').strip()
            especie_filtro = request.query_params.get('especie', '').strip()  # Filtro por especie (nombre común)
            profundidad_min = request.query_params.get('rango_profundidad_min')
            profundidad_max = request.query_params.get('rango_profundidad_max')
            embarcacion_filtro = request.query_params.get('embarcacion', '').strip()
            puerto_filtro = request.query_params.get('puerto', '').strip()
            year_filter = request.query_params.get('year', '').strip()

            # Construir filtros dinámicos
            filters = Q()
            if taxa_filtro:
                filters &= Q(especie__taxa__iexact=taxa_filtro)
            if especie_filtro:
                filters &= Q(especie__nombre_comun__iexact=especie_filtro)
            if profundidad_min and profundidad_max:
                try:
                    profundidad_min = float(profundidad_min)
                    profundidad_max = float(profundidad_max)
                    filters &= Q(lance__profundidad_suelo_marino__range=(profundidad_min, profundidad_max))
                except ValueError:
                    return Response({"error": "Los valores de profundidad deben ser numéricos."}, status=400)
            if embarcacion_filtro:
                filters &= Q(lance__actividad__embarcacion__nombre_embarcacion__iexact=embarcacion_filtro)
            if puerto_filtro:
                filters &= (
                    Q(lance__actividad__puerto_salida__nombre_puerto__iexact=puerto_filtro) |
                    Q(lance__actividad__puerto_entrada__nombre_puerto__iexact=puerto_filtro)
                )
            if year_filter:
                try:
                    year = int(year_filter)
                    filters &= Q(lance__calado_fecha__year=year)
                except ValueError:
                    return Response({"error": "El año debe ser un número válido."}, status=400)

            # Definir las relaciones a cargar anticipadamente
            select_related_fields = [
                'especie',
                'lance__coordenadas',
                'lance__actividad__embarcacion',
                'lance__actividad__puerto_salida',
                'lance__actividad__puerto_entrada',
            ]

            # Filtrar los datos según el tipo
            capturas = avistamientos = incidencias = []
            if tipo_filtro == "todos":
                capturas = models.DatosCaptura.objects.select_related(*select_related_fields).filter(filters)
                avistamientos = models.Avistamiento.objects.select_related(*select_related_fields).filter(filters)
                incidencias = models.Incidencia.objects.select_related(*select_related_fields).filter(filters)
            elif tipo_filtro == "capturas":
                capturas = models.DatosCaptura.objects.select_related(*select_related_fields).filter(filters)
            elif tipo_filtro == "avistamientos":
                avistamientos = models.Avistamiento.objects.select_related(*select_related_fields).filter(filters)
            elif tipo_filtro == "incidencias":
                incidencias = models.Incidencia.objects.select_related(*select_related_fields).filter(filters)
            else:
                return Response({"error": f"Tipo de filtro inválido: {tipo_filtro}"}, status=400)

            # Procesar los datos y construir la respuesta
            datos_capturas = self.procesar_datos(capturas)
            datos_avistamientos = self.procesar_datos(avistamientos)
            datos_incidencias = self.procesar_datos(incidencias)

            # Combinar todos los registros para el análisis
            registros_combinados = datos_capturas + datos_avistamientos + datos_incidencias
            areas_por_especie = self.analizar_areas_por_especie(registros_combinados)

            data = {
                "capturas": datos_capturas,
                "avistamientos": datos_avistamientos,
                "incidencias": datos_incidencias,
                "areas_por_especie": areas_por_especie
            }
            return Response(data, status=200)

        except Exception as e:
            return Response({"error": f"Error interno del servidor: {str(e)}"}, status=500)

    def procesar_datos(self, queryset):
        """
        Procesa los datos aplicando la conversión de coordenadas.
        """
        registros = []
        try:
            iterator = queryset.iterator()
        except AttributeError:
            iterator = iter(queryset)

        for obj in iterator:
            coordenadas = getattr(obj.lance, 'coordenadas', None)
            if not coordenadas:
                continue

            latitud_decimal = self.convertir_coordenadas(
                coordenadas.latitud_ns, coordenadas.latitud_grados, coordenadas.latitud_minutos
            )
            longitud_decimal = self.convertir_coordenadas(
                coordenadas.longitud_w, coordenadas.longitud_grados, coordenadas.longitud_minutos
            )
            if latitud_decimal is None or longitud_decimal is None:
                continue

            actividad = getattr(obj.lance, 'actividad', None)
            registros.append({
                "especie": obj.especie.nombre_cientifico,
                "nombre_comun": obj.especie.nombre_comun,
                "lance": obj.lance.codigo_lance,
                "latitud": latitud_decimal,
                "longitud": longitud_decimal,
                "profundidad_suelo_marino": obj.lance.profundidad_suelo_marino,
                "taxa": obj.especie.taxa,
                "embarcacion": actividad.embarcacion.nombre_embarcacion if actividad and actividad.embarcacion else "Desconocido",
                "puerto_salida": actividad.puerto_salida.nombre_puerto if actividad and actividad.puerto_salida else "Desconocido",
                "puerto_entrada": actividad.puerto_entrada.nombre_puerto if actividad and actividad.puerto_entrada else "Desconocido",
                "year": obj.lance.calado_fecha.year if obj.lance.calado_fecha else "Desconocido",
            })
        return registros

    def analizar_areas_por_especie(self, registros):
        """
        Realiza un análisis agrupado por especie, determinando para cada una:
          - Número de registros.
          - Área de distribución (mínimo y máximo de latitud y longitud).
        """
        areas_por_especie = {}
        for registro in registros:
            especie = registro["especie"]
            if especie not in areas_por_especie:
                areas_por_especie[especie] = {
                    "nombre_comun": registro["nombre_comun"],
                    "count": 0,
                    "min_lat": registro["latitud"],
                    "max_lat": registro["latitud"],
                    "min_long": registro["longitud"],
                    "max_long": registro["longitud"],
                }
            areas_por_especie[especie]["count"] += 1
            areas_por_especie[especie]["min_lat"] = min(areas_por_especie[especie]["min_lat"], registro["latitud"])
            areas_por_especie[especie]["max_lat"] = max(areas_por_especie[especie]["max_lat"], registro["latitud"])
            areas_por_especie[especie]["min_long"] = min(areas_por_especie[especie]["min_long"], registro["longitud"])
            areas_por_especie[especie]["max_long"] = max(areas_por_especie[especie]["max_long"], registro["longitud"])
        return areas_por_especie



class FiltroMapaAPIView(APIView):
    """
    API para obtener datos filtrados según puerto, embarcaciones, taxas, especies,
    rango de profundidad y año.
    """

    def get(self, request, format=None):
        try:
            # Obtener parámetros de la solicitud
            tipo_filtro = request.GET.get('tipo', 'todos').lower()
            puerto_nombre = request.GET.get('puerto', None)
            taxa_seleccionada = request.GET.get('taxa', None)
            especie_seleccionada = request.GET.get('especie', None)
            year_filter = request.GET.get('year', None)

            # Inicializar variables
            tasas_disponibles = []
            puertos_flat = []
            embarcaciones = []
            profundidad_rango = {'min_profundidad': 0, 'max_profundidad': 100}
            años_disponibles = []
            especies_disponibles = []

            # Definir relaciones a cargar en el queryset base
            select_related_fields = [
                'lance__actividad__embarcacion',
                'lance__actividad__puerto_salida',
                'lance__actividad__puerto_entrada',
            ]

            # Definir el queryset base según el tipo de filtro
            if tipo_filtro == 'capturas':
                base_qs = models.DatosCaptura.objects.select_related(*select_related_fields).all()
            elif tipo_filtro == 'avistamientos':
                base_qs = models.Avistamiento.objects.select_related(*select_related_fields).all()
            elif tipo_filtro == 'incidencias':
                base_qs = models.Incidencia.objects.select_related(*select_related_fields).all()
            elif tipo_filtro == 'todos':
                base_qs_capturas = models.DatosCaptura.objects.select_related(*select_related_fields).all()
                base_qs_avistamientos = models.Avistamiento.objects.select_related(*select_related_fields).all()
                base_qs_incidencias = models.Incidencia.objects.select_related(*select_related_fields).all()
            else:
                return Response(
                    {"error": f"Tipo de filtro inválido: {tipo_filtro}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Función para aplicar filtros comunes, con opción de excluir uno o varios campos
            def aplicar_filtros(qs, exclude_field=None):
                # Convertir a lista si se pasa un solo valor
                if exclude_field is None:
                    exclude_field = []
                elif not isinstance(exclude_field, list):
                    exclude_field = [exclude_field]

                if puerto_nombre and 'puerto' not in exclude_field:
                    qs = qs.filter(
                        Q(lance__actividad__puerto_salida__nombre_puerto__iexact=puerto_nombre) |
                        Q(lance__actividad__puerto_entrada__nombre_puerto__iexact=puerto_nombre)
                    )
                if year_filter and 'year' not in exclude_field:
                    try:
                        year = int(year_filter)
                        qs = qs.filter(lance__calado_fecha__year=year)
                    except ValueError:
                        raise ValueError("El año debe ser un número válido.")
                if taxa_seleccionada and 'taxa' not in exclude_field:
                    qs = qs.filter(especie__taxa__iexact=taxa_seleccionada)
                if especie_seleccionada and 'especie' not in exclude_field:
                    qs = qs.filter(especie__nombre_comun__iexact=especie_seleccionada)
                return qs

            if tipo_filtro != 'todos':
                try:
                    # Consulta principal: se aplican todos los filtros
                    base_qs_filtrado = aplicar_filtros(base_qs)
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # --- Tasas disponibles ---
                # Se ignoran los filtros por taxa y especie para obtener solo las taxas que tienen datos
                tasas_disponibles = aplicar_filtros(base_qs, exclude_field=['taxa', 'especie']) \
                    .values_list('especie__taxa', flat=True) \
                    .distinct() \
                    .order_by('especie__taxa')

                # --- Puertos disponibles ---
                # Se ignoran los filtros por puerto y especie para obtener todos los puertos
                puertos_qs = aplicar_filtros(base_qs, exclude_field=['puerto', 'especie']) \
                    .filter(
                        Q(lance__actividad__puerto_salida__isnull=False) |
                        Q(lance__actividad__puerto_entrada__isnull=False)
                    )
                puertos_disponibles = puertos_qs.values_list(
                    'lance__actividad__puerto_salida__nombre_puerto',
                    'lance__actividad__puerto_entrada__nombre_puerto'
                ).distinct()
                puertos_flat = sorted({p for pair in puertos_disponibles for p in pair if p})

                # --- Embarcaciones disponibles ---
                embarcaciones_qs = base_qs_filtrado.filter(
                    lance__actividad__embarcacion__isnull=False
                ).values(
                    nombre_embarcacion=F('lance__actividad__embarcacion__nombre_embarcacion'),
                    matricula=F('lance__actividad__embarcacion__matricula')
                ).distinct()
                embarcaciones = list(embarcaciones_qs)

                # --- Rango de profundidad ---
                profundidad_rango = base_qs_filtrado.aggregate(
                    min_profundidad=Min('lance__profundidad_suelo_marino'),
                    max_profundidad=Max('lance__profundidad_suelo_marino')
                )

                # --- Años disponibles ---
                try:
                    años_disponibles = aplicar_filtros(base_qs, exclude_field='year') \
                        .values_list('lance__calado_fecha__year', flat=True) \
                        .distinct() \
                        .order_by('lance__calado_fecha__year')
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # --- Especies disponibles ---
                especies_disponibles = aplicar_filtros(base_qs, exclude_field='especie') \
                    .values_list('especie__nombre_comun', flat=True) \
                    .distinct() \
                    .order_by('especie__nombre_comun')

                # --- Resumen por puerto ---
                if puertos_flat:
                    puertos_salidas = base_qs_filtrado.filter(
                        lance__actividad__puerto_salida__isnull=False
                    ).values(
                        puerto=F('lance__actividad__puerto_salida__nombre_puerto'),
                        embarcacion=F('lance__actividad__embarcacion__codigo_embarcacion')
                    ).distinct()
                    puertos_entradas = base_qs_filtrado.filter(
                        lance__actividad__puerto_entrada__isnull=False
                    ).values(
                        puerto=F('lance__actividad__puerto_entrada__nombre_puerto'),
                        embarcacion=F('lance__actividad__embarcacion__codigo_embarcacion')
                    ).distinct()
                    combined = list(puertos_salidas) + list(puertos_entradas)
                    puerto_counts = defaultdict(set)
                    for item in combined:
                        if item['puerto'] and item['embarcacion']:
                            puerto_counts[item['puerto']].add(item['embarcacion'])
                    resumen_por_puerto = [
                        {"puerto": p, "total_embarcaciones": len(ids)}
                        for p, ids in puerto_counts.items()
                    ]
                else:
                    resumen_por_puerto = []

            elif tipo_filtro == 'todos':
                # Para el caso 'todos', se obtiene el listado de taxas sin filtrar por especie
                base_qs_all = models.Especie.objects.all()
                tasas_disponibles = base_qs_all.values_list('taxa', flat=True).distinct().order_by('taxa')

                try:
                    base_qs_capturas_filtrado = aplicar_filtros(base_qs_capturas, exclude_field='taxa')
                    base_qs_avistamientos_filtrado = aplicar_filtros(base_qs_avistamientos, exclude_field='taxa')
                    base_qs_incidencias_filtrado = aplicar_filtros(base_qs_incidencias, exclude_field='taxa')
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # --- Puertos disponibles combinando los tres tipos ---
                def obtener_puertos(qs):
                    return aplicar_filtros(qs, exclude_field=['puerto', 'especie']) \
                        .filter(
                            Q(lance__actividad__puerto_salida__isnull=False) |
                            Q(lance__actividad__puerto_entrada__isnull=False)
                        ).values_list(
                            'lance__actividad__puerto_salida__nombre_puerto',
                            'lance__actividad__puerto_entrada__nombre_puerto'
                        ).distinct()

                puertos_capturas = obtener_puertos(base_qs_capturas_filtrado)
                puertos_avistamientos = obtener_puertos(base_qs_avistamientos_filtrado)
                puertos_incidencias = obtener_puertos(base_qs_incidencias_filtrado)
                puertos_combinados = list(puertos_capturas) + list(puertos_avistamientos) + list(puertos_incidencias)
                puertos_flat = sorted({p for pair in puertos_combinados for p in pair if p})

                # --- Embarcaciones disponibles combinando los tres tipos ---
                def obtener_embarcaciones(qs):
                    return qs.filter(lance__actividad__embarcacion__isnull=False).values(
                        nombre_embarcacion=F('lance__actividad__embarcacion__nombre_embarcacion'),
                        matricula=F('lance__actividad__embarcacion__matricula')
                    ).distinct()

                embarcaciones_capturas = obtener_embarcaciones(base_qs_capturas_filtrado)
                embarcaciones_avistamientos = obtener_embarcaciones(base_qs_avistamientos_filtrado)
                embarcaciones_incidencias = obtener_embarcaciones(base_qs_incidencias_filtrado)
                embarcaciones_combinadas = list(embarcaciones_capturas) + list(embarcaciones_avistamientos) + list(embarcaciones_incidencias)
                embarcaciones_set = {
                    (emb['nombre_embarcacion'], emb['matricula'])
                    for emb in embarcaciones_combinadas
                }
                embarcaciones = [
                    {"nombre_embarcacion": name, "matricula": matricula}
                    for name, matricula in sorted(embarcaciones_set)
                ]

                # --- Rango de profundidad combinando los tres tipos ---
                def obtener_profundidad(qs):
                    return qs.aggregate(
                        min=Min('lance__profundidad_suelo_marino'),
                        max=Max('lance__profundidad_suelo_marino')
                    )
                profundidad_min_capturas = obtener_profundidad(base_qs_capturas_filtrado)['min'] or 0
                profundidad_max_capturas = obtener_profundidad(base_qs_capturas_filtrado)['max'] or 100
                profundidad_min_avistamientos = obtener_profundidad(base_qs_avistamientos_filtrado)['min'] or 0
                profundidad_max_avistamientos = obtener_profundidad(base_qs_avistamientos_filtrado)['max'] or 100
                profundidad_min_incidencias = obtener_profundidad(base_qs_incidencias_filtrado)['min'] or 0
                profundidad_max_incidencias = obtener_profundidad(base_qs_incidencias_filtrado)['max'] or 100
                min_profundidad = min(profundidad_min_capturas, profundidad_min_avistamientos, profundidad_min_incidencias)
                max_profundidad = max(profundidad_max_capturas, profundidad_max_avistamientos, profundidad_max_incidencias)
                profundidad_rango = {'min_profundidad': min_profundidad, 'max_profundidad': max_profundidad}

                # --- Años disponibles combinando los tres tipos ---
                try:
                    años_capturas = aplicar_filtros(base_qs_capturas, exclude_field='year') \
                        .values_list('lance__calado_fecha__year', flat=True) \
                        .distinct()
                    años_avistamientos = aplicar_filtros(base_qs_avistamientos, exclude_field='year') \
                        .values_list('lance__calado_fecha__year', flat=True) \
                        .distinct()
                    años_incidencias = aplicar_filtros(base_qs_incidencias, exclude_field='year') \
                        .values_list('lance__calado_fecha__year', flat=True) \
                        .distinct()
                    años_disponibles = sorted(set(años_capturas) | set(años_avistamientos) | set(años_incidencias))
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # --- Especies disponibles combinando los tres tipos ---
                especies_capturas = aplicar_filtros(base_qs_capturas, exclude_field='especie') \
                    .values_list('especie__nombre_comun', flat=True) \
                    .distinct()
                especies_avistamientos = aplicar_filtros(base_qs_avistamientos, exclude_field='especie') \
                    .values_list('especie__nombre_comun', flat=True) \
                    .distinct()
                especies_incidencias = aplicar_filtros(base_qs_incidencias, exclude_field='especie') \
                    .values_list('especie__nombre_comun', flat=True) \
                    .distinct()
                especies_disponibles = sorted(
                    set(especies_capturas) | set(especies_avistamientos) | set(especies_incidencias)
                )

                # --- Resumen por puerto combinando los tres tipos ---
                def obtener_puertos_embarcaciones(qs):
                    salida = qs.filter(lance__actividad__puerto_salida__isnull=False).values(
                        puerto=F('lance__actividad__puerto_salida__nombre_puerto'),
                        embarcacion=F('lance__actividad__embarcacion__codigo_embarcacion')
                    ).distinct()
                    entrada = qs.filter(lance__actividad__puerto_entrada__isnull=False).values(
                        puerto=F('lance__actividad__puerto_entrada__nombre_puerto'),
                        embarcacion=F('lance__actividad__embarcacion__codigo_embarcacion')
                    ).distinct()
                    return list(salida) + list(entrada)

                combined = (
                    obtener_puertos_embarcaciones(base_qs_capturas_filtrado) +
                    obtener_puertos_embarcaciones(base_qs_avistamientos_filtrado) +
                    obtener_puertos_embarcaciones(base_qs_incidencias_filtrado)
                )
                puerto_counts = defaultdict(set)
                for item in combined:
                    if item['puerto'] and item['embarcacion']:
                        puerto_counts[item['puerto']].add(item['embarcacion'])
                resumen_por_puerto = [
                    {"puerto": p, "total_embarcaciones": len(ids)}
                    for p, ids in puerto_counts.items()
                ]

            # Construir la respuesta final
            respuesta = {
                "puerto_seleccionado": puerto_nombre if puerto_nombre else "Todos",
                "embarcaciones": embarcaciones,
                "resumen_por_puerto": resumen_por_puerto if puertos_flat or tipo_filtro == 'todos' else [],
                "puertos": puertos_flat,
                "taxas": list(tasas_disponibles),
                "especies": list(especies_disponibles),
                "rango_profundidad": profundidad_rango,
                "años": list(años_disponibles),
                "filtros_aplicados": {
                    "tipo": tipo_filtro,
                    "puerto": puerto_nombre,
                    "taxa": taxa_seleccionada,
                    "especie": especie_seleccionada,
                    "year": year_filter
                }
            }
            return Response(respuesta, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error al obtener los datos: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

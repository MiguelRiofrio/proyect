from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Min, Max,Count,F
from .. import models
from rest_framework import status



class CoordenadasGeneralAPIView(APIView):
    """
    API para obtener las coordenadas en formato decimal de especies capturadas, avistamientos e incidencias.
    """

    @staticmethod
    def convertir_coordenadas(ns, grados, minutos):
        """
        Convierte las coordenadas en formato NS/EW, Grados y Minutos a decimal.
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
            especie_filtro = request.query_params.get('especie', '').strip()  # Nuevo filtro por especie
            profundidad_min = request.query_params.get('rango_profundidad_min')
            profundidad_max = request.query_params.get('rango_profundidad_max')
            embarcacion_filtro = request.query_params.get('embarcacion', '').strip()
            puerto_filtro = request.query_params.get('puerto', '').strip()
            year_filter = request.query_params.get('year', '').strip()

            # Construir filtros dinámicos
            filters = Q()
            if taxa_filtro:
                filters &= Q(especie__taxa__iexact=taxa_filtro)

            # Nuevo Filtro por Especie (nombre común).
            # Ajusta a nombre_cientifico si prefieres.
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

            # Filtrar los datos según el tipo
            capturas, avistamientos, incidencias = [], [], []

            if tipo_filtro == "todos":
                capturas = models.DatosCaptura.objects.select_related('especie', 'lance__coordenadas').filter(filters)
                avistamientos = models.Avistamiento.objects.select_related('especie', 'lance__coordenadas').filter(filters)
                incidencias = models.Incidencia.objects.select_related('especie', 'lance__coordenadas').filter(filters)
            elif tipo_filtro == "capturas":
                capturas = models.DatosCaptura.objects.select_related('especie', 'lance__coordenadas').filter(filters)
            elif tipo_filtro == "avistamientos":
                avistamientos = models.Avistamiento.objects.select_related('especie', 'lance__coordenadas').filter(filters)
            elif tipo_filtro == "incidencias":
                incidencias = models.Incidencia.objects.select_related('especie', 'lance__coordenadas').filter(filters)
            else:
                return Response({"error": f"Tipo de filtro inválido: {tipo_filtro}"}, status=400)

            # Procesar los datos y construir la respuesta
            data = {
                "capturas": self.procesar_datos(capturas),
                "avistamientos": self.procesar_datos(avistamientos),
                "incidencias": self.procesar_datos(incidencias),
            }

            return Response(data, status=200)

        except Exception as e:
            return Response({"error": f"Error interno del servidor: {str(e)}"}, status=500)

    def procesar_datos(self, queryset):
        """
        Procesa los datos aplicando la conversión de coordenadas.
        """
        registros = []

        for obj in queryset:
            coordenadas = getattr(obj.lance, 'coordenadas', None)
            if coordenadas:
                latitud_decimal = self.convertir_coordenadas(
                    coordenadas.latitud_ns, coordenadas.latitud_grados, coordenadas.latitud_minutos
                )
                longitud_decimal = self.convertir_coordenadas(
                    coordenadas.longitud_w, coordenadas.longitud_grados, coordenadas.longitud_minutos
                )

                if latitud_decimal is None or longitud_decimal is None:
                    continue

                registros.append({
                    "especie": obj.especie.nombre_cientifico,
                    "nombre_comun": obj.especie.nombre_comun,
                    "lance": obj.lance.codigo_lance,
                    "latitud": latitud_decimal,
                    "longitud": longitud_decimal,
                    "profundidad_suelo_marino": obj.lance.profundidad_suelo_marino,
                    "taxa": obj.especie.taxa,
                    "embarcacion": obj.lance.actividad.embarcacion.nombre_embarcacion if obj.lance.actividad and obj.lance.actividad.embarcacion else "Desconocido",
                    "puerto_salida": obj.lance.actividad.puerto_salida.nombre_puerto if obj.lance.actividad and obj.lance.actividad.puerto_salida else "Desconocido",
                    "puerto_entrada": obj.lance.actividad.puerto_entrada.nombre_puerto if obj.lance.actividad and obj.lance.actividad.puerto_entrada else "Desconocido",
                    "year": obj.lance.calado_fecha.year if obj.lance.calado_fecha else "Desconocido",
                })

        return registros



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

            # Inicializar variables para evitar referencias antes de asignación
            tasas_disponibles = []
            puertos_flat = []
            embarcaciones = []
            profundidad_rango = {'min_profundidad': 0, 'max_profundidad': 100}
            años_disponibles = []
            especies_disponibles = []

            # Definir el queryset base según el tipo de filtro
            if tipo_filtro == 'capturas':
                base_qs = models.DatosCaptura.objects.all()
            elif tipo_filtro == 'avistamientos':
                base_qs = models.Avistamiento.objects.all()
            elif tipo_filtro == 'incidencias':
                base_qs = models.Incidencia.objects.all()
            elif tipo_filtro == 'todos':
                base_qs_capturas = models.DatosCaptura.objects.all()
                base_qs_avistamientos = models.Avistamiento.objects.all()
                base_qs_incidencias = models.Incidencia.objects.all()
            else:
                return Response({"error": f"Tipo de filtro inválido: {tipo_filtro}"}, status=status.HTTP_400_BAD_REQUEST)

            # Importar F para usar alias en valores
            from django.db.models import F

            # Función para aplicar filtros comunes excepto el filtro específico
            def aplicar_filtros(qs, exclude_field=None):
                if puerto_nombre:
                    qs = qs.filter(
                        Q(lance__actividad__puerto_salida__nombre_puerto__iexact=puerto_nombre) |
                        Q(lance__actividad__puerto_entrada__nombre_puerto__iexact=puerto_nombre)
                    )
                if year_filter and exclude_field != 'year':
                    try:
                        year = int(year_filter)
                        qs = qs.filter(lance__calado_fecha__year=year)
                    except ValueError:
                        raise ValueError("El año debe ser un número válido.")
                if taxa_seleccionada and exclude_field != 'taxa':
                    qs = qs.filter(especie__taxa__iexact=taxa_seleccionada)
                if especie_seleccionada and exclude_field != 'especie':
                    qs = qs.filter(especie__nombre_comun__iexact=especie_seleccionada)
                return qs

            if tipo_filtro != 'todos':
                try:
                    base_qs_filtrado = aplicar_filtros(base_qs)
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # Taxas disponibles sin filtrar por 'taxa_seleccionada'
                tasas_disponibles = aplicar_filtros(base_qs, exclude_field='taxa').values_list('especie__taxa', flat=True).distinct().order_by('especie__taxa')

                # Puertos disponibles
                puertos_qs = base_qs_filtrado.filter(
                    Q(lance__actividad__puerto_salida__isnull=False) |
                    Q(lance__actividad__puerto_entrada__isnull=False)
                )
                puertos_disponibles = puertos_qs.values_list(
                    'lance__actividad__puerto_salida__nombre_puerto',
                    'lance__actividad__puerto_entrada__nombre_puerto'
                ).distinct()
                puertos_flat = sorted(
                    {p for pair in puertos_disponibles for p in pair if p}
                )

                # Embarcaciones disponibles con claves renombradas
                embarcaciones_qs = base_qs_filtrado.filter(
                    lance__actividad__embarcacion__isnull=False
                ).values(
                    nombre_embarcacion=F('lance__actividad__embarcacion__nombre_embarcacion'),
                    matricula=F('lance__actividad__embarcacion__matricula')
                ).distinct()
                embarcaciones = list(embarcaciones_qs)

                # Rango de profundidad
                profundidad_rango = base_qs_filtrado.aggregate(
                    min_profundidad=Min('lance__profundidad_suelo_marino'),
                    max_profundidad=Max('lance__profundidad_suelo_marino')
                )

                # Años disponibles sin filtrar por 'year_filter'
                try:
                    años_disponibles = aplicar_filtros(base_qs, exclude_field='year').values_list(
                        'lance__calado_fecha__year',
                        flat=True
                    ).distinct().order_by('lance__calado_fecha__year')
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # Especies disponibles sin filtrar por 'especie_seleccionada'
                especies_disponibles = aplicar_filtros(base_qs, exclude_field='especie').values_list(
                    'especie__nombre_comun',
                    flat=True
                ).distinct().order_by('especie__nombre_comun')

            elif tipo_filtro == 'todos':
                # **Obtención de todas las taxas disponibles sin filtrar por 'taxa_seleccionada'**
                base_qs_all = models.Especie.objects.all()
                if especie_seleccionada:
                    base_qs_all = base_qs_all.filter(nombre_comun__iexact=especie_seleccionada)
                tasas_disponibles = base_qs_all.values_list('taxa', flat=True).distinct().order_by('taxa')

                # **Aplicar filtros comunes si se proporcionan (exceptuando 'taxa')**
                try:
                    base_qs_capturas_filtrado = aplicar_filtros(base_qs_capturas, exclude_field='taxa')
                    base_qs_avistamientos_filtrado = aplicar_filtros(base_qs_avistamientos, exclude_field='taxa')
                    base_qs_incidencias_filtrado = aplicar_filtros(base_qs_incidencias, exclude_field='taxa')
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # Puertos disponibles en todos los tipos de datos
                def obtener_puertos(qs):
                    return qs.filter(
                        Q(lance__actividad__puerto_salida__isnull=False) |
                        Q(lance__actividad__puerto_entrada__isnull=False)
                    ).values_list('lance__actividad__puerto_salida__nombre_puerto', 'lance__actividad__puerto_entrada__nombre_puerto')

                puertos_capturas = obtener_puertos(base_qs_capturas_filtrado)
                puertos_avistamientos = obtener_puertos(base_qs_avistamientos_filtrado)
                puertos_incidencias = obtener_puertos(base_qs_incidencias_filtrado)
                puertos_combinados = list(puertos_capturas) + list(puertos_avistamientos) + list(puertos_incidencias)
                puertos_flat = sorted(
                    {p for pair in puertos_combinados for p in pair if p}
                )

                # Embarcaciones disponibles en todos los tipos de datos con claves renombradas
                def obtener_embarcaciones(qs):
                    return qs.filter(
                        lance__actividad__embarcacion__isnull=False
                    ).values(
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

                # Rango de profundidad en todos los tipos de datos
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

                # Años disponibles sin filtrar por 'year_filter'
                try:
                    años_capturas = aplicar_filtros(base_qs_capturas, exclude_field='year').values_list('lance__calado_fecha__year', flat=True).distinct()
                    años_avistamientos = aplicar_filtros(base_qs_avistamientos, exclude_field='year').values_list('lance__calado_fecha__year', flat=True).distinct()
                    años_incidencias = aplicar_filtros(base_qs_incidencias, exclude_field='year').values_list('lance__calado_fecha__year', flat=True).distinct()
                    años_disponibles = sorted(
                        set(años_capturas) | set(años_avistamientos) | set(años_incidencias)
                    )
                except ValueError as ve:
                    return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)

                # Especies disponibles sin filtrar por 'especie_seleccionada'
                especies_capturas = aplicar_filtros(base_qs_capturas, exclude_field='especie').values_list(
                    'especie__nombre_comun',
                    flat=True
                ).distinct()
                especies_avistamientos = aplicar_filtros(base_qs_avistamientos, exclude_field='especie').values_list(
                    'especie__nombre_comun',
                    flat=True
                ).distinct()
                especies_incidencias = aplicar_filtros(base_qs_incidencias, exclude_field='especie').values_list(
                    'especie__nombre_comun',
                    flat=True
                ).distinct()

                especies_disponibles = sorted(set(especies_capturas) | set(especies_avistamientos) | set(especies_incidencias))

            # Construcción de la respuesta
            respuesta = {
                "puerto_seleccionado": puerto_nombre if puerto_nombre else "Todos",
                "embarcaciones": embarcaciones,
                "resumen_por_puerto": [],
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

            # Construir resumen_por_puerto
            def contar_embarcaciones(qs, puerto):
                return qs.filter(
                    Q(lance__actividad__puerto_salida__nombre_puerto__iexact=puerto) |
                    Q(lance__actividad__puerto_entrada__nombre_puerto__iexact=puerto)
                ).values('lance__actividad__embarcacion').distinct().count()

            if puertos_flat:
                if tipo_filtro != 'todos':
                    respuesta["resumen_por_puerto"] = [
                        {
                            "puerto": puerto,
                            "total_embarcaciones": contar_embarcaciones(base_qs_filtrado, puerto)
                        }
                        for puerto in puertos_flat
                    ]
                else:
                    # Contar embarcaciones en todos los tipos de datos
                    resumen_por_puerto = []
                    for puerto in puertos_flat:
                        total_embarcaciones = (
                            contar_embarcaciones(base_qs_capturas_filtrado, puerto) +
                            contar_embarcaciones(base_qs_avistamientos_filtrado, puerto) +
                            contar_embarcaciones(base_qs_incidencias_filtrado, puerto)
                        )
                        resumen_por_puerto.append({
                            "puerto": puerto,
                            "total_embarcaciones": total_embarcaciones
                        })
                    respuesta["resumen_por_puerto"] = resumen_por_puerto

            return Response(respuesta, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Error al obtener los datos: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

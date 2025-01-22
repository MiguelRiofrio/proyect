from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Min, Max
from .. import models


class CoordenadasGeneralAPIView(APIView):
    """
    API para obtener las coordenadas en formato decimal de especies capturadas, avistamientos e incidencias.
    Soporta filtros por taxa, profundidad, lance, nombre común, latitud y longitud. 
    Proporciona una opción para obtener "todos" los datos.
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
            profundidad_min = request.query_params.get('rango_profundidad_min')
            profundidad_max = request.query_params.get('rango_profundidad_max')

            # Construir filtros dinámicos
            filters = Q()
            if taxa_filtro:
                filters &= Q(especie__taxa__iexact=taxa_filtro)
            if profundidad_min and profundidad_max:
                filters &= Q(lance__profundidad_suelo_marino__range=(float(profundidad_min), float(profundidad_max)))

            # Filtrar los datos según el tipo
            if tipo_filtro == "todos":
                capturas = models.DatosCaptura.objects.select_related('especie', 'lance__coordenadas').filter(filters)
                avistamientos = models.Avistamiento.objects.select_related('especie', 'lance__coordenadas').filter(filters)
                incidencias = models.Incidencia.objects.select_related('especie', 'lance__coordenadas').filter(filters)
            else:
                capturas = avistamientos = incidencias = []

                if tipo_filtro == "capturas":
                    capturas = models.DatosCaptura.objects.select_related('especie', 'lance__coordenadas').filter(filters)
                elif tipo_filtro == "avistamientos":
                    avistamientos = models.Avistamiento.objects.select_related('especie', 'lance__coordenadas').filter(filters)
                elif tipo_filtro == "incidencias":
                    incidencias = models.Incidencia.objects.select_related('especie', 'lance__coordenadas').filter(filters)

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
                    "taxa": obj.especie.taxa
                })

        return registros




class FiltroCoordenadasAPIView(APIView):
    """
    API para obtener las opciones disponibles para los filtros en la búsqueda de coordenadas,
    filtrando por capturas, avistamientos, incidencias o todos.
    """

    def get(self, request):
        tipo_dato = request.query_params.get('tipo', 'capturas').strip().lower()
        taxa_seleccionada = request.query_params.get('taxa', '').strip()

        try:
            if tipo_dato == 'capturas':
                registros = models.DatosCaptura.objects.select_related('especie', 'lance')
            elif tipo_dato == 'avistamientos':
                registros = models.Avistamiento.objects.select_related('especie', 'lance')
            elif tipo_dato == 'incidencias':
                registros = models.Incidencia.objects.select_related('especie', 'lance')
            elif tipo_dato == 'todos':
                capturas = models.DatosCaptura.objects.select_related('especie', 'lance').values_list('especie__taxa', 'especie__nombre_comun')
                avistamientos = models.Avistamiento.objects.select_related('especie', 'lance').values_list('especie__taxa', 'especie__nombre_comun')
                incidencias = models.Incidencia.objects.select_related('especie', 'lance').values_list('especie__taxa', 'especie__nombre_comun')

                # Combinar los resultados y eliminar duplicados manualmente
                todas_especies = list(set(capturas) | set(avistamientos) | set(incidencias))

                # Obtener taxas únicas
                taxas_disponibles = sorted(set(taxa for taxa, _ in todas_especies))

                # Filtrar especies si se selecciona una taxa
                if taxa_seleccionada:
                    especies_disponibles = sorted(set(especie for taxa, especie in todas_especies if taxa.lower() == taxa_seleccionada.lower()))
                else:
                    especies_disponibles = sorted(set(especie for _, especie in todas_especies))

                # Calcular el rango de profundidad
                profundidad_rango = {
                    "min": min(filter(None, [
                        models.DatosCaptura.objects.aggregate(min_val=Min('lance__profundidad_suelo_marino'))['min_val'],
                        models.Avistamiento.objects.aggregate(min_val=Min('lance__profundidad_suelo_marino'))['min_val'],
                        models.Incidencia.objects.aggregate(min_val=Min('lance__profundidad_suelo_marino'))['min_val']
                    ]), default=0),
                    "max": max(filter(None, [
                        models.DatosCaptura.objects.aggregate(max_val=Max('lance__profundidad_suelo_marino'))['max_val'],
                        models.Avistamiento.objects.aggregate(max_val=Max('lance__profundidad_suelo_marino'))['max_val'],
                        models.Incidencia.objects.aggregate(max_val=Max('lance__profundidad_suelo_marino'))['max_val']
                    ]), default=100)
                }
            else:
                return Response({"error": "Tipo de dato no válido. Use 'capturas', 'avistamientos', 'incidencias' o 'todos'."}, status=400)

            if tipo_dato != 'todos':
                taxas_disponibles = registros.values_list('especie__taxa', flat=True).distinct().order_by('especie__taxa')

                if taxa_seleccionada:
                    registros = registros.filter(especie__taxa__iexact=taxa_seleccionada)

                especies_disponibles = registros.values_list('especie__nombre_comun', flat=True).distinct().order_by('especie__nombre_comun')

                profundidad_rango = registros.aggregate(
                    profundidad_minima=Min('lance__profundidad_suelo_marino'),
                    profundidad_maxima=Max('lance__profundidad_suelo_marino')
                )

                profundidad_rango = {
                    "min": profundidad_rango.get('profundidad_minima', 0),
                    "max": profundidad_rango.get('profundidad_maxima', 100)
                }

            data = {
                "tipo": tipo_dato,
                "taxas": taxas_disponibles,
                "especies": especies_disponibles,
                "rango_profundidad": profundidad_rango,
            }

            return Response(data, status=200)

        except Exception as e:
            return Response({"error": f"Error al obtener los filtros: {str(e)}"}, status=500)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Sum, Count, Avg, Max, Min, F
from ..models import DatosCaptura, Avistamiento, Incidencia, Especie, Lance, ActividadPesquera


class ReporteDetalladoView(APIView):
    """
    Genera un informe detallado de las actividades pesqueras, incluyendo capturas,
    avistamientos, incidencias, tendencias de lances y distribución temporal.
    """

    def get(self, request):
        try:
            # Obtener filtros
            filtros = request.query_params
            profundidad_min = filtros.get('profundidad_min', None)
            profundidad_max = filtros.get('profundidad_max', None)
            embarcacion = filtros.get('embarcacion', None)
            mes_captura = filtros.get('mes_captura', None)
            ano_captura = filtros.get('ano_captura', None)

            # Validación de filtros
            if profundidad_min and not profundidad_min.isdigit():
                raise ValidationError("El filtro 'profundidad_min' debe ser un número.")
            if profundidad_max and not profundidad_max.isdigit():
                raise ValidationError("El filtro 'profundidad_max' debe ser un número.")
            if ano_captura and not ano_captura.isdigit():
                raise ValidationError("El filtro 'ano_captura' debe ser un número válido de año.")

            # Procesar filtro de meses
            meses = None
            if mes_captura:
                meses = [int(m.strip()) for m in mes_captura.split(',') if m.strip().isdigit()]
                if any(m < 1 or m > 12 for m in meses):
                    raise ValidationError("Los valores de 'mes_captura' deben estar entre 1 y 12.")

            # Filtrado de datos
            lances_query = Lance.objects.all()
            if profundidad_min:
                lances_query = lances_query.filter(profundidad_suelo_marino__gte=float(profundidad_min))
            if profundidad_max:
                lances_query = lances_query.filter(profundidad_suelo_marino__lte=float(profundidad_max))
            if embarcacion:
                lances_query = lances_query.filter(actividad__embarcacion__nombre_embarcacion=embarcacion)
            if meses:
                lances_query = lances_query.filter(calado_fecha__month__in=meses)
            if ano_captura:
                lances_query = lances_query.filter(calado_fecha__year=int(ano_captura))

            # Estadísticas de capturas
            capturas_stats = (
                DatosCaptura.objects.filter(lance__in=lances_query)
                .values('especie__nombre_cientifico')
                .annotate(
                    total_capturado=Sum('individuos_retenidos'),
                    total_peso=Sum('peso_retenido'),
                    total_descartes=Sum('individuos_descarte'),
                    max_peso=Max('peso_retenido'),
                    min_peso=Min('peso_retenido'),
                )
                .order_by('-total_capturado')
            )

            # Avistamientos más comunes
            avistamientos_stats = (
                Avistamiento.objects.filter(lance__in=lances_query)
                .values('especie__nombre_cientifico')
                .annotate(
                    total_avistamientos=Sum(F('alimentandose') + F('deambulando') + F('en_reposo')),
                )
                .order_by('-total_avistamientos')
            )

            # Incidencias más reportadas
            incidencias_stats = (
                Incidencia.objects.filter(lance__in=lances_query)
                .values('especie__nombre_cientifico')
                .annotate(
                    total_incidencias=Sum(F('herida_grave') + F('herida_leve') + F('muerto')),
                )
                .order_by('-total_incidencias')
            )

            # Tendencias de lances por año
            lances_tendencia = (
                lances_query
                .annotate(year=F('calado_fecha__year'))
                .values('year')
                .annotate(
                    total_lances=Count('codigo_lance'),
                    promedio_profundidad=Avg('profundidad_suelo_marino'),
                )
                .order_by('year')
            )

            # Resumen general
            resumen = {
                "total_especies": Especie.objects.count(),
                "total_capturas": DatosCaptura.objects.filter(lance__in=lances_query).count(),
                "total_avistamientos": Avistamiento.objects.filter(lance__in=lances_query).count(),
                "total_incidencias": Incidencia.objects.filter(lance__in=lances_query).count(),
                "total_lances": lances_query.count(),
                "profundidad_maxima": lances_query.aggregate(Max('profundidad_suelo_marino'))['profundidad_suelo_marino__max'],
                "profundidad_minima": lances_query.aggregate(Min('profundidad_suelo_marino'))['profundidad_suelo_marino__min'],
            }

            # Compilación del informe
            reporte = {
                "resumen_general": resumen,
                "capturas_mas_comunes": list(capturas_stats),
                "avistamientos_mas_comunes": list(avistamientos_stats),
                "incidencias_mas_comunes": list(incidencias_stats),
                "tendencia_lances": list(lances_tendencia),
                "filtros_aplicados": {
                    "Profundidad Mínima": profundidad_min if profundidad_min else "No especificada",
                    "Profundidad Máxima": profundidad_max if profundidad_max else "No especificada",
                    "Embarcación": embarcacion if embarcacion else "Todas",
                    "Mes de Captura": ", ".join(map(str, meses)) if meses else "Todos",
                    "Año de Captura": ano_captura if ano_captura else "Todos",
                }
            }

            return Response(reporte, status=200)

        except ValidationError as ve:
            return Response({"error": str(ve)}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

        
        
class FiltrosView(APIView):
    """
    Devuelve los valores de filtros disponibles que tienen registros en la base de datos.
    """

    MESES_MAP = {
        0: "Sin Especificar",
        1: "Enero",
        2: "Febrero",
        3: "Marzo",
        4: "Abril",
        5: "Mayo",
        6: "Junio",
        7: "Julio",
        8: "Agosto",
        9: "Septiembre",
        10: "Octubre",
        11: "Noviembre",
        12: "Diciembre",
    }

    def get(self, request):
        try:
            # Verificar si existen registros en la tabla Lance antes de consultar filtros
            if not Lance.objects.exists():
                return Response({"error": "No hay registros disponibles en el sistema."}, status=400)

            # Obtener embarcaciones con datos en las capturas
            embarcaciones_con_datos = (
                ActividadPesquera.objects
                .values('embarcacion__nombre_embarcacion')
                .annotate(total_registros=Count('lance'))
                .filter(total_registros__gt=0)
                .order_by('embarcacion__nombre_embarcacion')
            )

            embarcaciones_list = [
                emb['embarcacion__nombre_embarcacion'] for emb in embarcaciones_con_datos if emb['embarcacion__nombre_embarcacion']
            ]

            # Obtener rangos de profundidad disponibles
            profundidad_minima = Lance.objects.aggregate(min_profundidad=Min('profundidad_suelo_marino'))['min_profundidad']
            profundidad_maxima = Lance.objects.aggregate(max_profundidad=Max('profundidad_suelo_marino'))['max_profundidad']

            # Manejar posibles valores nulos en la profundidad
            if profundidad_minima is None or profundidad_maxima is None:
                profundidad_minima, profundidad_maxima = None, None

            # Obtener los meses disponibles y convertirlos a nombres
            meses_numericos = (
                Lance.objects
                .values_list('calado_fecha__month', flat=True)
                .distinct()
                .order_by('calado_fecha__month')
            )

            meses_disponibles = [
                {"valor": mes, "nombre": self.MESES_MAP.get(mes, "Desconocido")} for mes in meses_numericos
            ]

            # Obtener los años disponibles
            anos_disponibles = (
                Lance.objects
                .values_list('calado_fecha__year', flat=True)
                .distinct()
                .order_by('calado_fecha__year')
            )

            # Verificar si hay filtros disponibles
            if not embarcaciones_list and not meses_disponibles and not anos_disponibles:
                return Response({"message": "No se encontraron datos disponibles para los filtros."}, status=404)

            # Compilar respuesta con los filtros disponibles
            filtros_disponibles = {
                "embarcaciones": embarcaciones_list or [],
                "rango_profundidad": {
                    "profundidad_minima": profundidad_minima or 0,
                    "profundidad_maxima": profundidad_maxima or "No disponible",
                },
                "meses": meses_disponibles or [],
                "anos": list(anos_disponibles) or [],
            }

            return Response(filtros_disponibles, status=200)

        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {str(e)}"}, status=500)

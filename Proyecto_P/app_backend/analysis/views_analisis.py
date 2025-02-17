from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import Sum, Count, Avg, Max, Min, F
from ..models import DatosCaptura, Avistamiento, Incidencia, Especie, Lance, ActividadPesquera
from django.db.models.functions import ExtractMonth, ExtractYear


class ReporteDetalladoView(APIView):
    """
    Genera un reporte detallado de la actividad pesquera, incluyendo:
      - Resumen general con indicadores adicionales (promedios, ratios y porcentajes)
      - Desglose de capturas por especie
      - Desglose de avistamientos por especie
      - Desglose de incidencias (total y por tipo) por especie
      - Tendencias de lances por año
      - Distribución de avistamientos por mes
      - Distribución de capturas por año
      - (Opcional) Esfuerzo por embarcación
    Se pueden aplicar filtros en función de profundidad, embarcación, mes y año de captura.
    """

    def get(self, request):
        try:
            # Obtener filtros desde query params
            filtros = request.query_params
            profundidad_min = filtros.get('profundidad_min')
            profundidad_max = filtros.get('profundidad_max')
            embarcacion = filtros.get('embarcacion')
            mes_captura = filtros.get('mes_captura')
            ano_captura = filtros.get('ano_captura')

            # Construir la consulta base para lances
            lances = Lance.objects.all()
            if profundidad_min:
                lances = lances.filter(profundidad_suelo_marino__gte=float(profundidad_min))
            if profundidad_max:
                lances = lances.filter(profundidad_suelo_marino__lte=float(profundidad_max))
            if embarcacion:
                # Se filtra por nombre de embarcación (a través de ActividadPesquera)
                lances = lances.filter(actividad__embarcacion__nombre_embarcacion__icontains=embarcacion)
            if mes_captura:
                # Se asume que mes_captura es una lista separada por comas (por ejemplo: "3,4")
                meses = [int(m) for m in mes_captura.split(',') if m.isdigit()]
                lances = lances.filter(calado_fecha__month__in=meses)
            if ano_captura:
                lances = lances.filter(calado_fecha__year=int(ano_captura))

            # Resumen general
            resumen = {
                "total_especies": Especie.objects.count(),
                "total_especies_unicas_capturadas": DatosCaptura.objects.filter(lance__in=lances).values('especie').distinct().count(),
                "total_capturas": DatosCaptura.objects.filter(lance__in=lances).count(),
                "total_avistamientos": Avistamiento.objects.filter(lance__in=lances).count(),
                "total_incidencias": Incidencia.objects.filter(lance__in=lances).count(),
                "total_lances": lances.count(),
                "profundidad_maxima": lances.aggregate(Max('profundidad_suelo_marino'))['profundidad_suelo_marino__max'],
                "profundidad_minima": lances.aggregate(Min('profundidad_suelo_marino'))['profundidad_suelo_marino__min'],
                "total_peso_retenido": DatosCaptura.objects.filter(lance__in=lances).aggregate(Sum('peso_retenido'))['peso_retenido__sum'] or 0,
                "total_peso_descarte": DatosCaptura.objects.filter(lance__in=lances).aggregate(Sum('peso_descarte'))['peso_descarte__sum'] or 0,
            }

            # Cálculos adicionales para enriquecer el reporte
            total_lances = resumen.get("total_lances", 0)
            total_capturas = resumen.get("total_capturas", 0)
            total_peso_retenido = resumen.get("total_peso_retenido", 0)
            total_peso_descarte = resumen.get("total_peso_descarte", 0)
            total_especies_unicas = resumen.get("total_especies_unicas_capturadas", 0)

            # Promedio de capturas por lance
            promedio_capturas_por_lance = total_capturas / total_lances if total_lances > 0 else 0

            # Promedio de peso retenido por lance
            promedio_peso_retenido_por_lance = total_peso_retenido / total_lances if total_lances > 0 else 0

            # Porcentaje de peso retenido y de descarte
            suma_pesos = total_peso_retenido + total_peso_descarte
            if suma_pesos > 0:
                porcentaje_retenido = (total_peso_retenido / suma_pesos) * 100
                porcentaje_descarte = (total_peso_descarte / suma_pesos) * 100
            else:
                porcentaje_retenido = 0
                porcentaje_descarte = 0

            # Ratio de capturas por especie única
            ratio_capturas_por_especie_unica = total_capturas / total_especies_unicas if total_especies_unicas > 0 else 0

            # Agregar estos cálculos al reporte
            detalle_adicional = {
                "promedio_capturas_por_lance": round(promedio_capturas_por_lance, 2),
                "promedio_peso_retenido_por_lance": round(promedio_peso_retenido_por_lance, 2),
                "porcentaje_retenido": round(porcentaje_retenido, 2),
                "porcentaje_descarte": round(porcentaje_descarte, 2),
                "ratio_capturas_por_especie_unica": round(ratio_capturas_por_especie_unica, 2),
            }

            # Capturas por especie
            capturas_por_especie = DatosCaptura.objects.filter(lance__in=lances)\
                .values('especie__nombre_cientifico')\
                .annotate(
                    total_individuos=Sum('individuos_retenidos'),
                    total_peso=Sum('peso_retenido'),
                    max_peso=Max('peso_retenido'),
                    min_peso=Min('peso_retenido'),
                )\
                .order_by('-total_individuos')

            # Avistamientos por especie
            avistamientos_por_especie = Avistamiento.objects.filter(lance__in=lances)\
                .values('especie__nombre_cientifico')\
                .annotate(
                    total_avistamientos=Sum(F('alimentandose') + F('deambulando') + F('en_reposo'))
                )\
                .order_by('-total_avistamientos')

            # Incidencias por especie (total)
            incidencias_por_especie = Incidencia.objects.filter(lance__in=lances)\
                .values('especie__nombre_cientifico')\
                .annotate(
                    total_incidencias=Sum(F('herida_grave') + F('herida_leve') + F('muerto'))
                )\
                .order_by('-total_incidencias')

            # Incidencias desglosadas por tipo (por especie)
            incidencias_por_tipo = Incidencia.objects.filter(lance__in=lances)\
                .values('especie__nombre_cientifico')\
                .annotate(
                    herida_grave=Sum('herida_grave'),
                    herida_leve=Sum('herida_leve'),
                    muerto=Sum('muerto')
                )\
                .order_by('-herida_grave', '-herida_leve', '-muerto')

            # Tendencia de lances por año
            tendencia_lances = lances.annotate(year=ExtractYear('calado_fecha'))\
                .values('year')\
                .annotate(
                    total_lances=Count('codigo_lance'),
                    promedio_profundidad=Avg('profundidad_suelo_marino')
                )\
                .order_by('year')

            # Distribución de avistamientos por mes (según la fecha de calado del lance)
            distribucion_avistamientos = Avistamiento.objects.filter(lance__in=lances)\
                .annotate(month=ExtractMonth('lance__calado_fecha'))\
                .values('month')\
                .annotate(total_avistamientos=Count('codigo_avistamiento'))\
                .order_by('month')

            # Mapear el número del mes a su nombre correspondiente
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
            distribucion_avistamientos_list = []
            for item in distribucion_avistamientos:
                # Se agrega el nombre del mes usando el diccionario
                item['nombre_mes'] = MESES_MAP.get(item['month'], "Desconocido")
                distribucion_avistamientos_list.append(item)

            # Distribución de capturas por año (según la fecha de calado del lance)
            distribucion_capturas = DatosCaptura.objects.filter(lance__in=lances)\
                .annotate(year=ExtractYear('lance__calado_fecha'))\
                .values('year')\
                .annotate(total_capturas=Count('codigo_captura'))\
                .order_by('year')

            # (Opcional) Esfuerzo pesquero por embarcación:
            esfuerzo_por_embarcacion = ActividadPesquera.objects.filter(lance__in=lances)\
                .values('embarcacion__nombre_embarcacion')\
                .annotate(total_lances=Count('lance'))\
                .order_by('embarcacion__nombre_embarcacion')

            reporte = {
                "resumen_general": resumen,
                "detalle_adicional": detalle_adicional,
                "capturas_por_especie": list(capturas_por_especie),
                "avistamientos_por_especie": list(avistamientos_por_especie),
                "incidencias_por_especie": list(incidencias_por_especie),
                "incidencias_por_tipo": list(incidencias_por_tipo),
                "tendencia_lances": list(tendencia_lances),
                "distribucion_avistamientos_por_mes": distribucion_avistamientos_list,
                "distribucion_capturas_por_ano": list(distribucion_capturas),
                "esfuerzo_por_embarcacion": list(esfuerzo_por_embarcacion),
                "filtros_aplicados": {
                    "Profundidad Mínima": profundidad_min or filtros.get('profundidadMinima') or 0,
                    "Profundidad Máxima": profundidad_max or filtros.get('profundidadMaxima') or 100,
                    "Embarcación": embarcacion or "Todas",
                    "Mes de Captura": mes_captura or "Todos",
                    "Año de Captura": ano_captura or "Todos",
                }
            }

            return Response(reporte, status=200)
        except Exception as e:
            return Response({"error": f"Error interno del servidor: {str(e)}"}, status=500)


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
                emb['embarcacion__nombre_embarcacion']
                for emb in embarcaciones_con_datos
                if emb['embarcacion__nombre_embarcacion']
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
                {"valor": mes, "nombre": self.MESES_MAP.get(mes, "Desconocido")}
                for mes in meses_numericos
            ]

            # Obtener los años disponibles
            anos_disponibles = (
                Lance.objects
                .values_list('calado_fecha__year', flat=True)
                .distinct()
                .order_by('calado_fecha__year')
            )

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

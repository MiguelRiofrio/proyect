from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg, Count, Max, Min
from django.db.models.functions import ExtractYear, ExtractMonth
from datetime import datetime
from ..models import DatosCaptura, Lance, Avistamiento, Incidencia

class EstadisticasPesquerasView(APIView):
    """
    Genera estadísticas pesqueras robustas basadas en niveles de desembarque, esfuerzo pesquero
    y desempeño por embarcación, con filtros avanzados.
    """

    def validar_fechas(self, fecha_inicio, fecha_fin):
        """
        Valida y convierte las fechas de string a objeto date.
        """
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            return fecha_inicio, fecha_fin
        except ValueError:
            raise ValueError("Formato de fecha inválido. Use 'YYYY-MM-DD'.")

    def obtener_niveles_desembarque(self, capturas_query):
        """
        Genera estadísticas de niveles de desembarque a partir de la consulta de capturas.
        """
        return capturas_query.values('especie__nombre_cientifico').annotate(
            total_retenido=Sum('peso_retenido'),
            total_descarte=Sum('peso_descarte'),
            total_capturas=Count('codigo_captura')
        ).order_by('-total_retenido')

    def calcular_esfuerzo_pesquero(self, esfuerzo_pesquero_query):
        """
        Calcula estadísticas de esfuerzo pesquero a partir de la consulta de lances.
        """
        return esfuerzo_pesquero_query.values('actividad__embarcacion__nombre_embarcacion').annotate(
            total_lances=Count('codigo_lance'),
            promedio_profundidad=Avg('profundidad_suelo_marino')
        ).order_by('-total_lances')

    def obtener_resumen_general(self, capturas_query, avistamientos_query, incidencias_query, lances_query):
        """
        Genera un resumen general de las estadísticas, agregando totales y promedios de peso,
        así como el porcentaje de descarte.
        """
        total_especies = capturas_query.values('especie').distinct().count()
        total_capturas = capturas_query.count()
        total_avistamientos = avistamientos_query.count()
        total_incidencias = incidencias_query.count()
        total_lances = lances_query.count()

        # Estadísticas de profundidades
        profundidades = lances_query.aggregate(
            profundidad_maxima=Max('profundidad_suelo_marino'),
            profundidad_minima=Min('profundidad_suelo_marino'),
        )
        profundidad_maxima = profundidades['profundidad_maxima'] or 0.0
        profundidad_minima = profundidades['profundidad_minima'] or 0.0

        # Agregados de peso en capturas
        peso_agregado = capturas_query.aggregate(
            total_peso_retenido=Sum('peso_retenido'),
            total_peso_descarte=Sum('peso_descarte'),
            promedio_peso_retenido=Avg('peso_retenido'),
            promedio_peso_descarte=Avg('peso_descarte')
        )
        total_peso_retenido = peso_agregado['total_peso_retenido'] or 0.0
        total_peso_descarte = peso_agregado['total_peso_descarte'] or 0.0
        promedio_peso_retenido = peso_agregado['promedio_peso_retenido'] or 0.0
        promedio_peso_descarte = peso_agregado['promedio_peso_descarte'] or 0.0

        # Calcular porcentaje de descarte (evitando división por cero)
        porcentaje_descartes = 0
        suma_pesos = total_peso_retenido + total_peso_descarte
        if suma_pesos > 0:
            porcentaje_descartes = (total_peso_descarte * 100) / suma_pesos

        resumen = {
            "total_especies": total_especies,
            "total_capturas": total_capturas,
            "total_avistamientos": total_avistamientos,
            "total_incidencias": total_incidencias,
            "total_lances": total_lances,
            "profundidad_maxima": profundidad_maxima,
            "profundidad_minima": profundidad_minima,
            "total_peso_retenido": total_peso_retenido,
            "total_peso_descarte": total_peso_descarte,
            "promedio_peso_retenido": promedio_peso_retenido,
            "promedio_peso_descarte": promedio_peso_descarte,
            "porcentaje_descartes": porcentaje_descartes
        }
        return resumen

    def obtener_capturas_mas_comunes(self, capturas_query):
        """
        Obtiene las capturas más comunes agrupadas por especie (top 20).
        """
        return capturas_query.values('especie__nombre_cientifico').annotate(
            total_capturado=Sum('peso_retenido'),
            total_descartes=Sum('peso_descarte'),
            max_peso=Max('peso_retenido'),
            min_peso=Min('peso_retenido'),
            total_capturas=Count('codigo_captura')
        ).order_by('-total_capturado')[:20]

    def obtener_avistamientos_mas_comunes(self, avistamientos_query):
        """
        Obtiene los avistamientos más comunes agrupados por especie (top 20).
        """
        return avistamientos_query.values('especie__nombre_cientifico').annotate(
            total_avistamientos=Count('codigo_avistamiento')
        ).order_by('-total_avistamientos')[:20]

    def obtener_incidencias_mas_comunes(self, incidencias_query):
        """
        Obtiene las incidencias más comunes agrupadas por especie (top 20).
        """
        return incidencias_query.values('especie__nombre_cientifico').annotate(
            total_incidencias=Count('codigo_incidencia')
        ).order_by('-total_incidencias')[:20]

    def obtener_tendencia_lances(self, lances_query):
        """
        Obtiene la tendencia de lances por año.
        """
        return lances_query.annotate(year=ExtractYear('actividad__fecha_salida')).values('year').annotate(
            total_lances=Count('pk'),
            promedio_profundidad=Avg('profundidad_suelo_marino')
        ).order_by('year')

    def obtener_tendencia_capturas_mensual(self, capturas_query):
        """
        Obtiene la tendencia de capturas a nivel mensual.
        """
        return capturas_query.annotate(
            mes=ExtractMonth('lance__actividad__fecha_salida')
        ).values('mes').annotate(
            total_capturas=Count('codigo_captura'),
            total_peso_retenido=Sum('peso_retenido')
        ).order_by('mes')

    def obtener_desempeno_embarcaciones(self, capturas_query):
        """
        Genera estadísticas de desempeño agrupadas por embarcación.
        """
        return capturas_query.values('lance__actividad__embarcacion__nombre_embarcacion').annotate(
            total_capturado=Sum('peso_retenido'),
            total_capturas=Count('codigo_captura'),
            promedio_peso=Avg('peso_retenido')
        ).order_by('-total_capturado')

    def get_filtros_aplicados(self, filtros):
        """
        Retorna los filtros aplicados en una estructura amigable.
        """
        filtros_aplicados = {
            "Profundidad Mínima": filtros.get('profundidad_min', "No especificada"),
            "Profundidad Máxima": filtros.get('profundidad_max', "No especificada"),
            "Embarcación": filtros.get('embarcacion', "Todas"),
            "Mes de Captura": filtros.get('mes_captura', "Todos"),
            "Año de Captura": filtros.get('ano_captura', "Todos")
        }
        # Se puede incluir taxa si se requiere
        if filtros.get('taxa'):
            filtros_aplicados["Taxa"] = filtros.get('taxa')
        else:
            filtros_aplicados["Taxa"] = "Todas"
        return filtros_aplicados

    def get(self, request):
        try:
            # Obtener filtros desde los parámetros de la consulta
            filtros = request.query_params
            embarcacion = filtros.get('embarcacion')
            fecha_inicio = filtros.get('fecha_inicio')
            fecha_fin = filtros.get('fecha_fin')
            taxa = filtros.get('taxa')
            profundidad_min = filtros.get('profundidad_min')
            profundidad_max = filtros.get('profundidad_max')
            mes_captura = filtros.get('mes_captura')
            ano_captura = filtros.get('ano_captura')

            # Validar fechas si están presentes
            if fecha_inicio and fecha_fin:
                try:
                    fecha_inicio, fecha_fin = self.validar_fechas(fecha_inicio, fecha_fin)
                except ValueError as e:
                    return Response({"error": str(e)}, status=400)

            # Construir consulta de capturas con filtros
            capturas_query = DatosCaptura.objects.all()
            if embarcacion:
                capturas_query = capturas_query.filter(
                    lance__actividad__embarcacion__nombre_embarcacion=embarcacion
                )
            if fecha_inicio and fecha_fin:
                capturas_query = capturas_query.filter(
                    lance__actividad__fecha_salida__gte=fecha_inicio,
                    lance__actividad__fecha_entrada__lte=fecha_fin
                )
            if taxa:
                capturas_query = capturas_query.filter(especie__taxa__icontains=taxa)
            if profundidad_min and profundidad_max:
                capturas_query = capturas_query.filter(
                    lance__profundidad_suelo_marino__gte=float(profundidad_min),
                    lance__profundidad_suelo_marino__lte=float(profundidad_max)
                )
            if mes_captura:
                capturas_query = capturas_query.filter(
                    lance__actividad__fecha_salida__month=int(mes_captura)
                )
            if ano_captura:
                capturas_query = capturas_query.filter(
                    lance__actividad__fecha_salida__year=int(ano_captura)
                )

            # Construir consulta de esfuerzo pesquero (basada en Lances)
            esfuerzo_pesquero_query = Lance.objects.all()
            if embarcacion:
                esfuerzo_pesquero_query = esfuerzo_pesquero_query.filter(
                    actividad__embarcacion__nombre_embarcacion=embarcacion
                )
            if fecha_inicio and fecha_fin:
                esfuerzo_pesquero_query = esfuerzo_pesquero_query.filter(
                    actividad__fecha_salida__gte=fecha_inicio,
                    actividad__fecha_entrada__lte=fecha_fin
                )
            if profundidad_min and profundidad_max:
                esfuerzo_pesquero_query = esfuerzo_pesquero_query.filter(
                    profundidad_suelo_marino__gte=float(profundidad_min),
                    profundidad_suelo_marino__lte=float(profundidad_max)
                )
            if mes_captura:
                esfuerzo_pesquero_query = esfuerzo_pesquero_query.filter(
                    actividad__fecha_salida__month=int(mes_captura)
                )
            if ano_captura:
                esfuerzo_pesquero_query = esfuerzo_pesquero_query.filter(
                    actividad__fecha_salida__year=int(ano_captura)
                )

            # Consultas para avistamientos e incidencias (con filtros similares)
            avistamientos_query = Avistamiento.objects.all()
            if embarcacion:
                avistamientos_query = avistamientos_query.filter(
                    lance__actividad__embarcacion__nombre_embarcacion=embarcacion
                )
            if fecha_inicio and fecha_fin:
                avistamientos_query = avistamientos_query.filter(
                    lance__actividad__fecha_salida__gte=fecha_inicio,
                    lance__actividad__fecha_entrada__lte=fecha_fin
                )
            if taxa:
                avistamientos_query = avistamientos_query.filter(especie__taxa__icontains=taxa)
            if profundidad_min and profundidad_max:
                avistamientos_query = avistamientos_query.filter(
                    lance__profundidad_suelo_marino__gte=float(profundidad_min),
                    lance__profundidad_suelo_marino__lte=float(profundidad_max)
                )
            if mes_captura:
                avistamientos_query = avistamientos_query.filter(
                    lance__actividad__fecha_salida__month=int(mes_captura)
                )
            if ano_captura:
                avistamientos_query = avistamientos_query.filter(
                    lance__actividad__fecha_salida__year=int(ano_captura)
                )

            incidencias_query = Incidencia.objects.all()
            if embarcacion:
                incidencias_query = incidencias_query.filter(
                    lance__actividad__embarcacion__nombre_embarcacion=embarcacion
                )
            if fecha_inicio and fecha_fin:
                incidencias_query = incidencias_query.filter(
                    lance__actividad__fecha_salida__gte=fecha_inicio,
                    lance__actividad__fecha_entrada__lte=fecha_fin
                )
            if taxa:
                incidencias_query = incidencias_query.filter(especie__taxa__icontains=taxa)
            if profundidad_min and profundidad_max:
                incidencias_query = incidencias_query.filter(
                    lance__profundidad_suelo_marino__gte=float(profundidad_min),
                    lance__profundidad_suelo_marino__lte=float(profundidad_max)
                )
            if mes_captura:
                incidencias_query = incidencias_query.filter(
                    lance__actividad__fecha_salida__month=int(mes_captura)
                )
            if ano_captura:
                incidencias_query = incidencias_query.filter(
                    lance__actividad__fecha_salida__year=int(ano_captura)
                )

            # Generar estadísticas
            resumen_general = self.obtener_resumen_general(
                capturas_query,
                avistamientos_query,
                incidencias_query,
                esfuerzo_pesquero_query
            )
            niveles_desembarque = self.obtener_niveles_desembarque(capturas_query)
            esfuerzo_pesquero = self.calcular_esfuerzo_pesquero(esfuerzo_pesquero_query)
            capturas_mas_comunes = self.obtener_capturas_mas_comunes(capturas_query)
            avistamientos_mas_comunes = self.obtener_avistamientos_mas_comunes(avistamientos_query)
            incidencias_mas_comunes = self.obtener_incidencias_mas_comunes(incidencias_query)
            tendencia_lances = self.obtener_tendencia_lances(esfuerzo_pesquero_query)
            tendencia_capturas_mensual = self.obtener_tendencia_capturas_mensual(capturas_query)
            desempeno_embarcaciones = self.obtener_desempeno_embarcaciones(capturas_query)
            filtros_aplicados = self.get_filtros_aplicados(filtros)

            # Compilar resultados en un reporte robusto
            reporte = {
                "resumen_general": resumen_general,
                "niveles_desembarque": list(niveles_desembarque),
                "esfuerzo_pesquero": list(esfuerzo_pesquero),
                "capturas_mas_comunes": list(capturas_mas_comunes),
                "avistamientos_mas_comunes": list(avistamientos_mas_comunes),
                "incidencias_mas_comunes": list(incidencias_mas_comunes),
                "tendencia_lances_por_ano": list(tendencia_lances),
                "tendencia_capturas_por_mes": list(tendencia_capturas_mensual),
                "desempeno_por_embarcacion": list(desempeno_embarcaciones),
                "filtros_aplicados": filtros_aplicados
            }

            return Response(reporte, status=200)

        except Exception as e:
            return Response({"error": f"Ocurrió un error: {str(e)}"}, status=500)


class ListFiltroView(APIView):
    """
    Devuelve la lista de taxas, embarcaciones y el rango de fechas disponibles en la base de datos.
    """

    def get(self, request):
        try:
            # Obtener taxas con datos en las capturas
            taxas_con_datos = DatosCaptura.objects.values('especie__taxa').annotate(
                total_registros=Count('codigo_captura')
            ).filter(total_registros__gt=0).distinct().order_by('especie__taxa')

            taxas_list = [
                taxa['especie__taxa'] for taxa in taxas_con_datos if taxa['especie__taxa']
            ]

            # Obtener embarcaciones con datos en los lances
            embarcaciones_con_datos = Lance.objects.values('actividad__embarcacion__nombre_embarcacion').annotate(
                total_lances=Count('codigo_lance')
            ).filter(total_lances__gt=0).distinct().order_by('actividad__embarcacion__nombre_embarcacion')

            embarcaciones_list = [
                emb['actividad__embarcacion__nombre_embarcacion']
                for emb in embarcaciones_con_datos if emb['actividad__embarcacion__nombre_embarcacion']
            ]

            # Obtener el rango de fechas disponibles en la base de datos
            fecha_minima = Lance.objects.aggregate(min_fecha=Min('actividad__fecha_salida'))['min_fecha']
            fecha_maxima = Lance.objects.aggregate(max_fecha=Max('actividad__fecha_entrada'))['max_fecha']

            if not taxas_list and not embarcaciones_list:
                return Response({"message": "No se encontraron registros de taxas ni embarcaciones."}, status=404)

            resultado = {
                "taxas": taxas_list,
                "embarcaciones": embarcaciones_list,
                "rango_fechas": {
                    "fecha_minima": fecha_minima,
                    "fecha_maxima": fecha_maxima
                }
            }
            return Response(resultado, status=200)

        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {str(e)}"}, status=500)

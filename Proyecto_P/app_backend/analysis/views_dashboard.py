from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework import status,generics
from django.db.models import Sum, Avg, Q, F, FloatField, Count , ExpressionWrapper
import numpy as np
from sklearn.linear_model import LinearRegression
import math
from .. import models  
from django.db.models.functions import ExtractYear, ExtractMonth


class DashboardDataView(APIView):
    def get(self, request, format=None):
        try:
            # Obtener parámetros de filtrado desde la solicitud GET
            embarcacion_nombre = request.GET.get('embarcacion', None)
            puerto_nombre = request.GET.get('puerto', None)
            year = request.GET.get('year', None)  # Nuevo parámetro 'year'

            # Inicializar el queryset de actividades
            actividades = models.ActividadPesquera.objects.all().select_related('embarcacion', 'puerto_salida', 'puerto_entrada')

            # Filtrar por nombre de embarcación si se proporciona
            if embarcacion_nombre:
                actividades = actividades.filter(embarcacion__nombre_embarcacion=embarcacion_nombre)

            # Filtrar por nombre de puerto si se proporciona
            if puerto_nombre:
                actividades = actividades.filter(
                    Q(puerto_salida__nombre_puerto=puerto_nombre) | 
                    Q(puerto_entrada__nombre_puerto=puerto_nombre)
                )

            # Filtrar por año si se proporciona
            if year:
                try:
                    year = int(year)
                    actividades = actividades.filter(lance__calado_fecha__year=year)
                except ValueError:
                    return Response({"error": "El parámetro 'year' debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

            # KPI 1: Total de actividades pesqueras
            total_actividades = actividades.count()

            # KPI 2: Total de capturas retenidas y descartadas
            capturas = models.DatosCaptura.objects.filter(lance__actividad__in=actividades).select_related('especie', 'lance')
            total_retenido = capturas.aggregate(Sum('peso_retenido'))['peso_retenido__sum'] or 0
            total_descartado = capturas.aggregate(Sum('peso_descarte'))['peso_descarte__sum'] or 0

            # KPI 3: Capturas retenidas por mes
            capturas_por_mes = capturas.annotate(month=ExtractMonth('lance__calado_fecha')).values('month').annotate(
                total_retenido=Sum('peso_retenido')
            ).order_by('month')

            capturas_por_mes_array = [
                {"month": item['month'], "total_retenido": item['total_retenido']}
                for item in capturas_por_mes
            ]

            # Extraer datos para regresión lineal
            meses = [item['month'] for item in capturas_por_mes_array]
            capturas_mes = [item['total_retenido'] for item in capturas_por_mes_array]

            if len(capturas_mes) > 1:
                X = np.array(meses).reshape(-1, 1)
                y = np.array(capturas_mes)
                model = LinearRegression()
                model.fit(X, y)
                tendencia = model.coef_[0]  # Pendiente de la regresión
                regresion_lineal = list(model.predict(X))  # Convertir predicciones a lista
            else:
                tendencia = None
                regresion_lineal = []  # No hay suficiente información para la regresión

            # KPI 4: Promedio de capturas retenidas por lance
            promedio_retenido = capturas.aggregate(Avg('peso_retenido'))['peso_retenido__avg'] or 0

            # KPI 5: Capturas retenidas y descartadas totales por año
            capturas_por_ano = capturas.annotate(year=ExtractYear('lance__calado_fecha')).values('year').annotate(
                retenido=Sum('peso_retenido'),
                descartado=Sum('peso_descarte')
            ).order_by('year')

            capturas_por_ano_array = [
                {"year": item['year'], "retenido": item['retenido'], "descartado": item['descartado']}
                for item in capturas_por_ano
            ]

            # KPI 6: Distribución de artes de pesca
            artes_pesca = actividades.values('tipo_arte_pesca').annotate(
                total=Count('tipo_arte_pesca')
            )

            artes_pesca_array = [
                {"tipo_arte": item['tipo_arte_pesca'], "total": item['total']}
                for item in artes_pesca
            ]

            # KPI 7: Avistamientos totales por especie
            avistamientos = models.Avistamiento.objects.filter(lance__actividad__in=actividades).values(
                'especie__nombre_cientifico'
            ).annotate(
                total_avistamientos=Sum(
                    ExpressionWrapper(F('alimentandose') + F('deambulando') + F('en_reposo'), output_field=FloatField())
                )
            ).order_by('-total_avistamientos')

            avistamientos_array = [
                {"especie": item['especie__nombre_cientifico'], "total_avistamientos": item['total_avistamientos']}
                for item in avistamientos
            ]

            # KPI 8: Incidencias totales por tipo de lesión
            incidencias = models.Incidencia.objects.filter(lance__actividad__in=actividades).aggregate(
                total_graves=Sum('herida_grave'),
                total_leves=Sum('herida_leve'),
                total_muertos=Sum('muerto')
            )

            # KPI 9: Uso de carnadas
            carnadas = models.LancePalangreCarnadas.objects.values('codigo_tipo_carnada__nombre_carnada').annotate(
                total_porcentaje=Sum('porcentaje_carnada')
            ).order_by('-total_porcentaje')

            carnadas_array = [
                {"nombre_carnada": item['codigo_tipo_carnada__nombre_carnada'], "total_porcentaje": item['total_porcentaje']}
                for item in carnadas
            ]

            # Preparar la respuesta para el dashboard
            data = {
                "total_actividades": total_actividades,
                "total_retenido": total_retenido,
                "total_descartado": total_descartado,
                "promedio_retenido": promedio_retenido,
                "capturas_por_mes": capturas_por_mes_array,
                "capturas_por_ano": capturas_por_ano_array,
                "regresion_lineal": regresion_lineal,
                "tendencia_retenido": tendencia,
                "artes_pesca": artes_pesca_array,
                "avistamientos": avistamientos_array,
                "incidencias": incidencias,
                "carnadas": carnadas_array,
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)




class FiltroDashboardAPIView(APIView):
    """
    API para obtener la lista de embarcaciones por puerto de salida o entrada y filtrar por año.
    Además, proporciona una lista de años disponibles.
    """

    def get(self, request, format=None):
        try:
            puerto_nombre = request.GET.get('puerto', None)
            year = request.GET.get('year', None)  # Obtener el parámetro 'year'

            actividades = models.ActividadPesquera.objects.all()

            if puerto_nombre:
                actividades = actividades.filter(
                    Q(puerto_salida__nombre_puerto__iexact=puerto_nombre) | 
                    Q(puerto_entrada__nombre_puerto__iexact=puerto_nombre)
                )
            
            if year:
                try:
                    year = int(year)
                    actividades = actividades.filter(lance__calado_fecha__year=year)
                except ValueError:
                    return Response({"error": "El parámetro 'year' debe ser un número entero."}, status=status.HTTP_400_BAD_REQUEST)

            # Obtener la lista de años disponibles, excluyendo los null y ordenada descendentemente
            available_years = models.ActividadPesquera.objects.annotate(
                year=ExtractYear('lance__calado_fecha')
            ).filter(year__isnull=False).values_list('year', flat=True).distinct().order_by('-year')  # Orden descendente

            # Filtrar embarcaciones basadas en actividades filtradas
            embarcaciones = models.Embarcacion.objects.filter(
                actividadpesquera__in=actividades
            ).distinct().values('nombre_embarcacion')

            # Contar embarcaciones por puerto de salida y entrada
            embarcaciones_por_puerto = (
                actividades.values('puerto_salida__nombre_puerto')
                .annotate(total_embarcaciones=Count('embarcacion'))
                .order_by('puerto_salida__nombre_puerto')
            )

            respuesta = {
                "puerto_seleccionado": puerto_nombre if puerto_nombre else "Todos",
                "anio_seleccionado": year if year else "Todos",
                "embarcaciones": list(embarcaciones),
                "resumen_por_puerto": [
                    {
                        "puerto": item['puerto_salida__nombre_puerto'],
                        "total_embarcaciones": item['total_embarcaciones']
                    }
                    for item in embarcaciones_por_puerto
                ],
                "available_years": list(available_years)  # Lista de años disponibles sin null
            }

            return Response(respuesta, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Error al obtener las embarcaciones: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

class KpiHomeView(APIView):
    """
    API para calcular KPIs para la página principal.
    """
    def get(self, request, format=None):
        try:
            # Total de especies
            total_especies = models.Especie.objects.count()

            # Total de observaciones registradas (avistamientos)
            total_avistamientos = (
                models.Avistamiento.objects.aggregate(
                    total=Sum(
                        ExpressionWrapper(F('alimentandose') + F('deambulando') + F('en_reposo'), output_field=FloatField())
                    )
                )['total']
                or 0
            )

            # Total de incidencias registradas
            total_incidencias = (
                models.Incidencia.objects.aggregate(
                    total=Sum(
                        ExpressionWrapper(F('herida_grave') + F('herida_leve') + F('muerto'), output_field=FloatField())
                    )
                )['total']
                or 0
            )

            # Especie más común en capturas
            especie_mas_comun = (
                models.DatosCaptura.objects.values('especie__nombre_cientifico', 'especie__nombre_comun')
                .annotate(total_captura=Sum('individuos_retenidos'))
                .order_by('-total_captura')
                .first()
            )

            # Cálculo del Índice de Diversidad de Shannon
            especies_capturadas = models.DatosCaptura.objects.values('especie__nombre_cientifico').annotate(
                total_individuos=Sum('individuos_retenidos')
            )

            # Filtrar especies con al menos un individuo retenido
            especies_capturadas = especies_capturadas.filter(total_individuos__gt=0)

            total_individuos = especies_capturadas.aggregate(total=Sum('total_individuos'))['total'] or 0

            if total_individuos > 0 and especies_capturadas.exists():
                shannon_index = 0
                for especie in especies_capturadas:
                    p_i = especie['total_individuos'] / total_individuos
                    if p_i > 0:
                        shannon_index -= p_i * math.log(p_i)
                # Opcional: Redondear a dos decimales
                shannon_index = round(shannon_index, 2)
            else:
                shannon_index = 0  # O podrías usar None para indicar ausencia de datos

            # Preparar datos de respuesta
            data = {
                "total_especies": total_especies,
                "total_avistamientos": total_avistamientos,
                "total_incidencias": total_incidencias,
                "especie_mas_comun": especie_mas_comun or {
                    "especie__nombre_cientifico": "No disponible",
                    "especie__nombre_comun": "No disponible",
                    "total_captura": 0,
                },
                "indice_diversidad_shannon": shannon_index,  # Nuevo KPI
            }

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TopEspeciesView(APIView):
    """
    API para obtener el top 10 de especies más capturadas, avistadas y con más incidencias.
    """
    def get(self, request, format=None):
        try:
            # Top 10 especies más capturadas
            capturas = (
                models.DatosCaptura.objects.values('especie__nombre_cientifico', 'especie__nombre_comun')
                .annotate(total_captura=Sum('individuos_retenidos'))
                .order_by('-total_captura')[:10]
            )

            # Top 10 especies más avistadas
            avistamientos = (
                models.Avistamiento.objects.filter(lance__actividad__in=models.ActividadPesquera.objects.all())
                .values('especie__nombre_cientifico', 'especie__nombre_comun')
                .annotate(
                    total_avistamientos=Sum(
                        ExpressionWrapper(F('alimentandose') + F('deambulando') + F('en_reposo'), output_field=FloatField())
                    )
                )
                .order_by('-total_avistamientos')[:10]
            )

            # Top 10 especies con más incidencias
            incidencias = (
                models.Incidencia.objects.values('especie__nombre_cientifico', 'especie__nombre_comun')
                .annotate(
                    total_incidencias=Sum('herida_grave') + Sum('herida_leve') + Sum('muerto')
                )
                .order_by('-total_incidencias')[:10]
            )

            return Response({
                'top_capturas': list(capturas),
                'top_avistamientos': list(avistamientos),
                'top_incidencias': list(incidencias),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

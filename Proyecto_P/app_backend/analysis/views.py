from rest_framework.response import Response
from rest_framework.decorators import api_view
from .. import models
from django.db.models import Sum, Avg,Q
import numpy as np
from sklearn.linear_model import LinearRegression
from django.db.models.functions import ExtractYear 

@api_view(['GET'])
def dashboard_data(request):
    # Filtro por embarcación
    embarcacion_nombre = request.GET.get('embarcacion', None)
    actividades = models.ActividadPesquera.objects.all()
    if embarcacion_nombre:
        actividades = actividades.filter(embarcacion__nombre_embarcacion=embarcacion_nombre)

    # KPI 1: Total de actividades pesqueras
    total_actividades = actividades.count()

    # KPI 2: Total de capturas retenidas y descartadas
    capturas = models.DatosCaptura.objects.filter(lance__actividad__in=actividades)
    total_retenido = capturas.aggregate(Sum('peso_retenido'))['peso_retenido__sum'] or 0
    total_descartado = capturas.aggregate(Sum('peso_descarte'))['peso_descarte__sum'] or 0

    # KPI 3: Capturas retenidas por mes
    capturas_por_mes = capturas.values('lance__calado_fecha__month').annotate(
        total_retenido=Sum('peso_retenido')).order_by('lance__calado_fecha__month')
    capturas_por_mes_array = [
        {"month": item['lance__calado_fecha__month'], "total_retenido": item['total_retenido']}
        for item in capturas_por_mes
    ]

    # Extraer datos para regresión lineal
    meses = [item['lance__calado_fecha__month'] for item in capturas_por_mes]
    capturas_mes = [item['total_retenido'] for item in capturas_por_mes]

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
    capturas_por_ano = capturas.values('lance__calado_fecha__year').annotate(
        retenido=Sum('peso_retenido'),
        descartado=Sum('peso_descarte')
    ).order_by('lance__calado_fecha__year')
    capturas_por_ano_array = [
        {"year": item['lance__calado_fecha__year'], "retenido": item['retenido'], "descartado": item['descartado']}
        for item in capturas_por_ano
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
    }

    return Response(data)

@api_view(['GET'])
def kpi_home(request):
    """
    API para calcular KPIs para la página principal.
    """
    # Total de especies
    total_especies = models.Especie.objects.count()

    # Total de observaciones registradas (avistamientos)
    total_avistamientos = (
        models.Avistamiento.objects.aggregate(
            total=Sum('alimentandose') + Sum('deambulando') + Sum('en_reposo')
        )['total']
        or 0
    )

    # Total de incidencias registradas
    total_incidencias = (
        models.Incidencia.objects.aggregate(
            total=Sum('herida_grave') + Sum('herida_leve') + Sum('muerto')
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
    }

    return Response(data)

@api_view(['GET'])
def top_especies(request):
    """
    API para obtener el top 10 de especies más capturadas, avistadas y con más incidencias.
    """
    # Top 10 especies más capturadas
    capturas = (
        models.DatosCaptura.objects.values('especie__nombre_cientifico', 'especie__nombre_comun')
        .annotate(total_captura=Sum('individuos_retenidos'))
        .order_by('-total_captura')[:10]
    )

    # Top 10 especies más avistadas
    avistamientos = (
        models.Avistamiento.objects.values('especie__nombre_cientifico', 'especie__nombre_comun')
        .annotate(total_avistamientos=Sum('alimentandose') + Sum('deambulando') + Sum('en_reposo'))
        .order_by('-total_avistamientos')[:10]
    )

    # Top 10 especies con más incidencias
    incidencias = (
        models.Incidencia.objects.values('especie__nombre_cientifico', 'especie__nombre_comun')
        .annotate(total_incidencias=Sum('herida_grave') + Sum('herida_leve') + Sum('muerto'))
        .order_by('-total_incidencias')[:10]
    )

    return Response({
        'top_capturas': list(capturas),
        'top_avistamientos': list(avistamientos),
        'top_incidencias': list(incidencias),
    })

@api_view(['GET'])
def coordenadas_general(request):
    """
    API para obtener las coordenadas en formato decimal de especies capturadas, avistamientos e incidencias.
    Adaptado a la relación OneToOne entre Lance y Coordenadas, con soporte para filtrar por taxa y profundidad_suelo_marino.
    """
    def convertir_coordenadas(ns, grados, minutos):
        """
        Convierte las coordenadas en formato NS/EW, Grados y Minutos a decimal.
        """
        decimal = float(grados) + float(minutos) / 60
        if ns.lower() in ['s', 'w']:
            decimal = -decimal
        return round(decimal, 4)

    # Obtener filtros del request
    taxa_filtro = request.query_params.get('taxa', None)
    profundidad_filtro = request.query_params.get('profundidad_suelo_marino', None)

    # Consultar datos de capturas
    capturas = models.DatosCaptura.objects.select_related('especie', 'lance__coordenadas').all()
    if taxa_filtro:
        capturas = capturas.filter(especie__taxa=taxa_filtro)
    if profundidad_filtro:
        capturas = capturas.filter(lance__profundidad_suelo_marino=profundidad_filtro)

    # Consultar datos de avistamientos
    avistamientos = models.Avistamiento.objects.select_related('especie', 'lance__coordenadas').all()
    if taxa_filtro:
        avistamientos = avistamientos.filter(especie__taxa=taxa_filtro)
    if profundidad_filtro:
        avistamientos = avistamientos.filter(lance__profundidad_suelo_marino=profundidad_filtro)

    # Consultar datos de incidencias
    incidencias = models.Incidencia.objects.select_related('especie', 'lance__coordenadas').all()
    if taxa_filtro:
        incidencias = incidencias.filter(especie__taxa=taxa_filtro)
    if profundidad_filtro:
        incidencias = incidencias.filter(lance__profundidad_suelo_marino=profundidad_filtro)

    # Crear el formato de salida
    data = {
        "capturas": [],
        "avistamientos": [],
        "incidencias": []
    }

    # Procesar capturas
    for captura in capturas:
        if captura.lance:
            coordenadas = getattr(captura.lance, 'coordenadas', None)
            if coordenadas:
                latitud_decimal = convertir_coordenadas(
                    coordenadas.latitud_ns,
                    coordenadas.latitud_grados,
                    coordenadas.latitud_minutos
                )
                longitud_decimal = convertir_coordenadas(
                    coordenadas.longitud_w,
                    coordenadas.longitud_grados,
                    coordenadas.longitud_minutos
                )
                data["capturas"].append({
                    "especie": captura.especie.nombre_cientifico,
                    "lance": captura.lance.codigo_lance,
                    "nombre_comun": captura.especie.nombre_comun,
                    "latitud": latitud_decimal,
                    "longitud": longitud_decimal,
                    "total": captura.individuos_retenidos + captura.individuos_descarte,
                    "profundidad_suelo_marino": captura.lance.profundidad_suelo_marino,
                    "taxa": captura.especie.taxa
                })

    # Procesar avistamientos
    for avistamiento in avistamientos:
        if avistamiento.lance:
            coordenadas = getattr(avistamiento.lance, 'coordenadas', None)
            if coordenadas:
                latitud_decimal = convertir_coordenadas(
                    coordenadas.latitud_ns,
                    coordenadas.latitud_grados,
                    coordenadas.latitud_minutos
                )
                longitud_decimal = convertir_coordenadas(
                    coordenadas.longitud_w,
                    coordenadas.longitud_grados,
                    coordenadas.longitud_minutos
                )
                data["avistamientos"].append({
                    "especie": avistamiento.especie.nombre_cientifico,
                    "nombre_comun": avistamiento.especie.nombre_comun,
                    "lance": avistamiento.lance.codigo_lance,
                    "latitud": latitud_decimal,
                    "longitud": longitud_decimal,
                    "profundidad_suelo_marino": avistamiento.lance.profundidad_suelo_marino,
                    "taxa": avistamiento.especie.taxa
                })

    # Procesar incidencias
    for incidencia in incidencias:
        if incidencia.lance:
            coordenadas = getattr(incidencia.lance, 'coordenadas', None)
            if coordenadas:
                latitud_decimal = convertir_coordenadas(
                    coordenadas.latitud_ns,
                    coordenadas.latitud_grados,
                    coordenadas.latitud_minutos
                )
                longitud_decimal = convertir_coordenadas(
                    coordenadas.longitud_w,
                    coordenadas.longitud_grados,
                    coordenadas.longitud_minutos
                )
                data["incidencias"].append({
                    "especie": incidencia.especie.nombre_cientifico,
                    "nombre_comun": incidencia.especie.nombre_comun,
                    "lance": incidencia.lance.codigo_lance,
                    "latitud": latitud_decimal,
                    "longitud": longitud_decimal,
                    "profundidad_suelo_marino": incidencia.lance.profundidad_suelo_marino,
                    "taxa": incidencia.especie.taxa
                })

    return Response(data)


@api_view(['GET'])
def areas_mayor_avistamiento(request):
    """
    API para obtener áreas con mayor número de avistamientos, compatible con GeoJSON.
    """

    def convertir_coordenadas(ns, grados, minutos):
        """
        Convierte las coordenadas en formato NS/EW, Grados y Minutos a decimal.
        """
        decimal = float(grados) + float(minutos) / 60
        if ns.lower() in ['s', 'w']:
            decimal = -decimal
        return round(decimal, 4)

    # Obtener filtros del request
    taxa_filtro = request.query_params.get('taxa', None)
    profundidad_filtro = request.query_params.get('profundidad_suelo_marino', None)
    region_filtro = request.query_params.get('region', None)
    formato_geojson = request.query_params.get('geojson', 'false').lower() == 'true'

    # Consultar datos de avistamientos
    avistamientos = models.Avistamiento.objects.select_related('lance__coordenadas')
    if taxa_filtro:
        avistamientos = avistamientos.filter(especie__taxa=taxa_filtro)
    if profundidad_filtro:
        avistamientos = avistamientos.filter(lance__profundidad_suelo_marino=profundidad_filtro)
    if region_filtro:
        avistamientos = avistamientos.filter(lance__actividad__puerto_salida__nombre_puerto=region_filtro)

    # Calcular las áreas con mayor número de avistamientos
    areas_mayor_avistamiento = (
        avistamientos
        .values('lance__coordenadas__latitud_grados', 'lance__coordenadas__longitud_grados')
        .annotate(total_avistamientos=Sum('alimentandose') + Sum('deambulando') + Sum('en_reposo'))
        .order_by('-total_avistamientos')[:10]
    )

    # Convertir los resultados a una lista de dictados
    areas_mayor_avistamiento_list = [
        {
            "latitud_grados": area['lance__coordenadas__latitud_grados'],
            "longitud_grados": area['lance__coordenadas__longitud_grados'],
            "total_avistamientos": area['total_avistamientos']
        }
        for area in areas_mayor_avistamiento
    ]

    # Preparar datos de salida
    data = {
        "areas_mayor_avistamiento": areas_mayor_avistamiento_list,
    }

    # Generar GeoJSON si es necesario
    if formato_geojson:
        data['geojson'] = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            area['longitud_grados'],
                            area['latitud_grados']
                        ]
                    },
                    "properties": {
                        "total_avistamientos": area['total_avistamientos']
                    }
                }
                for area in areas_mayor_avistamiento_list
            ]
        }

    return Response(data)

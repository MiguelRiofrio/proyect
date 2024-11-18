from rest_framework.response import Response
from rest_framework.decorators import api_view

from django.http import JsonResponse, HttpResponse
from django.db.models import Sum, Count
from collections import defaultdict
from datetime import date
import io
import pandas as pd
from reportlab.pdfgen import canvas
from .models import Lance, DatosCaptura, Avistamiento, Incidencia


# Generar Reporte
def generar_reporte(request):
    formato = request.GET.get('formato', 'vista_previa')  # Vista previa por defecto

    # Ejemplo de datos para el reporte
    data = list(
        DatosCaptura.objects.values('nombre_cientifico')
        .annotate(total_capturas=Sum('total_individuos'))
        .order_by('-total_capturas')
    )

    if formato == 'pdf':
        # Generar PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 750, "Reporte de Capturas por Especie")
        y = 700
        for row in data:
            p.drawString(100, y, f"{row['nombre_cientifico']}: {row['total_capturas']} capturas")
            y -= 20
        p.save()
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')

    elif formato == 'xlsx':
        # Generar Excel
        df = pd.DataFrame(data)
        output = io.BytesIO()
        writer = pd.ExcelWriter(output, engine='xlsxwriter')
        df.to_excel(writer, index=False, sheet_name='Reporte')
        writer.save()
        output.seek(0)
        return HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    elif formato == 'vista_previa':
        # Devolver datos como JSON para vista previa
        return JsonResponse(data, safe=False)

    else:
        return HttpResponse("Formato no soportado", status=400)


@api_view(['GET'])
def dashboard_data2(request):
    """
    API para obtener datos del dashboard.
    """
    # Capturas por especie
    capturas_por_especie = DatosCaptura.objects.values('nombre_cientifico').annotate(
        total_captura=Sum('total_individuos')
    ).order_by('-total_captura')

    # Total de peso capturado retenido y descartado
    peso_capturas = DatosCaptura.objects.aggregate(
        total_retenido=Sum('peso_retenido'),
        total_descarte=Sum('peso_descarte')
    )

    # Avistamientos por grupo
    avistamientos_por_grupo = Avistamiento.objects.values('grupos_avi_int').annotate(
        total=Count('codigo_avistamiento')
    ).order_by('-total')

    # Incidencias por tipo
    incidencias_por_tipo = Incidencia.objects.aggregate(
        herida_grave=Sum('herida_grave'),
        herida_leve=Sum('herida_leve'),
        muerto=Sum('muerto')
    )

    # Lances por mes
    lances = Lance.objects.all()
    lances_por_mes = defaultdict(int)
    for lance in lances:
        if lance.calado_fecha:
            mes = lance.calado_fecha.replace(day=1)  # Normalizar al primer día del mes
            lances_por_mes[mes] += 1

    lances_por_mes_resultados = [
        {'mes': mes.strftime('%Y-%m'), 'total_lances': total}
        for mes, total in sorted(lances_por_mes.items())
    ]

    # Respuesta
    data = {
        "capturas_por_especie": list(capturas_por_especie),
        "peso_capturas": peso_capturas,
        "avistamientos_por_grupo": list(avistamientos_por_grupo),
        "incidencias_por_tipo": incidencias_por_tipo,
        "lances_por_mes": lances_por_mes_resultados,
    }
    return Response(data)
# Dashboard Data
def dashboard_data(request):
    lances_por_mes = defaultdict(int)

    for lance in Lance.objects.all():
        try:
            fecha = lance.calado_fecha  # Se asume que `calado_fecha` es un campo existente en el modelo Lance
            mes = fecha.replace(day=1)
            lances_por_mes[mes] += 1
        except AttributeError:
            continue

    lances_por_mes_resultados = [
        {'mes': mes.strftime('%Y-%m'), 'total_lances': total}
        for mes, total in sorted(lances_por_mes.items())
    ]

    data = {
        "capturas_por_especie": list(
            DatosCaptura.objects.values('nombre_cientifico')
            .annotate(total_captura=Sum('total_individuos'))
            .order_by('-total_captura')
        ),
        "peso_capturas": DatosCaptura.objects.aggregate(
            total_retenido=Sum('peso_retenido'),
            total_descarte=Sum('peso_descarte'),
        ),
        "avistamientos_por_grupo": list(
            Avistamiento.objects.values('grupos_avi_int')
            .annotate(total=Count('codigo_avistamiento'))
            .order_by('-total')
        ),
        "incidencias_por_tipo": Incidencia.objects.aggregate(
            herida_grave=Sum('herida_grave'),
            herida_leve=Sum('herida_leve'),
            muerto=Sum('muerto'),
        ),
        "lances_por_mes": lances_por_mes_resultados,
    }

    return JsonResponse(data)


# Datos del Mapa Genéricos
def obtener_datos_mapa(request):
    lances = Lance.objects.all()
    datos = []

    for lance in lances:
        try:
            lat = round(
                lance.latitud_grados + (lance.latitud_minutos / 60), 4
            ) * (-1 if lance.latitud_ns.lower() == 's' else 1)
            lon = round(
                lance.longitud_grados + (lance.longitud_minutos / 60), 4
            ) * (-1 if lance.longitud_w.lower() == 'w' else 1)

            capturas = DatosCaptura.objects.filter(codigo_lance=lance)
            for captura in capturas:
                datos.append({
                    'latitud': lat,
                    'longitud': lon,
                    'nombre_cientifico': captura.nombre_cientifico,
                    'total_individuos': captura.total_individuos,
                })
        except (AttributeError, TypeError):
            continue

    return JsonResponse(datos, safe=False)


# Datos del Mapa con Avistamientos
def obtener_datos_mapa_avistamientos(request):
    lances = Lance.objects.all()
    datos = []

    for lance in lances:
        try:
            lat = round(
                lance.latitud_grados + (lance.latitud_minutos / 60), 4
            ) * (-1 if lance.latitud_ns.lower() == 's' else 1)
            lon = round(
                lance.longitud_grados + (lance.longitud_minutos / 60), 4
            ) * (-1 if lance.longitud_w.lower() == 'w' else 1)

            avistamientos = Avistamiento.objects.filter(codigo_lance=lance)
            for avistamiento in avistamientos:
                datos.append({
                    'latitud': lat,
                    'longitud': lon,
                    'nombre_cientifico': avistamiento.nombre_cientifico,
                    'alimentandose': avistamiento.alimentandose,
                    'deambulando': avistamiento.deambulando,
                    'en_reposo': avistamiento.en_reposo,
                    'total_individuos': avistamiento.total_individuos,
                })
        except (AttributeError, TypeError):
            continue

    return JsonResponse(datos, safe=False)

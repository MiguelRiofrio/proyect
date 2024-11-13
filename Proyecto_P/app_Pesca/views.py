from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from django.http import JsonResponse
from django.db.models.functions import TruncMonth
from django.db.models import Sum, Count, Avg, F
from rest_framework.viewsets import ModelViewSet
from datetime import date
from collections import defaultdict
from .models import (
    ActividadPesquera, Lance, DatosCaptura, Avistamiento, Incidencia, LancePalangre
)
from django.http import HttpResponse, JsonResponse
import io
import pandas as pd
from reportlab.pdfgen import canvas

def generar_reporte(request):
    formato = request.GET.get('formato', 'vista_previa')  # Vista previa por defecto

    # Datos de ejemplo para el reporte
    data = [
        {"Especie": "Especie A", "Capturas": 120},
        {"Especie": "Especie B", "Capturas": 80},
        {"Especie": "Especie C", "Capturas": 45},
    ]

    if formato == 'pdf':
        # Generar PDF
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer)
        p.drawString(100, 750, "Reporte de Capturas por Especie")
        y = 700
        for row in data:
            p.drawString(100, y, f"{row['Especie']}: {row['Capturas']} capturas")
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


# Vista para el Dashboard
def dashboard_data(request):
    # Manejo de lances por mes combinando Año, Mes y Día en Python
    lances = Lance.objects.all()
    lances_por_mes = defaultdict(int)
    for lance in lances:
        try:
            fecha = date(lance.calado_inicial_ano, lance.calado_inicial_mes, lance.calado_inicial_dia)
            mes = fecha.replace(day=1)  # Normalizar al primer día del mes
            lances_por_mes[mes] += 1
        except ValueError:
            continue

    lances_por_mes_resultados = [{'mes': mes.strftime('%Y-%m'), 'total_lances': total} for mes, total in sorted(lances_por_mes.items())]

    data = {
        "capturas_por_especie": list(
            DatosCaptura.objects.values('nombre_cientifico').annotate(
                total_captura=Sum('total_individuos')
            ).order_by('-total_captura')
        ),
        "peso_capturas": DatosCaptura.objects.aggregate(
            total_retenido=Sum('peso_retenido'),
            total_descarte=Sum('peso_descarte')
        ),
        "avistamientos_por_grupo": list(
            Avistamiento.objects.values('grupos_avi_int').annotate(
                total=Count('codigo_avistamiento')
            ).order_by('-total')
        ),
        "incidencias_por_tipo": Incidencia.objects.aggregate(
            herida_grave=Sum('herida_grave'),
            herida_leve=Sum('herida_leve'),
            muerto=Sum('muerto')
        ),
        "lances_por_mes": lances_por_mes_resultados,
    }
    return JsonResponse(data)


# Vista para datos del mapa (genérico)
def obtener_datos_mapa(request):
    lances = Lance.objects.all()
    datos = []

    for lance in lances:
        lat = round(
            lance.latitud_grados + (lance.latitud_minutos / 60), 4
        ) * (-1 if lance.latitud_ns.lower() == 's' else 1)
        lon = round(
            lance.longitud_grados + (lance.longitud_minutos / 60), 4
        ) * (-1 if lance.longitud_w.lower() == 'w' else 1)

        # Capturas relacionadas
        capturas = DatosCaptura.objects.filter(codigo_lance=lance)
        for captura in capturas:
            datos.append({
                'latitud': lat,
                'longitud': lon,
                'nombre_cientifico': captura.nombre_cientifico,
                'total_individuos': captura.total_individuos,
            })

    return JsonResponse(datos, safe=False)


# Vista para datos del mapa con avistamientos
def obtener_datos_mapa_avistamientos(request):
    lances = Lance.objects.all()
    datos = []

    for lance in lances:
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

    return JsonResponse(datos, safe=False)

from rest_framework.response import Response
from rest_framework.decorators import api_view, action
from rest_framework.views import APIView
from rest_framework import viewsets,status
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum, Count
from collections import defaultdict
from datetime import date
import io
import pandas as pd
from reportlab.pdfgen import canvas
from .models import Lance, DatosCaptura, Avistamiento, Incidencia
from django.shortcuts import get_object_or_404
from .models import (
    ActividadPesquera, Lance, DatosCaptura, Avistamiento, Incidencia
)
from .serializers import (
    ActividadPesqueraSerializer, LanceSerializer, LanceCercoSerializer,
    LancePalangreSerializer, LanceArrastreSerializer, DatosCapturaSerializer,
    AvistamientoSerializer, IncidenciaSerializer
)


#vistas para visualizar todos los datos de una sola actividad
class ActividadDetalleCompletaView(APIView):
    """
    Vista para obtener los detalles de una actividad pesquera, incluyendo todos los lances, capturas, incidencias y avistamientos relacionados.
    """

    def get(self, request, codigo_actividad):
        # Obtener la actividad pesquera por código
        actividad = get_object_or_404(ActividadPesquera, codigo_actividad=codigo_actividad)
        actividad_serializer = ActividadPesqueraSerializer(actividad)

        # Obtener todos los lances relacionados con la actividad
        lances = Lance.objects.filter(codigo_actividad=actividad.codigo_actividad)
        lances_data = []

        for lance in lances:
            # Procesar latitud y longitud
            latitud = convertir_coordenadas(
                lance.latitud_ns, lance.latitud_grados, lance.latitud_minutos
            )
            longitud = convertir_coordenadas(
                lance.longitud_w, lance.longitud_grados, lance.longitud_minutos
            )

            # Serializar el lance básico y añadir las coordenadas calculadas
            lance_data = LanceSerializer(lance).data
            lance_data['latitud'] = latitud
            lance_data['longitud'] = longitud

            # Identificar el tipo de lance y serializar los detalles
            if hasattr(lance, 'lancecerco'):
                lance_tipo = "cerco"
                detalles = LanceCercoSerializer(lance.lancecerco).data
            elif hasattr(lance, 'lancepalangre'):
                lance_tipo = "palangre"
                detalles = LancePalangreSerializer(lance.lancepalangre).data
            elif hasattr(lance, 'lancearrastre'):
                lance_tipo = "arrastre"
                detalles = LanceArrastreSerializer(lance.lancearrastre).data
            else:
                lance_tipo = "desconocido"
                detalles = {}

            # Obtener capturas asociadas al lance
            capturas = DatosCaptura.objects.filter(codigo_lance=lance.codigo_lance)
            capturas_serializer = DatosCapturaSerializer(capturas, many=True)

            # Obtener avistamientos asociados al lance
            avistamientos = Avistamiento.objects.filter(codigo_lance=lance.codigo_lance)
            avistamientos_serializer = AvistamientoSerializer(avistamientos, many=True)

            # Obtener incidencias asociadas al lance
            incidencias = Incidencia.objects.filter(codigo_lance=lance.codigo_lance)
            incidencias_serializer = IncidenciaSerializer(incidencias, many=True)

            # Añadir todos los detalles del lance
            lances_data.append({
                "lance": lance_data,
                "tipo_lance": lance_tipo,
                "detalles": detalles,
                "capturas": capturas_serializer.data,
                "avistamientos": avistamientos_serializer.data,
                "incidencias": incidencias_serializer.data
            })

        # Construir la respuesta completa
        response_data = {
            "actividad": actividad_serializer.data,
            "lances": lances_data
        }

        return Response(response_data, status=status.HTTP_200_OK)

#vista para visualizar la lista y crear actividad
class ActividadPesqueraViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar todas las operaciones CRUD de ActividadPesquera.
    """
    queryset = ActividadPesquera.objects.all()
    serializer_class = ActividadPesqueraSerializer

    # Elimina redundancia al combinar este código con el ViewSet anterior
    @api_view(['GET', 'POST'])
    def actividad_pesquera_list(request):
        """
        API para listar todas las actividades pesqueras o crear una nueva.
        """
        if request.method == 'GET':
            # Listar actividades
            actividades = ActividadPesquera.objects.all()
            serializer = ActividadPesqueraSerializer(actividades, many=True)
            return Response(serializer.data)
        
    # Método para manejar el borrado de una actividad pesquera
    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_actividad(self, request, pk=None):
        try:
            actividad = ActividadPesquera.objects.get(pk=pk)
            actividad.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ActividadPesquera.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

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

# Datos del Mapa con Avistamientos
def obtener_datosA_mapa(request):
    lances = Lance.objects.all()
    datos = []
    estado="desconocido"
    for lance in lances:
        try:
            # Calcular la latitud y longitud
            lat = convertir_coordenadas(lance.latitud_ns,lance.latitud_grados,lance.latitud_minutos)
            lon = convertir_coordenadas(lance.longitud_w,lance.longitud_grados,lance.longitud_minutos)
            
            # Agregar datos de Avistamientos
            avistamientos = Avistamiento.objects.filter(codigo_lance=lance)
            for avistamiento in avistamientos:
                datos.append({
                    'tipo': 'avistamiento',
                    'latitud': lat,
                    'longitud': lon,
                    'nombre_cientifico': avistamiento.nombre_cientifico,
                    'alimentandose': avistamiento.alimentandose,
                    'deambulando': avistamiento.deambulando,
                    'en_reposo': avistamiento.en_reposo,
                    'total_individuos': avistamiento.total_individuos,
                })

           
        except (AttributeError, TypeError) as e:
            # Puedes registrar el error si necesitas depuración
            print(f"Error procesando lance {lance.codigo_lance}: {e}")
            continue

    return JsonResponse(datos, safe=False)


def obtener_datosC_mapa(request):
    lances = Lance.objects.all()
    datos = []
    estado="desconocido"
    for lance in lances:
        try:
            # Calcular la latitud y longitud
            lat = convertir_coordenadas(lance.latitud_ns,lance.latitud_grados,lance.latitud_minutos)
            lon = convertir_coordenadas(lance.longitud_w,lance.longitud_grados,lance.longitud_minutos)
            
          # Agregar datos de Capturas
            capturas = DatosCaptura.objects.filter(codigo_lance=lance)
            for captura in capturas:
                datos.append({
                    'tipo': 'captura',
                    'latitud': lat,
                    'longitud': lon,
                    'nombre_cientifico': captura.nombre_cientifico,
                    'total_peso_lb': captura. total_peso_lb,
                    'cantidad': captura.total_individuos,
                })
           
        except (AttributeError, TypeError) as e:
            # Puedes registrar el error si necesitas depuración
            print(f"Error procesando lance {lance.codigo_lance}: {e}")
            continue

    return JsonResponse(datos, safe=False)


def obtener_datosI_mapa(request):
    lances = Lance.objects.all()
    datos = []
    estado="desconocido"
    for lance in lances:
        try:
            # Calcular la latitud y longitud
            lat = convertir_coordenadas(lance.latitud_ns,lance.latitud_grados,lance.latitud_minutos)
            lon = convertir_coordenadas(lance.longitud_w,lance.longitud_grados,lance.longitud_minutos)
            
                # Agregar datos de Incidencias
            incidencias = Incidencia.objects.filter(codigo_lance=lance)
           
            datos.append({
                'tipo': 'incidencia',
                'latitud': lat,
                'longitud': lon,
                
                })
           
        except (AttributeError, TypeError) as e:
            # Puedes registrar el error si necesitas depuración
            print(f"Error procesando lance {lance.codigo_lance}: {e}")
            continue

    return JsonResponse(datos, safe=False)

     
#funcion para convertir coordenadas
def convertir_coordenadas(ns, grados, minutos):
    """
    Convierte las coordenadas en formato NS/EW, Grados y Minutos a decimal.
    """
    decimal = float(grados) + float(minutos) / 60
    if ns in ['s','w']:  # Si es sur o oeste, debe ser negativo
        decimal = -decimal
    return round(decimal, 4) 
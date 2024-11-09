from rest_framework.response import Response
from rest_framework.decorators import api_view,action
from django.http import JsonResponse
from django.shortcuts import render
from django.db.models import Sum, Count
from rest_framework.viewsets import ModelViewSet
from .models import ActividadPesquera, Lance, DatosCaptura, Avistamiento, Incidencia
from .serializers import (ActividadPesqueraSerializer,LanceSerializer, DatosCapturaSerializer,AvistamientoSerializer,IncidenciaSerializer,
)

class ActividadPesqueraViewSet(ModelViewSet):
    queryset = ActividadPesquera.objects.all()
    serializer_class = ActividadPesqueraSerializer

    @action(detail=True, methods=['get'])
    def detalle(self, request, pk=None):
        try:
            actividad = self.get_object()  # Obtiene la actividad correspondiente al ID
            lances = Lance.objects.filter(codigo_de_ingreso=pk)
            capturas = DatosCaptura.objects.filter(codigo_lance__in=lances.values_list('codigo_lance', flat=True))
            avistamientos = Avistamiento.objects.filter(codigo_lance__in=lances.values_list('codigo_lance', flat=True))
            incidencias = Incidencia.objects.filter(codigo_lance__in=lances.values_list('codigo_lance', flat=True))

            # Serializar los datos
            actividad_serializada = ActividadPesqueraSerializer(actividad).data
            lances_serializados = LanceSerializer(lances, many=True).data
            capturas_serializadas = DatosCapturaSerializer(capturas, many=True).data
            avistamientos_serializados = AvistamientoSerializer(avistamientos, many=True).data
            incidencias_serializadas = IncidenciaSerializer(incidencias, many=True).data

            return Response({
                "actividad": actividad_serializada,
                "lances": lances_serializados,
                "capturas": capturas_serializadas,
                "avistamientos": avistamientos_serializados,
                "incidencias": incidencias_serializadas
            })

        except ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada"}, status=404)



def dashboard_data(request):
    # Ejemplo de datos: Lances por hora y capturas por tipo de faena (esto lo puedes adaptar a tus necesidades)
    
    # Lances agrupados por hora (simulando horas del día)
    lances_por_hora = list(
        Lance.objects.values('calado_inicial_hora').annotate(total=Count('codigo_lance')).order_by('calado_inicial_hora')
    )
    
    # Unidades capturadas por Lance (puedes ajustar el campo según tu necesidad)
    capturas_por_faena = list(
        DatosCaptura.objects.values('codigo_lance__faena').annotate(total_individuos=Sum('total_individuos'))
    )

    # Incidencias registradas por Lance
    incidencias_por_faena = list(
        Incidencia.objects.values('codigo_lance__faena').annotate(total_incidencias=Count('codigo_incidencia'))
    )
    
    data = {
        'lances_por_hora': lances_por_hora,
        'capturas_por_faena': capturas_por_faena,
        'incidencias_por_faena': incidencias_por_faena,
    }

    return JsonResponse(data)

@api_view(['GET'])
def chart_data(request):
    try:
        # Obtener los datos del modelo
        datos = DatosCaptura.objects.all()
        
        # Crear una lista de diccionarios para enviar al frontend
        data = [
            {
                'nombre_cientifico': dato.nombre_cientifico,
                'total_individuos': dato.total_individuos
            }
            for dato in datos
        ]

        # Devolver los datos en formato JSON
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
def obtener_datos_mapa_avistamientos(request):
    lances = Lance.objects.all()
    datos = []

    for lance in lances:
        # Calcular latitud
        lat = lance.latitud_grados + (lance.latitud_minutos / 60)
        lat = round(lat, 4)
        if lance.latitud_ns == 's':
            lat = -lat

        # Calcular longitud
        lon = lance.longitud_grados + (lance.longitud_minutos / 60)
        lon = round(lon, 4)
        if lance.longitud_w == 'w':
            lon = -lon

        # Obtener avistamientos relacionados con el lance
        avistamientos = Avistamiento.objects.filter(codigo_lance=lance)

        for avistamiento in avistamientos:
            datos.append({
                'latitud': lat,
                'longitud': lon,
                'nombre_cientifico': avistamiento.nombre_cientifico,
                'deambulando': avistamiento.deambulando,
                'alimentandose': avistamiento.alimentandose,
                'en_reposo': avistamiento.en_reposo,
                'total_individuos': avistamiento.total_individuos
            })

    return JsonResponse(datos, safe=False)    

def obtener_datos_mapa1(request):
    lances = Lance.objects.all()
    datos = []

    for lance in lances:
        # Calcular latitud
        lat = lance.latitud_grados + (lance.latitud_minutos / 60)
        lat = round(lat, 4)
        if lance.latitud_ns == 's':
            lat = -lat

        # Calcular longitud
        lon = lance.longitud_grados + (lance.longitud_minutos / 60)
        lon = round(lon, 4)
        if lance.longitud_w == 'w':
            lon = -lon

        # Obtener el puerto de entrada de la actividad pesquera asociada
        puerto_entrada = lance.codigo_de_ingreso.puerto_de_entrada

        # Obtener avistamientos relacionados con el lance
        avistamientos = Avistamiento.objects.filter(codigo_lance=lance)

        for avistamiento in avistamientos:
            datos.append({
                'latitud': lat,
                'longitud': lon,
                'puerto_entrada': puerto_entrada,
                'nombre_cientifico': avistamiento.nombre_cientifico,
                'alimentandose': avistamiento.alimentandose,
                'deambulando': avistamiento.deambulando,
                'en_reposo': avistamiento.en_reposo,
                'total_individuos': avistamiento.total_individuos
            })

    return JsonResponse(datos, safe=False)


def obtener_datos_mapa(request):
    lances = Lance.objects.all()
    datos = []

    for lance in lances:
        lat = lance.latitud_grados + (lance.latitud_minutos / 60)
        lat = round(lat, 4)
        if lance.latitud_ns == 's':
            lat = -lat
            
        lon = lance.longitud_grados + (lance.longitud_minutos / 60)
        lon = round(lon, 4)
        if lance.longitud_w == 'w':
            lon = -lon

        capturas = DatosCaptura.objects.filter(codigo_lance=lance)
        for captura in capturas:
            datos.append({
                'latitud': lat,
                'longitud': lon,
                'nombre_cientifico': captura.nombre_cientifico,
                'total_individuos': captura.total_individuos
            })

    return JsonResponse(datos, safe=False)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import (
    ActividadPesquera, Lance, LanceCerco, LancePalangre, LanceArrastre,
    DatosCaptura, Avistamiento, Incidencia
)
from .serializers import (
    ActividadPesqueraSerializer, LanceSerializer, LanceCercoSerializer,
    LancePalangreSerializer, LanceArrastreSerializer, DatosCapturaSerializer,
    AvistamientoSerializer, IncidenciaSerializer
)

def convertir_coordenadas(ns, grados, minutos):
    """
    Convierte las coordenadas en formato NS/EW, Grados y Minutos a decimal.
    """
    decimal = float(grados) + float(minutos) / 60
    if ns in ['s','w']:  # Si es sur o oeste, debe ser negativo
        decimal = -decimal
    return round(decimal, 4) 

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



# Vistas CRUD para ActividadPesquera
class ActividadPesqueraView(APIView):
    """
    CRUD para la tabla ActividadPesquera.
    """

    def get(self, request, codigo_actividad=None):
        if codigo_actividad:
            actividad = get_object_or_404(ActividadPesquera, codigo_actividad=codigo_actividad)
            serializer = ActividadPesqueraSerializer(actividad)
        else:
            actividades = ActividadPesquera.objects.all()
            serializer = ActividadPesqueraSerializer(actividades, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ActividadPesqueraSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, codigo_actividad):
        actividad = get_object_or_404(ActividadPesquera, codigo_actividad=codigo_actividad)
        serializer = ActividadPesqueraSerializer(actividad, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, codigo_actividad):
        actividad = get_object_or_404(ActividadPesquera, codigo_actividad=codigo_actividad)
        actividad.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

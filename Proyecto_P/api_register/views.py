from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import (
    ActividadPesquera, Lance, LanceCerco, LanceArrastre, LancePalangre,
    DatosCaptura, Avistamiento, Incidencia
)
from .serializers import (
    ActividadPesqueraSerializer, LanceSerializer, LanceCercoSerializer, LanceArrastreSerializer,
    LancePalangreSerializer, DatosCapturaSerializer, AvistamientoSerializer, IncidenciaSerializer
)

    


class ActividadDetalleView(APIView):
    def get(self, request, id):
        try:
            # Obtener la actividad pesquera
            actividad = ActividadPesquera.objects.get(pk=id)
            actividad_serializer = ActividadPesqueraSerializer(actividad)

            # Obtener los lances relacionados con la actividad
            lances = Lance.objects.filter(codigo_de_ingreso=actividad.codigo_de_ingreso)
            lances_data = []

            for lance in lances:
                # Detalles básicos del lance
                lance_data = LanceSerializer(lance).data

                # Identificar el tipo de lance
                if hasattr(lance, 'lance_cerco'):
                    lance_tipo = "cerco"
                    detalles = LanceCerco.objects.get(codigo_lance=lance.codigo_lance)
                    lance_detalles = {
                        "red_altura": detalles.red_altura,
                        "red_longitud": detalles.red_longitud,
                        "malla_cabecero": detalles.malla_cabecero,
                        "malla_cuerpo": detalles.malla_cuerpo,
                        "profundidad_suelo_marino": detalles.profundidad_suelo_marino,
                    }
                elif hasattr(lance, 'lance_arrastre'):
                    lance_tipo = "arrastre"
                    detalles = LanceArrastre.objects.get(codigo_lance=lance.codigo_lance)
                    lance_detalles = {
                        "calado_final_fecha": detalles.calado_final_fecha,
                        "calado_final_hora": detalles.calado_final_hora,
                        "altura": detalles.altura,
                        "longitud": detalles.longitud,
                        "profundidad_suelo_marino": detalles.profundidad_suelo_marino,
                    }
                elif hasattr(lance, 'lance_palangre'):
                    lance_tipo = "palangre"
                    detalles = LancePalangre.objects.get(codigo_lance=lance.codigo_lance)
                    lance_detalles = {
                        "nombre_cientifico_1": detalles.nombre_cientifico_1,
                        "tipo_anzuelo": detalles.tipo_anzuelo,
                        "cantidad_anzuelos": detalles.cantidad_anzuelos,
                        "linea_madre_metros": detalles.linea_madre_metros,
                    }
                else:
                    lance_tipo = "desconocido"
                    lance_detalles = {}

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
                    "detalles": lance_detalles,
                    "capturas": capturas_serializer.data,
                    "avistamientos": avistamientos_serializer.data,
                    "incidencias": incidencias_serializer.data
                })

            # Construir la respuesta completa
            return Response({
                "actividad": actividad_serializer.data,
                "lances": lances_data
            }, status=status.HTTP_200_OK)

        except ActividadPesquera.DoesNotExist:
            return Response({"error": "Actividad no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
        
# CRUD para ActividadPesquera
class ActividadPesqueraView(APIView):
    def get(self, request, id=None):
        if id:
            actividad = ActividadPesquera.objects.get(pk=id)
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

    def put(self, request, id):
        actividad = ActividadPesquera.objects.get(pk=id)
        serializer = ActividadPesqueraSerializer(actividad, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        actividad = ActividadPesquera.objects.get(pk=id)
        actividad.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# CRUD para Lance y subtipos (LanceCerco, LanceArrastre, LancePalangre)
class LanceView(APIView):
    def get(self, request, id=None):
        if id:
            lance = Lance.objects.get(pk=id)
            serializer = LanceSerializer(lance)
        else:
            lances = Lance.objects.all()
            serializer = LanceSerializer(lances, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LanceSerializer(data=request.data)
        if serializer.is_valid():
            lance = serializer.save()
            tipo = request.data.get('tipo')
            if tipo == 'cerco':
                cerco_serializer = LanceCercoSerializer(data=request.data)
                if cerco_serializer.is_valid():
                    cerco_serializer.save(codigo_lance=lance)
                else:
                    return Response(cerco_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            elif tipo == 'arrastre':
                arrastre_serializer = LanceArrastreSerializer(data=request.data)
                if arrastre_serializer.is_valid():
                    arrastre_serializer.save(codigo_lance=lance)
                else:
                    return Response(arrastre_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            elif tipo == 'palangre':
                palangre_serializer = LancePalangreSerializer(data=request.data)
                if palangre_serializer.is_valid():
                    palangre_serializer.save(codigo_lance=lance)
                else:
                    return Response(palangre_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        lance = Lance.objects.get(pk=id)
        serializer = LanceSerializer(lance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        lance = Lance.objects.get(pk=id)
        lance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# CRUD para DatosCaptura
class DatosCapturaView(APIView):
    def get(self, request, id=None):
        if id:
            captura = DatosCaptura.objects.get(pk=id)
            serializer = DatosCapturaSerializer(captura)
        else:
            capturas = DatosCaptura.objects.all()
            serializer = DatosCapturaSerializer(capturas, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DatosCapturaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        captura = DatosCaptura.objects.get(pk=id)
        serializer = DatosCapturaSerializer(captura, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        captura = DatosCaptura.objects.get(pk=id)
        captura.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# CRUD para Avistamiento
class AvistamientoView(APIView):
    def get(self, request, id=None):
        if id:
            avistamiento = Avistamiento.objects.get(pk=id)
            serializer = AvistamientoSerializer(avistamiento)
        else:
            avistamientos = Avistamiento.objects.all()
            serializer = AvistamientoSerializer(avistamientos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AvistamientoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        avistamiento = Avistamiento.objects.get(pk=id)
        serializer = AvistamientoSerializer(avistamiento, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        avistamiento = Avistamiento.objects.get(pk=id)
        avistamiento.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# CRUD para Incidencia
class IncidenciaView(APIView):
    def get(self, request, id=None):
        if id:
            incidencia = Incidencia.objects.get(pk=id)
            serializer = IncidenciaSerializer(incidencia)
        else:
            incidencias = Incidencia.objects.all()
            serializer = IncidenciaSerializer(incidencias, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = IncidenciaSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id):
        incidencia = Incidencia.objects.get(pk=id)
        serializer = IncidenciaSerializer(incidencia, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        incidencia = Incidencia.objects.get(pk=id)
        incidencia.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

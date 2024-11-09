from rest_framework import serializers
from .models import (
    ActividadPesquera, Lance, LanceCerco, LanceArrastre, LancePalangre,
    DatosCaptura, Avistamiento, Incidencia
)

class ActividadPesqueraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadPesquera
        fields = '__all__'

class LanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lance
        fields = '__all__'

class LanceCercoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanceCerco
        fields = '__all__'

class LanceArrastreSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanceArrastre
        fields = '__all__'

class LancePalangreSerializer(serializers.ModelSerializer):
    class Meta:
        model = LancePalangre
        fields = '__all__'

class DatosCapturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatosCaptura
        fields = '__all__'

class AvistamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avistamiento
        fields = '__all__'

class IncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidencia
        fields = '__all__'

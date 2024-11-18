from rest_framework import serializers
from .models import (
    ActividadPesquera, Lance, LanceCerco, LancePalangre, LanceArrastre,
    DatosCaptura, Avistamiento, Incidencia
)

# Serializer para ActividadPesquera
class ActividadPesqueraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadPesquera
        fields = '__all__'


# Serializer para Lance
class LanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lance
        fields = '__all__'


# Serializer para LanceCerco
class LanceCercoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanceCerco
        fields = '__all__'


# Serializer para LancePalangre
class LancePalangreSerializer(serializers.ModelSerializer):
    codigo_lance = serializers.PrimaryKeyRelatedField(queryset=Lance.objects.all())

    class Meta:
        model = LancePalangre
        fields = '__all__'


# Serializer para LanceArrastre
class LanceArrastreSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanceArrastre
        fields = '__all__'


# Serializer para DatosCaptura
class DatosCapturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatosCaptura
        fields = '__all__'


# Serializer para Avistamiento
class AvistamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avistamiento
        fields = '__all__'


# Serializer para Incidencia
class IncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidencia
        fields = '__all__'

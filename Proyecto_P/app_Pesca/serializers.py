from rest_framework import serializers
from .models import ActividadPesquera, Lance,LanceCerco,LanceArrastre,LancePalangre, DatosCaptura, Avistamiento, Incidencia

# Serializador para ActividadPesquera
class ActividadPesqueraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadPesquera
        fields = '__all__'

# Serializador para Lance
class LanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lance
        fields = '__all__'

# Serializador para Lance_Cerco
class LanceCercoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanceCerco
        fields = '__all__'

# Serializador para Lance_Palangre
class LancePalangreSerializer(serializers.ModelSerializer):
    class Meta:
        model = LancePalangre
        fields = '__all__'

# Serializador para Lance_Arrastre
class LanceArrastreSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanceArrastre
        fields = '__all__'

# Serializador para DatosCaptura
class DatosCapturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatosCaptura
        fields = '__all__'

# Serializador para Avistamiento
class AvistamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avistamiento
        fields = '__all__'

# Serializador para Incidencia
class IncidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incidencia
        fields = '__all__'




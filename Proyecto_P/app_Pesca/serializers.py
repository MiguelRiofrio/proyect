from rest_framework import serializers
from . import models

class TipoCarnadaSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TipoCarnada
        fields = '__all__'

class PuertoSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Puerto
        fields = '__all__'

class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Persona
        fields = '__all__'

class EmbarcacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Embarcacion
        fields = '__all__'

class CoordenadasSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Coordenadas
        fields = '__all__'

class EspecieSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Especie
        fields = '__all__'

class ActividadPesqueraSerializer(serializers.ModelSerializer):
    puerto_salida = serializers.PrimaryKeyRelatedField(queryset=models.Puerto.objects.all())
    puerto_entrada = serializers.PrimaryKeyRelatedField(queryset=models.Puerto.objects.all())
    armador = serializers.PrimaryKeyRelatedField(queryset=models.Persona.objects.all())
    capitan = serializers.PrimaryKeyRelatedField(queryset=models.Persona.objects.all())
    observador = serializers.PrimaryKeyRelatedField(queryset=models.Persona.objects.all())
    embarcacion = serializers.PrimaryKeyRelatedField(queryset=models.Embarcacion.objects.all())

    class Meta:
        model = models.ActividadPesquera
        fields = '__all__'

class LanceSerializer(serializers.ModelSerializer):
    actividad = serializers.PrimaryKeyRelatedField(queryset=models.ActividadPesquera.objects.all())
    coordenadas = serializers.PrimaryKeyRelatedField(queryset=models.Coordenadas.objects.all())

    class Meta:
        model = models.Lance
        fields = '__all__'

class LancePalangreSerializer(serializers.ModelSerializer):
    codigo_lance = serializers.PrimaryKeyRelatedField(queryset=models.Lance.objects.all())

    class Meta:
        model = models.LancePalangre
        fields = '__all__'

class LanceArrastreSerializer(serializers.ModelSerializer):
    codigo_lance = serializers.PrimaryKeyRelatedField(queryset=models.Lance.objects.all())

    class Meta:
        model = models.LanceArrastre
        fields = '__all__'

class LanceCercoSerializer(serializers.ModelSerializer):
    codigo_lance = serializers.PrimaryKeyRelatedField(queryset=models.Lance.objects.all())

    class Meta:
        model = models.LanceCerco
        fields = '__all__'

class LancePalangreCarnadasSerializer(serializers.ModelSerializer):
    codigo_lance_palangre = serializers.PrimaryKeyRelatedField(queryset=models.LancePalangre.objects.all())
    codigo_tipo_carnada = serializers.PrimaryKeyRelatedField(queryset=models.TipoCarnada.objects.all())

    class Meta:
        model = models.LancePalangreCarnadas
        fields = '__all__'

class DatosCapturaSerializer(serializers.ModelSerializer):
    lance = serializers.PrimaryKeyRelatedField(queryset=models.Lance.objects.all())
    especie = serializers.PrimaryKeyRelatedField(queryset=models.Especie.objects.all())

    class Meta:
        model = models.DatosCaptura
        fields = '__all__'

class AvistamientoSerializer(serializers.ModelSerializer):
    lance = serializers.PrimaryKeyRelatedField(queryset=models.Lance.objects.all())
    especie = serializers.PrimaryKeyRelatedField(queryset=models.Especie.objects.all())

    class Meta:
        model = models.Avistamiento
        fields = '__all__'

class IncidenciaSerializer(serializers.ModelSerializer):
    lance = serializers.PrimaryKeyRelatedField(queryset=models.Lance.objects.all())
    especie = serializers.PrimaryKeyRelatedField(queryset=models.Especie.objects.all())

    class Meta:
        model = models.Incidencia
        fields = '__all__'

class IncidenciaAvesSerializer(serializers.ModelSerializer):
    codigo_incidencia = serializers.PrimaryKeyRelatedField(queryset=models.Incidencia.objects.all())

    class Meta:
        model = models.IncidenciaAves
        fields = '__all__'

class IncidenciaMamiferosSerializer(serializers.ModelSerializer):
    codigo_incidencia = serializers.PrimaryKeyRelatedField(queryset=models.Incidencia.objects.all())

    class Meta:
        model = models.IncidenciaMamiferos
        fields = '__all__'

class IncidenciaTortugasSerializer(serializers.ModelSerializer):
    codigo_incidencia = serializers.PrimaryKeyRelatedField(queryset=models.Incidencia.objects.all())

    class Meta:
        model = models.IncidenciaTortugas
        fields = '__all__'

class IncidenciaPalangreSerializer(serializers.ModelSerializer):
    codigo_incidencia = serializers.PrimaryKeyRelatedField(queryset=models.Incidencia.objects.all())

    class Meta:
        model = models.IncidenciaPalangre
        fields = '__all__'

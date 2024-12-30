from django.db import models

class TipoCarnada(models.Model):
    codigo_tipo_carnada = models.IntegerField(primary_key=True, default=0)
    nombre_carnada = models.CharField(max_length=100, default="Sin nombre")

class Puerto(models.Model):
    codigo_puerto = models.IntegerField( primary_key=True, default=0)
    nombre_puerto = models.CharField(max_length=100, unique=True, default="Sin nombre")

class Persona(models.Model):
    codigo_persona = models.IntegerField(primary_key=True, default=0)
    nombre = models.CharField(max_length=100, default="Sin nombre")
    rol = models.CharField(max_length=50, default="Sin rol")

class Embarcacion(models.Model):
    codigo_embarcacion = models.IntegerField( primary_key=True, default=0)
    nombre_embarcacion = models.CharField(max_length=100, default="Sin nombre")
    matricula = models.CharField(max_length=50, default="Sin matrícula")

class Grupo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

class Especie(models.Model):
    codigo_especie = models.IntegerField( primary_key=True, default=0)
    taxa = models.CharField(max_length=100, null=True, blank=True, default="Sin taxa")
    genero = models.CharField(max_length=100, null=True, blank=True, default="Sin género")
    grupo = models.ForeignKey(Grupo, on_delete=models.SET_NULL, null=True, blank=True)  # Relación con Grupo
    especie = models.CharField(max_length=100, null=True, blank=True, default="Sin especie")
    nombre_cientifico = models.CharField(max_length=150, null=True, blank=True, default="Sin nombre científico")
    nombre_comun = models.CharField(max_length=150, null=True, blank=True, default="Sin nombre común")

class ActividadPesquera(models.Model):
    codigo_actividad = models.CharField(max_length=50, primary_key=True, default="default_actividad")
    fecha_salida = models.DateField(default="2000-01-01")
    fecha_entrada = models.DateField(default="2000-01-01")
    puerto_salida = models.ForeignKey(Puerto, related_name="salidas", on_delete=models.CASCADE, null=True, default=None)
    puerto_entrada = models.ForeignKey(Puerto, related_name="entradas", on_delete=models.CASCADE, null=True, default=None)
    armador = models.ForeignKey(Persona, related_name="armador", on_delete=models.CASCADE, null=True, blank=True, default=None)
    capitan = models.ForeignKey(Persona, related_name="capitan", on_delete=models.CASCADE, null=True, default=None)
    observador = models.ForeignKey(Persona, related_name="observador", on_delete=models.CASCADE, null=True, default=None)
    embarcacion = models.ForeignKey(Embarcacion, on_delete=models.CASCADE, null=True, default=None)
    tipo_arte_pesca = models.CharField(max_length=50, null=True, default="Sin tipo de arte")
    pesca_objetivo = models.CharField(max_length=100, null=True, blank=True, default="Sin objetivo")
    ingresado = models.ForeignKey(Persona, related_name="ingresado", on_delete=models.CASCADE, null=True, default=None)


class Lance(models.Model):
    codigo_lance = models.CharField(max_length=50, primary_key=True, default="default_lance")
    actividad = models.ForeignKey(ActividadPesquera, on_delete=models.CASCADE, null=True, default=None)
    numero_lance = models.IntegerField(default=0)
    calado_fecha = models.DateField(default="2000-01-01")
    calado_hora = models.TimeField(default="00:00")
    profundidad_suelo_marino = models.FloatField(default=0.0)

class Coordenadas(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, default=None)
    latitud_ns = models.CharField(max_length=1, default="N")
    latitud_grados = models.IntegerField(default=0)
    latitud_minutos = models.DecimalField(max_digits=10,decimal_places=3,default=0.00)
    longitud_w = models.CharField(max_length=1, default="W")
    longitud_grados = models.IntegerField(default=0)
    longitud_minutos = models.DecimalField(max_digits=10,decimal_places=3,default=0.00)



class LancePalangre(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, default=None)
    Tipo_anzuelo = models.CharField(max_length=3, default="N")
    tamano_anzuelo = models.FloatField(default=0.0)
    cantidad_anzuelos = models.IntegerField(default=0)
    linea_madre_metros = models.FloatField(default=0.0)
    profundidad_anzuelo_metros = models.FloatField(default=0.0)

class LanceArrastre(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, default=None)
    ted = models.BooleanField(default=False)
    copo = models.IntegerField(default=0)
    tunel = models.IntegerField(default=0)
    pico = models.IntegerField(default=0)

class LanceCerco(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, default=None)
    altura_red = models.FloatField(default=0.0)
    longitud_red = models.FloatField(default=0.0)
    malla_cabecero = models.FloatField(default=0.0)
    malla_cuerpo = models.FloatField(default=0.0)

class LancePalangreCarnadas(models.Model):
    codigo_lance_palangre = models.OneToOneField(LancePalangre, on_delete=models.CASCADE, primary_key=True, default=None)
    codigo_tipo_carnada = models.ForeignKey(TipoCarnada, on_delete=models.CASCADE, null=True, default=None)
    porcentaje_carnada = models.FloatField(default=0.0)

class DatosCaptura(models.Model):
    codigo_captura = models.CharField(max_length=50, primary_key=True, default="default_captura")
    lance = models.ForeignKey(Lance, on_delete=models.CASCADE, null=True, default=None)
    especie = models.ForeignKey(Especie, on_delete=models.CASCADE, null=True, default=None)
    individuos_retenidos = models.IntegerField(default=0)
    individuos_descarte = models.IntegerField(default=0)
    peso_retenido = models.FloatField(default=0.0)
    peso_descarte = models.FloatField(default=0.0)
    

class Avistamiento(models.Model):
    codigo_avistamiento = models.CharField(max_length=50, primary_key=True, default="default_avistamiento")
    lance = models.ForeignKey(Lance, on_delete=models.CASCADE, null=True, default=None)
    especie = models.ForeignKey(Especie, on_delete=models.CASCADE, null=True, default=None)
    alimentandose = models.IntegerField(default=0)
    deambulando = models.IntegerField(default=0)
    en_reposo = models.IntegerField(default=0)
    
class Incidencia(models.Model):
    codigo_incidencia = models.CharField(max_length=50, primary_key=True)
    lance = models.ForeignKey(Lance, on_delete=models.CASCADE, null=True)
    especie = models.ForeignKey(Especie, on_delete=models.CASCADE, null=True)
    herida_grave = models.IntegerField(default=0)
    herida_leve = models.IntegerField(default=0)
    muerto = models.IntegerField(default=0)
    Totalindividuos = models.IntegerField(default=0)
    observacion = models.TextField(null=True, blank=True, default="Sin observación")

class IncidenciaAves(models.Model):
    codigo_incidencia = models.OneToOneField(Incidencia, on_delete=models.CASCADE, primary_key=True)
    aves_pico = models.IntegerField(default=0)
    aves_patas = models.IntegerField(default=0)
    aves_alas = models.IntegerField(default=0)

class IncidenciaMamiferos(models.Model):
    codigo_incidencia = models.OneToOneField(Incidencia, on_delete=models.CASCADE, primary_key=True)
    mamiferos_hocico = models.IntegerField(default=0)
    mamiferos_cuello = models.IntegerField(default=0)
    mamiferos_cuerpo = models.IntegerField(default=0)

class IncidenciaTortugas(models.Model):
    codigo_incidencia = models.OneToOneField(Incidencia, on_delete=models.CASCADE, primary_key=True)
    tortugas_pico = models.IntegerField(default=0)
    tortugas_cuerpo = models.IntegerField(default=0)
    tortugas_aleta = models.IntegerField(default=0)

class IncidenciaPalangre(models.Model):
    codigo_incidencia = models.OneToOneField(Incidencia, on_delete=models.CASCADE, primary_key=True)
    palangre_orinque = models.IntegerField(default=0)
    palangre_reinal = models.IntegerField(default=0)
    palangre_anzuelo = models.IntegerField(default=0)
    palangre_linea_madre = models.IntegerField(default=0)

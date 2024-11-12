from django.db import models

# Modelo para ACTIVIDADPESQUERA
class ActividadPesquera(models.Model):
    codigo_de_ingreso = models.CharField(max_length=50, primary_key=True)
    puerto_de_salida = models.CharField(max_length=100)
    dia_salida = models.IntegerField()
    mes_salida = models.IntegerField()
    ano_salida = models.IntegerField()
    puerto_de_entrada = models.CharField(max_length=100)
    dia_entrada = models.IntegerField()
    mes_entrada = models.IntegerField()
    ano_entrada = models.IntegerField()
    observador = models.CharField(max_length=100)
    embarcacion = models.CharField(max_length=100)
    armador = models.CharField(max_length=100)
    capitan_de_pesca = models.CharField(max_length=100)
    matricula = models.CharField(max_length=50)
    tipo_de_flota = models.CharField(max_length=50)
    pesca_objetivo = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'actividadpesquera'

    def __str__(self):
        return self.codigo_de_ingreso


# Modelo para LANCE
class Lance(models.Model):
    codigo_lance = models.CharField(max_length=50, primary_key=True)
    codigo_de_ingreso = models.ForeignKey(ActividadPesquera, on_delete=models.CASCADE, db_column='codigo_de_ingreso')
    faena = models.CharField(max_length=100)
    lance = models.IntegerField()
    calado_inicial_dia = models.IntegerField()
    calado_inicial_mes = models.IntegerField()
    calado_inicial_ano = models.IntegerField()
    calado_inicial_hora = models.TimeField()
    latitud_ns = models.CharField(max_length=1)
    latitud_grados = models.IntegerField()
    latitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)
    longitud_w = models.CharField(max_length=1)
    longitud_grados = models.IntegerField()
    longitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)

    class Meta:
        managed = False
        db_table = 'lance'

    def __str__(self):
        return self.codigo_lance


# Modelo para LANCE_CERCO
class LanceCerco(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, db_column='codigo_de_ingreso')
    red_altura = models.DecimalField(max_digits=7, decimal_places=2)
    red_longitud = models.DecimalField(max_digits=7, decimal_places=2)
    malla_cabecero = models.DecimalField(max_digits=5, decimal_places=2)
    malla_cuerpo = models.DecimalField(max_digits=5, decimal_places=2)
    profundidad_suelo_marino = models.DecimalField(max_digits=7, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'lance_cerco'


# Modelo para LANCE_ARRASTRE
class LanceArrastre(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, db_column='codigo_de_ingreso')
    calado_final_fecha = models.DateField()
    calado_final_hora = models.TimeField()
    calado_final_latitud_ns = models.CharField(max_length=1)
    calado_final_latitud_grados = models.IntegerField()
    calado_final_latitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)
    calado_final_longitud_w = models.CharField(max_length=1)
    calado_final_longitud_grados = models.IntegerField()
    calado_final_longitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)
    recorrido_inicial_fecha = models.DateField()
    recorrido_inicial_hora = models.TimeField()
    recorrido_inicial_latitud_ns = models.CharField(max_length=1)
    recorrido_inicial_latitud_grados = models.IntegerField()
    recorrido_inicial_latitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)
    recorrido_inicial_longitud_w = models.CharField(max_length=1)
    recorrido_inicial_longitud_grados = models.IntegerField()
    recorrido_inicial_longitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)
    recorrido_final_fecha = models.DateField()
    recorrido_final_hora = models.TimeField()
    recorrido_final_latitud_ns = models.CharField(max_length=1)
    recorrido_final_latitud_grados = models.IntegerField()
    recorrido_final_latitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)
    recorrido_final_longitud_w = models.CharField(max_length=1)
    recorrido_final_longitud_grados = models.IntegerField()
    recorrido_final_longitud_minutos = models.DecimalField(max_digits=5, decimal_places=3)
    altura = models.DecimalField(max_digits=7, decimal_places=2)
    longitud = models.DecimalField(max_digits=7, decimal_places=2)
    cabecero = models.IntegerField()
    cuerpo = models.IntegerField()
    profundidad_suelo_marino = models.DecimalField(max_digits=7, decimal_places=2)
    carnada_1 = models.CharField(max_length=100)
    carnada_2 = models.CharField(max_length=100)
    tipo_anzuelo = models.CharField(max_length=50)
    cantidad_anzuelos = models.IntegerField()
    linea_madre_metros = models.DecimalField(max_digits=7, decimal_places=2)
    anzuelo = models.DecimalField(max_digits=5, decimal_places=2)
    especies_observadas = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'lance_arrastre'


# Modelo para LANCE_PALANGRE
class LancePalangre(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, related_name='lance_palangre')
    nombre_cientifico_1 = models.CharField(max_length=100)
    porcentaje_carnada_1 = models.DecimalField(max_digits=5, decimal_places=2)
    nombre_cientifico_2 = models.CharField(max_length=100)
    porcentaje_carnada_2 = models.DecimalField(max_digits=5, decimal_places=2)
    nombre_cientifico_3 = models.CharField(max_length=100)
    porcentaje_carnada_3 = models.DecimalField(max_digits=5, decimal_places=2)
    nombre_cientifico_4 = models.CharField(max_length=100)
    porcentaje_carnada_4 = models.DecimalField(max_digits=5, decimal_places=2)
    nombre_cientifico_5 = models.CharField(max_length=100)
    porcentaje_carnada_5 = models.DecimalField(max_digits=5, decimal_places=2)
    tipo_anzuelo = models.CharField(max_length=100)
    tamano_anzuelo = models.DecimalField(max_digits=5, decimal_places=2)
    cantidad_anzuelos = models.IntegerField()
    linea_madre_metros = models.DecimalField(max_digits=7, decimal_places=2)
    profundidad_anzuelo_metros = models.DecimalField(max_digits=7, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'lance_palangre'

class DatosCaptura(models.Model):
    codigo_captura = models.CharField(primary_key=True, max_length=50)
    codigo_lance = models.ForeignKey(Lance, on_delete=models.CASCADE, db_column='codigo_lance')
    taxa = models.CharField(max_length=100, blank=True, null=True)
    genero = models.CharField(max_length=100, blank=True, null=True)
    especie = models.CharField(max_length=100, blank=True, null=True)
    nombre_cientifico = models.CharField(max_length=150, blank=True, null=True)
    nombre_comun = models.CharField(max_length=150, blank=True, null=True)
    individuos_retenidos = models.IntegerField(blank=True, null=True)
    individuos_descarte = models.IntegerField(blank=True, null=True)
    total_individuos = models.IntegerField(blank=True, null=True)
    peso_retenido = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    peso_descarte = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_peso_lb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    def __str__(self):
        return f"{self.nombre_cientifico} - {self.total_individuos}"
    class Meta:
        managed = False
        db_table = 'datoscaptura'

    

class Avistamiento(models.Model):
    codigo_avistamiento = models.CharField(primary_key=True, max_length=50)
    codigo_lance = models.ForeignKey(Lance, on_delete=models.CASCADE, db_column='codigo_lance')
    grupos_avi_int = models.CharField(max_length=100, blank=True, null=True)
    nombre_cientifico = models.CharField(max_length=150, blank=True, null=True)
    alimentandose = models.IntegerField(blank=True, null=True)
    deambulando = models.IntegerField(blank=True, null=True)
    en_reposo = models.IntegerField(blank=True, null=True)
    total_individuos = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'avistamiento'

class Incidencia(models.Model):
    codigo_incidencia = models.CharField(primary_key=True, max_length=50)
    codigo_lance = models.ForeignKey(Lance, on_delete=models.CASCADE, db_column='codigo_lance')
    grupos_avi_int = models.CharField(max_length=100, blank=True, null=True)
    nombre_cientifico = models.CharField(max_length=150, blank=True, null=True)
    herida_grave = models.IntegerField(blank=True, null=True)
    herida_leve = models.IntegerField(blank=True, null=True)
    muerto = models.IntegerField(blank=True, null=True)
    aves_pico = models.IntegerField(blank=True, null=True)
    aves_patas = models.IntegerField(blank=True, null=True)
    aves_alas = models.IntegerField(blank=True, null=True)
    mamiferos_hocico = models.IntegerField(blank=True, null=True)
    mamiferos_cuello = models.IntegerField(blank=True, null=True)
    mamiferos_cuerpo = models.IntegerField(blank=True, null=True)
    tortugas_pico = models.IntegerField(blank=True, null=True)
    tortugas_cuerpo = models.IntegerField(blank=True, null=True)
    tortugas_aleta = models.IntegerField(blank=True, null=True)
    palangre_orinque = models.IntegerField(blank=True, null=True)
    palangre_reinal = models.IntegerField(blank=True, null=True)
    palangre_anzuelo = models.IntegerField(blank=True, null=True)
    palangre_linea_madre = models.IntegerField(blank=True, null=True)
    total_individuos = models.IntegerField(blank=True, null=True)
    observacion = models.CharField(max_length=250, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'incidencia'
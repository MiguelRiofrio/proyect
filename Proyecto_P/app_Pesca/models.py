from django.db import models

# Tabla: ActividadPesquera
class ActividadPesquera(models.Model):
    codigo_actividad = models.CharField(max_length=100, primary_key=True, db_column='CodigoActividad')
    fecha_salida = models.DateField(db_column='FechaSalida')
    puerto_salida = models.CharField(max_length=100, db_column='PuertoSalida')
    fecha_entrada = models.DateField(db_column='FechaEntrada')
    puerto_entrada = models.CharField(max_length=100, db_column='PuertoEntrada')
    nombre_armador = models.CharField(max_length=100, db_column='NombreArmador')
    nombre_capitan = models.CharField(max_length=100, db_column='NombreCapitan')
    nombre_embarcacion = models.CharField(max_length=100, db_column='NombreEmbarcacion')
    matricula = models.CharField(max_length=50, db_column='Matricula')
    observador = models.CharField(max_length=100, db_column='Observador')
    pesca_objetivo = models.CharField(max_length=50, db_column='PescaObjetivo')
    arte_pesca = models.CharField(max_length=20, choices=[('Cerco', 'Cerco'), ('Palangre', 'Palangre'), ('Arrastre', 'Arrastre')], db_column='ArtePesca')

    class Meta:
        managed = False
        db_table = 'actividadpesquera'


# Tabla: Lance
class Lance(models.Model):
    codigo_lance = models.CharField(max_length=100, primary_key=True, db_column='CodigoLance')
    codigo_actividad = models.ForeignKey(ActividadPesquera, on_delete=models.CASCADE, db_column='CodigoActividad')
    numero_lance = models.IntegerField(db_column='NumeroLance')
    calado_fecha = models.DateField(db_column='CaladoFecha')
    calado_hora = models.TimeField(db_column='CaladoHora')
    latitud_ns = models.CharField(max_length=1, blank=True, null=True, db_column='Latitud_NS')
    latitud_grados = models.IntegerField(blank=True, null=True, db_column='Latitud_Grados')
    latitud_minutos = models.DecimalField(max_digits=5, decimal_places=3, blank=True, null=True, db_column='Latitud_Minutos')
    longitud_w = models.CharField(max_length=1, blank=True, null=True, db_column='Longitud_W')
    longitud_grados = models.IntegerField(blank=True, null=True, db_column='Longitud_Grados')
    longitud_minutos = models.DecimalField(max_digits=5, decimal_places=3, blank=True, null=True, db_column='Longitud_Minutos')
    profundidad_suelo_marino = models.DecimalField(max_digits=5, decimal_places=2, db_column='ProfundidadSueloMarino')

    class Meta:
        managed = False
        db_table = 'lance'


# Tabla: LanceCerco
class LanceCerco(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, db_column='CodigoLance')
    altura_red = models.DecimalField(max_digits=7, decimal_places=2, db_column='AlturaRed')
    longitud_red = models.DecimalField(max_digits=7, decimal_places=2, db_column='LongitudRed')
    malla_cabecero = models.DecimalField(max_digits=5, decimal_places=2, db_column='MallaCabecero')
    malla_cuerpo = models.DecimalField(max_digits=5, decimal_places=2, db_column='MallaCuerpo')

    class Meta:
        managed = False
        db_table = 'lancecerco'


# Tabla: LancePalangre
class LancePalangre(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, db_column='CodigoLance')
    carnada1 = models.CharField(max_length=100, blank=True, null=True, db_column='Carnada1')
    porcentaje_carnada1 = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, db_column='PorcentajeCarnada1')
    carnada2 = models.CharField(max_length=100, blank=True, null=True, db_column='Carnada2')
    porcentaje_carnada2 = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, db_column='PorcentajeCarnada2')
    tipo_anzuelo = models.CharField(max_length=50, blank=True, null=True, db_column='TipoAnzuelo')
    tamano_anzuelo = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, db_column='TamanoAnzuelo')
    cantidad_anzuelos = models.IntegerField(blank=True, null=True, db_column='CantidadAnzuelos')
    linea_madre_metros = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True, db_column='LineaMadreMetros')
    profundidad_anzuelo_metros = models.DecimalField(max_digits=7, decimal_places=2, blank=True, null=True, db_column='ProfundidadAnzueloMetros')

    class Meta:
        managed = False
        db_table = 'lancepalangre'


# Tabla: LanceArrastre
class LanceArrastre(models.Model):
    codigo_lance = models.OneToOneField(Lance, on_delete=models.CASCADE, primary_key=True, db_column='CodigoLance')
    ted = models.BooleanField(db_column='TED')
    copo = models.IntegerField(blank=True, null=True, db_column='Copo')
    tunel = models.IntegerField(blank=True, null=True, db_column='Tunel')
    pico = models.IntegerField(blank=True, null=True, db_column='Pico')

    class Meta:
        managed = False
        db_table = 'lancearrastre'


# Tabla: DatosCaptura
class DatosCaptura(models.Model):
    codigo_captura = models.AutoField(primary_key=True, db_column='Codigo_Captura')
    codigo_lance = models.ForeignKey(Lance, on_delete=models.CASCADE, db_column='CodigoLance')
    taxa = models.CharField(max_length=100, db_column='Taxa')
    genero = models.CharField(max_length=100, db_column='Genero')
    especie = models.CharField(max_length=100, db_column='Especie')
    nombre_cientifico = models.CharField(max_length=150, db_column='Nombre_Cientifico')
    nombre_comun = models.CharField(max_length=150, db_column='Nombre_Comun')
    individuos_retenidos = models.IntegerField(db_column='Individuos_Retenidos')
    individuos_descarte = models.IntegerField(db_column='Individuos_Descarte')
    total_individuos = models.IntegerField(db_column='Total_Individuos')
    peso_retenido = models.DecimalField(max_digits=10, decimal_places=2, db_column='Peso_Retenido')
    peso_descarte = models.DecimalField(max_digits=10, decimal_places=2, db_column='Peso_Descarte')
    total_peso_lb = models.DecimalField(max_digits=10, decimal_places=2, db_column='Total_Peso_Lb')

    class Meta:
        managed = False
        db_table = 'datos_captura'


# Tabla: Avistamiento
class Avistamiento(models.Model):
    codigo_avistamiento = models.AutoField(primary_key=True, db_column='Codigo_Avistamiento')
    codigo_lance = models.ForeignKey(Lance, on_delete=models.CASCADE, db_column='CodigoLance')
    grupos_avi_int = models.CharField(max_length=100, db_column='Grupos_Avi_Int')
    nombre_cientifico = models.CharField(max_length=150, db_column='Nombre_Cientifico')
    alimentandose = models.IntegerField(db_column='Alimentandose')
    deambulando = models.IntegerField(db_column='Deambulando')
    en_reposo = models.IntegerField(db_column='En_Reposo')
    total_individuos = models.IntegerField(db_column='Total_Individuos')

    class Meta:
        managed = False
        db_table = 'avistamiento'


# Tabla: Incidencia
class Incidencia(models.Model):
    codigo_incidencia = models.CharField(max_length=50, primary_key=True, db_column='Codigo_Incidencia')
    codigo_lance = models.ForeignKey(Lance, on_delete=models.CASCADE, db_column='CodigoLance')
    grupos_avi_int = models.CharField(max_length=100, db_column='Grupos_Avi_Int')
    nombre_cientifico = models.CharField(max_length=150, db_column='Nombre_Cientifico')
    herida_grave = models.IntegerField(db_column='Herida_Grave')
    herida_leve = models.IntegerField(db_column='Herida_Leve')
    muerto = models.IntegerField(db_column='Muerto')
    aves_pico = models.IntegerField(blank=True, null=True, db_column='Aves_Pico')
    aves_patas = models.IntegerField(blank=True, null=True, db_column='Aves_Patas')
    aves_alas = models.IntegerField(blank=True, null=True, db_column='Aves_Alas')
    mamiferos_hocico = models.IntegerField(blank=True, null=True, db_column='Mamiferos_Hocico')
    mamiferos_cuello = models.IntegerField(blank=True, null=True, db_column='Mamiferos_Cuello')
    mamiferos_cuerpo = models.IntegerField(blank=True, null=True, db_column='Mamiferos_Cuerpo')
    tortugas_pico = models.IntegerField(blank=True, null=True, db_column='Tortugas_Pico')
    tortugas_cuerpo = models.IntegerField(blank=True, null=True, db_column='Tortugas_Cuerpo')
    tortugas_aleta = models.IntegerField(blank=True, null=True, db_column='Tortugas_Aleta')
    palangre_orinque = models.IntegerField(blank=True, null=True, db_column='Palangre_Orinque')
    palangre_reinal = models.IntegerField(blank=True, null=True, db_column='Palangre_Reinal')
    palangre_anzuelo = models.IntegerField(blank=True, null=True, db_column='Palangre_Anzuelo')
    palangre_linea_madre = models.IntegerField(blank=True, null=True, db_column='Palangre_Linea_Madre')
    total_individuos = models.IntegerField(db_column='Total_Individuos')
    observacion = models.CharField(max_length=250, blank=True, null=True, db_column='Observacion')

    class Meta:
        managed = False
        db_table = 'incidencia'

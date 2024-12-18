# Generated by Django 4.2 on 2024-12-13 15:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ActividadPesquera',
            fields=[
                ('codigo_actividad', models.CharField(default='default_actividad', max_length=50, primary_key=True, serialize=False)),
                ('fecha_salida', models.DateField(default='2000-01-01')),
                ('fecha_entrada', models.DateField(default='2000-01-01')),
                ('tipo_arte_pesca', models.CharField(default='Sin tipo de arte', max_length=50, null=True)),
                ('pesca_objetivo', models.CharField(blank=True, default='Sin objetivo', max_length=100, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Coordenadas',
            fields=[
                ('codigo_coordenadas', models.CharField(default='default_coord', max_length=50, primary_key=True, serialize=False)),
                ('latitud_ns', models.CharField(default='N', max_length=1)),
                ('latitud_grados', models.IntegerField(default=0)),
                ('latitud_minutos', models.FloatField(default=0.0)),
                ('longitud_w', models.CharField(default='W', max_length=1)),
                ('longitud_grados', models.IntegerField(default=0)),
                ('longitud_minutos', models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name='Embarcacion',
            fields=[
                ('codigo_embarcacion', models.CharField(default='default_embarcacion', max_length=50, primary_key=True, serialize=False)),
                ('nombre_embarcacion', models.CharField(default='Sin nombre', max_length=100)),
                ('matricula', models.CharField(default='Sin matrícula', max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Especie',
            fields=[
                ('codigo_especie', models.CharField(default='default_especie', max_length=50, primary_key=True, serialize=False)),
                ('taxa', models.CharField(blank=True, default='Sin taxa', max_length=100, null=True)),
                ('genero', models.CharField(blank=True, default='Sin género', max_length=100, null=True)),
                ('especie', models.CharField(blank=True, default='Sin especie', max_length=100, null=True)),
                ('nombre_cientifico', models.CharField(blank=True, default='Sin nombre científico', max_length=150, null=True)),
                ('nombre_comun', models.CharField(blank=True, default='Sin nombre común', max_length=150, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Incidencia',
            fields=[
                ('codigo_incidencia', models.CharField(max_length=50, primary_key=True, serialize=False)),
                ('grupos_avi_int', models.CharField(blank=True, default='Sin grupo', max_length=100, null=True)),
                ('observacion', models.TextField(blank=True, default='Sin observación', null=True)),
                ('especie', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.especie')),
            ],
        ),
        migrations.CreateModel(
            name='Lance',
            fields=[
                ('codigo_lance', models.CharField(default='default_lance', max_length=50, primary_key=True, serialize=False)),
                ('numero_lance', models.IntegerField(default=0)),
                ('calado_fecha', models.DateField(default='2000-01-01')),
                ('calado_hora', models.TimeField(default='00:00:00')),
                ('profundidad_suelo_marino', models.FloatField(default=0.0)),
                ('actividad', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.actividadpesquera')),
                ('coordenadas', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.coordenadas')),
            ],
        ),
        migrations.CreateModel(
            name='Persona',
            fields=[
                ('codigo_persona', models.CharField(default='default_persona', max_length=50, primary_key=True, serialize=False)),
                ('nombre', models.CharField(default='Sin nombre', max_length=100)),
                ('rol', models.CharField(default='Sin rol', max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Puerto',
            fields=[
                ('codigo_puerto', models.CharField(default='default_puerto', max_length=50, primary_key=True, serialize=False)),
                ('nombre_puerto', models.CharField(default='Sin nombre', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='TipoCarnada',
            fields=[
                ('codigo_tipo_carnada', models.IntegerField(default=0, primary_key=True, serialize=False)),
                ('nombre_carnada', models.CharField(default='Sin nombre', max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='IncidenciaAves',
            fields=[
                ('codigo_incidencia', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='app_Pesca.incidencia')),
                ('herida_grave', models.IntegerField(default=0)),
                ('herida_leve', models.IntegerField(default=0)),
                ('muerto', models.IntegerField(default=0)),
                ('aves_pico', models.IntegerField(default=0)),
                ('aves_patas', models.IntegerField(default=0)),
                ('aves_alas', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='IncidenciaMamiferos',
            fields=[
                ('codigo_incidencia', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='app_Pesca.incidencia')),
                ('herida_grave', models.IntegerField(default=0)),
                ('herida_leve', models.IntegerField(default=0)),
                ('muerto', models.IntegerField(default=0)),
                ('mamiferos_hocico', models.IntegerField(default=0)),
                ('mamiferos_cuello', models.IntegerField(default=0)),
                ('mamiferos_cuerpo', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='IncidenciaPalangre',
            fields=[
                ('codigo_incidencia', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='app_Pesca.incidencia')),
                ('palangre_orinque', models.IntegerField(default=0)),
                ('palangre_reinal', models.IntegerField(default=0)),
                ('palangre_anzuelo', models.IntegerField(default=0)),
                ('palangre_linea_madre', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='IncidenciaTortugas',
            fields=[
                ('codigo_incidencia', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='app_Pesca.incidencia')),
                ('herida_grave', models.IntegerField(default=0)),
                ('herida_leve', models.IntegerField(default=0)),
                ('muerto', models.IntegerField(default=0)),
                ('tortugas_pico', models.IntegerField(default=0)),
                ('tortugas_cuerpo', models.IntegerField(default=0)),
                ('tortugas_aleta', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='LanceArrastre',
            fields=[
                ('codigo_lance', models.OneToOneField(default=None, on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='app_Pesca.lance')),
                ('ted', models.BooleanField(default=False)),
                ('copo', models.IntegerField(default=0)),
                ('tunel', models.IntegerField(default=0)),
                ('pico', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='LanceCerco',
            fields=[
                ('codigo_lance', models.OneToOneField(default=None, on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='app_Pesca.lance')),
                ('altura_red', models.FloatField(default=0.0)),
                ('longitud_red', models.FloatField(default=0.0)),
                ('malla_cabecero', models.FloatField(default=0.0)),
                ('malla_cuerpo', models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name='LancePalangre',
            fields=[
                ('codigo_lance', models.OneToOneField(default=None, on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='app_Pesca.lance')),
                ('tamano_anzuelo', models.FloatField(default=0.0)),
                ('cantidad_anzuelos', models.IntegerField(default=0)),
                ('linea_madre_metros', models.FloatField(default=0.0)),
                ('profundidad_anzuelo_metros', models.FloatField(default=0.0)),
            ],
        ),
        migrations.AddField(
            model_name='incidencia',
            name='lance',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.lance'),
        ),
        migrations.CreateModel(
            name='DatosCaptura',
            fields=[
                ('codigo_captura', models.CharField(default='default_captura', max_length=50, primary_key=True, serialize=False)),
                ('individuos_retenidos', models.IntegerField(default=0)),
                ('individuos_descarte', models.IntegerField(default=0)),
                ('peso_retenido', models.FloatField(default=0.0)),
                ('peso_descarte', models.FloatField(default=0.0)),
                ('especie', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.especie')),
                ('lance', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.lance')),
            ],
        ),
        migrations.CreateModel(
            name='Avistamiento',
            fields=[
                ('codigo_avistamiento', models.CharField(default='default_avistamiento', max_length=50, primary_key=True, serialize=False)),
                ('grupos_avi_int', models.CharField(default='Sin grupo', max_length=100)),
                ('alimentandose', models.IntegerField(default=0)),
                ('deambulando', models.IntegerField(default=0)),
                ('en_reposo', models.IntegerField(default=0)),
                ('especie', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.especie')),
                ('lance', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.lance')),
            ],
        ),
        migrations.AddField(
            model_name='actividadpesquera',
            name='armador',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='armador', to='app_Pesca.persona'),
        ),
        migrations.AddField(
            model_name='actividadpesquera',
            name='capitan',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='capitan', to='app_Pesca.persona'),
        ),
        migrations.AddField(
            model_name='actividadpesquera',
            name='embarcacion',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.embarcacion'),
        ),
        migrations.AddField(
            model_name='actividadpesquera',
            name='observador',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='observador', to='app_Pesca.persona'),
        ),
        migrations.AddField(
            model_name='actividadpesquera',
            name='puerto_entrada',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='entradas', to='app_Pesca.puerto'),
        ),
        migrations.AddField(
            model_name='actividadpesquera',
            name='puerto_salida',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='salidas', to='app_Pesca.puerto'),
        ),
        migrations.CreateModel(
            name='LancePalangreCarnadas',
            fields=[
                ('codigo_carnada', models.IntegerField(default=0, primary_key=True, serialize=False)),
                ('porcentaje_carnada', models.FloatField(default=0.0)),
                ('codigo_tipo_carnada', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.tipocarnada')),
                ('codigo_lance_palangre', models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='app_Pesca.lancepalangre')),
            ],
        ),
    ]

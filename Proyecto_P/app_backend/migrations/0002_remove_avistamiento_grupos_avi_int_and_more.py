# Generated by Django 4.2 on 2024-12-27 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_backend', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='avistamiento',
            name='grupos_avi_int',
        ),
        migrations.RemoveField(
            model_name='incidencia',
            name='grupos_avi_int',
        ),
        migrations.AddField(
            model_name='especie',
            name='grupos',
            field=models.CharField(blank=True, default='Sin grupo', max_length=100, null=True),
        ),
    ]

# Generated by Django 4.2 on 2024-12-16 20:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app_Pesca', '0006_lancepalangre_tipo'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lancepalangre',
            name='Tipo',
            field=models.CharField(default='N', max_length=3),
        ),
    ]

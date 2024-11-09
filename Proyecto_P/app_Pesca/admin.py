from django.contrib import admin
from .models import ActividadPesquera, Lance, DatosCaptura, Avistamiento, Incidencia

admin.site.register(ActividadPesquera)
admin.site.register(Lance)
admin.site.register(DatosCaptura)
admin.site.register(Avistamiento)
admin.site.register(Incidencia)
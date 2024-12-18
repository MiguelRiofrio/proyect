from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

# Configurar el router
router = DefaultRouter()
router.register(r'tipo-carnada', TipoCarnadaViewSet)
router.register(r'puertos', PuertoViewSet)
router.register(r'personas', PersonaViewSet)
router.register(r'embarcaciones', EmbarcacionViewSet)
router.register(r'coordenadas', CoordenadasViewSet)
router.register(r'especies', EspecieViewSet)
router.register(r'actividades', ActividadPesqueraViewSet)
router.register(r'lances', LanceViewSet)
router.register(r'capturas', DatosCapturaViewSet)
router.register(r'avistamientos', AvistamientoViewSet)
router.register(r'incidencias', IncidenciaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
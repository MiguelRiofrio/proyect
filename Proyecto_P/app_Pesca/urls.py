from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
urlpatterns = [
    path('', include(router.urls)),  # Todas las rutas generadas por el router
    path('dashboard-data/', views.dashboard_data, name='dashboard_data'),
    path('api/chart-data/', views.DatosCaptura, name='chart_data'),
    path('mapa_a/', views.obtener_datos_mapa_avistamientos, name='avistamientos_mapa'),
    #path('mapa/', views.obtener_datos_mapa1, name='obtener_datos_mapa'),
    path('generar-reporte/', views.generar_reporte, name='generar_reporte'),

    
]
    
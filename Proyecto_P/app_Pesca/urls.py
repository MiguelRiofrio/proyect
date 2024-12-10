from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'actividad', views.ActividadPesqueraViewSet, basename='actividad')

urlpatterns = [
    path('', include(router.urls)),  # Todas las rutas generadas por el router
    path('dashboard/', views.dashboard_data2, name='dashboard_data'),#ni idea donde sale
    #datos del mapa
    path('mapa/', views.obtener_datosA_mapa, name='avistamientos_mapa'),
    path('mapa_c/', views.obtener_datosC_mapa, name='Capturas_mapa'),
    #path('mapa/', views.obtener_datos_mapa1, name='obtener_datos_mapa'),
    path('generar-reporte/', views.generar_reporte, name='generar_reporte'),
    #Trae el detalle de una actividad
    path('actividad_c/<str:codigo_actividad>/', views.ActividadDetalleCompletaView.as_view(), name='actividad_pesquera_detail'),
    
]
from django.urls import path
from .views import ActividadPesqueraView, LanceView, DatosCapturaView, AvistamientoView,IncidenciaView
from . import views
urlpatterns = [
    path('actividades/', ActividadPesqueraView.as_view(), name='actividades'),
    path('actividades/<str:id>/', ActividadPesqueraView.as_view(), name='actividad_detalle'),
    path('actividadDetalle/<str:id>/', views.ActividadDetalleView.as_view(), name='actividad-detalle-completo'),


    path('lances/', LanceView.as_view(), name='lances'),
    path('lances/<str:id>/', LanceView.as_view(), name='lance_detalle'),
    
    path('capturas/', DatosCapturaView.as_view(), name='capturas'),
    path('capturas/<str:id>/', DatosCapturaView.as_view(), name='captura_detalle'),
    
    path('avistamientos/', AvistamientoView.as_view(), name='avistamientos'),
    path('avistamientos/<str:id>/', AvistamientoView.as_view(), name='avistamiento_detalle'),
    
    path('incidencias/', IncidenciaView.as_view(), name='incidencias'),
    path('incidencias/<str:id>/', IncidenciaView.as_view(), name='incidencia_detalle'),
]

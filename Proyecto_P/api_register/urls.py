from django.urls import path
from .views import ActividadPesqueraView, ActividadDetalleCompletaView
urlpatterns = [
     path('actividad/<str:codigo_actividad>/', ActividadDetalleCompletaView.as_view(), name='actividad-detalle'),
    path('actividad/', ActividadPesqueraView.as_view(), name='actividad-list-create'),
    path('actividad/<str:codigo_actividad>/', ActividadPesqueraView.as_view(), name='actividad-update-delete'),


]

# urls.py
from rest_framework.routers import DefaultRouter
from . import views  # Importa todos los ViewSets
from django.urls import path,include  

router = DefaultRouter()



urlpatterns = [
    path('', include(router.urls)),  # Agrega las rutas del router
    path('dashboard/', views.dashboard_data, name='dashboard'),
    path('top-especies/', views.top_especies, name='top_especies'),
    path('kpi-home/', views.kpi_home, name='kpi_home'),
    path('localizacion_especies/', views.coordenadas_general, name='localizacion'),
    path('localizacion_especies_a/', views.areas_mayor_avistamiento, name='localizacion'),


]

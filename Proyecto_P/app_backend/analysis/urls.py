# urls.py
from rest_framework.routers import DefaultRouter
from . import views_analisis, views_dashboard, views_estadistica , views_mapa # Importa todos los ViewSets
from django.urls import path,include  

router = DefaultRouter()

urlpatterns = [
    # Agrega las rutas del router
    path('', include(router.urls)),  
    #views_dashboard
    path('dashboard/', views_dashboard.DashboardDataView.as_view(), name='dashboard'),
    path('top-especies/', views_dashboard.TopEspeciesView.as_view(), name='top_especies'),
    path('kpi-home/', views_dashboard.KpiHomeView.as_view(), name='kpi_home'),
    #views_mapa
    path('localizacion_especies/', views_mapa.CoordenadasGeneralAPIView.as_view(), name='localizacion'),
    path('filtros-coordenadas/', views_mapa.FiltroCoordenadasAPIView.as_view(), name='filtros-coordenadas'),

    #path('localizacion_especies_a/', views_mapa.areas_mayor_avistamiento, name='localizacion'),
    #views_analisis
    path('reporte/', views_analisis.ReporteDetalladoView.as_view(), name='reporte'),
    path('filtros-analisis/', views_analisis.FiltrosView.as_view(), name='filtros_disponibles'),

    #views_estaditicas
    path('estadisticas/', views_estadistica.EstadisticasPesquerasView.as_view(), name='estadisticas-pesqueras'),
    path('filtro-estadistica/', views_estadistica.ListFiltroView.as_view(), name='listar_taxas_embarcaciones'),


]

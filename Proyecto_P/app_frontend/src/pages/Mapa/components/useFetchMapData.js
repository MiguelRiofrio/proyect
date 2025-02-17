// src/hooks/useFetchMapData.js
import { useState, useEffect, useCallback } from 'react';
import api from '../../../routes/api';

const useFetchMapData = (filtros) => {
  const [datos, setDatos] = useState({ capturas: [], avistamientos: [], incidencias: [] });
  const [filtrosDisponibles, setFiltrosDisponibles] = useState({
    taxas: [],
    especies: [],
    puertos: [],
    embarcaciones: [],
    rangoProfundidad: { min: 0, max: 100 },
    años: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir parámetros (omitimos aquellos vacíos)
      const params = {
        tipo: filtros.tipoFiltro,
        taxa: filtros.taxaFiltro || undefined,
        especie: filtros.especieFiltro || undefined,
        rango_profundidad_min: filtros.profundidadMin || undefined,
        rango_profundidad_max: filtros.profundidadMax || undefined,
        puerto: filtros.puerto || undefined,
        embarcacion: filtros.embarcacion || undefined,
        year: filtros.year || undefined,
      };

      // Se realizan dos llamadas en paralelo
      const [coordenadasResponse, filtrosResponse] = await Promise.all([
        api.get('/localizacion_especies/', { params }),
        api.get('/filtros-coordenadas/', { params }),
      ]);

      console.log("Respuesta de /localizacion_especies:", coordenadasResponse.data);
      console.log("Respuesta de /filtros-coordenadas:", filtrosResponse.data);

      setDatos(coordenadasResponse.data || { capturas: [], avistamientos: [], incidencias: [] });

      // Aquí transformamos el objeto recibido para que tenga { min, max }
      const rangoFromApi = filtrosResponse.data.rango_profundidad;
      console.log("Valor de rango_profundidad desde API:", rangoFromApi);

      setFiltrosDisponibles({
        taxas: filtrosResponse.data.taxas || [],
        especies: filtrosResponse.data.especies || [],
        puertos: filtrosResponse.data.puertos || [],
        embarcaciones: filtrosResponse.data.embarcaciones || [],
        // Transformamos las claves: de min_profundidad/max_profundidad a min/max
        rangoProfundidad: rangoFromApi && typeof rangoFromApi === 'object'
          ? { min: rangoFromApi.min_profundidad, max: rangoFromApi.max_profundidad }
          : { min: 0, max: 100 },
        años: filtrosResponse.data.años || [],
      });
    } catch (err) {
      setError("Error al cargar los datos del mapa.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { datos, filtrosDisponibles, loading, error, refetch: fetchData };
};

export default useFetchMapData;

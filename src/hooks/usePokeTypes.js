import { useState, useEffect, useCallback } from 'react';
import * as pokeTypesApi from '../api/pokeTypes';

export function usePokeTypes() {
  const [pokeTypes, setPokeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPokeTypes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pokeTypesApi.getPokeTypes();
      setPokeTypes(data.pokeTypes || data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPokeTypes();
  }, [fetchPokeTypes]);

  const create = useCallback(async (data) => {
    const result = await pokeTypesApi.createPokeType(data);
    await fetchPokeTypes();
    return result;
  }, [fetchPokeTypes]);

  const update = useCallback(async (id, data) => {
    const result = await pokeTypesApi.updatePokeType(id, data);
    await fetchPokeTypes();
    return result;
  }, [fetchPokeTypes]);

  return { pokeTypes, loading, error, create, update, refetch: fetchPokeTypes };
}

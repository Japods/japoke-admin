import { useState, useEffect, useCallback } from 'react';
import * as invApi from '../api/inventory';

export function useSupplies() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSupplies = useCallback(async () => {
    try {
      const res = await invApi.getSupplies();
      setSupplies(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  const create = useCallback(async (data) => {
    await invApi.createSupply(data);
    await fetchSupplies();
  }, [fetchSupplies]);

  const update = useCallback(async (id, data) => {
    await invApi.updateSupply(id, data);
    await fetchSupplies();
  }, [fetchSupplies]);

  return { supplies, loading, error, create, update, refetch: fetchSupplies };
}

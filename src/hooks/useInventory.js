import { useState, useEffect, useCallback } from 'react';
import * as invApi from '../api/inventory';

export function useInventory() {
  const [inventory, setInventory] = useState({ items: [], supplies: [] });
  const [movements, setMovements] = useState({ movements: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await invApi.getInventory();
      setInventory(res.data || { items: [], supplies: [] });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovements = useCallback(async (filters = {}) => {
    try {
      const res = await invApi.getMovements(filters);
      setMovements({ movements: res.movements || [], pagination: res.pagination || {} });
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchMovements();
  }, [fetchInventory, fetchMovements]);

  const purchase = useCallback(async (data) => {
    const res = await invApi.recordPurchase(data);
    await fetchInventory();
    await fetchMovements();
    return res;
  }, [fetchInventory, fetchMovements]);

  const adjust = useCallback(async (data) => {
    const res = await invApi.adjustStock(data);
    await fetchInventory();
    await fetchMovements();
    return res;
  }, [fetchInventory, fetchMovements]);

  return {
    inventory,
    movements,
    loading,
    error,
    purchase,
    adjust,
    refetch: fetchInventory,
    refetchMovements: fetchMovements,
  };
}

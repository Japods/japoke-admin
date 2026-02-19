import { useState, useEffect, useCallback } from 'react';
import * as purchasesApi from '../api/purchases';

export function usePurchases(params = {}) {
  const [purchases, setPurchases] = useState([]);
  const [summary, setSummary] = useState({ totalBS: 0, totalUSD: 0, totalUSDT: 0, count: 0 });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await purchasesApi.getPurchases(params);
      setPurchases(data.purchases || []);
      setSummary(data.summary || { totalBS: 0, totalUSD: 0, totalUSDT: 0, count: 0 });
      setPagination(data.pagination || { page: 1, total: 0, pages: 1 });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const create = useCallback(async (data) => {
    const result = await purchasesApi.createPurchase(data);
    await fetchPurchases();
    return result;
  }, [fetchPurchases]);

  const update = useCallback(async (id, data) => {
    const result = await purchasesApi.updatePurchase(id, data);
    await fetchPurchases();
    return result;
  }, [fetchPurchases]);

  const remove = useCallback(async (id) => {
    const result = await purchasesApi.deletePurchase(id);
    await fetchPurchases();
    return result;
  }, [fetchPurchases]);

  return { purchases, summary, pagination, loading, error, create, update, remove, refetch: fetchPurchases };
}

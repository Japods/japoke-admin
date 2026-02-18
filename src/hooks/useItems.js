import { useState, useEffect, useCallback } from 'react';
import * as itemsApi from '../api/items';

export function useItems(categoryFilter) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = categoryFilter ? { category: categoryFilter } : {};
      const data = await itemsApi.getItems(params);
      setItems(data.items || data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const create = useCallback(async (data) => {
    const result = await itemsApi.createItem(data);
    await fetchItems();
    return result;
  }, [fetchItems]);

  const update = useCallback(async (id, data) => {
    const result = await itemsApi.updateItem(id, data);
    await fetchItems();
    return result;
  }, [fetchItems]);

  return { items, loading, error, create, update, refetch: fetchItems };
}

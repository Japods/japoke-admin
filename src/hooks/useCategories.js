import { useState, useEffect, useCallback } from 'react';
import * as categoriesApi from '../api/categories';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getCategories();
      setCategories(data.categories || data.data || data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const create = useCallback(async (data) => {
    const result = await categoriesApi.createCategory(data);
    await fetchCategories();
    return result;
  }, [fetchCategories]);

  const update = useCallback(async (id, data) => {
    const result = await categoriesApi.updateCategory(id, data);
    await fetchCategories();
    return result;
  }, [fetchCategories]);

  return { categories, loading, error, create, update, refetch: fetchCategories };
}

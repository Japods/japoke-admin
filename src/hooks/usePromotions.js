import { useState, useEffect, useCallback } from 'react';
import * as promoApi from '../api/promotions';

export function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await promoApi.getPromotions();
      setPromotions(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (data) => {
    await promoApi.createPromotion(data);
    await fetch();
  }, [fetch]);

  const update = useCallback(async (id, data) => {
    await promoApi.updatePromotion(id, data);
    await fetch();
  }, [fetch]);

  const remove = useCallback(async (id) => {
    await promoApi.deletePromotion(id);
    await fetch();
  }, [fetch]);

  return { promotions, loading, error, create, update, remove, refetch: fetch };
}

export function useDiscountCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await promoApi.getDiscountCodes();
      setCodes(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (data) => {
    await promoApi.createDiscountCode(data);
    await fetch();
  }, [fetch]);

  const update = useCallback(async (id, data) => {
    await promoApi.updateDiscountCode(id, data);
    await fetch();
  }, [fetch]);

  const remove = useCallback(async (id) => {
    await promoApi.deleteDiscountCode(id);
    await fetch();
  }, [fetch]);

  return { codes, loading, error, create, update, remove, refetch: fetch };
}

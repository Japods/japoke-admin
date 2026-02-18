import { useState, useEffect, useRef, useCallback } from 'react';
import { getOrders, updateOrderStatus } from '../api/orders';
import { POLLING_INTERVAL } from '../utils/constants';

export function useOrders({ onNewOrder } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const knownIdsRef = useRef(new Set());
  const isFirstFetchRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      const list = data.orders || data.data || data || [];

      if (isFirstFetchRef.current) {
        knownIdsRef.current = new Set(list.map((o) => o._id));
        isFirstFetchRef.current = false;
      } else {
        const newOrders = list.filter((o) => !knownIdsRef.current.has(o._id));
        if (newOrders.length > 0 && onNewOrder) {
          onNewOrder(newOrders);
        }
        knownIdsRef.current = new Set(list.map((o) => o._id));
      }

      setOrders(list);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [onNewOrder]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advanceStatus = useCallback(async (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o)),
    );

    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: o.status } : o)),
      );
      await fetchOrders();
      throw err;
    }
  }, [fetchOrders]);

  const cancelOrder = useCallback(async (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o)),
    );

    try {
      await updateOrderStatus(orderId, 'cancelled');
    } catch (err) {
      await fetchOrders();
      throw err;
    }
  }, [fetchOrders]);

  return { orders, loading, error, advanceStatus, cancelOrder, refetch: fetchOrders };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { STATUS_CONFIG } from '../../utils/constants';
import { timeAgo, formatCurrency } from '../../utils/formatters';
import { getOrders } from '../../api/orders';

export default function OrderListView({ onAdvance, onCancel, onOrderClick, refreshKey = 0 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalCount: 0, totalPages: 1 });
  const prevRefreshKey = useRef(refreshKey);

  const fetchOrders = useCallback(async (p) => {
    setLoading(true);
    try {
      const data = await getOrders({ page: p, limit: 20 });
      setOrders(data.orders || []);
      setPagination(data.pagination || { totalCount: 0, totalPages: 1 });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when page changes
  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  // On refresh: reset to page 1 or re-fetch if already on page 1
  useEffect(() => {
    if (prevRefreshKey.current === refreshKey) return;
    prevRefreshKey.current = refreshKey;
    if (page === 1) {
      fetchOrders(1);
    } else {
      setPage(1);
    }
  }, [refreshKey, page, fetchOrders]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" className="text-naranja" />
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gris text-sm">No hay pedidos</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gris-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gris-border bg-gris-light/50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Pedido</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Cliente</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Bowls</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Total</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Estado</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Tiempo</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              return (
                <tr
                  key={order._id}
                  onClick={() => onOrderClick?.(order)}
                  className="border-b border-gris-border/50 hover:bg-gris-light/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-heading font-bold text-negro">#{order.orderNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-negro truncate max-w-[180px]">{order.customer?.name}</p>
                    <p className="text-xs text-gris truncate max-w-[180px]">{order.customer?.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-center text-gris">{order.items?.length || 0}</td>
                  <td className="py-3 px-4 text-right font-semibold text-naranja">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge status={order.status} />
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gris">
                    {timeAgo(order.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {config?.nextStatus && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={(e) => { e.stopPropagation(); onAdvance?.(order); }}
                        >
                          {config.nextLabel}
                        </Button>
                      )}
                      {config?.canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error hover:bg-error-light"
                          onClick={(e) => { e.stopPropagation(); onCancel?.(order); }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer: count + pagination */}
      <div className="px-4 py-3 border-t border-gris-border flex items-center justify-between">
        <p className="text-xs text-gris">
          {pagination.totalCount} pedidos · Página {page} de {pagination.totalPages}
        </p>
        {pagination.totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

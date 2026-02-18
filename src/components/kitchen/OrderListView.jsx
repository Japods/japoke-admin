import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { STATUS_CONFIG, DELIVERED_LIMIT } from '../../utils/constants';
import { timeAgo, formatCurrency } from '../../utils/formatters';

export default function OrderListView({ orders, onAdvance, onCancel, onOrderClick }) {
  const visibleOrders = orders.filter((o) => {
    if (o.status === 'delivered') {
      const deliveredOrders = orders.filter((x) => x.status === 'delivered');
      return deliveredOrders.indexOf(o) < DELIVERED_LIMIT;
    }
    return true;
  });

  if (visibleOrders.length === 0) {
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
            {visibleOrders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const bowlCount = order.items?.length || 0;

              return (
                <tr
                  key={order._id}
                  onClick={() => onOrderClick?.(order)}
                  className="border-b border-gris-border/50 hover:bg-gris-light/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-heading font-bold text-negro">
                      #{order.orderNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-negro truncate max-w-[180px]">
                        {order.customer?.name}
                      </p>
                      <p className="text-xs text-gris truncate max-w-[180px]">
                        {order.customer?.phone}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-gris">
                    {bowlCount}
                  </td>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvance?.(order);
                          }}
                        >
                          {config.nextLabel}
                        </Button>
                      )}
                      {config?.canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error hover:bg-error-light"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel?.(order);
                          }}
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
    </div>
  );
}

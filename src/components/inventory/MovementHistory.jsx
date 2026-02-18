import { timeAgo } from '../../utils/formatters';

const TYPE_LABELS = {
  purchase: 'Compra',
  order_usage: 'Uso en pedido',
  manual_adjustment: 'Ajuste manual',
  waste: 'Desperdicio',
};

const TYPE_COLORS = {
  purchase: 'bg-success-light text-success',
  order_usage: 'bg-info-light text-info',
  manual_adjustment: 'bg-warning-light text-warning',
  waste: 'bg-error-light text-error',
};

export default function MovementHistory({ movements, pagination, onPageChange }) {
  if (!movements || movements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gris">No hay movimientos registrados</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {movements.map((mov) => (
          <div
            key={mov._id}
            className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gris-light/30"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLORS[mov.type] || 'bg-gris-light text-gris'}`}
              >
                {TYPE_LABELS[mov.type] || mov.type}
              </span>
              <div>
                <span className="text-sm font-medium text-negro">
                  {mov.refId?.name || 'Item eliminado'}
                </span>
                {mov.order?.orderNumber && (
                  <span className="text-xs text-gris ml-1.5">({mov.order.orderNumber})</span>
                )}
                {mov.notes && (
                  <p className="text-[11px] text-gris mt-0.5">{mov.notes}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-sm font-semibold ${mov.quantity >= 0 ? 'text-success' : 'text-error'}`}>
                {mov.quantity >= 0 ? '+' : ''}{mov.quantity}
              </span>
              <p className="text-[10px] text-gris">{timeAgo(mov.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && onPageChange && (
        <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gris-border">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                pagination.page === i + 1
                  ? 'bg-naranja text-white'
                  : 'text-gris hover:bg-gris-light'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

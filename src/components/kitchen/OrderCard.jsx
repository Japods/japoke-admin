import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { STATUS_CONFIG } from '../../utils/constants';
import { timeAgo } from '../../utils/formatters';

export default function OrderCard({ order, onAdvance, onCancel, onClick, isDragging }) {
  const config = STATUS_CONFIG[order.status];
  const bowlCount = order.items?.length || 0;

  function handleDragStart(e) {
    e.dataTransfer.setData('application/json', JSON.stringify({
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
    }));
    e.dataTransfer.effectAllowed = 'move';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick?.(order)}
      className={`
        bg-white rounded-xl border-l-4 p-3 cursor-grab active:cursor-grabbing
        shadow-sm hover:shadow-md transition-all duration-200
        ${config?.borderColor || 'border-gris-border'}
        ${isDragging ? 'opacity-40 scale-95' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-heading font-bold text-sm text-negro">
            #{order.orderNumber}
          </span>
          <p className="text-xs text-gris mt-0.5 truncate max-w-[140px]">
            {order.customer?.name}
          </p>
        </div>
        <Badge status={order.status} />
      </div>

      <div className="flex items-center gap-2 mb-3 text-xs text-gris">
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(order.createdAt).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
          <span className="text-gris-border/60">·</span>
          {timeAgo(order.createdAt)}
        </span>
        <span className="text-gris-border">|</span>
        <span>{bowlCount} {bowlCount === 1 ? 'bowl' : 'bowls'}</span>
      </div>

      <div className="flex gap-2">
        {config?.nextStatus && (
          <Button
            size="sm"
            variant="primary"
            className="flex-1"
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
    </div>
  );
}

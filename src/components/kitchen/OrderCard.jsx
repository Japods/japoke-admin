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

      <div className="flex flex-col gap-1 mb-3">
        <div className="flex items-center gap-2 text-xs text-gris">
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
        {order.deliveryTime && (
          <div className="flex items-center gap-1 text-xs font-semibold text-naranja">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            Entrega: {order.deliveryTime}
          </div>
        )}
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

import { useState } from 'react';
import { STATUS_CONFIG, ORDER_STATUSES } from '../../utils/constants';
import OrderCard from './OrderCard';

export default function KanbanColumn({ status, orders, onAdvance, onCancel, onOrderClick, onDrop, draggingOrderId }) {
  const config = STATUS_CONFIG[status];
  const [dragOver, setDragOver] = useState(false);

  function isValidDrop(currentStatus) {
    const currentIdx = ORDER_STATUSES.indexOf(currentStatus);
    const targetIdx = ORDER_STATUSES.indexOf(status);
    return targetIdx === currentIdx + 1;
  }

  function handleDragOver(e) {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.types.includes('application/json');
      if (raw) {
        e.dataTransfer.dropEffect = 'move';
        setDragOver(true);
      }
    } catch {
      // ignore
    }
  }

  function handleDragLeave(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.currentStatus === status) return;
      if (!isValidDrop(data.currentStatus)) return;
      onDrop?.(data, status);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] shrink-0">
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-t-xl ${config.bgColor}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
        <h3 className={`font-heading font-bold text-sm ${config.color}`}>
          {config.label}
        </h3>
        <span
          className={`
            ml-auto min-w-[22px] h-[22px] flex items-center justify-center
            rounded-full text-xs font-bold ${config.color} bg-white/60
          `}
        >
          {orders.length}
        </span>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex-1 rounded-b-xl p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]
          transition-colors duration-200
          ${dragOver ? 'bg-naranja-light/60 ring-2 ring-naranja ring-inset' : 'bg-gris-light/50'}
        `}
      >
        {orders.length === 0 && (
          <p className="text-xs text-gris text-center py-8 italic">
            {dragOver ? 'Soltar aqui' : 'Sin pedidos'}
          </p>
        )}
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onAdvance={onAdvance}
            onCancel={onCancel}
            onClick={onOrderClick}
            isDragging={draggingOrderId === order._id}
          />
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ORDER_STATUSES, DELIVERED_LIMIT } from '../../utils/constants';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ orders, onAdvance, onCancel, onOrderClick, onDrop }) {
  const [draggingOrderId, setDraggingOrderId] = useState(null);

  const ordersByStatus = ORDER_STATUSES.reduce((acc, status) => {
    let filtered = orders.filter((o) => o.status === status);

    if (status === 'delivered') {
      filtered = filtered.slice(0, DELIVERED_LIMIT);
    }

    acc[status] = filtered;
    return acc;
  }, {});

  function handleDragStartCapture(e) {
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        setDraggingOrderId(JSON.parse(raw).orderId);
      }
    } catch {
      // Data not available during dragstart in some browsers, use target
    }
  }

  function handleDragEnd() {
    setDraggingOrderId(null);
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4 no-scrollbar h-full"
      onDragStartCapture={handleDragStartCapture}
      onDragEnd={handleDragEnd}
    >
      {ORDER_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          orders={ordersByStatus[status]}
          onAdvance={onAdvance}
          onCancel={onCancel}
          onOrderClick={onOrderClick}
          onDrop={onDrop}
          draggingOrderId={draggingOrderId}
        />
      ))}
    </div>
  );
}

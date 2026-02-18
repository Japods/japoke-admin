import { useEffect, useState } from 'react';

export default function NewOrderAlert({ newOrders = [], onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (newOrders.length > 0) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newOrders, onDismiss]);

  if (!visible || newOrders.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-slide-down">
      <div className="flex items-center gap-3 bg-naranja text-white px-5 py-3 rounded-xl shadow-lg">
        <span className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </span>
        <div>
          <p className="font-heading font-bold text-sm">
            {newOrders.length === 1 ? 'Nuevo pedido!' : `${newOrders.length} nuevos pedidos!`}
          </p>
          <p className="text-xs text-white/80">
            {newOrders.map((o) => `#${o.orderNumber}`).join(', ')}
          </p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          className="ml-2 p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getAlerts } from '../../api/inventory';

export default function StockAlerts() {
  const [alerts, setAlerts] = useState({ items: [], supplies: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getAlerts();
        setAlerts(res.data || { items: [], supplies: [] });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const allAlerts = [
    ...alerts.items.map((i) => ({
      name: i.name,
      stock: i.currentStock,
      unit: i.trackingUnit,
      min: i.minStock,
      type: 'item',
      portions: i.availablePortions,
    })),
    ...alerts.supplies.map((s) => ({
      name: s.name,
      stock: s.currentStock,
      unit: s.trackingUnit,
      min: s.minStock,
      type: 'supply',
      portions: null,
    })),
  ];

  if (loading || allAlerts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-error/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="font-heading font-semibold text-error">Alertas de Stock</h3>
      </div>
      <div className="space-y-2">
        {allAlerts.map((alert) => (
          <div
            key={`${alert.type}-${alert.name}`}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-error-light/50"
          >
            <div>
              <span className="text-sm font-medium text-negro">{alert.name}</span>
              <span className="text-[10px] ml-1.5 text-gris">
                ({alert.type === 'item' ? 'Ingrediente' : 'Insumo'})
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-error">
                {alert.stock} {alert.unit}
              </span>
              {alert.portions !== null && (
                <span className="text-[10px] text-gris ml-1">
                  ({alert.portions} porciones)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

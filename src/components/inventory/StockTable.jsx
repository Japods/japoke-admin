import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

const STATUS_STYLES = {
  ok: 'bg-success-light text-success',
  low: 'bg-warning-light text-warning',
  critical: 'bg-error-light text-error',
};

const STATUS_LABELS = {
  ok: 'OK',
  low: 'Bajo',
  critical: 'Critico',
};

export default function StockTable({ items, supplies, onAdjust }) {
  const allRows = [
    ...items.map((i) => ({ ...i, _type: 'Item', _label: i.category?.name || 'Item' })),
    ...supplies.map((s) => ({ ...s, _type: 'Supply', _label: 'Insumo' })),
  ];

  if (allRows.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gris">No hay items con tracking habilitado. Activa el tracking desde el Catalogo.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gris-light/50 border-b border-gris-border">
            <th className="text-left py-3 px-4 text-gris font-medium">Nombre</th>
            <th className="text-left py-3 px-4 text-gris font-medium">Tipo</th>
            <th className="text-right py-3 px-4 text-gris font-medium">Stock</th>
            <th className="text-right py-3 px-4 text-gris font-medium">Porciones</th>
            <th className="text-right py-3 px-4 text-gris font-medium">Min</th>
            <th className="text-right py-3 px-4 text-gris font-medium">Costo Unit.</th>
            <th className="text-center py-3 px-4 text-gris font-medium">Estado</th>
            <th className="text-center py-3 px-4 text-gris font-medium">Accion</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map((row) => (
            <tr key={`${row._type}-${row._id}`} className="border-b border-gris-border/50 last:border-0 hover:bg-gris-light/30">
              <td className="py-3 px-4 font-medium text-negro">{row.name}</td>
              <td className="py-3 px-4">
                <span className="text-xs text-gris bg-gris-light px-2 py-0.5 rounded-full">
                  {row._label}
                </span>
              </td>
              <td className="py-3 px-4 text-right font-semibold text-negro">
                {row.currentStock} {row.trackingUnit}
              </td>
              <td className="py-3 px-4 text-right text-gris">
                {row.availablePortions != null ? row.availablePortions : row._type === 'Supply' ? Math.floor(row.currentStock / (row.usagePerPoke || 1)) : '-'}
              </td>
              <td className="py-3 px-4 text-right text-gris">
                {row.minStock} {row.trackingUnit}
              </td>
              <td className="py-3 px-4 text-right text-gris">
                {formatCurrency(row.costPerUnit || row.unitCost || 0)}
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[row.status] || STATUS_STYLES.ok}`}>
                  {STATUS_LABELS[row.status] || 'OK'}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onAdjust(row._type, row)}
                  className="text-xs text-naranja hover:text-naranja/80 font-medium cursor-pointer"
                >
                  Ajustar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

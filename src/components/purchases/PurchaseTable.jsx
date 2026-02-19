import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

function formatBS(n) {
  return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function formatUSD(n) {
  return `$${Number(n).toFixed(2)}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function PurchaseTable({ purchases, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-naranja" />
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gris text-sm">No hay compras registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gris-border">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Fecha</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Proveedor</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Factura</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Total BS</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Tasa BCV</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Tasa USDT</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">USD (BCV)</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">USDT</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gris uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p._id} className="border-b border-gris-border/50 hover:bg-gris-light/40 transition-colors">
              <td className="py-3 px-4 text-gris whitespace-nowrap">{formatDate(p.date)}</td>
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium text-negro">{p.supplier}</p>
                  {p.description && (
                    <p className="text-xs text-gris truncate max-w-[180px]">{p.description}</p>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-xs text-gris font-mono">
                {p.invoiceNumber || '—'}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-negro whitespace-nowrap">
                Bs. {formatBS(p.totalBS)}
              </td>
              <td className="py-3 px-4 text-right text-xs text-gris whitespace-nowrap">
                Bs. {formatBS(p.bcvRate)}
              </td>
              <td className="py-3 px-4 text-right text-xs text-gris whitespace-nowrap">
                Bs. {formatBS(p.usdtRate)}
              </td>
              <td className="py-3 px-4 text-right font-medium text-dorado whitespace-nowrap">
                {formatUSD(p.totalUSD)}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-naranja whitespace-nowrap">
                {formatUSD(p.totalUSDT)} USDT
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(p)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-error hover:bg-error-light"
                    onClick={() => onDelete(p)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

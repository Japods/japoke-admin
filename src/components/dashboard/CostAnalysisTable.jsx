import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

function MarginIndicator({ percent }) {
  const color =
    percent >= 60
      ? 'text-success'
      : percent >= 45
        ? 'text-dorado'
        : percent >= 30
          ? 'text-warning'
          : 'text-error';

  const bgColor =
    percent >= 60
      ? 'bg-success'
      : percent >= 45
        ? 'bg-dorado'
        : percent >= 30
          ? 'bg-warning'
          : 'bg-error';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gris-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bgColor} transition-all duration-500`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums ${color}`}>{percent}%</span>
    </div>
  );
}

export default function CostAnalysisTable({ data }) {
  const [expandedType, setExpandedType] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gris-border p-6">
        <h3 className="font-heading font-semibold text-negro mb-4">Análisis de Costos</h3>
        <p className="text-sm text-gris text-center py-4">Sin datos aún</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gris-border p-6">
      <h3 className="font-heading font-semibold text-negro mb-5">Análisis de Costos</h3>

      <div className="space-y-4">
        {data.map((row) => {
          const isExpanded = expandedType === row._id;
          const hasProteins = row.byProtein && row.byProtein.length > 0;

          return (
            <div
              key={row._id}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded ? 'ring-2 ring-naranja/15 border-naranja/30' : 'border-gris-border'
              }`}
            >
              {/* Menu type header */}
              <div
                className={`p-4 ${hasProteins ? 'cursor-pointer' : ''}`}
                onClick={() => hasProteins && setExpandedType(isExpanded ? null : row._id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-negro">{row.name}</span>
                    {hasProteins && (
                      <span className="text-[10px] text-gris bg-gris-light px-1.5 py-0.5 rounded">
                        promedio
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MarginIndicator percent={row.marginPercent} />
                    {hasProteins && (
                      <svg
                        className={`w-4 h-4 text-gris transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gris-light/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-gris">Venta</p>
                    <p className="text-sm font-bold text-negro">{formatCurrency(row.salePrice)}</p>
                  </div>
                  <div className="bg-error/5 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-gris">Costo</p>
                    <p className="text-sm font-bold text-error/80">{formatCurrency(row.totalCost)}</p>
                  </div>
                  <div className="bg-success/5 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-gris">Margen</p>
                    <p className="text-sm font-bold text-success">{formatCurrency(row.margin)}</p>
                  </div>
                </div>
              </div>

              {/* Protein breakdown */}
              {isExpanded && hasProteins && (
                <div className="border-t border-gris-border/50 px-4 pb-4 pt-3">
                  <p className="text-[10px] text-gris uppercase tracking-wider mb-3">
                    Desglose por proteína
                  </p>
                  <div className="space-y-2">
                    {row.byProtein.map((p) => (
                      <div
                        key={p.proteinId}
                        className="flex items-center gap-3 bg-gris-light/30 rounded-lg px-3 py-2.5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-negro">{p.proteinName}</p>
                          <p className="text-[10px] text-gris">
                            Proteína: {formatCurrency(p.proteinCost)} · Costo total: {formatCurrency(p.totalCost)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-success">{formatCurrency(p.margin)}</p>
                          <MarginIndicator percent={p.marginPercent} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

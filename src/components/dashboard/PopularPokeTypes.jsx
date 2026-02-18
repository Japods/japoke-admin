import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

const TYPE_COLORS = {
  0: { bg: 'bg-naranja/10', text: 'text-naranja', ring: 'ring-naranja/20', dot: 'bg-naranja' },
  1: { bg: 'bg-dorado/10', text: 'text-dorado', ring: 'ring-dorado/20', dot: 'bg-dorado' },
  2: { bg: 'bg-info/10', text: 'text-info', ring: 'ring-info/20', dot: 'bg-info' },
  3: { bg: 'bg-success/10', text: 'text-success', ring: 'ring-success/20', dot: 'bg-success' },
};

function getColor(index) {
  return TYPE_COLORS[index % Object.keys(TYPE_COLORS).length];
}

export default function PopularPokeTypes({ data }) {
  const [expanded, setExpanded] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gris-border p-6">
        <h3 className="font-heading font-semibold text-negro mb-4">Pokes Más Vendidos</h3>
        <p className="text-sm text-gris text-center py-4">Sin datos aún</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gris-border p-6">
      <h3 className="font-heading font-semibold text-negro mb-5">Pokes Más Vendidos</h3>

      {/* Type cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          const color = getColor(idx);
          const isExpanded = expanded === item.name;
          const hasProteins = item.byProtein && item.byProtein.length > 0;

          return (
            <div
              key={item.name}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded ? `ring-2 ${color.ring} border-transparent` : 'border-gris-border'
              }`}
            >
              {/* Card header */}
              <div
                className={`p-4 ${hasProteins ? 'cursor-pointer' : ''}`}
                onClick={() => hasProteins && setExpanded(isExpanded ? null : item.name)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.text} flex items-center justify-center font-heading font-bold text-lg`}>
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-negro text-sm">{item.name}</p>
                      <p className="text-xs text-gris">{pct}% del total</p>
                    </div>
                  </div>
                  {hasProteins && (
                    <svg
                      className={`w-4 h-4 text-gris transition-transform duration-200 mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] text-gris uppercase tracking-wider">Bowls</p>
                    <p className="text-xl font-heading font-bold text-negro">{item.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gris uppercase tracking-wider">Ingresos</p>
                    <p className={`text-xl font-heading font-bold ${color.text}`}>
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Expanded: Protein breakdown */}
              {isExpanded && hasProteins && (
                <div className="px-4 pb-4 pt-1 border-t border-gris-border/50">
                  <p className="text-[10px] text-gris uppercase tracking-wider mb-2">
                    Proteínas elegidas
                  </p>
                  <div className="space-y-2">
                    {item.byProtein.map((p, pIdx) => {
                      const protPct = item.count > 0 ? Math.round((p.count / item.count) * 100) : 0;
                      return (
                        <div key={p.name || pIdx} className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`} />
                          <span className="text-sm text-negro flex-1">{p.name}</span>
                          <span className="text-xs font-medium text-negro tabular-nums">
                            {p.count}x
                          </span>
                          <span className={`text-xs font-bold ${color.text} tabular-nums w-10 text-right`}>
                            {protPct}%
                          </span>
                        </div>
                      );
                    })}
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

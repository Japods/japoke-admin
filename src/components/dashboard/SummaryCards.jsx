import { formatCurrency } from '../../utils/formatters';

function formatUsd(amount) {
  return '$' + Number(amount).toFixed(2);
}

function getUsdEquivalent(eurAmount, rates) {
  if (!rates?.dolar_paralelo?.rate || !rates?.euro_bcv?.rate || !eurAmount) return null;
  const bs = eurAmount * rates.euro_bcv.rate;
  const usd = bs / rates.dolar_paralelo.rate;
  return `~${formatUsd(usd)} USD`;
}

export default function SummaryCards({ summary, exchangeRates }) {
  const p = summary.period || {};

  const cards = [
    {
      key: 'revenue',
      label: 'Ingresos del periodo',
      value: formatCurrency(p.revenue || 0),
      subValue: getUsdEquivalent(p.revenue, exchangeRates),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-success',
      bg: 'bg-success-light',
    },
    {
      key: 'orders',
      label: 'Pedidos',
      value: p.orders || 0,
      subValue: p.delivered ? `${p.delivered} entregados` : null,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'text-naranja',
      bg: 'bg-naranja-light',
    },
    {
      key: 'bowls',
      label: 'Bowls vendidos',
      value: p.bowls || 0,
      subValue: null,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'text-info',
      bg: 'bg-info-light',
    },
    {
      key: 'avgTicket',
      label: 'Ticket Promedio',
      value: formatCurrency(p.avgTicket || 0),
      subValue: getUsdEquivalent(p.avgTicket, exchangeRates),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-dorado',
      bg: 'bg-dorado/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-xl border border-gris-border p-4 flex items-start gap-3"
        >
          <div className={`${card.bg} ${card.color} p-2.5 rounded-xl shrink-0`}>
            {card.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gris font-medium truncate">{card.label}</p>
            <p className="text-lg font-heading font-bold text-negro mt-0.5">
              {card.value}
            </p>
            {card.subValue && (
              <p className="text-[10px] text-gris mt-0.5">{card.subValue}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const RATE_CONFIG = [
  { key: 'dolar_bcv', label: 'USD BCV', color: 'text-success', bg: 'bg-success/5' },
  { key: 'euro_bcv', label: 'EUR BCV', color: 'text-info', bg: 'bg-info/5' },
  { key: 'dolar_paralelo', label: 'Paralelo', color: 'text-naranja', bg: 'bg-naranja/5' },
];

export default function ExchangeRateWidget({ rates }) {
  if (!rates) return null;

  return (
    <div className="bg-white rounded-xl border border-gris-border p-3">
      <div className="grid grid-cols-3 gap-2">
        {RATE_CONFIG.map(({ key, label, color, bg }) => {
          const data = rates[key];
          if (!data) return null;

          const timeStr = data.fetchedAt
            ? new Date(data.fetchedAt).toLocaleTimeString('es-VE', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          return (
            <div
              key={key}
              className={`${bg} rounded-lg px-3 py-2.5 text-center`}
            >
              <p className="text-[10px] text-gris font-medium mb-0.5">{label}</p>
              <p className={`text-sm font-bold ${color}`}>
                {data.rate?.toFixed(2)} Bs
              </p>
              {timeStr && (
                <p className="text-[9px] text-gris mt-0.5">{timeStr}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

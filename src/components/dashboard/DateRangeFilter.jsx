import { useState } from 'react';

const PRESETS = [
  { id: 'today', label: 'Hoy', getDates: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: start.toISOString(), to: now.toISOString() };
  }},
  { id: 'week', label: '7 días', getDates: () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { from: start.toISOString(), to: now.toISOString() };
  }},
  { id: 'month', label: '30 días', getDates: () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { from: start.toISOString(), to: now.toISOString() };
  }},
  { id: '90days', label: '90 días', getDates: () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 90);
    return { from: start.toISOString(), to: now.toISOString() };
  }},
];

function formatRange(selected, customFrom, customTo) {
  if (selected === 'custom' && customFrom && customTo) {
    const f = new Date(customFrom).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
    const t = new Date(customTo).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
    return `${f} — ${t}`;
  }
  const preset = PRESETS.find((p) => p.id === selected);
  if (!preset) return '';
  const dates = preset.getDates();
  const f = new Date(dates.from).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
  const t = new Date(dates.to).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
  return `${f} — ${t}`;
}

export default function DateRangeFilter({ selected, onSelect }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  function handlePreset(preset) {
    setShowCustom(false);
    onSelect({ id: preset.id, ...preset.getDates() });
  }

  function handleCustom() {
    if (customFrom && customTo) {
      onSelect({
        id: 'custom',
        from: new Date(customFrom).toISOString(),
        to: new Date(customTo + 'T23:59:59').toISOString(),
      });
      setShowCustom(false);
    }
  }

  const rangeLabel = formatRange(selected, customFrom, customTo);

  return (
    <div className="bg-white rounded-xl border border-gris-border p-3 flex flex-col justify-center h-full">
      {/* Header with icon and date range */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-naranja" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className="text-xs font-semibold text-negro">Periodo</span>
        </div>
        {rangeLabel && (
          <span className="text-[10px] text-gris font-medium">{rangeLabel}</span>
        )}
      </div>

      {/* Segmented control */}
      <div className="flex bg-gris-light/60 rounded-lg p-0.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset)}
            className={`
              flex-1 py-2 rounded-md text-xs font-semibold text-center transition-all duration-200 cursor-pointer
              ${selected === preset.id
                ? 'bg-white text-naranja shadow-sm'
                : 'text-gris hover:text-negro'
              }
            `}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`
            flex-1 py-2 rounded-md text-xs font-semibold text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-1
            ${selected === 'custom'
              ? 'bg-white text-naranja shadow-sm'
              : 'text-gris hover:text-negro'
            }
          `}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Rango
        </button>
      </div>

      {/* Custom range picker */}
      {showCustom && (
        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gris-border/50">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs border border-gris-border rounded-lg bg-gris-light/30 focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja focus:bg-white transition-colors"
          />
          <svg className="w-3 h-3 text-gris shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs border border-gris-border rounded-lg bg-gris-light/30 focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja focus:bg-white transition-colors"
          />
          <button
            onClick={handleCustom}
            disabled={!customFrom || !customTo}
            className="px-4 py-1.5 bg-naranja text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-naranja-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}

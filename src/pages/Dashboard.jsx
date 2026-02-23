import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import Spinner from '../components/ui/Spinner';
import DateRangeFilter from '../components/dashboard/DateRangeFilter';
import ExchangeRateWidget from '../components/dashboard/ExchangeRateWidget';
import SummaryCards from '../components/dashboard/SummaryCards';
import StockAlerts from '../components/dashboard/StockAlerts';
import SalesChart from '../components/dashboard/SalesChart';
import PopularPokeTypes from '../components/dashboard/PopularPokeTypes';
import CostAnalysisTable from '../components/dashboard/CostAnalysisTable';
import WalletQuickView from '../components/dashboard/WalletQuickView';
import { getStoreStatus, setStoreStatus } from '../api/settings';

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  return {
    id: '30days',
    from: start.toISOString(),
    to: now.toISOString(),
  };
}

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState(getDefaultDateRange);
  const [isOpen, setIsOpen] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    getStoreStatus().then((d) => setIsOpen(d.isOpen)).catch(() => setIsOpen(false));
  }, []);

  async function handleToggle() {
    setToggling(true);
    try {
      const result = await setStoreStatus(!isOpen);
      setIsOpen(result.isOpen);
    } finally {
      setToggling(false);
    }
  }

  const dateRange = useMemo(() => ({
    from: dateFilter.from,
    to: dateFilter.to,
  }), [dateFilter.from, dateFilter.to]);

  const {
    summary,
    sales,
    popularPokeTypes,
    costAnalysis,
    exchangeRates,
    loading,
    error,
  } = useDashboard(dateRange);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-naranja" />
          <p className="text-sm text-gris">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-error font-medium mb-1">Error al cargar dashboard</p>
          <p className="text-sm text-gris">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Store open/closed toggle */}
      {isOpen !== null && (
        <div className={`rounded-xl border-2 px-5 py-4 flex items-center justify-between gap-4 ${
          isOpen ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shrink-0 ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <div>
              <p className="font-heading font-bold text-negro">
                Tienda {isOpen ? 'ABIERTA' : 'CERRADA'}
              </p>
              <p className="text-xs text-gris">
                {isOpen
                  ? 'Los clientes pueden hacer pedidos normalmente'
                  : 'Los clientes ven la pantalla de cerrado · No se aceptan pedidos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`shrink-0 px-5 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 ${
              isOpen
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {toggling ? '...' : isOpen ? 'Cerrar tienda' : 'Abrir tienda'}
          </button>
        </div>
      )}

      {/* Top bar: Date filter + Exchange rates in balanced grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DateRangeFilter selected={dateFilter.id} onSelect={setDateFilter} />
        <ExchangeRateWidget rates={exchangeRates} />
      </div>

      {/* Summary Cards */}
      {summary && <SummaryCards summary={summary} exchangeRates={exchangeRates} />}

      {/* Wallet Quick View + Stock Alerts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WalletQuickView />
        {summary && summary.alertCount > 0 && <StockAlerts />}
      </div>

      {/* Sales Chart - full width */}
      <SalesChart sales={sales} />

      {/* Popular Poke Types */}
      <PopularPokeTypes data={popularPokeTypes} />

      {/* Cost Analysis - full width */}
      <CostAnalysisTable data={costAnalysis} />
    </div>
  );
}

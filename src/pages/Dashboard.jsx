import { useState, useMemo } from 'react';
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

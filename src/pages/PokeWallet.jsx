import { useState, useEffect, useCallback } from 'react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import {
  getProtectionSummary,
  createProtection,
  getProtectionHistory,
  createWalletTransaction,
  getWalletTransactions,
} from '../api/protection';

function formatBs(amount) {
  return (
    Number(amount).toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' Bs'
  );
}

function formatUsd(amount) {
  return '$' + Number(amount).toFixed(2);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DESTINATION_LABELS = {
  usdt: 'Binance USDT',
  efectivo_usd: 'Efectivo USD',
};

const RECORD_TYPE_BADGE = {
  protection: { label: 'Protección', color: 'bg-blue-50 text-blue-700' },
  capital_injection: { label: 'Capital', color: 'bg-green-50 text-green-700' },
  bs_expense: { label: 'Gasto Bs', color: 'bg-red-50 text-red-700' },
  usd_expense: { label: 'Gasto USD', color: 'bg-orange-50 text-orange-700' },
};

// today as YYYY-MM-DD for date inputs
function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function PokeWallet() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Protection form
  const [showProtectionForm, setShowProtectionForm] = useState(false);
  const [protectionForm, setProtectionForm] = useState({
    amountBs: '',
    rate: '',
    destination: 'usdt',
    notes: '',
  });
  const [protectionSubmitting, setProtectionSubmitting] = useState(false);
  const [protectionError, setProtectionError] = useState('');

  // Capital injection form
  const [showCapitalForm, setShowCapitalForm] = useState(false);
  const [capitalForm, setCapitalForm] = useState({
    wallet: 'usdt',
    amountUsd: '',
    description: '',
    date: todayStr(),
  });
  const [capitalSubmitting, setCapitalSubmitting] = useState(false);
  const [capitalError, setCapitalError] = useState('');

  // Bs expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amountBs: '',
    description: '',
    date: todayStr(),
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  // USD expense form
  const [showUsdExpenseForm, setShowUsdExpenseForm] = useState(false);
  const [usdExpenseForm, setUsdExpenseForm] = useState({
    wallet: 'usdt',
    amountUsd: '',
    description: '',
    date: todayStr(),
  });
  const [usdExpenseSubmitting, setUsdExpenseSubmitting] = useState(false);
  const [usdExpenseError, setUsdExpenseError] = useState('');

  const fetchData = useCallback(async (page = 1) => {
    try {
      const [summaryRes, historyRes, txRes] = await Promise.all([
        getProtectionSummary(),
        getProtectionHistory({ page, limit: 15 }),
        getWalletTransactions({ page, limit: 15 }),
      ]);
      setSummary(summaryRes.data);

      // Merge and sort both histories by date descending
      const protectionRecords = (historyRes.records || []).map((r) => ({
        ...r,
        _recordType: 'protection',
        _sortDate: r.protectedAt,
      }));
      const txRecords = (txRes.records || []).map((r) => ({
        ...r,
        _recordType: r.type,
        _sortDate: r.date,
      }));
      const combined = [...protectionRecords, ...txRecords].sort(
        (a, b) => new Date(b._sortDate) - new Date(a._sortDate)
      );

      setHistory(combined);
      setHistoryMeta({
        total: (historyRes.total || 0) + (txRes.total || 0),
        page,
        totalPages: Math.max(historyRes.totalPages || 1, txRes.totalPages || 1),
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openProtectionForm() {
    setProtectionForm({
      amountBs: summary?.unprotectedBs?.toFixed(2) || '',
      rate: summary?.currentRate?.toFixed(2) || '',
      destination: 'usdt',
      notes: '',
    });
    setProtectionError('');
    setShowProtectionForm(true);
    setShowCapitalForm(false);
    setShowExpenseForm(false);
    setShowUsdExpenseForm(false);
  }

  function openCapitalForm() {
    setCapitalForm({ wallet: 'usdt', amountUsd: '', description: '', date: todayStr() });
    setCapitalError('');
    setShowCapitalForm(true);
    setShowProtectionForm(false);
    setShowExpenseForm(false);
    setShowUsdExpenseForm(false);
  }

  function openExpenseForm() {
    setExpenseForm({ amountBs: '', description: '', date: todayStr() });
    setExpenseError('');
    setShowExpenseForm(true);
    setShowProtectionForm(false);
    setShowCapitalForm(false);
    setShowUsdExpenseForm(false);
  }

  function openUsdExpenseForm() {
    setUsdExpenseForm({ wallet: 'usdt', amountUsd: '', description: '', date: todayStr() });
    setUsdExpenseError('');
    setShowUsdExpenseForm(true);
    setShowProtectionForm(false);
    setShowCapitalForm(false);
    setShowExpenseForm(false);
  }

  async function handleProtectionSubmit(e) {
    e.preventDefault();
    setProtectionSubmitting(true);
    setProtectionError('');
    try {
      await createProtection({
        amountBs: Number(protectionForm.amountBs),
        rateDolarParalelo: Number(protectionForm.rate),
        destination: protectionForm.destination,
        notes: protectionForm.notes,
      });
      setShowProtectionForm(false);
      setLoading(true);
      await fetchData();
    } catch (err) {
      setProtectionError(err.message || 'Error al proteger');
    } finally {
      setProtectionSubmitting(false);
    }
  }

  async function handleCapitalSubmit(e) {
    e.preventDefault();
    setCapitalSubmitting(true);
    setCapitalError('');
    try {
      await createWalletTransaction({
        type: 'capital_injection',
        wallet: capitalForm.wallet,
        amountUsd: Number(capitalForm.amountUsd),
        description: capitalForm.description,
        date: capitalForm.date,
      });
      setShowCapitalForm(false);
      setLoading(true);
      await fetchData();
    } catch (err) {
      setCapitalError(err.message || 'Error al registrar capital');
    } finally {
      setCapitalSubmitting(false);
    }
  }

  async function handleExpenseSubmit(e) {
    e.preventDefault();
    setExpenseSubmitting(true);
    setExpenseError('');
    try {
      await createWalletTransaction({
        type: 'bs_expense',
        amountBs: Number(expenseForm.amountBs),
        description: expenseForm.description,
        date: expenseForm.date,
      });
      setShowExpenseForm(false);
      setLoading(true);
      await fetchData();
    } catch (err) {
      setExpenseError(err.message || 'Error al registrar gasto');
    } finally {
      setExpenseSubmitting(false);
    }
  }

  async function handleUsdExpenseSubmit(e) {
    e.preventDefault();
    setUsdExpenseSubmitting(true);
    setUsdExpenseError('');
    try {
      await createWalletTransaction({
        type: 'usd_expense',
        wallet: usdExpenseForm.wallet,
        amountUsd: Number(usdExpenseForm.amountUsd),
        description: usdExpenseForm.description,
        date: usdExpenseForm.date,
      });
      setShowUsdExpenseForm(false);
      setLoading(true);
      await fetchData();
    } catch (err) {
      setUsdExpenseError(err.message || 'Error al registrar gasto');
    } finally {
      setUsdExpenseSubmitting(false);
    }
  }

  const protectionResultUsd =
    protectionForm.amountBs && protectionForm.rate && Number(protectionForm.rate) > 0
      ? Number(protectionForm.amountBs) / Number(protectionForm.rate)
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-naranja" />
          <p className="text-sm text-gris">Cargando PokeWallet...</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const hasUnprotected = summary.unprotectedBs > 0.01;
  const totalWallet =
    (summary.wallets?.usdt?.total || 0) + (summary.wallets?.efectivo?.total || 0);

  const filteredHistory = selectedWallet
    ? history.filter((record) => {
        if (record._recordType === 'protection') return record.destination === selectedWallet;
        if (record._recordType === 'capital_injection') return record.wallet === selectedWallet;
        if (record._recordType === 'usd_expense') return record.wallet === selectedWallet;
        return false;
      })
    : history;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-negro">PokeWallet</h1>
          <p className="text-sm text-gris mt-1">
            Gestiona tus bolívares y protege tu capital
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={openCapitalForm}>
            Agregar capital
          </Button>
          <Button variant="outline" onClick={openExpenseForm}>
            Gasto Bs
          </Button>
          <Button variant="outline" onClick={openUsdExpenseForm}>
            Gasto USD
          </Button>
          {hasUnprotected && (
            <Button onClick={openProtectionForm}>
              Proteger Bs
            </Button>
          )}
        </div>
      </div>

      {/* Main balance card */}
      <div className="bg-gradient-to-br from-naranja to-naranja-dark rounded-2xl p-6 text-white">
        <p className="text-sm opacity-80 mb-1">Saldo total</p>
        <p className="text-4xl font-heading font-bold">
          {formatUsd(totalWallet)}
        </p>
        <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xs opacity-70">Protecciones</p>
            <p className="text-lg font-bold">{summary.protected.protectionCount}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Bs protegidos</p>
            <p className="text-lg font-bold">{formatBs(summary.protected.totalBs)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Tasa actual</p>
            <p className="text-lg font-bold">{summary.currentRate?.toFixed(2)} Bs/$</p>
          </div>
        </div>
      </div>

      {/* Wallets grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Unprotected Bs */}
        <div className={`rounded-xl border-2 p-5 ${hasUnprotected ? 'border-warning bg-warning/5' : 'border-success/30 bg-success/5'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg ${hasUnprotected ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-negro">Bs sin proteger</p>
          </div>
          <p className={`text-2xl font-bold ${hasUnprotected ? 'text-warning' : 'text-success'}`}>
            {formatBs(summary.unprotectedBs)}
          </p>
          {hasUnprotected && summary.currentRate > 0 && (
            <p className="text-xs text-gris mt-1">~{formatUsd(summary.potentialUsd)} al paralelo actual</p>
          )}
          {!hasUnprotected && (
            <p className="text-xs text-success mt-1 font-medium">Todo protegido</p>
          )}
          <p className="text-[10px] text-gris mt-2">
            {summary.received.orderCount} pagos · {formatBs(summary.received.totalBs)} recibidos
          </p>
          {summary.bsExpenses?.totalBs > 0 && (
            <p className="text-[10px] text-error mt-0.5">
              Gastado: {formatBs(summary.bsExpenses.totalBs)} ({summary.bsExpenses.count} gastos)
            </p>
          )}
        </div>

        {/* USDT Wallet */}
        <button
          type="button"
          onClick={() => setSelectedWallet(selectedWallet === 'usdt' ? null : 'usdt')}
          className={`rounded-xl border-2 bg-white p-5 text-left transition-all cursor-pointer w-full ${
            selectedWallet === 'usdt'
              ? 'border-blue-500 shadow-md shadow-blue-100'
              : 'border-gris-border hover:border-blue-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.893 13.393l-1.135-1.135a2.252 2.252 0 01-.421-.585l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 01-1.383-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.411-2.353a2.25 2.25 0 00.286-.76m11.928 9.869A9 9 0 008.965 3.525m11.928 9.868A9 9 0 118.965 3.525" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-negro">Binance USDT</p>
            {selectedWallet === 'usdt' && (
              <span className="ml-auto text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Filtrado</span>
            )}
          </div>
          <p className="text-2xl font-bold text-negro">
            {formatUsd(summary.wallets?.usdt?.total || 0)}
          </p>
          <div className="mt-2 space-y-0.5 text-[11px] text-gris">
            <p>Protecciones: {formatUsd(summary.wallets?.usdt?.fromProtection || 0)} ({summary.wallets?.usdt?.protectionCount || 0})</p>
            <p>Pagos directos: {formatUsd(summary.wallets?.usdt?.fromOrders || 0)} ({summary.wallets?.usdt?.orderCount || 0})</p>
            {(summary.wallets?.usdt?.fromInjections || 0) > 0 && (
              <p className="text-green-600 font-medium">Capital inyectado: {formatUsd(summary.wallets.usdt.fromInjections)}</p>
            )}
            {(summary.wallets?.usdt?.expenses || 0) > 0 && (
              <p className="text-orange-600 font-medium">Gastos USD: -{formatUsd(summary.wallets.usdt.expenses)}</p>
            )}
          </div>
        </button>

        {/* Efectivo USD Wallet */}
        <button
          type="button"
          onClick={() => setSelectedWallet(selectedWallet === 'efectivo_usd' ? null : 'efectivo_usd')}
          className={`rounded-xl border-2 bg-white p-5 text-left transition-all cursor-pointer w-full ${
            selectedWallet === 'efectivo_usd'
              ? 'border-green-500 shadow-md shadow-green-100'
              : 'border-gris-border hover:border-green-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-50 text-green-600 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-negro">Efectivo USD</p>
            {selectedWallet === 'efectivo_usd' && (
              <span className="ml-auto text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Filtrado</span>
            )}
          </div>
          <p className="text-2xl font-bold text-negro">
            {formatUsd(summary.wallets?.efectivo?.total || 0)}
          </p>
          <div className="mt-2 space-y-0.5 text-[11px] text-gris">
            <p>Protecciones: {formatUsd(summary.wallets?.efectivo?.fromProtection || 0)} ({summary.wallets?.efectivo?.protectionCount || 0})</p>
            <p>Pagos directos: {formatUsd(summary.wallets?.efectivo?.fromOrders || 0)} ({summary.wallets?.efectivo?.orderCount || 0})</p>
            {(summary.wallets?.efectivo?.fromInjections || 0) > 0 && (
              <p className="text-green-600 font-medium">Capital inyectado: {formatUsd(summary.wallets.efectivo.fromInjections)}</p>
            )}
            {(summary.wallets?.efectivo?.expenses || 0) > 0 && (
              <p className="text-orange-600 font-medium">Gastos USD: -{formatUsd(summary.wallets.efectivo.expenses)}</p>
            )}
          </div>
        </button>
      </div>

      {/* Protection form */}
      {showProtectionForm && (
        <div className="bg-white rounded-xl border border-gris-border p-6">
          <h3 className="font-heading font-bold text-negro mb-4">Registrar protección</h3>
          <form onSubmit={handleProtectionSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">
                  Monto en Bs
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={protectionForm.amountBs}
                  onChange={(e) => setProtectionForm({ ...protectionForm, amountBs: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">
                  Tasa Dólar Paralelo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={protectionForm.rate}
                  onChange={(e) => setProtectionForm({ ...protectionForm, rate: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gris font-medium block mb-1.5">Destino</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProtectionForm({ ...protectionForm, destination: 'usdt' })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    protectionForm.destination === 'usdt'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gris-border text-gris hover:border-gris'
                  }`}
                >
                  Binance USDT
                </button>
                <button
                  type="button"
                  onClick={() => setProtectionForm({ ...protectionForm, destination: 'efectivo_usd' })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    protectionForm.destination === 'efectivo_usd'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gris-border text-gris hover:border-gris'
                  }`}
                >
                  Efectivo USD
                </button>
              </div>
            </div>

            {protectionResultUsd > 0 && (
              <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
                <p className="text-xs text-gris">Obtienes</p>
                <p className="text-2xl font-bold text-success">{formatUsd(protectionResultUsd)}</p>
                <p className="text-[10px] text-gris mt-1">
                  en {protectionForm.destination === 'usdt' ? 'Binance USDT' : 'Efectivo USD'}
                </p>
              </div>
            )}

            <div>
              <label className="text-xs text-gris font-medium block mb-1.5">
                Nota (opcional)
              </label>
              <input
                type="text"
                value={protectionForm.notes}
                onChange={(e) => setProtectionForm({ ...protectionForm, notes: e.target.value })}
                className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="Ej: Compra Binance P2P, Zelle enviado, etc."
              />
            </div>

            {protectionError && <p className="text-sm text-error font-medium">{protectionError}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" loading={protectionSubmitting}>
                Confirmar protección
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowProtectionForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Capital injection form */}
      {showCapitalForm && (
        <div className="bg-white rounded-xl border border-gris-border p-6">
          <h3 className="font-heading font-bold text-negro mb-4">Agregar capital</h3>
          <form onSubmit={handleCapitalSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gris font-medium block mb-1.5">Wallet destino</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCapitalForm({ ...capitalForm, wallet: 'usdt' })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    capitalForm.wallet === 'usdt'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gris-border text-gris hover:border-gris'
                  }`}
                >
                  Binance USDT
                </button>
                <button
                  type="button"
                  onClick={() => setCapitalForm({ ...capitalForm, wallet: 'efectivo_usd' })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    capitalForm.wallet === 'efectivo_usd'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gris-border text-gris hover:border-gris'
                  }`}
                >
                  Efectivo USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">Monto USD</label>
                <input
                  type="number"
                  step="0.01"
                  value={capitalForm.amountUsd}
                  onChange={(e) => setCapitalForm({ ...capitalForm, amountUsd: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={capitalForm.date}
                  onChange={(e) => setCapitalForm({ ...capitalForm, date: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gris font-medium block mb-1.5">Descripción</label>
              <input
                type="text"
                value={capitalForm.description}
                onChange={(e) => setCapitalForm({ ...capitalForm, description: e.target.value })}
                className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="Ej: Capital inicial, Transferencia bancaria, etc."
                required
              />
            </div>

            {capitalError && <p className="text-sm text-error font-medium">{capitalError}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" loading={capitalSubmitting}>
                Registrar capital
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCapitalForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Bs expense form */}
      {showExpenseForm && (
        <div className="bg-white rounded-xl border border-gris-border p-6">
          <h3 className="font-heading font-bold text-negro mb-4">Registrar gasto en Bs</h3>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">Monto Bs</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenseForm.amountBs}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amountBs: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gris font-medium block mb-1.5">Descripción</label>
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="Ej: Pago proveedor, Servicios, etc."
                required
              />
            </div>

            {expenseError && <p className="text-sm text-error font-medium">{expenseError}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" loading={expenseSubmitting}>
                Registrar gasto
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowExpenseForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* USD expense form */}
      {showUsdExpenseForm && (
        <div className="bg-white rounded-xl border border-gris-border p-6">
          <h3 className="font-heading font-bold text-negro mb-4">Registrar gasto en USD</h3>
          <form onSubmit={handleUsdExpenseSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gris font-medium block mb-1.5">Wallet origen</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUsdExpenseForm({ ...usdExpenseForm, wallet: 'usdt' })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    usdExpenseForm.wallet === 'usdt'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gris-border text-gris hover:border-gris'
                  }`}
                >
                  Binance USDT
                </button>
                <button
                  type="button"
                  onClick={() => setUsdExpenseForm({ ...usdExpenseForm, wallet: 'efectivo_usd' })}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                    usdExpenseForm.wallet === 'efectivo_usd'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gris-border text-gris hover:border-gris'
                  }`}
                >
                  Efectivo USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">Monto USD</label>
                <input
                  type="number"
                  step="0.01"
                  value={usdExpenseForm.amountUsd}
                  onChange={(e) => setUsdExpenseForm({ ...usdExpenseForm, amountUsd: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gris font-medium block mb-1.5">Fecha</label>
                <input
                  type="date"
                  value={usdExpenseForm.date}
                  onChange={(e) => setUsdExpenseForm({ ...usdExpenseForm, date: e.target.value })}
                  className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gris font-medium block mb-1.5">Descripción</label>
              <input
                type="text"
                value={usdExpenseForm.description}
                onChange={(e) => setUsdExpenseForm({ ...usdExpenseForm, description: e.target.value })}
                className="w-full border border-gris-border rounded-xl px-4 py-2.5 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="Ej: Compra insumos, Pago proveedor, etc."
                required
              />
            </div>

            {usdExpenseError && <p className="text-sm text-error font-medium">{usdExpenseError}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" loading={usdExpenseSubmitting}>
                Registrar gasto
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowUsdExpenseForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Combined history table */}
      <div className="bg-white rounded-xl border border-gris-border overflow-hidden">
        <div className="px-6 py-4 border-b border-gris-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-heading font-bold text-negro">Historial</h3>
            {selectedWallet && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                selectedWallet === 'usdt' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
              }`}>
                {selectedWallet === 'usdt' ? 'Binance USDT' : 'Efectivo USD'}
              </span>
            )}
          </div>
          {selectedWallet && (
            <button
              type="button"
              onClick={() => setSelectedWallet(null)}
              className="text-xs text-gris hover:text-negro transition-colors cursor-pointer"
            >
              Ver todos
            </button>
          )}
        </div>

        {filteredHistory.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gris text-sm">
              {selectedWallet ? 'No hay movimientos en esta wallet' : 'No hay registros aún'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gris-light/50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-gris">Fecha</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gris">Tipo</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gris">Monto</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gris">Destino / Detalle</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gris">Nota / Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gris-border">
                {filteredHistory.map((record) => {
                  const badge = RECORD_TYPE_BADGE[record._recordType] || RECORD_TYPE_BADGE.protection;

                  if (record._recordType === 'protection') {
                    return (
                      <tr key={`p-${record._id}`} className="hover:bg-gris-light/30 transition-colors">
                        <td className="px-6 py-3 text-gris whitespace-nowrap">
                          {formatDate(record.protectedAt)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-medium text-negro">
                          {formatBs(record.amountBs)}
                          <span className="text-xs text-gris ml-1">→ {formatUsd(record.amountUsd)}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            record.destination === 'usdt' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {DESTINATION_LABELS[record.destination] || record.destination}
                          </span>
                          <span className="text-[10px] text-gris ml-2">{record.rateDolarParalelo?.toFixed(2)} Bs/$</span>
                        </td>
                        <td className="px-6 py-3 text-gris text-xs max-w-[180px] truncate">
                          {record.notes || '—'}
                        </td>
                      </tr>
                    );
                  }

                  if (record._recordType === 'capital_injection') {
                    return (
                      <tr key={`t-${record._id}`} className="hover:bg-gris-light/30 transition-colors">
                        <td className="px-6 py-3 text-gris whitespace-nowrap">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-success">
                          {formatUsd(record.amountUsd)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            record.wallet === 'usdt' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {DESTINATION_LABELS[record.wallet] || record.wallet}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gris text-xs max-w-[180px] truncate">
                          {record.description}
                        </td>
                      </tr>
                    );
                  }

                  if (record._recordType === 'usd_expense') {
                    return (
                      <tr key={`t-${record._id}`} className="hover:bg-gris-light/30 transition-colors">
                        <td className="px-6 py-3 text-gris whitespace-nowrap">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-orange-600">
                          -{formatUsd(record.amountUsd)}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            record.wallet === 'usdt' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                          }`}>
                            {DESTINATION_LABELS[record.wallet] || record.wallet}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gris text-xs max-w-[180px] truncate">
                          {record.description}
                        </td>
                      </tr>
                    );
                  }

                  // bs_expense
                  return (
                    <tr key={`t-${record._id}`} className="hover:bg-gris-light/30 transition-colors">
                      <td className="px-6 py-3 text-gris whitespace-nowrap">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-bold text-error">
                        {formatBs(record.amountBs)}
                      </td>
                      <td className="px-6 py-3 text-gris text-xs">—</td>
                      <td className="px-6 py-3 text-gris text-xs max-w-[180px] truncate">
                        {record.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {historyMeta.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gris-border flex items-center justify-between">
            <p className="text-xs text-gris">
              {historyMeta.total} registros · Página {historyMeta.page} de {historyMeta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={historyMeta.page <= 1}
                onClick={() => fetchData(historyMeta.page - 1)}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={historyMeta.page >= historyMeta.totalPages}
                onClick={() => fetchData(historyMeta.page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProtectionSummary } from '../../api/protection';

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

export default function WalletQuickView() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getProtectionSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {});
  }, []);

  if (!summary) {
    return (
      <div className="bg-white rounded-xl border border-gris-border p-5">
        <p className="text-sm text-gris text-center">Cargando wallet...</p>
      </div>
    );
  }

  const hasUnprotected = summary.unprotectedBs > 0.01;
  const totalWallet =
    (summary.wallets?.usdt?.total || 0) + (summary.wallets?.efectivo?.total || 0);

  return (
    <button
      onClick={() => navigate('/wallet')}
      className="bg-white rounded-xl border border-gris-border p-5 text-left w-full hover:border-naranja/40 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-naranja/10 text-naranja p-2 rounded-xl">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 013 6v3" />
            </svg>
          </div>
          <h3 className="font-heading font-bold text-sm text-negro">PokeWallet</h3>
        </div>
        <svg className="w-4 h-4 text-gris" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-lg p-2.5 text-center ${hasUnprotected ? 'bg-warning/5' : 'bg-success/5'}`}>
          <p className="text-[10px] text-gris">Sin proteger</p>
          <p className={`text-xs font-bold ${hasUnprotected ? 'text-warning' : 'text-success'}`}>
            {formatBs(summary.unprotectedBs)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-gris">USDT</p>
          <p className="text-xs font-bold text-blue-700">
            {formatUsd(summary.wallets?.usdt?.total || 0)}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-gris">Efectivo</p>
          <p className="text-xs font-bold text-green-700">
            {formatUsd(summary.wallets?.efectivo?.total || 0)}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gris-border/50 flex justify-between items-center">
        <span className="text-[10px] text-gris">Saldo total protegido</span>
        <span className="text-sm font-bold text-negro">{formatUsd(totalWallet)}</span>
      </div>
    </button>
  );
}

import { useState } from 'react';
import { usePurchases } from '../hooks/usePurchases';
import PurchaseTable from '../components/purchases/PurchaseTable';
import PurchaseForm from '../components/purchases/PurchaseForm';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

function SummaryCard({ label, value, sub, color = 'text-negro' }) {
  return (
    <div className="bg-white rounded-xl border border-gris-border p-4">
      <p className="text-xs font-semibold text-gris uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-heading font-bold text-xl ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gris mt-0.5">{sub}</p>}
    </div>
  );
}

function formatBS(n) {
  return `Bs. ${new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2 }).format(n)}`;
}

function formatUSD(n) {
  return `$${Number(n).toFixed(2)}`;
}

export default function Purchases() {
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [appliedFilters, setAppliedFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { purchases, summary, loading, error, create, update, remove } = usePurchases(appliedFilters);

  function openCreate() {
    setEditingPurchase(null);
    setFormOpen(true);
  }

  function openEdit(purchase) {
    setEditingPurchase(purchase);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingPurchase(null);
  }

  async function handleSubmit(data) {
    if (editingPurchase) {
      await update(editingPurchase._id, data);
    } else {
      await create(data);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      await remove(deleteConfirm._id);
      setDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  function applyFilters(e) {
    e.preventDefault();
    const active = {};
    if (filters.from) active.from = filters.from;
    if (filters.to) active.to = filters.to;
    setAppliedFilters(active);
  }

  function clearFilters() {
    setFilters({ from: '', to: '' });
    setAppliedFilters({});
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Total compras"
          value={summary.count}
          sub="registradas"
        />
        <SummaryCard
          label="Total en Bs."
          value={formatBS(summary.totalBS)}
          color="text-negro"
        />
        <SummaryCard
          label="Total USD (BCV)"
          value={formatUSD(summary.totalUSD)}
          sub="al cambio oficial"
          color="text-dorado"
        />
        <SummaryCard
          label="Total en USDT"
          value={`${formatUSD(summary.totalUSDT)} USDT`}
          sub="costo real en crypto"
          color="text-naranja"
        />
      </div>

      {/* Filtros + boton */}
      <div className="bg-white rounded-xl border border-gris-border p-4">
        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gris mb-1">Desde</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))}
              className="px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gris mb-1">Hasta</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))}
              className="px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Filtrar
          </Button>
          {Object.keys(appliedFilters).length > 0 && (
            <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>
              Limpiar
            </Button>
          )}
          <div className="ml-auto">
            <Button onClick={openCreate} size="sm">
              + Registrar compra
            </Button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gris-border overflow-hidden">
        {loading && purchases.length === 0 ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="text-naranja" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error text-sm">{error}</p>
          </div>
        ) : (
          <PurchaseTable
            purchases={purchases}
            loading={loading}
            onEdit={openEdit}
            onDelete={setDeleteConfirm}
          />
        )}
      </div>

      {/* Formulario */}
      <PurchaseForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        purchase={editingPurchase}
      />

      {/* Confirmacion de eliminacion */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar compra"
        message={`Eliminar la compra de "${deleteConfirm?.supplier}" del ${deleteConfirm?.date ? new Date(deleteConfirm.date).toLocaleDateString('es-VE') : ''}? Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}

import { useState } from 'react';
import { usePromotions, useDiscountCodes } from '../hooks/usePromotions';
import { formatCurrency } from '../utils/formatters';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PromotionForm from '../components/promotions/PromotionForm';
import DiscountCodeForm from '../components/promotions/DiscountCodeForm';
import Spinner from '../components/ui/Spinner';

const TABS = [
  { id: 'promotions', label: 'Promociones' },
  { id: 'codes', label: 'Códigos de descuento' },
];

export default function PromotionsManager() {
  const [activeTab, setActiveTab] = useState('promotions');

  // Promotions
  const { promotions, loading: loadingPromos, error: errorPromos, create: createPromo, update: updatePromo, remove: removePromo } = usePromotions();
  const [promoFormOpen, setPromoFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deletingPromo, setDeletingPromo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Discount codes
  const { codes, loading: loadingCodes, error: errorCodes, create: createCode, update: updateCode, remove: removeCode } = useDiscountCodes();
  const [codeFormOpen, setCodeFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [deletingCode, setDeletingCode] = useState(null);
  const [deleteCodeLoading, setDeleteCodeLoading] = useState(false);

  // Promo handlers
  function handleNewPromo() {
    setEditingPromo(null);
    setPromoFormOpen(true);
  }
  function handleEditPromo(promo) {
    setEditingPromo(promo);
    setPromoFormOpen(true);
  }
  async function handlePromoSubmit(data) {
    if (editingPromo) {
      await updatePromo(editingPromo._id, data);
    } else {
      await createPromo(data);
    }
  }
  async function handleTogglePromo(promo) {
    await updatePromo(promo._id, { active: !promo.active });
  }
  async function handleDeletePromo() {
    setDeleteLoading(true);
    try {
      await removePromo(deletingPromo._id);
      setDeletingPromo(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Code handlers
  function handleNewCode() {
    setEditingCode(null);
    setCodeFormOpen(true);
  }
  function handleEditCode(code) {
    setEditingCode(code);
    setCodeFormOpen(true);
  }
  async function handleCodeSubmit(data) {
    if (editingCode) {
      await updateCode(editingCode._id, data);
    } else {
      await createCode(data);
    }
  }
  async function handleToggleCode(code) {
    await updateCode(code._id, { active: !code.active });
  }
  async function handleDeleteCode() {
    setDeleteCodeLoading(true);
    try {
      await removeCode(deletingCode._id);
      setDeletingCode(null);
    } finally {
      setDeleteCodeLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-negro">Promociones</h1>
          <p className="text-sm text-gris mt-1">Gestiona promociones y códigos de descuento</p>
        </div>
        <Button onClick={activeTab === 'promotions' ? handleNewPromo : handleNewCode}>
          {activeTab === 'promotions' ? '+ Nueva promo' : '+ Nuevo código'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-1 border border-gris-border inline-flex gap-1 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-naranja text-white'
                : 'text-gris hover:text-negro hover:bg-gris-light'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gris-border overflow-hidden">
        {activeTab === 'promotions' && (
          <PromotionsTable
            promotions={promotions}
            loading={loadingPromos}
            error={errorPromos}
            onEdit={handleEditPromo}
            onToggle={handleTogglePromo}
            onDelete={setDeletingPromo}
          />
        )}
        {activeTab === 'codes' && (
          <CodesTable
            codes={codes}
            loading={loadingCodes}
            error={errorCodes}
            onEdit={handleEditCode}
            onToggle={handleToggleCode}
            onDelete={setDeletingCode}
          />
        )}
      </div>

      {/* Forms */}
      <PromotionForm
        open={promoFormOpen}
        onClose={() => setPromoFormOpen(false)}
        onSubmit={handlePromoSubmit}
        promotion={editingPromo}
      />
      <DiscountCodeForm
        open={codeFormOpen}
        onClose={() => setCodeFormOpen(false)}
        onSubmit={handleCodeSubmit}
        discountCode={editingCode}
      />

      {/* Delete confirmations */}
      <ConfirmDialog
        open={!!deletingPromo}
        onClose={() => setDeletingPromo(null)}
        onConfirm={handleDeletePromo}
        title="Eliminar promoción"
        message={`¿Eliminar "${deletingPromo?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmVariant="danger"
        loading={deleteLoading}
      />
      <ConfirmDialog
        open={!!deletingCode}
        onClose={() => setDeletingCode(null)}
        onConfirm={handleDeleteCode}
        title="Eliminar código"
        message={`¿Eliminar el código "${deletingCode?.code}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmVariant="danger"
        loading={deleteCodeLoading}
      />
    </div>
  );
}

// ── Promotions Table ──────────────────────────────────────────────────

function PromotionsTable({ promotions, loading, error, onEdit, onToggle, onDelete }) {
  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error) return <div className="p-8 text-center text-error text-sm">{error}</div>;
  if (promotions.length === 0) return <div className="p-8 text-center text-gris text-sm">No hay promociones creadas</div>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gris-border text-left text-gris text-xs uppercase tracking-wide">
          <th className="px-4 py-3">Nombre</th>
          <th className="px-4 py-3">Poke Types</th>
          <th className="px-4 py-3">Proteínas</th>
          <th className="px-4 py-3 text-right">Precio</th>
          <th className="px-4 py-3 text-center">Activa</th>
          <th className="px-4 py-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {promotions.map((promo) => (
          <tr key={promo._id} className="border-b border-gris-border last:border-0 hover:bg-gris-light/50 transition-colors">
            <td className="px-4 py-3">
              <p className="font-medium text-negro">{promo.name}</p>
              {promo.description && <p className="text-xs text-gris mt-0.5">{promo.description}</p>}
            </td>
            <td className="px-4 py-3 text-gris">
              {(promo.pokeTypes || []).map((pt) => (
                <span key={pt.pokeType?._id || pt.pokeType} className="inline-block mr-1">
                  {pt.quantity}x {pt.pokeType?.name || '—'}
                </span>
              ))}
            </td>
            <td className="px-4 py-3 text-gris">
              {promo.allowedProteins?.length > 0
                ? promo.allowedProteins.map((p) => p.name || p).join(', ')
                : <span className="text-gris/50">Todas</span>
              }
            </td>
            <td className="px-4 py-3 text-right font-bold text-naranja">{formatCurrency(promo.promoPrice)}</td>
            <td className="px-4 py-3 text-center">
              <button
                onClick={() => onToggle(promo)}
                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${promo.active ? 'bg-naranja' : 'bg-gris-border'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${promo.active ? 'left-5' : 'left-0.5'}`} />
              </button>
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="sm" onClick={() => onEdit(promo)}>Editar</Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(promo)} className="text-error hover:text-error">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Discount Codes Table ──────────────────────────────────────────────

function CodesTable({ codes, loading, error, onEdit, onToggle, onDelete }) {
  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>;
  if (error) return <div className="p-8 text-center text-error text-sm">{error}</div>;
  if (codes.length === 0) return <div className="p-8 text-center text-gris text-sm">No hay códigos de descuento</div>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gris-border text-left text-gris text-xs uppercase tracking-wide">
          <th className="px-4 py-3">Código</th>
          <th className="px-4 py-3 text-center">Descuento</th>
          <th className="px-4 py-3 text-center">Usos</th>
          <th className="px-4 py-3">Expira</th>
          <th className="px-4 py-3 text-center">Activo</th>
          <th className="px-4 py-3 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {codes.map((code) => {
          const expired = code.expiresAt && new Date(code.expiresAt) < new Date();
          const limitReached = code.usageLimit && code.usageCount >= code.usageLimit;
          return (
            <tr key={code._id} className="border-b border-gris-border last:border-0 hover:bg-gris-light/50 transition-colors">
              <td className="px-4 py-3">
                <span className="font-mono font-bold text-negro bg-gris-light px-2 py-0.5 rounded">{code.code}</span>
              </td>
              <td className="px-4 py-3 text-center font-bold text-naranja">{code.percentage}%</td>
              <td className="px-4 py-3 text-center text-gris">
                {code.usageCount}{code.usageLimit ? ` / ${code.usageLimit}` : ''}
                {limitReached && <span className="ml-1 text-[10px] text-error font-bold">AGOTADO</span>}
              </td>
              <td className="px-4 py-3 text-gris">
                {code.expiresAt
                  ? <span className={expired ? 'text-error' : ''}>{new Date(code.expiresAt).toLocaleDateString('es-ES')}</span>
                  : <span className="text-gris/50">Sin expiración</span>
                }
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onToggle(code)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${code.active ? 'bg-naranja' : 'bg-gris-border'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${code.active ? 'left-5' : 'left-0.5'}`} />
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(code)}>Editar</Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(code)} className="text-error hover:text-error">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

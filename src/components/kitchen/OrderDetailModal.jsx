import { useEffect, useRef, useState } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import BowlDetail from './BowlDetail';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatCurrency, formatTime, timeAgo } from '../../utils/formatters';
import {
  updatePaymentStatus,
  updatePaymentDetails,
  addSplitPayment,
  updateSplitPaymentStatus,
  deleteOrder,
} from '../../api/orders';

const PAYMENT_LABELS = {
  pago_movil: 'Pago Móvil (Bs)',
  efectivo_usd: 'Efectivo (USD)',
  binance_usdt: 'Binance (USDT)',
};

const PAYMENT_STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'text-warning bg-warning-light' },
  verified: { label: 'Verificado', color: 'text-success bg-success-light' },
  rejected: { label: 'Rechazado', color: 'text-error bg-error-light' },
};

const PAYMENT_METHODS = ['pago_movil', 'efectivo_usd', 'binance_usdt'];

function toWhatsAppUrl(phone, message = '') {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') ? '58' + digits.slice(1) : digits;
  const encoded = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${intl}${encoded}`;
}

export default function OrderDetailModal({ order, open, onClose, onAdvance, onCancel, onRefresh }) {
  const overlayRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !order) return null;

  const config = STATUS_CONFIG[order.status];

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await deleteOrder(order._id);
      onClose();
      onRefresh?.();
    } catch (err) {
      alert(err.message || 'Error al eliminar el pedido');
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex justify-end bg-negro/40 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gris-border px-5 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-heading font-bold text-lg text-negro">
                Pedido #{order.orderNumber}
              </h2>
              <Badge status={order.status} />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gris-light transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-gris" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-xs text-gris">
              {formatTime(order.createdAt)} — {timeAgo(order.createdAt)}
            </p>
            {order.deliveryTime && (
              <span className="flex items-center gap-1 text-xs font-bold text-naranja bg-naranja/10 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Entrega: {order.deliveryTime}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer Info */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-sm text-negro">Cliente</h3>
              {order.customer?.phone && (
                <a
                  href={toWhatsAppUrl(
                    order.customer.phone,
                    `Hola ${order.customer.name}, tu pedido Japoke #${order.orderNumber} está listo 🥢`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
            <div className="bg-dorado-light rounded-xl p-3 space-y-1">
              <p className="text-sm font-medium text-negro">{order.customer?.name}</p>
              <p className="text-xs text-gris">{order.customer?.phone}</p>
              <p className="text-xs text-gris">{order.customer?.email}</p>
              <p className="text-xs text-gris">{order.customer?.address}</p>
              <p className="text-xs text-gris flex items-center gap-1.5 mt-1">
                <span className="font-semibold text-negro">Hora de entrega:</span>
                {order.deliveryTime ? (
                  <span className="font-bold text-naranja">{order.deliveryTime}</span>
                ) : (
                  <span className="text-gris">No indicada</span>
                )}
              </p>
              {order.customer?.notes && (
                <p className="text-xs text-naranja mt-1 italic">
                  Nota: {order.customer.notes}
                </p>
              )}
            </div>
          </section>

          {/* Bowls */}
          <section>
            <h3 className="font-heading font-bold text-sm text-negro mb-2">
              Bowls ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((bowl, i) => (
                <BowlDetail key={i} bowl={bowl} index={i} />
              ))}
            </div>
          </section>

          {/* Totals */}
          <section className="bg-gris-light rounded-xl p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gris">Subtotal</span>
              <span className="text-negro">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gris-border">
              <span className="text-negro">Total</span>
              <span className="text-naranja">{formatCurrency(order.total)}</span>
            </div>
          </section>

          {/* Payment Info */}
          {order.payment && order.payment.method && (
            <PaymentSection order={order} onRefresh={onRefresh} />
          )}

          {/* Split Payment */}
          <SplitPaymentSection order={order} onRefresh={onRefresh} />

          {/* Actions */}
          <section className="flex gap-3 pt-2">
            {config?.nextStatus && (
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onAdvance?.(order)}
              >
                {config.nextLabel}
              </Button>
            )}
            {config?.canCancel && (
              <Button
                variant="danger"
                onClick={() => onCancel?.(order)}
              >
                Cancelar pedido
              </Button>
            )}
          </section>

          {/* Delete Order */}
          <section className="pt-2 border-t border-gris-border">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full text-xs text-gris hover:text-error transition-colors py-1 cursor-pointer"
              >
                Eliminar pedido permanentemente
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2">
                <p className="text-sm font-semibold text-error text-center">
                  ¿Eliminar el pedido #{order.orderNumber}?
                </p>
                <p className="text-xs text-gris text-center">
                  Se restaurará el stock descontado. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleteLoading}
                    className="flex-1 py-2 text-sm border-2 border-gris-border rounded-xl font-semibold hover:bg-gris-light transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 py-2 text-sm bg-error text-white rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deleteLoading ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function PaymentSection({ order, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [editError, setEditError] = useState('');
  const p = order.payment;
  const statusConfig = PAYMENT_STATUS_LABELS[p.status] || PAYMENT_STATUS_LABELS.pending;

  function openEdit() {
    setEditData({
      method: p.method || 'pago_movil',
      amountBs: p.amountBs ?? '',
      amountUsd: p.amountUsd ?? '',
      referenceId: p.referenceId || '',
    });
    setEditError('');
    setEditMode(true);
  }

  async function handlePaymentAction(newStatus) {
    setLoading(true);
    try {
      await updatePaymentStatus(order._id, newStatus);
      onRefresh?.();
    } catch (err) {
      alert('Error al actualizar estado de pago: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setEditError('');
    try {
      await updatePaymentDetails(order._id, {
        method: editData.method,
        amountBs: editData.amountBs !== '' ? Number(editData.amountBs) : undefined,
        amountUsd: editData.amountUsd !== '' ? Number(editData.amountUsd) : undefined,
        referenceId: editData.referenceId,
      });
      setEditMode(false);
      onRefresh?.();
    } catch (err) {
      setEditError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-bold text-sm text-negro">Pago principal</h3>
        {!editMode && (
          <button
            type="button"
            onClick={openEdit}
            className="text-xs text-naranja hover:underline font-medium cursor-pointer"
          >
            Editar pago
          </button>
        )}
      </div>

      {editMode ? (
        <form onSubmit={handleEditSubmit} className="bg-white border border-naranja/30 rounded-xl p-3 space-y-3">
          <div>
            <label className="text-xs text-gris font-medium block mb-1">Método</label>
            <select
              value={editData.method}
              onChange={(e) => setEditData({ ...editData, method: e.target.value })}
              className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gris font-medium block mb-1">Monto Bs</label>
              <input
                type="number"
                step="0.01"
                value={editData.amountBs}
                onChange={(e) => setEditData({ ...editData, amountBs: e.target.value })}
                className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-gris font-medium block mb-1">Monto USD</label>
              <input
                type="number"
                step="0.01"
                value={editData.amountUsd}
                onChange={(e) => setEditData({ ...editData, amountUsd: e.target.value })}
                className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gris font-medium block mb-1">Referencia</label>
            <input
              type="text"
              value={editData.referenceId}
              onChange={(e) => setEditData({ ...editData, referenceId: e.target.value })}
              className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
              placeholder="Número de referencia"
            />
          </div>
          {editError && <p className="text-xs text-error font-medium">{editError}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1" loading={loading}>
              Guardar cambios
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-gris-border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-negro">
              {PAYMENT_LABELS[p.method] || p.method}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div>
              <p className="text-[10px] text-gris">EUR</p>
              <p className="text-sm font-semibold text-negro">{formatCurrency(p.amountEur)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gris">Bs</p>
              <p className="text-sm font-semibold text-negro">
                {p.amountBs ? Number(p.amountBs).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gris">USD/USDT</p>
              <p className="text-sm font-semibold text-negro">
                {p.amountUsd ? `$${Number(p.amountUsd).toFixed(2)}` : '—'}
              </p>
            </div>
          </div>

          {p.referenceId && (
            <div className="text-xs">
              <span className="text-gris">Ref: </span>
              <span className="text-negro font-medium">{p.referenceId}</span>
            </div>
          )}

          {p.rates && (
            <div className="flex gap-3 text-[10px] text-gris pt-1 border-t border-gris-border/50">
              <span>EUR BCV: {p.rates.euroBcv?.toFixed(2)}</span>
              <span>USD BCV: {p.rates.dolarBcv?.toFixed(2)}</span>
              <span>Paralelo: {p.rates.dolarParalelo?.toFixed(2)}</span>
            </div>
          )}

          {p.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="primary"
                className="flex-1"
                onClick={() => handlePaymentAction('verified')}
                loading={loading}
              >
                Verificar pago
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handlePaymentAction('rejected')}
                loading={loading}
              >
                Rechazar
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SplitPaymentSection({ order, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    method: 'efectivo_usd',
    amountBs: '',
    amountUsd: '',
    referenceId: '',
  });
  const [formError, setFormError] = useState('');

  const sp = order.splitPayment;
  const hasSplit = sp && sp.method;
  const canAdd = !hasSplit && order.status !== 'cancelled';

  async function handleAddSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFormError('');
    try {
      await addSplitPayment(order._id, {
        method: formData.method,
        amountBs: formData.amountBs !== '' ? Number(formData.amountBs) : undefined,
        amountUsd: formData.amountUsd !== '' ? Number(formData.amountUsd) : undefined,
        referenceId: formData.referenceId,
      });
      setShowAddForm(false);
      onRefresh?.();
    } catch (err) {
      setFormError(err.message || 'Error al agregar pago');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus) {
    setLoading(true);
    try {
      await updateSplitPaymentStatus(order._id, newStatus);
      onRefresh?.();
    } catch (err) {
      alert('Error al actualizar estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }

  if (!hasSplit && !canAdd) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-bold text-sm text-negro">Pago secundario</h3>
        {canAdd && !showAddForm && (
          <button
            type="button"
            onClick={() => {
              const primaryMethod = order.payment?.method;
              const defaultMethod = primaryMethod === 'pago_movil' ? 'efectivo_usd' : 'pago_movil';
              setFormData({ method: defaultMethod, amountBs: '', amountUsd: '', referenceId: '' });
              setFormError('');
              setShowAddForm(true);
            }}
            className="text-xs text-naranja hover:underline font-medium cursor-pointer"
          >
            + Agregar pago dividido
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white border border-naranja/30 rounded-xl p-3 space-y-3">
          <div>
            <label className="text-xs text-gris font-medium block mb-1">Método</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm text-negro focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
            >
              {PAYMENT_METHODS.filter((m) => m !== order.payment?.method).map((m) => (
                <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gris font-medium block mb-1">Monto Bs</label>
              <input
                type="number"
                step="0.01"
                value={formData.amountBs}
                onChange={(e) => setFormData({ ...formData, amountBs: e.target.value })}
                className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs text-gris font-medium block mb-1">Monto USD</label>
              <input
                type="number"
                step="0.01"
                value={formData.amountUsd}
                onChange={(e) => setFormData({ ...formData, amountUsd: e.target.value })}
                className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gris font-medium block mb-1">Referencia</label>
            <input
              type="text"
              value={formData.referenceId}
              onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              className="w-full border border-gris-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja"
              placeholder="Número de referencia"
            />
          </div>
          {formError && <p className="text-xs text-error font-medium">{formError}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1" loading={loading}>
              Agregar pago
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {hasSplit && (() => {
        const statusConfig = PAYMENT_STATUS_LABELS[sp.status] || PAYMENT_STATUS_LABELS.pending;
        return (
          <div className="bg-white border border-gris-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-negro">
                {PAYMENT_LABELS[sp.method] || sp.method}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center py-2">
              {sp.amountBs != null && (
                <div>
                  <p className="text-[10px] text-gris">Bs</p>
                  <p className="text-sm font-semibold text-negro">
                    {Number(sp.amountBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {sp.amountUsd != null && (
                <div>
                  <p className="text-[10px] text-gris">USD/USDT</p>
                  <p className="text-sm font-semibold text-negro">
                    ${Number(sp.amountUsd).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            {sp.referenceId && (
              <div className="text-xs">
                <span className="text-gris">Ref: </span>
                <span className="text-negro font-medium">{sp.referenceId}</span>
              </div>
            )}
            {sp.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleStatusUpdate('verified')}
                  loading={loading}
                >
                  Verificar pago
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleStatusUpdate('rejected')}
                  loading={loading}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        );
      })()}
    </section>
  );
}

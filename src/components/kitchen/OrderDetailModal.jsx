import { useEffect, useRef, useState } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import BowlDetail from './BowlDetail';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatCurrency, formatTime, timeAgo } from '../../utils/formatters';
import { updatePaymentStatus } from '../../api/orders';

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

export default function OrderDetailModal({ order, open, onClose, onAdvance, onCancel, onRefresh }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;

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
          <p className="text-xs text-gris mt-1">
            {formatTime(order.createdAt)} — {timeAgo(order.createdAt)}
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer Info */}
          <section>
            <h3 className="font-heading font-bold text-sm text-negro mb-2">Cliente</h3>
            <div className="bg-dorado-light rounded-xl p-3 space-y-1">
              <p className="text-sm font-medium text-negro">{order.customer?.name}</p>
              <p className="text-xs text-gris">{order.customer?.phone}</p>
              <p className="text-xs text-gris">{order.customer?.email}</p>
              <p className="text-xs text-gris">{order.customer?.address}</p>
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
        </div>
      </div>
    </div>
  );
}

function PaymentSection({ order, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const p = order.payment;
  const statusConfig = PAYMENT_STATUS_LABELS[p.status] || PAYMENT_STATUS_LABELS.pending;

  async function handlePaymentAction(newStatus) {
    setLoading(true);
    try {
      await updatePaymentStatus(order._id, newStatus);
      onRefresh?.();
    } catch (err) {
      console.error('[Payment] Error updating status:', err);
      alert('Error al actualizar estado de pago: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h3 className="font-heading font-bold text-sm text-negro mb-2">Pago</h3>
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
    </section>
  );
}

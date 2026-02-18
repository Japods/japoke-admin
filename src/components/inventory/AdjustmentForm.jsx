import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function AdjustmentForm({ open, onClose, onSubmit, target }) {
  const [form, setForm] = useState({
    newStock: '',
    reason: 'manual_adjustment',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && target) {
      setForm({
        newStock: target.item.currentStock?.toString() || '0',
        reason: 'manual_adjustment',
        notes: '',
      });
    }
  }, [open, target]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!target) return;
    setSubmitting(true);
    try {
      await onSubmit({
        refModel: target.refModel,
        refId: target.item._id,
        newStock: Number(form.newStock),
        reason: form.reason,
        notes: form.notes,
      });
      onClose();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  }

  if (!target) return null;

  const diff = Number(form.newStock) - (target.item.currentStock || 0);

  return (
    <Modal open={open} onClose={onClose} title={`Ajustar Stock: ${target.item.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gris-light/50 rounded-xl px-4 py-3">
          <p className="text-sm text-gris">
            Stock actual: <span className="text-base font-bold text-negro">{target.item.currentStock} {target.item.trackingUnit}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-negro mb-1">Nuevo Stock</label>
          <input
            type="number"
            step="any"
            min="0"
            value={form.newStock}
            onChange={(e) => setForm({ ...form, newStock: e.target.value })}
            required
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
          />
        </div>

        {form.newStock !== '' && (
          <div className={`text-sm font-semibold px-3 py-2 rounded-lg ${diff >= 0 ? 'text-success bg-success-light' : 'text-error bg-error-light'}`}>
            {diff >= 0 ? '+' : ''}{diff} {target.item.trackingUnit}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-negro mb-1">Razon</label>
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja bg-white transition-all"
          >
            <option value="manual_adjustment">Ajuste manual</option>
            <option value="waste">Desperdicio / Merma</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-negro mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja resize-none transition-all"
            placeholder="Razon del ajuste..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gris-border">
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" loading={submitting}>Guardar Ajuste</Button>
        </div>
      </form>
    </Modal>
  );
}

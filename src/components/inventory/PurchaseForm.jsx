import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function PurchaseForm({ open, onClose, onSubmit, items, supplies }) {
  const [form, setForm] = useState({
    refModel: 'Item',
    refId: '',
    quantity: '',
    unitCost: '',
    notes: '',
    updateCost: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ refModel: 'Item', refId: '', quantity: '', unitCost: '', notes: '', updateCost: true });
    }
  }, [open]);

  const options = form.refModel === 'Item' ? items : supplies;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost),
      });
      onClose();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar Compra">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-negro mb-1">Tipo</label>
          <select
            value={form.refModel}
            onChange={(e) => setForm({ ...form, refModel: e.target.value, refId: '' })}
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja bg-white transition-all"
          >
            <option value="Item">Ingrediente</option>
            <option value="Supply">Insumo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-negro mb-1">
            {form.refModel === 'Item' ? 'Ingrediente' : 'Insumo'}
          </label>
          <select
            value={form.refId}
            onChange={(e) => setForm({ ...form, refId: e.target.value })}
            required
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja bg-white transition-all"
          >
            <option value="">Seleccionar...</option>
            {(options || []).map((opt) => (
              <option key={opt._id} value={opt._id}>
                {opt.name} (Stock: {opt.currentStock} {opt.trackingUnit})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Cantidad</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
              className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
              placeholder="Ej: 2000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Costo Unitario (EUR)</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.unitCost}
              onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
              required
              className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
              placeholder="Ej: 0.02"
            />
          </div>
        </div>

        {form.quantity && form.unitCost && (
          <div className="bg-gris-light/50 rounded-xl px-4 py-3">
            <p className="text-sm text-gris">
              Total compra: <span className="text-base font-bold text-negro">€{(Number(form.quantity) * Number(form.unitCost)).toFixed(2)}</span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="updateCost"
            checked={form.updateCost}
            onChange={(e) => setForm({ ...form, updateCost: e.target.checked })}
            className="w-4 h-4 rounded accent-naranja"
          />
          <label htmlFor="updateCost" className="text-sm text-gris cursor-pointer">
            Actualizar costo unitario del item
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-negro mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja resize-none transition-all"
            placeholder="Proveedor, fecha de compra, etc."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gris-border">
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" loading={submitting}>Registrar Compra</Button>
        </div>
      </form>
    </Modal>
  );
}

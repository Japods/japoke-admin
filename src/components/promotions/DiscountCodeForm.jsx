import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const INITIAL_STATE = {
  code: '',
  percentage: '',
  active: true,
  usageLimit: '',
  expiresAt: '',
};

export default function DiscountCodeForm({ open, onClose, onSubmit, discountCode = null }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!discountCode;

  useEffect(() => {
    if (discountCode) {
      setForm({
        code: discountCode.code || '',
        percentage: discountCode.percentage ?? '',
        active: discountCode.active ?? true,
        usageLimit: discountCode.usageLimit ?? '',
        expiresAt: discountCode.expiresAt ? discountCode.expiresAt.slice(0, 10) : '',
      });
    } else {
      setForm(INITIAL_STATE);
    }
    setError(null);
  }, [discountCode, open]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        code: form.code.toUpperCase().trim(),
        percentage: Number(form.percentage),
        active: form.active,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      };
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all';

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-md mx-4">
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="font-heading font-bold text-lg text-negro mb-4">
          {isEdit ? 'Editar código' : 'Nuevo código de descuento'}
        </h3>

        {error && (
          <div className="bg-error-light text-error text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Código</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className={inputClass + ' uppercase'}
              placeholder="Ej: JAPOKE15"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-negro mb-1">Descuento (%)</label>
              <input name="percentage" type="number" min="1" max="100" value={form.percentage} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-negro mb-1">Límite de usos</label>
              <input name="usageLimit" type="number" min="1" value={form.usageLimit} onChange={handleChange} className={inputClass} placeholder="Sin límite" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-negro mb-1">Fecha de expiración</label>
            <input name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} className={inputClass} />
          </div>

          <div className="flex items-center gap-2">
            <input name="active" type="checkbox" checked={form.active} onChange={handleChange} className="w-4 h-4 rounded accent-naranja" />
            <label className="text-sm text-negro">Activo</label>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Guardar cambios' : 'Crear código'}</Button>
        </div>
      </form>
    </Modal>
  );
}

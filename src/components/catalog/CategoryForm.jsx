import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CATEGORY_TYPES } from '../../utils/constants';

const INITIAL_STATE = {
  name: '',
  type: 'protein',
  displayOrder: 0,
  isActive: true,
};

export default function CategoryForm({ open, onClose, onSubmit, category = null }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!category;

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        type: category.type || 'protein',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive ?? true,
      });
    } else {
      setForm(INITIAL_STATE);
    }
    setError(null);
  }, [category, open]);

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
      const data = { ...form, displayOrder: Number(form.displayOrder) };
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-md mx-4">
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="font-heading font-bold text-lg text-negro mb-4">
          {isEdit ? 'Editar categoria' : 'Nueva categoria'}
        </h3>

        {error && (
          <div className="bg-error-light text-error text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
              placeholder="Ej: Proteinas Premium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-negro mb-1">Tipo</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all bg-white"
            >
              {CATEGORY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-negro mb-1">Orden de visualizacion</label>
            <input
              name="displayOrder"
              type="number"
              value={form.displayOrder}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-naranja"
            />
            <label className="text-sm text-negro">Activo</label>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear categoria'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

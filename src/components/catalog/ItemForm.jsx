import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { PROTEIN_TIERS } from '../../utils/constants';

const TRACKING_UNITS = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'units', label: 'Unidades' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
];

const INITIAL_STATE = {
  name: '',
  category: '',
  tier: '',
  portionSize: '',
  extraPrice: '',
  costPerUnit: '',
  isTrackable: false,
  trackingUnit: 'g',
  currentStock: '0',
  minStock: '0',
  isAvailable: true,
  displayOrder: 0,
};

export default function ItemForm({ open, onClose, onSubmit, item = null, categories = [] }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        category: item.category?._id || item.category || '',
        tier: item.tier || '',
        portionSize: item.portionSize || '',
        extraPrice: item.extraPrice || '',
        costPerUnit: item.costPerUnit || '',
        isTrackable: item.isTrackable ?? false,
        trackingUnit: item.trackingUnit || 'g',
        currentStock: item.currentStock?.toString() || '0',
        minStock: item.minStock?.toString() || '0',
        isAvailable: item.isAvailable ?? true,
        displayOrder: item.displayOrder || 0,
      });
    } else {
      setForm(INITIAL_STATE);
    }
    setError(null);
  }, [item, open]);

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
        ...form,
        portionSize: form.portionSize ? Number(form.portionSize) : undefined,
        extraPrice: form.extraPrice ? Number(form.extraPrice) : undefined,
        costPerUnit: form.costPerUnit ? Number(form.costPerUnit) : undefined,
        currentStock: Number(form.currentStock),
        minStock: Number(form.minStock),
        displayOrder: Number(form.displayOrder),
        tier: form.tier || undefined,
      };
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
          {isEdit ? 'Editar item' : 'Nuevo item'}
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
              placeholder="Ej: Salmon"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-negro mb-1">Categoria</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all bg-white"
            >
              <option value="">Seleccionar...</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-negro mb-1">Tier</label>
              <select
                name="tier"
                value={form.tier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all bg-white"
              >
                <option value="">Ninguno</option>
                {PROTEIN_TIERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-negro mb-1">Porcion (g)</label>
              <input
                name="portionSize"
                type="number"
                value={form.portionSize}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-negro mb-1">Precio extra</label>
              <input
                name="extraPrice"
                type="number"
                value={form.extraPrice}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-negro mb-1">Costo por unidad</label>
              <input
                name="costPerUnit"
                type="number"
                value={form.costPerUnit}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
              />
            </div>
          </div>

          {/* Inventory Tracking */}
          <div className="border-t border-gris-border pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                name="isTrackable"
                type="checkbox"
                checked={form.isTrackable}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-naranja"
              />
              <label className="text-sm font-medium text-negro">Trackear inventario</label>
            </div>

            {form.isTrackable && (
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-sm font-medium text-negro mb-1">Unidad de medida</label>
                  <select
                    name="trackingUnit"
                    value={form.trackingUnit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all bg-white"
                  >
                    {TRACKING_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-negro mb-1">Stock actual</label>
                    <input
                      name="currentStock"
                      type="number"
                      step="any"
                      value={form.currentStock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-negro mb-1">Stock minimo</label>
                    <input
                      name="minStock"
                      type="number"
                      step="any"
                      value={form.minStock}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              name="isAvailable"
              type="checkbox"
              checked={form.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 rounded accent-naranja"
            />
            <label className="text-sm text-negro">Disponible</label>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

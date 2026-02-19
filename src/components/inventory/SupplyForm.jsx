import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const TRACKING_UNITS = [
  { value: 'units', label: 'Unidades' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function SupplyForm({ open, onClose, onSubmit, supply }) {
  const isEditing = !!supply;
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    unitCost: '',
    currentStock: '',
    minStock: '',
    trackingUnit: 'units',
    usagePerPoke: '1',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      if (supply) {
        setForm({
          name: supply.name || '',
          slug: supply.slug || '',
          description: supply.description || '',
          unitCost: supply.unitCost?.toString() || '0',
          currentStock: supply.currentStock?.toString() || '0',
          minStock: supply.minStock?.toString() || '0',
          trackingUnit: supply.trackingUnit || 'units',
          usagePerPoke: supply.usagePerPoke?.toString() || '1',
        });
      } else {
        setForm({
          name: '',
          slug: '',
          description: '',
          unitCost: '',
          currentStock: '0',
          minStock: '0',
          trackingUnit: 'units',
          usagePerPoke: '1',
        });
      }
    }
  }, [open, supply]);

  function handleNameChange(name) {
    setForm((f) => ({
      ...f,
      name,
      slug: isEditing ? f.slug : slugify(name),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        unitCost: Number(form.unitCost),
        minStock: Number(form.minStock),
        trackingUnit: form.trackingUnit,
        usagePerPoke: Number(form.usagePerPoke),
      };
      // Solo incluir slug y currentStock en creación
      if (!isEditing) {
        payload.slug = form.slug;
        payload.currentStock = Number(form.currentStock);
      }
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el insumo');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar Insumo' : 'Nuevo Insumo'} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-negro mb-1">Nombre</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
            placeholder="Ej: Envase Poke Grande"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-negro mb-1">Descripcion</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
            placeholder="Descripcion opcional"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Unidad de Medida</label>
            <select
              value={form.trackingUnit}
              onChange={(e) => setForm({ ...form, trackingUnit: e.target.value })}
              className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja bg-white transition-all"
            >
              {TRACKING_UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Stock Actual</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.currentStock}
              onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
              className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Stock Minimo</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Uso/Poke</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.usagePerPoke}
              onChange={(e) => setForm({ ...form, usagePerPoke: e.target.value })}
              className="w-full border border-gris-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-naranja/30 focus:border-naranja transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gris-border">
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" loading={submitting}>{isEditing ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
}

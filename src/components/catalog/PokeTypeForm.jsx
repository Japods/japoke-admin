import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const INITIAL_STATE = {
  name: '',
  basePrice: '',
  proteinGrams: '',
  baseGrams: '',
  maxVegetables: '',
  maxSauces: '',
  maxToppings: '',
  allowedProteinTiers: ['base', 'premium'],
  supplies: [],
  isActive: true,
};

export default function PokeTypeForm({ open, onClose, onSubmit, pokeType = null, availableSupplies = [] }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEdit = !!pokeType;

  useEffect(() => {
    if (pokeType) {
      setForm({
        name: pokeType.name || '',
        basePrice: pokeType.basePrice || '',
        proteinGrams: pokeType.rules?.proteinGrams || '',
        baseGrams: pokeType.rules?.baseGrams || '',
        maxVegetables: pokeType.rules?.maxVegetables || '',
        maxSauces: pokeType.rules?.maxSauces || '',
        maxToppings: pokeType.rules?.maxToppings || '',
        allowedProteinTiers: pokeType.allowedProteinTiers || ['base', 'premium'],
        supplies: (pokeType.supplies || []).map((s) => ({
          supply: s.supply?._id || s.supply,
          quantity: s.quantity || 1,
        })),
        isActive: pokeType.isActive ?? true,
      });
    } else {
      setForm(INITIAL_STATE);
    }
    setError(null);
  }, [pokeType, open]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleTierToggle(tier) {
    setForm((prev) => {
      const tiers = prev.allowedProteinTiers.includes(tier)
        ? prev.allowedProteinTiers.filter((t) => t !== tier)
        : [...prev.allowedProteinTiers, tier];
      return { ...prev, allowedProteinTiers: tiers };
    });
  }

  function handleAddSupply() {
    setForm((prev) => ({
      ...prev,
      supplies: [...prev.supplies, { supply: '', quantity: 1 }],
    }));
  }

  function handleRemoveSupply(index) {
    setForm((prev) => ({
      ...prev,
      supplies: prev.supplies.filter((_, i) => i !== index),
    }));
  }

  function handleSupplyChange(index, field, value) {
    setForm((prev) => ({
      ...prev,
      supplies: prev.supplies.map((s, i) =>
        i === index ? { ...s, [field]: field === 'quantity' ? Number(value) : value } : s
      ),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        name: form.name,
        basePrice: Number(form.basePrice),
        rules: {
          proteinGrams: Number(form.proteinGrams),
          baseGrams: Number(form.baseGrams),
          maxVegetables: Number(form.maxVegetables),
          maxSauces: Number(form.maxSauces),
          maxToppings: Number(form.maxToppings),
        },
        allowedProteinTiers: form.allowedProteinTiers,
        supplies: form.supplies.filter((s) => s.supply),
        isActive: form.isActive,
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
          {isEdit ? 'Editar tipo de poke' : 'Nuevo tipo de poke'}
        </h3>

        {error && (
          <div className="bg-error-light text-error text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-negro mb-1">Nombre</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                placeholder="Ej: Regular"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-negro mb-1">Precio base</label>
              <input
                name="basePrice"
                type="number"
                value={form.basePrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
              />
            </div>
          </div>

          <fieldset className="border border-gris-border rounded-xl p-3">
            <legend className="text-xs font-semibold text-gris uppercase tracking-wide px-1">Reglas</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gris mb-1">Proteina (g)</label>
                <input
                  name="proteinGrams"
                  type="number"
                  value={form.proteinGrams}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gris-border rounded-lg text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gris mb-1">Base (g)</label>
                <input
                  name="baseGrams"
                  type="number"
                  value={form.baseGrams}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gris-border rounded-lg text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gris mb-1">Max vegetales</label>
                <input
                  name="maxVegetables"
                  type="number"
                  value={form.maxVegetables}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gris-border rounded-lg text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-gris mb-1">Max salsas</label>
                <input
                  name="maxSauces"
                  type="number"
                  value={form.maxSauces}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gris-border rounded-lg text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gris mb-1">Max toppings</label>
                <input
                  name="maxToppings"
                  type="number"
                  value={form.maxToppings}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gris-border rounded-lg text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                />
              </div>
            </div>
          </fieldset>

          <div>
            <label className="block text-sm font-medium text-negro mb-2">Tiers permitidos</label>
            <div className="flex gap-3">
              {['base', 'premium'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleTierToggle(tier)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
                    ${form.allowedProteinTiers.includes(tier)
                      ? 'bg-naranja text-white'
                      : 'bg-gris-light text-gris hover:bg-gris-border'
                    }
                  `}
                >
                  {tier === 'premium' ? 'Premium' : 'Base'}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="border border-gris-border rounded-xl p-3">
            <legend className="text-xs font-semibold text-gris uppercase tracking-wide px-1">Insumos asociados</legend>

            {form.supplies.length === 0 && (
              <p className="text-sm text-gris py-2 text-center">Sin insumos asociados</p>
            )}

            <div className="space-y-2">
              {form.supplies.map((entry, idx) => {
                const selectedIds = form.supplies
                  .filter((_, i) => i !== idx)
                  .map((s) => s.supply);

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={entry.supply}
                      onChange={(e) => handleSupplyChange(idx, 'supply', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gris-border rounded-lg text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none bg-white transition-all"
                    >
                      <option value="">Seleccionar insumo...</option>
                      {availableSupplies
                        .filter((s) => s.isActive !== false)
                        .filter((s) => !selectedIds.includes(s._id))
                        .map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      {entry.supply && (() => {
                        const current = availableSupplies.find((s) => s._id === entry.supply);
                        if (current && selectedIds.includes(current._id)) {
                          return <option value={current._id}>{current.name}</option>;
                        }
                        return null;
                      })()}
                    </select>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={entry.quantity}
                      onChange={(e) => handleSupplyChange(idx, 'quantity', e.target.value)}
                      className="w-20 px-3 py-2 border border-gris-border rounded-lg text-sm text-center focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
                      title="Cantidad por poke"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSupply(idx)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gris hover:bg-error-light hover:text-error transition-colors cursor-pointer"
                      title="Quitar"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {availableSupplies.filter((s) => s.isActive !== false).length > form.supplies.length && (
              <button
                type="button"
                onClick={handleAddSupply}
                className="mt-2 text-sm text-naranja font-medium hover:text-naranja-dark transition-colors cursor-pointer"
              >
                + Agregar insumo
              </button>
            )}
          </fieldset>

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
            {isEdit ? 'Guardar cambios' : 'Crear tipo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

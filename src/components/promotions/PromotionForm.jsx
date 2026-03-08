import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import * as promoApi from '../../api/promotions';

const INITIAL_STATE = {
  name: '',
  description: '',
  promoPrice: '',
  active: false,
  displayOrder: 0,
  pokeTypes: [], // [{ pokeType: id, quantity: 1 }]
  allowedProteins: [], // [id, id, ...]
};

export default function PromotionForm({ open, onClose, onSubmit, promotion = null }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pokeTypes, setPokeTypes] = useState([]);
  const [proteins, setProteins] = useState([]);

  const isEdit = !!promotion;

  useEffect(() => {
    if (!open) return;
    promoApi.getPokeTypes()
      .then((res) => setPokeTypes(res.data || []))
      .catch(() => setError('Error cargando tipos de poke'));
    promoApi.getItems()
      .then((res) => {
        const items = res.data || [];
        setProteins(items.filter((i) => i.category?.type === 'protein' || i.tier));
      })
      .catch(() => setError('Error cargando proteínas'));
  }, [open]);

  useEffect(() => {
    if (promotion) {
      setForm({
        name: promotion.name || '',
        description: promotion.description || '',
        promoPrice: promotion.promoPrice ?? '',
        active: promotion.active ?? false,
        displayOrder: promotion.displayOrder ?? 0,
        pokeTypes: (promotion.pokeTypes || []).map((pt) => ({
          pokeType: pt.pokeType?._id || pt.pokeType,
          quantity: pt.quantity,
        })),
        allowedProteins: (promotion.allowedProteins || []).map((p) => p._id || p),
      });
    } else {
      setForm(INITIAL_STATE);
    }
    setError(null);
  }, [promotion, open]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handlePokeTypeChange(index, field, value) {
    setForm((prev) => {
      const updated = [...prev.pokeTypes];
      updated[index] = { ...updated[index], [field]: field === 'quantity' ? Number(value) : value };
      return { ...prev, pokeTypes: updated };
    });
  }

  function addPokeTypeRow() {
    setForm((prev) => ({
      ...prev,
      pokeTypes: [...prev.pokeTypes, { pokeType: '', quantity: 1 }],
    }));
  }

  function removePokeTypeRow(index) {
    setForm((prev) => ({
      ...prev,
      pokeTypes: prev.pokeTypes.filter((_, i) => i !== index),
    }));
  }

  function toggleProtein(id) {
    setForm((prev) => {
      const has = prev.allowedProteins.includes(id);
      return {
        ...prev,
        allowedProteins: has
          ? prev.allowedProteins.filter((p) => p !== id)
          : [...prev.allowedProteins, id],
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        name: form.name,
        description: form.description,
        promoPrice: Number(form.promoPrice),
        active: form.active,
        displayOrder: Number(form.displayOrder),
        pokeTypes: form.pokeTypes.filter((pt) => pt.pokeType),
        allowedProteins: form.allowedProteins,
      };
      if (!isEdit) {
        data.slug = form.name
          .toLowerCase()
          .trim()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = 'w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all';
  const selectClass = inputClass + ' bg-white';

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-lg mx-4">
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="font-heading font-bold text-lg text-negro mb-4">
          {isEdit ? 'Editar promoción' : 'Nueva promoción'}
        </h3>

        {error && (
          <div className="bg-error-light text-error text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-negro mb-1">Nombre</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Ej: 2 Ceviche por 15€" />
          </div>

          <div>
            <label className="block text-sm font-medium text-negro mb-1">Descripción</label>
            <input name="description" value={form.description} onChange={handleChange} className={inputClass} placeholder="Descripción opcional" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-negro mb-1">Precio promo (€)</label>
              <input name="promoPrice" type="number" min="0" step="0.01" value={form.promoPrice} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-negro mb-1">Orden</label>
              <input name="displayOrder" type="number" min="0" value={form.displayOrder} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* Poke Types */}
          <div>
            <label className="block text-sm font-medium text-negro mb-2">Tipos de poke incluidos</label>
            <div className="space-y-2">
              {form.pokeTypes.map((pt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={pt.pokeType} onChange={(e) => handlePokeTypeChange(i, 'pokeType', e.target.value)} className={selectClass + ' flex-1'}>
                    <option value="">Seleccionar tipo...</option>
                    {pokeTypes.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.basePrice}€)</option>
                    ))}
                  </select>
                  <input type="number" min="1" value={pt.quantity} onChange={(e) => handlePokeTypeChange(i, 'quantity', e.target.value)} className={inputClass + ' w-20'} />
                  <button type="button" onClick={() => removePokeTypeRow(i)} className="text-error hover:text-error/80 cursor-pointer p-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addPokeTypeRow} className="mt-2 text-sm text-naranja font-medium hover:text-naranja-dark cursor-pointer">
              + Agregar tipo de poke
            </button>
          </div>

          {/* Allowed Proteins */}
          <div>
            <label className="block text-sm font-medium text-negro mb-2">
              Proteínas permitidas
              <span className="text-gris font-normal ml-1">(vacío = todas)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {proteins.map((p) => (
                <label key={p._id} className="flex items-center gap-2 p-2 rounded-lg border border-gris-border hover:bg-gris-light/50 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={form.allowedProteins.includes(p._id)}
                    onChange={() => toggleProtein(p._id)}
                    className="w-4 h-4 rounded accent-naranja"
                  />
                  <span className="text-sm text-negro">{p.name}</span>
                  {p.tier && <span className="text-[10px] text-gris uppercase">{p.tier}</span>}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input name="active" type="checkbox" checked={form.active} onChange={handleChange} className="w-4 h-4 rounded accent-naranja" />
            <label className="text-sm text-negro">Activa</label>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Guardar cambios' : 'Crear promoción'}</Button>
        </div>
      </form>
    </Modal>
  );
}

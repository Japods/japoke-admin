import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { getStockableItems, getLatestRates } from '../../api/purchases';

const UNITS = ['kg', 'g', 'l', 'ml', 'unidad', 'caja', 'paquete'];

const EMPTY_LINE = {
  name: '',
  quantity: '',
  unit: 'kg',
  unitPriceBS: '',
  subtotalBS: '',
  refModel: null,
  refId: null,
};

const INITIAL_STATE = {
  date: new Date().toISOString().split('T')[0],
  supplier: '',
  invoiceNumber: '',
  description: '',
  totalBS: '',
  bcvRate: '',
  usdtRate: '',
  notes: '',
};

// Convierte la cantidad a la unidad base (kg, l, o unidad)
function toBaseUnit(qty, unit) {
  if (unit === 'g') return qty / 1000;
  if (unit === 'ml') return qty / 1000;
  return qty;
}

// Calcula el precio unitario base (Bs./kg, Bs./l, Bs./unidad) desde subtotal
function calcUnitPrice(subtotalBS, qty, unit) {
  const s = parseFloat(subtotalBS);
  const q = parseFloat(qty);
  if (!s || !q || q === 0) return null;
  const base = toBaseUnit(q, unit);
  if (base === 0) return null;
  return (s / base).toFixed(2);
}

// Etiqueta de la unidad base
function priceLabelForUnit(unit) {
  if (unit === 'g' || unit === 'kg') return 'Bs./kg';
  if (unit === 'ml' || unit === 'l') return 'Bs./l';
  return `Bs./${unit}`;
}

function calcTotals(totalBS, bcvRate, usdtRate) {
  const bs = parseFloat(totalBS);
  const bcv = parseFloat(bcvRate);
  const usdt = parseFloat(usdtRate);
  if (!bs || !bcv || !usdt) return { usd: null, usdtAmt: null };
  return {
    usd: `$${(bs / bcv).toFixed(2)}`,
    usdtAmt: `${(bs / usdt).toFixed(2)} USDT`,
  };
}

export default function PurchaseForm({ open, onClose, onSubmit, purchase = null }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stockable, setStockable] = useState({ items: [], supplies: [] });

  const isEdit = !!purchase;
  const { usd, usdtAmt } = calcTotals(form.totalBS, form.bcvRate, form.usdtRate);

  // Cargar items/insumos stockables y tasas actuales al abrir
  useEffect(() => {
    if (!open) return;

    getStockableItems()
      .then((res) => setStockable(res.data || { items: [], supplies: [] }))
      .catch(() => {});

    // Pre-llenar tasas solo en modo creacion (no edicion)
    if (!purchase) {
      getLatestRates()
        .then((res) => {
          const d = res?.data ?? res;
          const bcv = d?.dolar_bcv?.rate;
          const usdt = d?.dolar_paralelo?.rate;
          setForm((prev) => ({
            ...prev,
            ...(bcv ? { bcvRate: Number(bcv).toFixed(2) } : {}),
            ...(usdt ? { usdtRate: Number(usdt).toFixed(2) } : {}),
          }));
        })
        .catch(() => {});
    }
  }, [open, purchase]);

  useEffect(() => {
    if (purchase) {
      setForm({
        date: purchase.date ? purchase.date.split('T')[0] : new Date().toISOString().split('T')[0],
        supplier: purchase.supplier || '',
        invoiceNumber: purchase.invoiceNumber || '',
        description: purchase.description || '',
        totalBS: purchase.totalBS || '',
        bcvRate: purchase.bcvRate || '',
        usdtRate: purchase.usdtRate || '',
        notes: purchase.notes || '',
      });
      setLines(
        purchase.items?.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          unitPriceBS: i.unitPriceBS,
          subtotalBS: i.subtotalBS,
          refModel: i.refModel || null,
          refId: i.refId || null,
        })) || [],
      );
    } else {
      setForm(INITIAL_STATE);
      setLines([]);
    }
    setError(null);
  }, [purchase, open]);

  // Auto-calcula totalBS desde las lineas
  useEffect(() => {
    if (lines.length === 0) return;
    const total = lines.reduce((acc, l) => acc + (parseFloat(l.subtotalBS) || 0), 0);
    if (total > 0) setForm((prev) => ({ ...prev, totalBS: total.toFixed(2) }));
  }, [lines]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function addLine() {
    setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  }

  function removeLine(idx) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateLine(idx, field, value) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        const updated = { ...line, [field]: value };
        // unitPriceBS siempre derivado del subtotal
        const qty = field === 'quantity' ? value : line.quantity;
        const unit = field === 'unit' ? value : line.unit;
        const sub = field === 'subtotalBS' ? value : line.subtotalBS;
        updated.unitPriceBS = calcUnitPrice(sub, qty, unit) ?? line.unitPriceBS;
        return updated;
      }),
    );
  }

  // Al seleccionar un item/insumo del catalogo, rellena nombre y unidad automáticamente
  function handleCatalogSelect(idx, refModel, refId) {
    if (!refModel || !refId) {
      updateLine(idx, 'refModel', null);
      updateLine(idx, 'refId', null);
      return;
    }

    const list = refModel === 'Item' ? stockable.items : stockable.supplies;
    const found = list.find((x) => x._id === refId);

    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        return {
          ...line,
          refModel,
          refId,
          name: found?.name || line.name,
          unit: found?.trackingUnit || line.unit,
        };
      }),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validLines = lines
        .filter((l) => l.name && l.quantity && l.subtotalBS)
        .map((l) => ({
          name: l.name,
          quantity: Number(l.quantity),
          unit: l.unit,
          subtotalBS: Number(l.subtotalBS),
          unitPriceBS: Number(calcUnitPrice(l.subtotalBS, l.quantity, l.unit) ?? 0),
          refModel: l.refModel || null,
          refId: l.refId || null,
        }));

      const payload = {
        date: form.date,
        supplier: form.supplier,
        invoiceNumber: form.invoiceNumber,
        description: form.description,
        totalBS: Number(form.totalBS),
        bcvRate: Number(form.bcvRate),
        usdtRate: Number(form.usdtRate),
        notes: form.notes,
        items: validLines,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const allStockable = [
    ...stockable.items.map((x) => ({ ...x, refModel: 'Item', label: `[Item] ${x.name}` })),
    ...stockable.supplies.map((x) => ({ ...x, refModel: 'Supply', label: `[Insumo] ${x.name}` })),
  ];

  return (
    <Modal open={open} onClose={onClose} className="w-full max-w-5xl mx-4">
      <form onSubmit={handleSubmit} className="p-6">
        <h3 className="font-heading font-bold text-lg text-negro mb-5">
          {isEdit ? 'Editar compra' : 'Registrar compra'}
        </h3>

        {error && (
          <div className="bg-error-light text-error text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Datos generales */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gris uppercase tracking-wide mb-1">Fecha</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gris uppercase tracking-wide mb-1">Proveedor</label>
            <input
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              required
              placeholder="Ej: Abasto El Tigre"
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gris uppercase tracking-wide mb-1">N° Factura</label>
            <input
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              placeholder="Opcional"
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gris uppercase tracking-wide mb-1">Descripcion</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opcional"
              className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all"
            />
          </div>
        </div>

        {/* Lineas de items */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gris uppercase tracking-wide">Detalle de productos</label>
            <button
              type="button"
              onClick={addLine}
              className="text-xs text-naranja font-semibold hover:text-naranja-dark transition-colors cursor-pointer"
            >
              + Agregar linea
            </button>
          </div>

          {lines.length > 0 && (
            <div className="border border-gris-border rounded-xl overflow-hidden mb-2">
              {/* Cabecera */}
              <div className="grid grid-cols-[1.8fr_1.8fr_1fr_1fr_1.2fr_1.2fr_auto] gap-0 bg-gris-light px-3 py-2 border-b border-gris-border">
                <span className="text-xs font-semibold text-gris">Vinculo catalogo</span>
                <span className="text-xs font-semibold text-gris">Producto</span>
                <span className="text-xs font-semibold text-gris">Cantidad</span>
                <span className="text-xs font-semibold text-gris">Unidad</span>
                <span className="text-xs font-semibold text-gris">Total Bs. pagado</span>
                <span className="text-xs font-semibold text-gris">Precio base</span>
                <span />
              </div>

              {lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-[1.8fr_1.8fr_1fr_1fr_1.2fr_1.2fr_auto] gap-1 px-2 py-2 border-t border-gris-border/50 ${
                    line.refId ? 'bg-naranja-light/20' : ''
                  }`}
                >
                  {/* Selector catalogo */}
                  <div className="flex items-center gap-1">
                    {line.refId && (
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${line.refModel === 'Item' ? 'bg-dorado' : 'bg-info'}`} title={line.refModel} />
                    )}
                    <select
                      value={line.refId ? `${line.refModel}:${line.refId}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) { handleCatalogSelect(idx, null, null); return; }
                        const [model, id] = val.split(':');
                        handleCatalogSelect(idx, model, id);
                      }}
                      className="w-full px-1.5 py-1.5 border border-gris-border rounded-lg text-xs bg-white focus:ring-1 focus:ring-naranja/30 focus:border-naranja outline-none"
                    >
                      <option value="">Gasto libre</option>
                      {stockable.items.length > 0 && (
                        <optgroup label="Items del catalogo">
                          {stockable.items.map((item) => (
                            <option key={item._id} value={`Item:${item._id}`}>
                              {item.name}{item.isTrackable ? ` (stock: ${item.currentStock} ${item.trackingUnit})` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {stockable.supplies.length > 0 && (
                        <optgroup label="Insumos">
                          {stockable.supplies.map((s) => (
                            <option key={s._id} value={`Supply:${s._id}`}>
                              {s.name} ({s.currentStock} {s.trackingUnit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <input
                    value={line.name}
                    onChange={(e) => updateLine(idx, 'name', e.target.value)}
                    placeholder="Nombre"
                    required
                    className="px-2 py-1.5 border border-gris-border rounded-lg text-xs focus:ring-1 focus:ring-naranja/30 focus:border-naranja outline-none"
                  />
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                    min="0"
                    step="any"
                    placeholder="0"
                    required
                    className="px-2 py-1.5 border border-gris-border rounded-lg text-xs focus:ring-1 focus:ring-naranja/30 focus:border-naranja outline-none"
                  />
                  <select
                    value={line.unit}
                    onChange={(e) => updateLine(idx, 'unit', e.target.value)}
                    className="px-1 py-1.5 border border-gris-border rounded-lg text-xs bg-white focus:ring-1 focus:ring-naranja/30 focus:border-naranja outline-none"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  {/* Subtotal — dos inputs sincronizados: Bs. ↔ USD */}
                  <div className="flex flex-col gap-0.5">
                    <div className="relative">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-gris pointer-events-none">Bs.</span>
                      <input
                        type="number"
                        value={line.subtotalBS}
                        onChange={(e) => updateLine(idx, 'subtotalBS', e.target.value)}
                        min="0"
                        step="any"
                        placeholder="0.00"
                        required
                        className="w-full pl-6 pr-1 py-1.5 border border-naranja/60 rounded-lg text-xs focus:ring-1 focus:ring-naranja/40 focus:border-naranja outline-none font-medium"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] text-dorado font-bold pointer-events-none">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={(() => {
                          const bs = parseFloat(line.subtotalBS);
                          const bcv = parseFloat(form.bcvRate);
                          if (!bs || !bcv || bcv === 0) return '';
                          return (bs / bcv).toFixed(2);
                        })()}
                        onChange={(e) => {
                          const usd = parseFloat(e.target.value);
                          const bcv = parseFloat(form.bcvRate);
                          if (!isNaN(usd) && !isNaN(bcv) && bcv > 0) {
                            updateLine(idx, 'subtotalBS', (usd * bcv).toFixed(2));
                          } else if (e.target.value === '') {
                            updateLine(idx, 'subtotalBS', '');
                          }
                        }}
                        className="w-full pl-5 pr-1 py-1 border border-dorado/40 rounded-lg text-[10px] bg-dorado-light focus:ring-1 focus:ring-dorado/30 focus:border-dorado outline-none text-dorado font-semibold"
                      />
                    </div>
                  </div>
                  {/* Precio base — calculado automáticamente, solo lectura */}
                  <div className="flex flex-col gap-0.5 justify-center">
                    <div className="px-2 py-1.5 border border-gris-border/50 rounded-lg text-xs bg-gris-light text-gris-dark text-right tabular-nums">
                      {calcUnitPrice(line.subtotalBS, line.quantity, line.unit)
                        ? Number(calcUnitPrice(line.subtotalBS, line.quantity, line.unit)).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : '—'}
                    </div>
                    <span className="text-[10px] text-gris text-center leading-none">
                      {priceLabelForUnit(line.unit)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="px-1.5 text-error hover:text-error/70 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Leyenda */}
              <div className="px-3 py-2 bg-gris-light/50 border-t border-gris-border flex items-center gap-4 text-xs text-gris">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-dorado" /> Item catalogo (actualiza stock)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-info" /> Insumo (actualiza stock)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gris-border" /> Gasto libre (solo financiero)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tasas y totales */}
        <div className="bg-dorado-light rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-dorado uppercase tracking-wide mb-3">Montos y tasas de cambio</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-2">
              <div>
                <label className="block text-xs text-gris mb-1">Total Bs. pagado</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gris">Bs.</span>
                  <input
                    name="totalBS"
                    type="number"
                    value={form.totalBS}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                    required
                    min="0"
                    step="any"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gris-border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gris mb-1">
                  Equivalente en USD
                  <span className="ml-1 text-[10px] text-dorado font-medium">· al BCV del día</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-dorado font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={(() => {
                      const bs = parseFloat(form.totalBS);
                      const bcv = parseFloat(form.bcvRate);
                      if (!bs || !bcv || bcv === 0) return '';
                      return (bs / bcv).toFixed(2);
                    })()}
                    onChange={(e) => {
                      const usd = parseFloat(e.target.value);
                      const bcv = parseFloat(form.bcvRate);
                      if (!isNaN(usd) && !isNaN(bcv) && bcv > 0) {
                        setForm((prev) => ({ ...prev, totalBS: (usd * bcv).toFixed(2) }));
                      } else if (e.target.value === '') {
                        setForm((prev) => ({ ...prev, totalBS: '' }));
                      }
                    }}
                    className="w-full pl-7 pr-3 py-2 border border-dorado/50 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-dorado/30 focus:border-dorado outline-none transition-all bg-dorado-light"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gris mb-1">
                Tasa BCV (Bs. x $1)
                <span className="ml-1 text-[10px] text-dorado font-medium">· auto</span>
              </label>
              <input
                name="bcvRate"
                type="number"
                value={form.bcvRate}
                onChange={handleChange}
                required
                min="0"
                step="any"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gris mb-1">
                Tasa USDT (Bs. x 1 USDT)
                <span className="ml-1 text-[10px] text-dorado font-medium">· auto</span>
              </label>
              <input
                name="usdtRate"
                type="number"
                value={form.usdtRate}
                onChange={handleChange}
                required
                min="0"
                step="any"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all bg-white"
              />
            </div>
          </div>

          {usd && usdtAmt && (
            <div className="flex gap-6 mt-3 pt-3 border-t border-dorado/20">
              <div>
                <p className="text-xs text-gris">Equivale en USD (BCV)</p>
                <p className="font-heading font-bold text-dorado">{usd}</p>
              </div>
              <div>
                <p className="text-xs text-gris">Equivale en USDT</p>
                <p className="font-heading font-bold text-naranja">{usdtAmt}</p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gris uppercase tracking-wide mb-1">Notas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Opcional"
            className="w-full px-3 py-2 border border-gris-border rounded-xl text-sm focus:ring-2 focus:ring-naranja/30 focus:border-naranja outline-none transition-all resize-none"
          />
        </div>

        {/* Aviso de stock */}
        {lines.some((l) => l.refId) && (
          <div className="mt-3 flex items-start gap-2 bg-naranja-light border border-naranja/20 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 text-naranja mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-naranja-dark">
              {lines.filter((l) => l.refId).length} linea(s) vinculada(s) actualizaran el stock al guardar.
              El costo unitario se recalculara en USD usando la tasa BCV.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-5">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Guardar cambios' : 'Registrar compra'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

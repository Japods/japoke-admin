import { formatCurrency } from '../../utils/formatters';

function IngredientList({ label, items, showQuantity = false }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-2">
      <p className="text-xs font-semibold text-gris uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gris-light rounded-md text-xs text-negro"
          >
            {item.name}
            {showQuantity && item.quantity && (
              <span className="text-gris">({item.quantity}g)</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BowlDetail({ bowl, index }) {
  return (
    <div className="bg-gris-light/50 rounded-xl p-3 border border-gris-border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-heading font-bold text-sm text-negro">
          Bowl {index + 1} — {bowl.pokeTypeName}
        </h4>
        <span className="text-sm font-semibold text-naranja">
          {formatCurrency(bowl.itemTotal)}
        </span>
      </div>

      <IngredientList label="Proteinas" items={bowl.proteins} showQuantity />
      <IngredientList label="Bases" items={bowl.bases} showQuantity />
      <IngredientList label="Vegetales" items={bowl.vegetables} />
      <IngredientList label="Salsas" items={bowl.sauces} />
      <IngredientList label="Toppings" items={bowl.toppings} />

      {bowl.extras && bowl.extras.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gris-border">
          <p className="text-xs font-semibold text-gris uppercase tracking-wide mb-1">Extras</p>
          {bowl.extras.map((extra, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-0.5">
              <span className="text-negro">
                {extra.name}
                {extra.quantity > 1 && <span className="text-gris"> x{extra.quantity}</span>}
              </span>
              <span className="text-gris font-medium">+{formatCurrency(extra.subtotal)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORY_LABELS = {
  protein: 'Proteina',
  base: 'Base',
  vegetable: 'Vegetal',
  sauce: 'Salsa',
  topping: 'Topping',
};

const CATEGORY_COLORS = {
  protein: 'bg-error-light text-error',
  base: 'bg-info-light text-info',
  vegetable: 'bg-success-light text-success',
  sauce: 'bg-warning-light text-warning',
  topping: 'bg-naranja-light text-naranja',
};

export default function PopularIngredients({ data }) {
  const items = data?.top || [];

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gris-border p-6">
        <h3 className="font-heading font-semibold text-negro mb-4">Ingredientes Populares</h3>
        <p className="text-sm text-gris text-center py-4">Sin datos aun</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gris-border p-6">
      <h3 className="font-heading font-semibold text-negro mb-4">Top 10 Ingredientes</h3>
      <div className="space-y-2">
        {items.slice(0, 10).map((item, idx) => (
          <div
            key={`${item.name}-${item.category}`}
            className="flex items-center justify-between py-1.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-gris w-5 text-right">{idx + 1}</span>
              <span className="text-sm font-medium text-negro">{item.name}</span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[item.category] || 'bg-gris-light text-gris'}`}
              >
                {CATEGORY_LABELS[item.category] || item.category}
              </span>
            </div>
            <span className="text-sm font-semibold text-naranja">{item.count}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}

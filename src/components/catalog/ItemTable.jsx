import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { formatCurrency } from '../../utils/formatters';

export default function ItemTable({ items, loading, onEdit, onToggle }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-naranja" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gris text-sm">No hay items creados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gris-border">
            <th className="text-left py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Nombre</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Categoria</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Tier</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Porcion</th>
            <th className="text-right py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Precio extra</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Disponible</th>
            <th className="text-right py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-b border-gris-border/50 hover:bg-gris-light/50 transition-colors">
              <td className="py-3 px-3 font-medium text-negro">{item.name}</td>
              <td className="py-3 px-3 text-gris">
                {item.category?.name || '—'}
              </td>
              <td className="py-3 px-3 text-center">
                {item.tier ? (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      item.tier === 'premium'
                        ? 'bg-dorado-light text-dorado'
                        : 'bg-gris-light text-gris'
                    }`}
                  >
                    {item.tier === 'premium' ? 'Premium' : 'Base'}
                  </span>
                ) : (
                  <span className="text-gris">—</span>
                )}
              </td>
              <td className="py-3 px-3 text-center text-gris">
                {item.portionSize ? `${item.portionSize}g` : '—'}
              </td>
              <td className="py-3 px-3 text-right text-gris">
                {item.extraPrice ? formatCurrency(item.extraPrice) : '—'}
              </td>
              <td className="py-3 px-3 text-center">
                <button
                  onClick={() => onToggle(item)}
                  className={`
                    relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer
                    ${item.isAvailable ? 'bg-success' : 'bg-gris-border'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                      ${item.isAvailable ? 'translate-x-5' : 'translate-x-0.5'}
                    `}
                  />
                </button>
              </td>
              <td className="py-3 px-3 text-right">
                <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                  Editar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

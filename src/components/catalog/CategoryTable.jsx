import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { CATEGORY_TYPES } from '../../utils/constants';

function getCategoryTypeLabel(type) {
  return CATEGORY_TYPES.find((t) => t.value === type)?.label || type;
}

export default function CategoryTable({ categories, loading, onEdit, onToggle }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-naranja" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gris text-sm">No hay categorias creadas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gris-border">
            <th className="text-left py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Nombre</th>
            <th className="text-left py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Tipo</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Orden</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Activo</th>
            <th className="text-right py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat._id} className="border-b border-gris-border/50 hover:bg-gris-light/50 transition-colors">
              <td className="py-3 px-3 font-medium text-negro">{cat.name}</td>
              <td className="py-3 px-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-dorado-light text-dorado text-xs font-medium">
                  {getCategoryTypeLabel(cat.type)}
                </span>
              </td>
              <td className="py-3 px-3 text-center text-gris">{cat.displayOrder}</td>
              <td className="py-3 px-3 text-center">
                <button
                  onClick={() => onToggle(cat)}
                  className={`
                    relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer
                    ${cat.isActive ? 'bg-success' : 'bg-gris-border'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                      ${cat.isActive ? 'translate-x-5' : 'translate-x-0.5'}
                    `}
                  />
                </button>
              </td>
              <td className="py-3 px-3 text-right">
                <Button size="sm" variant="ghost" onClick={() => onEdit(cat)}>
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

import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { formatCurrency } from '../../utils/formatters';

export default function PokeTypeTable({ pokeTypes, loading, onEdit, onToggle }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-naranja" />
      </div>
    );
  }

  if (pokeTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gris text-sm">No hay tipos de poke creados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gris-border">
            <th className="text-left py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Nombre</th>
            <th className="text-right py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Precio base</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Reglas</th>
            <th className="text-center py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Activo</th>
            <th className="text-right py-3 px-3 text-xs font-semibold text-gris uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pokeTypes.map((pt) => (
            <tr key={pt._id} className="border-b border-gris-border/50 hover:bg-gris-light/50 transition-colors">
              <td className="py-3 px-3 font-medium text-negro">{pt.name}</td>
              <td className="py-3 px-3 text-right text-naranja font-semibold">
                {formatCurrency(pt.basePrice)}
              </td>
              <td className="py-3 px-3 text-center">
                <div className="flex flex-wrap gap-1 justify-center">
                  {pt.rules && (
                    <>
                      <span className="px-1.5 py-0.5 bg-gris-light rounded text-xs text-gris">
                        Prot: {pt.rules.proteinGrams}g
                      </span>
                      <span className="px-1.5 py-0.5 bg-gris-light rounded text-xs text-gris">
                        Base: {pt.rules.baseGrams}g
                      </span>
                      <span className="px-1.5 py-0.5 bg-gris-light rounded text-xs text-gris">
                        Veg: {pt.rules.maxVegetables}
                      </span>
                    </>
                  )}
                </div>
              </td>
              <td className="py-3 px-3 text-center">
                <button
                  onClick={() => onToggle(pt)}
                  className={`
                    relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer
                    ${pt.isActive ? 'bg-success' : 'bg-gris-border'}
                  `}
                >
                  <span
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                      ${pt.isActive ? 'translate-x-5' : 'translate-x-0.5'}
                    `}
                  />
                </button>
              </td>
              <td className="py-3 px-3 text-right">
                <Button size="sm" variant="ghost" onClick={() => onEdit(pt)}>
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

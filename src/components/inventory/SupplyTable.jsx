import { formatCurrency } from '../../utils/formatters';

export default function SupplyTable({ supplies, onEdit, onToggle }) {
  if (!supplies || supplies.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gris">No hay insumos registrados. Crea uno para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gris-light/50 border-b border-gris-border">
            <th className="text-left py-3 px-4 text-gris font-medium">Nombre</th>
            <th className="text-left py-3 px-4 text-gris font-medium">Descripcion</th>
            <th className="text-right py-3 px-4 text-gris font-medium">Costo Unit.</th>
            <th className="text-right py-3 px-4 text-gris font-medium">Stock</th>
            <th className="text-right py-3 px-4 text-gris font-medium">Uso/Poke</th>
            <th className="text-center py-3 px-4 text-gris font-medium">Activo</th>
            <th className="text-center py-3 px-4 text-gris font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {supplies.map((supply) => (
            <tr key={supply._id} className="border-b border-gris-border/50 last:border-0 hover:bg-gris-light/30">
              <td className="py-3 px-4 font-medium text-negro">{supply.name}</td>
              <td className="py-3 px-4 text-gris text-xs">{supply.description || '-'}</td>
              <td className="py-3 px-4 text-right text-negro">{formatCurrency(supply.unitCost)}</td>
              <td className="py-3 px-4 text-right font-semibold text-negro">
                {supply.currentStock} {supply.trackingUnit}
              </td>
              <td className="py-3 px-4 text-right text-gris">{supply.usagePerPoke}</td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onToggle(supply)}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${supply.isActive ? 'bg-success' : 'bg-gris-border'}`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${supply.isActive ? 'translate-x-5' : 'translate-x-0.5'}`}
                  />
                </button>
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => onEdit(supply)}
                  className="text-xs text-naranja hover:text-naranja/80 font-medium cursor-pointer"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

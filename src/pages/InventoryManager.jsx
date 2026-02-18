import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useSupplies } from '../hooks/useSupplies';
import StockTable from '../components/inventory/StockTable';
import PurchaseForm from '../components/inventory/PurchaseForm';
import SupplyTable from '../components/inventory/SupplyTable';
import SupplyForm from '../components/inventory/SupplyForm';
import MovementHistory from '../components/inventory/MovementHistory';
import AdjustmentForm from '../components/inventory/AdjustmentForm';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const TABS = [
  { id: 'stock', label: 'Stock' },
  { id: 'purchases', label: 'Compras' },
  { id: 'supplies', label: 'Insumos' },
  { id: 'history', label: 'Historial' },
];

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState('stock');
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [supplyFormOpen, setSupplyFormOpen] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);

  const { inventory, movements, loading, error, purchase, adjust, refetchMovements } = useInventory();
  const { supplies, create: createSupply, update: updateSupply } = useSupplies();

  function openAdjust(refModel, item) {
    setAdjustTarget({ refModel, item });
    setAdjustOpen(true);
  }

  function openEditSupply(supply) {
    setEditingSupply(supply);
    setSupplyFormOpen(true);
  }

  function openCreateSupply() {
    setEditingSupply(null);
    setSupplyFormOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-naranja" />
          <p className="text-sm text-gris">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-error font-medium mb-1">Error al cargar inventario</p>
          <p className="text-sm text-gris">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tabs + actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gris-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-naranja text-white'
                  : 'text-gris hover:text-negro hover:bg-gris-light'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {activeTab === 'stock' && (
            <Button onClick={() => setPurchaseOpen(true)} size="sm">
              + Registrar Compra
            </Button>
          )}
          {activeTab === 'supplies' && (
            <Button onClick={openCreateSupply} size="sm">
              + Nuevo Insumo
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gris-border overflow-hidden">
        {activeTab === 'stock' && (
          <StockTable
            items={inventory.items}
            supplies={inventory.supplies}
            onAdjust={openAdjust}
          />
        )}
        {activeTab === 'purchases' && (
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setPurchaseOpen(true)} size="sm">
                + Registrar Compra
              </Button>
            </div>
            <MovementHistory
              movements={movements.movements.filter((m) => m.type === 'purchase')}
              pagination={movements.pagination}
            />
          </div>
        )}
        {activeTab === 'supplies' && (
          <SupplyTable
            supplies={supplies}
            onEdit={openEditSupply}
            onToggle={async (supply) => {
              await updateSupply(supply._id, { isActive: !supply.isActive });
            }}
          />
        )}
        {activeTab === 'history' && (
          <div className="p-6">
            <MovementHistory
              movements={movements.movements}
              pagination={movements.pagination}
              onPageChange={(page) => refetchMovements({ page })}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <PurchaseForm
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        onSubmit={purchase}
        items={inventory.items}
        supplies={supplies}
      />

      <AdjustmentForm
        open={adjustOpen}
        onClose={() => { setAdjustOpen(false); setAdjustTarget(null); }}
        onSubmit={adjust}
        target={adjustTarget}
      />

      <SupplyForm
        open={supplyFormOpen}
        onClose={() => { setSupplyFormOpen(false); setEditingSupply(null); }}
        onSubmit={async (data) => {
          if (editingSupply) {
            await updateSupply(editingSupply._id, data);
          } else {
            await createSupply(data);
          }
        }}
        supply={editingSupply}
      />
    </div>
  );
}

import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { useItems } from '../hooks/useItems';
import { usePokeTypes } from '../hooks/usePokeTypes';
import { useSupplies } from '../hooks/useSupplies';
import CategoryTable from '../components/catalog/CategoryTable';
import CategoryForm from '../components/catalog/CategoryForm';
import ItemTable from '../components/catalog/ItemTable';
import ItemForm from '../components/catalog/ItemForm';
import PokeTypeTable from '../components/catalog/PokeTypeTable';
import PokeTypeForm from '../components/catalog/PokeTypeForm';
import Button from '../components/ui/Button';

const TABS = [
  { id: 'categories', label: 'Categorias' },
  { id: 'items', label: 'Items' },
  { id: 'pokeTypes', label: 'Tipos de Poke' },
];

export default function CatalogManager() {
  const [activeTab, setActiveTab] = useState('categories');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { categories, loading: catLoading, create: createCat, update: updateCat } = useCategories();
  const { items, loading: itemLoading, create: createItem, update: updateItem } = useItems();
  const { pokeTypes, loading: ptLoading, create: createPt, update: updatePt } = usePokeTypes();
  const { supplies } = useSupplies();

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingItem(null);
  }

  async function handleToggleCategory(cat) {
    await updateCat(cat._id, { isActive: !cat.isActive });
  }

  async function handleToggleItem(item) {
    await updateItem(item._id, { isAvailable: !item.isAvailable });
  }

  async function handleTogglePokeType(pt) {
    await updatePt(pt._id, { isActive: !pt.isActive });
  }

  async function handleCategorySubmit(data) {
    if (editingItem) {
      await updateCat(editingItem._id, data);
    } else {
      await createCat(data);
    }
  }

  async function handleItemSubmit(data) {
    if (editingItem) {
      await updateItem(editingItem._id, data);
    } else {
      await createItem(data);
    }
  }

  async function handlePokeTypeSubmit(data) {
    if (editingItem) {
      await updatePt(editingItem._id, data);
    } else {
      await createPt(data);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tabs + New button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gris-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                closeForm();
              }}
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

        <Button onClick={openCreate} size="sm">
          + Nuevo
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gris-border overflow-hidden">
        {activeTab === 'categories' && (
          <CategoryTable
            categories={categories}
            loading={catLoading}
            onEdit={openEdit}
            onToggle={handleToggleCategory}
          />
        )}
        {activeTab === 'items' && (
          <ItemTable
            items={items}
            loading={itemLoading}
            onEdit={openEdit}
            onToggle={handleToggleItem}
          />
        )}
        {activeTab === 'pokeTypes' && (
          <PokeTypeTable
            pokeTypes={pokeTypes}
            loading={ptLoading}
            onEdit={openEdit}
            onToggle={handleTogglePokeType}
          />
        )}
      </div>

      {/* Forms */}
      {activeTab === 'categories' && (
        <CategoryForm
          open={formOpen}
          onClose={closeForm}
          onSubmit={handleCategorySubmit}
          category={editingItem}
        />
      )}
      {activeTab === 'items' && (
        <ItemForm
          open={formOpen}
          onClose={closeForm}
          onSubmit={handleItemSubmit}
          item={editingItem}
          categories={categories}
        />
      )}
      {activeTab === 'pokeTypes' && (
        <PokeTypeForm
          open={formOpen}
          onClose={closeForm}
          onSubmit={handlePokeTypeSubmit}
          pokeType={editingItem}
          availableSupplies={supplies}
        />
      )}
    </div>
  );
}

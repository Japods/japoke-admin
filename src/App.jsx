import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './pages/Dashboard';
import KitchenBoard from './pages/KitchenBoard';
import CatalogManager from './pages/CatalogManager';
import InventoryManager from './pages/InventoryManager';
import PokeWallet from './pages/PokeWallet';
import Purchases from './pages/Purchases';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-gris-light">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kitchen" element={<KitchenBoard />} />
            <Route path="/catalog" element={<CatalogManager />} />
            <Route path="/inventory" element={<InventoryManager />} />
            <Route path="/wallet" element={<PokeWallet />} />
            <Route path="/purchases" element={<Purchases />} />
          </Routes>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

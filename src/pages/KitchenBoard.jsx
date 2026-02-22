import { useState, useCallback, useMemo } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useSound } from '../hooks/useSound';
import KanbanBoard from '../components/kitchen/KanbanBoard';
import OrderListView from '../components/kitchen/OrderListView';
import OrderDetailModal from '../components/kitchen/OrderDetailModal';
import NewOrderAlert from '../components/kitchen/NewOrderAlert';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import { STATUS_CONFIG } from '../utils/constants';

function getTodayParams() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
  return { from, to, limit: 200 };
}

export default function KitchenBoard() {
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrders, setNewOrders] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const { play } = useSound();

  const handleNewOrder = useCallback((orders) => {
    setNewOrders(orders);
    play();
  }, [play]);

  const todayParams = useMemo(() => getTodayParams(), []);

  const { orders, loading, error, advanceStatus, cancelOrder, refetch } = useOrders({
    onNewOrder: handleNewOrder,
    params: todayParams,
  });

  function refetchAll() {
    refetch();
    setListRefreshKey((k) => k + 1);
  }

  function openAdvanceConfirm(order, targetStatus) {
    const config = STATUS_CONFIG[order.status];
    const nextStatus = targetStatus || config?.nextStatus;
    if (!nextStatus) return;

    const nextConfig = STATUS_CONFIG[nextStatus];

    setConfirm({
      title: `${config.nextLabel || 'Mover'} pedido`,
      message: `Mover pedido #${order.orderNumber} a "${nextConfig.label}"?`,
      confirmLabel: config.nextLabel || 'Mover',
      confirmVariant: 'primary',
      action: async () => {
        await advanceStatus(order._id, nextStatus);
        setSelectedOrder(null);
      },
    });
  }

  function openCancelConfirm(order) {
    setConfirm({
      title: 'Cancelar pedido',
      message: `Seguro que desea cancelar el pedido #${order.orderNumber}? Esta accion no se puede deshacer.`,
      confirmLabel: 'Cancelar pedido',
      confirmVariant: 'danger',
      action: async () => {
        await cancelOrder(order._id);
        setSelectedOrder(null);
      },
    });
  }

  function handleDrop(dragData, targetStatus) {
    const order = orders.find((o) => o._id === dragData.orderId);
    if (!order) return;
    openAdvanceConfirm(order, targetStatus);
  }

  async function handleConfirmAction() {
    if (!confirm?.action) return;
    setActionLoading(true);
    try {
      await confirm.action();
      setConfirm(null);
      setListRefreshKey((k) => k + 1);
    } catch {
      // Error handled by hook
    } finally {
      setActionLoading(false);
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-naranja" />
          <p className="text-sm text-gris">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-error font-medium mb-1">Error al cargar pedidos</p>
          <p className="text-sm text-gris">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* View toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gris">
          {viewMode === 'kanban'
            ? `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} hoy`
            : ''}
        </p>
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gris-border">
          <button
            onClick={() => setViewMode('kanban')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
              ${viewMode === 'kanban' ? 'bg-naranja text-white' : 'text-gris hover:text-negro hover:bg-gris-light'}
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer
              ${viewMode === 'list' ? 'bg-naranja text-white' : 'text-gris hover:text-negro hover:bg-gris-light'}
            `}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Lista
          </button>
        </div>
      </div>

      {/* Views */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          orders={orders}
          onAdvance={(order) => openAdvanceConfirm(order)}
          onCancel={openCancelConfirm}
          onOrderClick={setSelectedOrder}
          onDrop={handleDrop}
        />
      ) : (
        <OrderListView
          refreshKey={listRefreshKey}
          onAdvance={(order) => openAdvanceConfirm(order)}
          onCancel={openCancelConfirm}
          onOrderClick={setSelectedOrder}
        />
      )}

      <OrderDetailModal
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAdvance={(order) => openAdvanceConfirm(order)}
        onCancel={openCancelConfirm}
        onRefresh={() => {
          refetchAll();
          setSelectedOrder(null);
        }}
      />

      <NewOrderAlert
        newOrders={newOrders}
        onDismiss={() => setNewOrders([])}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirmAction}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        confirmVariant={confirm?.confirmVariant}
        loading={actionLoading}
      />
    </>
  );
}

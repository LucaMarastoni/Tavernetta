import { useOutletContext } from 'react-router-dom';
import OrdersPanel from '../components/admin/OrdersPanel';

function AdminOrdersPage() {
  const { orders, ordersLoading, ordersError, refreshOrders, updateOrderStatus, updatingOrderId } = useOutletContext();

  return (
    <OrdersPanel
      orders={orders}
      loading={ordersLoading}
      error={ordersError}
      updatingOrderId={updatingOrderId}
      onRefresh={refreshOrders}
      onUpdateStatus={updateOrderStatus}
    />
  );
}

export default AdminOrdersPage;

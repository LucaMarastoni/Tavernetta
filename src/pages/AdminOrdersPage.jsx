import { useOutletContext } from 'react-router-dom';
import OrdersPanel from '../components/admin/OrdersPanel';

function AdminOrdersPage() {
  const { orders, ordersLoading, ordersError, refreshOrders, changeOrderStatus } = useOutletContext();

  return (
    <OrdersPanel
      orders={orders}
      loading={ordersLoading}
      error={ordersError}
      onRefresh={refreshOrders}
      onUpdateOrderStatus={changeOrderStatus}
    />
  );
}

export default AdminOrdersPage;

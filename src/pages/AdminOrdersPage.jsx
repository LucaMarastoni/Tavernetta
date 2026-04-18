import { useOutletContext } from 'react-router-dom';
import OrdersPanel from '../components/admin/OrdersPanel';

function AdminOrdersPage() {
  const { orders, ordersLoading, ordersError, refreshOrders } = useOutletContext();

  return <OrdersPanel orders={orders} loading={ordersLoading} error={ordersError} onRefresh={refreshOrders} />;
}

export default AdminOrdersPage;

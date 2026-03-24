import { useOutletContext } from 'react-router-dom';
import OrdersPanel from '../components/admin/OrdersPanel';

function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useOutletContext();

  return <OrdersPanel orders={orders} onUpdateStatus={updateOrderStatus} />;
}

export default AdminOrdersPage;

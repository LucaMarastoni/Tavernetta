import { apiGet, apiPost } from '../lib/apiClient';

export async function findCustomerByPhone(phone) {
  const normalizedPhone = phone.trim();
  const payload = await apiGet(`/api/customers/lookup?phone=${encodeURIComponent(normalizedPhone)}`);
  return payload.customer ?? null;
}

export async function upsertCustomer(customer) {
  const payload = {
    fullName: customer.fullName.trim(),
    phone: customer.phone.trim(),
    email: customer.email?.trim() || null,
  };

  const response = await apiPost('/api/customers', payload);
  return response.customer;
}

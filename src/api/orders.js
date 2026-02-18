import { api } from './client';

export function getOrders(params = {}) {
  return api.get('/admin/orders', params);
}

export function updateOrderStatus(id, status) {
  return api.patch(`/admin/orders/${id}/status`, { status });
}

export function updatePaymentStatus(id, paymentStatus) {
  return api.patch(`/admin/orders/${id}/payment`, { paymentStatus });
}

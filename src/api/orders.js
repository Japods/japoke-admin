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

export function updatePaymentDetails(id, data) {
  return api.patch(`/admin/orders/${id}/payment-details`, data);
}

export function addSplitPayment(id, data) {
  return api.post(`/admin/orders/${id}/split-payment`, data);
}

export function updateSplitPaymentStatus(id, status) {
  return api.patch(`/admin/orders/${id}/split-payment/status`, { status });
}

export function deleteOrder(id) {
  return api.delete(`/admin/orders/${id}`);
}

import { api } from './client';

export function getOrders(params = {}) {
  return api.get('/admin/orders', params);
}

export function updateOrderStatus(id, status) {
  return api.patch(`/admin/orders/${id}/status`, { status });
}

export function updatePaymentStatus(id, paymentStatus, recalculateRates = false) {
  return api.patch(`/admin/orders/${id}/payment`, { paymentStatus, recalculateRates });
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

export function setCourtesy(id, isCourtesy, reason = '') {
  return api.patch(`/admin/orders/${id}/courtesy`, { isCourtesy, reason });
}

export function getUnpaidOrders() {
  return api.get('/admin/orders-unpaid');
}

export function setDeliveryFree(id, deliveryFree) {
  return api.patch(`/admin/orders/${id}/delivery-free`, { deliveryFree });
}

export function deleteOrder(id) {
  return api.delete(`/admin/orders/${id}`);
}

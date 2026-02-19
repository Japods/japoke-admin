import { api } from './client';

export function getPurchases(params = {}) {
  return api.get('/admin/purchases', params);
}

export function getStockableItems() {
  return api.get('/admin/purchases/stockable-items');
}

export function getLatestRates() {
  return api.get('/exchange-rates/latest');
}

export function getPurchaseById(id) {
  return api.get(`/admin/purchases/${id}`);
}

export function createPurchase(data) {
  return api.post('/admin/purchases', data);
}

export function updatePurchase(id, data) {
  return api.patch(`/admin/purchases/${id}`, data);
}

export function deletePurchase(id) {
  return api.delete(`/admin/purchases/${id}`);
}

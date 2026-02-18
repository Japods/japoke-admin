import { api } from './client';

export function getInventory() {
  return api.get('/admin/inventory');
}

export function getAlerts() {
  return api.get('/admin/inventory/alerts');
}

export function getMovements(params = {}) {
  return api.get('/admin/inventory/movements', params);
}

export function recordPurchase(data) {
  return api.post('/admin/inventory/purchase', data);
}

export function adjustStock(data) {
  return api.post('/admin/inventory/adjustment', data);
}

export function getSupplies() {
  return api.get('/admin/inventory/supplies');
}

export function createSupply(data) {
  return api.post('/admin/inventory/supplies', data);
}

export function updateSupply(id, data) {
  return api.patch(`/admin/inventory/supplies/${id}`, data);
}

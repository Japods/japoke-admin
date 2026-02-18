import { api } from './client';

export function getItems(params = {}) {
  return api.get('/admin/items', params);
}

export function createItem(data) {
  return api.post('/admin/items', data);
}

export function updateItem(id, data) {
  return api.patch(`/admin/items/${id}`, data);
}

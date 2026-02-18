import { api } from './client';

export function getCategories() {
  return api.get('/admin/categories');
}

export function createCategory(data) {
  return api.post('/admin/categories', data);
}

export function updateCategory(id, data) {
  return api.patch(`/admin/categories/${id}`, data);
}

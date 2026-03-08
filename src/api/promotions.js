import { api } from './client';

export function getPromotions() {
  return api.get('/admin/promotions');
}

export function createPromotion(data) {
  return api.post('/admin/promotions', data);
}

export function updatePromotion(id, data) {
  return api.patch(`/admin/promotions/${id}`, data);
}

export function deletePromotion(id) {
  return api.delete(`/admin/promotions/${id}`);
}

export function getDiscountCodes() {
  return api.get('/admin/discount-codes');
}

export function createDiscountCode(data) {
  return api.post('/admin/discount-codes', data);
}

export function updateDiscountCode(id, data) {
  return api.patch(`/admin/discount-codes/${id}`, data);
}

export function deleteDiscountCode(id) {
  return api.delete(`/admin/discount-codes/${id}`);
}

// For protein selection in promo form
export function getItems(params = {}) {
  return api.get('/admin/items', params);
}

export function getPokeTypes() {
  return api.get('/admin/poke-types');
}

import { api } from './client';

export function getProtectionSummary() {
  return api.get('/admin/protection/summary');
}

export function createProtection(data) {
  return api.post('/admin/protection', data);
}

export function getProtectionHistory(params = {}) {
  return api.get('/admin/protection/history', params);
}

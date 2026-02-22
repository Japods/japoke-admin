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

export function createWalletTransaction(data) {
  return api.post('/admin/protection/transaction', data);
}

export function getWalletTransactions(params = {}) {
  return api.get('/admin/protection/transactions', params);
}

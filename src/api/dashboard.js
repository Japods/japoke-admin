import { api } from './client';

export function getSummary(params = {}) {
  return api.get('/admin/dashboard/summary', params);
}

export function getSales(params = {}) {
  return api.get('/admin/dashboard/sales', params);
}

export function getPopularItems(params = {}) {
  return api.get('/admin/dashboard/popular-items', params);
}

export function getPopularPokeTypes(params = {}) {
  return api.get('/admin/dashboard/popular-poke-types', params);
}

export function getCostAnalysis() {
  return api.get('/admin/dashboard/cost-analysis');
}

export function getExchangeRates() {
  return api.get('/exchange-rates/latest');
}

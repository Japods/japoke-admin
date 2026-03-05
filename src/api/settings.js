import { api } from './client';

export async function getStoreStatus() {
  const res = await api.get('/admin/settings/store-status');
  return res.data;
}

export async function setStoreStatus(isOpen) {
  const res = await api.put('/admin/settings/store-status', { isOpen });
  return res.data;
}

export async function getMaxDiscount() {
  const res = await api.get('/admin/settings/max-discount');
  return res.data;
}

export async function setMaxDiscount(maxDiscountPct) {
  const res = await api.put('/admin/settings/max-discount', { maxDiscountPct });
  return res.data;
}

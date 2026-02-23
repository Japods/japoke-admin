import { api } from './client';

export async function getStoreStatus() {
  const res = await api.get('/admin/settings/store-status');
  return res.data;
}

export async function setStoreStatus(isOpen) {
  const res = await api.put('/admin/settings/store-status', { isOpen });
  return res.data;
}

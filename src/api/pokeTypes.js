import { api } from './client';

export function getPokeTypes() {
  return api.get('/admin/poke-types');
}

export function createPokeType(data) {
  return api.post('/admin/poke-types', data);
}

export function updatePokeType(id, data) {
  return api.patch(`/admin/poke-types/${id}`, data);
}

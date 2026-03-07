import { api } from './client';

export function sendDeliveryCost(orderId, amountBs) {
  return api.post('/admin/whatsapp/delivery-cost', { orderId, amountBs });
}

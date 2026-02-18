export const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

export const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'text-warning',
    bgColor: 'bg-warning-light',
    borderColor: 'border-warning',
    dotColor: 'bg-warning',
    nextStatus: 'confirmed',
    nextLabel: 'Confirmar',
    canCancel: true,
  },
  confirmed: {
    label: 'Confirmado',
    color: 'text-info',
    bgColor: 'bg-info-light',
    borderColor: 'border-info',
    dotColor: 'bg-info',
    nextStatus: 'preparing',
    nextLabel: 'Preparar',
    canCancel: true,
  },
  preparing: {
    label: 'Preparando',
    color: 'text-naranja',
    bgColor: 'bg-naranja-light',
    borderColor: 'border-naranja',
    dotColor: 'bg-naranja',
    nextStatus: 'ready',
    nextLabel: 'Listo',
    canCancel: false,
  },
  ready: {
    label: 'Listo',
    color: 'text-success',
    bgColor: 'bg-success-light',
    borderColor: 'border-success',
    dotColor: 'bg-success',
    nextStatus: 'delivered',
    nextLabel: 'Entregar',
    canCancel: false,
  },
  delivered: {
    label: 'Entregado',
    color: 'text-gris',
    bgColor: 'bg-gris-light',
    borderColor: 'border-gris-border',
    dotColor: 'bg-gris',
    nextStatus: null,
    nextLabel: null,
    canCancel: false,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'text-error',
    bgColor: 'bg-error-light',
    borderColor: 'border-error',
    dotColor: 'bg-error',
    nextStatus: null,
    nextLabel: null,
    canCancel: false,
  },
};

export const CATEGORY_TYPES = [
  { value: 'protein', label: 'Proteina' },
  { value: 'base', label: 'Base' },
  { value: 'vegetable', label: 'Vegetal' },
  { value: 'sauce', label: 'Salsa' },
  { value: 'topping', label: 'Topping' },
];

export const PROTEIN_TIERS = [
  { value: 'base', label: 'Base' },
  { value: 'premium', label: 'Premium' },
];

export const POLLING_INTERVAL = 7000;
export const DELIVERED_LIMIT = 10;

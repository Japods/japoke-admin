export function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Hace un momento';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;

  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

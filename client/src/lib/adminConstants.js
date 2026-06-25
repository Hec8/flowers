export const ORDER_STATUS_LABELS = {
  PENDING: 'En traitement',
  CONFIRMED: 'Confirmée',
  SHIPPING: 'En livraison',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const CLIENT_ORDER_TABS = [
  { key: '', label: 'Tous' },
  { key: 'PROCESSING', label: 'En traitement' },
  { key: 'DELIVERED', label: 'Validés' },
  { key: 'CANCELLED', label: 'Annulés' },
];

export const formatReviewCount = (count) => {
  if (!count) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  return String(count);
};

export const formatAdminNumber = (n) => Number(n || 0).toLocaleString('fr-FR');

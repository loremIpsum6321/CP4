export function formatCurrency(value) {
  const number = parseFloat(value);
  if (Number.isNaN(number)) return '$0.00';
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatNumber(value, opts = {}) {
  const number = parseFloat(value);
  if (Number.isNaN(number)) return '0';
  return number.toLocaleString('en-US', opts);
}

export function signClass(value) {
  const number = parseFloat(value);
  if (Number.isNaN(number) || number === 0) return 'text-slate-400';
  return number > 0 ? 'text-good' : 'text-bad';
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function safeNumber(value, fallback = 0) {
  const n = parseFloat(value);
  return Number.isNaN(n) ? fallback : n;
}

export function statusTone(status) {
  switch ((status || '').toLowerCase()) {
    case 'good':
    case 'ok':
      return 'good';
    case 'warning':
    case 'caution':
      return 'warn';
    default:
      return 'bad';
  }
}

export function truncate(str, n = 28) {
  if (!str) return '';
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}

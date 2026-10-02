// Client API — même origine en production (servi par app.js), proxy Vite en dev
const API_BASE = import.meta.env.VITE_API_BASE || '';

// On appelle directement le point d'entrée PHP (/api/index.php) en lui
// transmettant la route via ?r=... : l'API fonctionne même si le serveur
// n'applique pas les règles de réécriture /api/* (fichier .htaccess absent,
// Apache désactivé, etc.). /api/index.php est un chemin réel qui existe.
function apiUrl(path) {
  const route = path.startsWith('/api') ? path.slice(4) : path;
  return `${API_BASE}/api/index.php?r=${encodeURIComponent(route)}`;
}

async function api(path, options = {}) {
  const res = await fetch(apiUrl(path), {
    headers: options.body ? { 'Content-Type': 'application/json', ...(options.headers || {}) } : (options.headers || {}),
    ...options,
  });
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).error || ''; } catch { /* corps non JSON */ }
    throw new Error(detail || `Erreur API (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

// ── Public ─────────────────────────────────────────────────────────────────
export const apiGetProducts   = () => api('/api/products');
export const apiCreateOrder   = (order)  => api('/api/orders',  { method: 'POST', body: JSON.stringify(order) });
export const apiCreateQuote   = (quote)  => api('/api/quotes',  { method: 'POST', body: JSON.stringify(quote) });
export const apiGetSettings   = () => api('/api/settings');

// ── Admin ──────────────────────────────────────────────────────────────────
const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, 'X-Admin-Token': token });

export const apiAdminLogin    = (username, password) =>
  api('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

// Session / profil de l'admin connecté
export const apiAdminMe             = (token)      => api('/api/auth/me',       { headers: authHeaders(token) });
export const apiAdminUpdateProfile  = (token, data) => api('/api/auth/profile',  { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) });
export const apiAdminChangePassword = (token, data) => api('/api/auth/password', { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data) });

// Gestion des utilisateurs (rôle admin uniquement)
export const apiAdminUsers       = (token)         => api('/api/users',        { headers: authHeaders(token) });
export const apiAdminCreateUser  = (token, data)   => api('/api/users',        { method: 'POST',   headers: authHeaders(token), body: JSON.stringify(data) });
export const apiAdminUpdateUser  = (token, id, d)  => api(`/api/users/${id}`,  { method: 'PATCH',  headers: authHeaders(token), body: JSON.stringify(d) });
export const apiAdminDeleteUser  = (token, id)     => api(`/api/users/${id}`,  { method: 'DELETE', headers: authHeaders(token) });

export const apiAdminOrders   = (token) => api('/api/orders',        { headers: authHeaders(token) });
export const apiAdminQuotes   = (token) => api('/api/quotes',        { headers: authHeaders(token) });
export const apiAdminSettings = (token) => api('/api/settings',      { headers: authHeaders(token) });

export const apiAdminSetOrderStatus = (token, id, status) =>
  api(`/api/orders/${id}/status`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ status }) });

export const apiAdminSetQuoteStatus = (token, id, status) =>
  api(`/api/quotes/${id}/status`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ status }) });

export const apiAdminCreateProduct = (token, product) =>
  api('/api/products', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(product) });

export const apiAdminUpdateProduct = (token, id, product) =>
  api(`/api/products/${id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(product) });

export const apiAdminDeleteProduct = (token, id) =>
  api(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders(token) });

export const apiAdminUpdateSettings = (token, settings) =>
  api('/api/settings', { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(settings) });

// Upload d'image → renvoie { url }
export async function apiUploadImage(token, file) {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(apiUrl('/api/upload'), {
    method: 'POST',
    headers: authHeaders(token),
    body: fd,
  });
  if (!res.ok) throw new Error('Upload impossible');
  return res.json();
}
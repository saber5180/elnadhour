/**
 * Préfixe les chemins relatifs (/uploads/...) avec l’API en prod (Vercel → Render).
 * Définir VITE_BACKEND_URL (sans /api), ex. https://elnadhour-api.onrender.com
 */
export function mediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;

  let path = url;
  // Legacy rows: filename only without /uploads/
  if (!path.startsWith('/') && !path.includes('://')) {
    path = `/uploads/${path.replace(/^\//, '')}`;
  }
  if (path.startsWith('/')) return path;

  const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${path.replace(/^\//, '')}`;
  return path;
}

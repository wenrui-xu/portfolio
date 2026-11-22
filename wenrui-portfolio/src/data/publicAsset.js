// Prefix URLs from public/ with the Vite deployment base.
export function publicAsset(path) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return path;
  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
}

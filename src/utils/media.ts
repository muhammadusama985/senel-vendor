export function getApiOrigin(): string {
  const baseUrl =
    import.meta.env.VITE_API_URL ||
    'https://intersection-promotion-ends-affiliate.trycloudflare.com/api/v1';
  try {
    const parsed = new URL(baseUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return 'https://intersection-promotion-ends-affiliate.trycloudflare.com';
  }
}

export function resolveMediaUrl(url?: string | null): string {
  const raw = (url || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw;
  }
  if (raw.startsWith('/')) return `${getApiOrigin()}${raw}`;
  return `${getApiOrigin()}/${raw}`;
}

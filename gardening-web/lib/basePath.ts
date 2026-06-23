/** Must match `basePath` in next.config.ts */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Full URL for Supabase auth redirects (outside Next.js router). */
export function authRedirectUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${basePath}${normalized}`;
  }
  return `${basePath}${normalized}`;
}

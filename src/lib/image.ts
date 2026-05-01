/**
 * Force http URLs to https. Some upstream feeds (e.g., older blog favicons)
 * still serve thumbnails over http; on bite-sized.xyz this surfaces as
 * mixed-content warnings or ORB blocks. Browsers auto-upgrade in many
 * cases, but doing it deterministically removes the console noise and
 * works around hosts that 403/blocked the upgrade.
 *
 * Pass-through for relative URLs, data:, blob:, https:, and falsy values.
 */
export function toHttpsUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://')) return 'https://' + url.slice('http://'.length);
  return url;
}

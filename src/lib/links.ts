// Link safety for content written in the admin (posts, profile links). Pure, testable.

/** Allows web links, email, same-site paths and in-page anchors; refuses javascript:, data:, etc. */
export function isSafeHref(href: unknown): href is string {
  if (typeof href !== 'string') return false;
  const h = href.trim();
  if (h === '') return false;
  if (h.startsWith('#') || (h.startsWith('/') && !h.startsWith('//'))) return true;
  if (h.startsWith('./') || h.startsWith('../')) return true;
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(h).protocol);
  } catch {
    return false;
  }
}

export type Brand = 'linkedin' | 'instagram' | 'github' | 'strava';

/** Which official logo (if any) goes with a profile link, by its host. */
export function brandFor(url: string): Brand | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin';
  if (host === 'instagram.com') return 'instagram';
  if (host === 'github.com') return 'github';
  if (host === 'strava.com') return 'strava';
  return null;
}

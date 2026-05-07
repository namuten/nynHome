/**
 * Summarizes raw user agent strings into a coarse, privacy-friendly summary like "Chrome / macOS" or "Safari / iOS".
 */
export function summarizeUserAgent(uaString: string | undefined): string | null {
  if (!uaString) return null;

  let os = 'Unknown OS';
  if (/windows/i.test(uaString)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(uaString)) os = 'iOS';
  else if (/android/i.test(uaString)) os = 'Android';
  else if (/linux/i.test(uaString)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/edg/i.test(uaString)) browser = 'Edge';
  else if (/chrome/i.test(uaString) && !/chromium/i.test(uaString)) browser = 'Chrome';
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = 'Safari';
  else if (/firefox/i.test(uaString)) browser = 'Firefox';
  else if (/opera|opr/i.test(uaString)) browser = 'Opera';

  return `${browser} on ${os}`;
}

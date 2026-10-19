/** Google's analytics, tag and font hosts, and every subdomain of them. */
const GOOGLE_HOST =
  /(^|\.)(google\.com|google-analytics\.com|googletagmanager\.com|doubleclick\.net|googleadservices\.com|googleapis\.com|gstatic\.com)$/i;

export function isGoogleHost(hostname: string): boolean {
  return GOOGLE_HOST.test(hostname);
}

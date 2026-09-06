/**
 * Utility to generate full, absolute, scannable verification URLs
 * that work seamlessly on GitHub Pages, custom domains, and local preview.
 */

export function getFullVerificationUrl(credentialId: string): string {
  if (!credentialId) return '';

  if (typeof window === 'undefined') {
    return `https://kapilnarula.github.io/VerbalEdge/?verify=${encodeURIComponent(credentialId)}`;
  }

  try {
    const url = new URL(window.location.href);
    let basePath = url.pathname;

    // Remove any trailing route fragments like /admin or /verify/... to get to app root
    basePath = basePath.replace(/\/admin\/?$/, '').replace(/\/verify\/.*$/, '');

    if (!basePath.endsWith('/')) {
      basePath += '/';
    }

    return `${url.origin}${basePath}?verify=${encodeURIComponent(credentialId)}`;
  } catch {
    return `?verify=${encodeURIComponent(credentialId)}`;
  }
}

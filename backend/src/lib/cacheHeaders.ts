import { Response, NextFunction, Request } from 'express';

/**
 * Cache-Control header constants matching professional production standards.
 */
export const CACHE_POLICIES = {
  // Vite Hashed Static Assets (fully immutable, chunk hashed)
  STATIC_IMMUTABLE: 'public, max-age=31536000, immutable',
  
  // HTML Shell / Main Entry (revalidate every time to pick up new bundles)
  HTML_NO_CACHE: 'no-cache, no-store, must-revalidate',
  
  // Dynamic APIs & Sensitive Admin Data (completely disable caching)
  API_NO_STORE: 'no-store, no-cache, must-revalidate, proxy-revalidate',
  
  // Public XML sitemaps / robots.txt (cache for 1 hour)
  SITEMAP_ROBOTS: 'public, max-age=3600',
  
  // Public original media assets (cache for 24 hours)
  MEDIA_ORIGINAL: 'public, max-age=86400',
  
  // Public media derivatives (WebP thumbnails, immutable unique keys)
  MEDIA_DERIVATIVES: 'public, max-age=31536000, immutable',
};

/**
 * Middleware to apply strict no-store to API responses by default.
 * Prevents clients and intermediate proxies from caching sensitive dynamic responses.
 */
export function noCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Cache-Control', CACHE_POLICIES.API_NO_STORE);
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

/**
 * Helper to set a specific Cache-Control policy on an express response.
 */
export function setCacheHeader(res: Response, policy: keyof typeof CACHE_POLICIES) {
  res.setHeader('Cache-Control', CACHE_POLICIES[policy]);
  if (policy === 'API_NO_STORE' || policy === 'HTML_NO_CACHE') {
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

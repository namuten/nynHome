import { prisma } from '../../lib/prisma';

/**
 * Generates sitemap.xml dynamically, combining static routes and published DB resources.
 */
export async function generateSitemapXml(): Promise<string> {
  const publicSiteUrl = process.env.PUBLIC_SITE_URL || 'https://crochub.dev';

  const staticRoutes = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: '/profile', changefreq: 'weekly', priority: '0.8' },
    { path: '/portfolio', changefreq: 'weekly', priority: '0.9' },
    { path: '/portfolio/resume', changefreq: 'monthly', priority: '0.8' },
    { path: '/portfolio/showcase', changefreq: 'weekly', priority: '0.9' },
    { path: '/gallery', changefreq: 'weekly', priority: '0.7' },
    { path: '/blog', changefreq: 'daily', priority: '0.7' },
    { path: '/study', changefreq: 'daily', priority: '0.7' },
  ];

  // Fetch published posts
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  });

  // Fetch published showcases
  const showcases = await prisma.showcaseItem.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  for (const route of staticRoutes) {
    xml += '  <url>\n';
    xml += `    <loc>${publicSiteUrl}${route.path}</loc>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  // Add dynamic post routes
  for (const post of posts) {
    const lastmod = post.updatedAt.toISOString().split('T')[0];
    xml += '  <url>\n';
    xml += `    <loc>${publicSiteUrl}/post/${post.id}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';
  }

  // Add dynamic showcase routes
  for (const sc of showcases) {
    const lastmod = sc.updatedAt.toISOString().split('T')[0];
    xml += '  <url>\n';
    xml += `    <loc>${publicSiteUrl}/portfolio/showcase/${sc.slug}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return xml;
}

/**
 * Generates standard robots.txt directing web spiders to the sitemap endpoint.
 */
export function generateRobotsTxt(): string {
  const publicSiteUrl = process.env.PUBLIC_SITE_URL || 'https://crochub.dev';
  return `User-agent: *
Allow: /
Sitemap: ${publicSiteUrl}/sitemap.xml
`;
}

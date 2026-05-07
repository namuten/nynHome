import fs from 'fs';
import path from 'path';
import { generateSitemapXml, generateRobotsTxt } from '../src/modules/seo/sitemap.service';

/**
 * Script to pre-build and output sitemap.xml and robots.txt statically to the frontend's public directory.
 */
async function run() {
  try {
    console.log('[SITEMAP] Generating static sitemap.xml & robots.txt...');
    const xml = await generateSitemapXml();
    const robots = generateRobotsTxt();

    const publicDir = path.resolve(__dirname, '../../../frontend/public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

    console.log('[SITEMAP] Successfully exported static sitemap & robots files.');
    process.exit(0);
  } catch (err) {
    console.error('[SITEMAP] Build run failed:', err);
    process.exit(1);
  }
}

run();
export {};

import { PrismaClient } from '@prisma/client';
import { seedUsers } from './00-users.seed';
import { seedTags } from './01-tags.seed';
import { seedPosts } from './02-posts.seed';
import { seedMedia } from './03-media.seed';
import { seedComments } from './04-comments.seed';
import { seedGuestbook } from './05-guestbook.seed';
import { seedSchedules } from './06-schedule.seed';
import { seedProfile } from './07-profile.seed';
import { seedPortfolio } from './08-portfolio.seed';
import { seedShowcase } from './09-showcase.seed';
import { seedCollections } from './10-collections.seed';
import { seedLayout } from './11-layout.seed';
import { seedSeo } from './12-seo.seed';
import { seedAnalytics } from './13-analytics.seed';
import { seedNotifications } from './14-notifications.seed';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('🌱 Starting sample data seed...\n');
    await seedUsers(prisma);
    await seedTags(prisma);
    await seedPosts(prisma);
    await seedMedia(prisma);
    await seedComments(prisma);
    await seedGuestbook(prisma);
    await seedSchedules(prisma);
    await seedProfile(prisma);
    await seedPortfolio(prisma);
    await seedShowcase(prisma);
    await seedCollections(prisma);
    await seedLayout(prisma);
    await seedSeo(prisma);
    await seedAnalytics(prisma);
    await seedNotifications(prisma);
    console.log('\n✅ All sample data seeded successfully!');
  } catch (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

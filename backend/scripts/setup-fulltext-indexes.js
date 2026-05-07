const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  console.log('🔍 Starting fulltext index establishment on database...');

  try {
    // 1. posts 테이블 FULLTEXT INDEX 생성
    console.log('⚡ Constructing FULLTEXT INDEX on [posts] (title, body)...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE posts
        ADD FULLTEXT INDEX ft_posts_search (title, body) WITH PARSER ngram
      `);
      console.log('✅ Created index [ft_posts_search] on [posts].');
    } catch (e) {
      if (e.message.includes('Duplicate key name')) {
        console.log('ℹ️ Index [ft_posts_search] already exists on [posts].');
      } else {
        throw e;
      }
    }

    // 2. showcase_items 테이블 FULLTEXT INDEX 생성
    console.log('⚡ Constructing FULLTEXT INDEX on [showcase_items] (title, description)...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE showcase_items
        ADD FULLTEXT INDEX ft_showcase_search (title, description) WITH PARSER ngram
      `);
      console.log('✅ Created index [ft_showcase_search] on [showcase_items].');
    } catch (e) {
      if (e.message.includes('Duplicate key name')) {
        console.log('ℹ️ Index [ft_showcase_search] already exists on [showcase_items].');
      } else {
        throw e;
      }
    }

    // 3. tags 테이블 FULLTEXT INDEX 생성
    console.log('⚡ Constructing FULLTEXT INDEX on [tags] (name)...');
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE tags
        ADD FULLTEXT INDEX ft_tags_search (name) WITH PARSER ngram
      `);
      console.log('✅ Created index [ft_tags_search] on [tags].');
    } catch (e) {
      if (e.message.includes('Duplicate key name')) {
        console.log('ℹ️ Index [ft_tags_search] already exists on [tags].');
      } else {
        throw e;
      }
    }

    console.log('🎉 Successfully established all FULLTEXT ngram indexes on targeted tables.');
  } catch (error) {
    console.error('❌ Failed to establish FULLTEXT indexes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  console.log('🔍 Executing CJK Fulltext verification...');

  try {
    // 임시 한글 테스트 포스트 작성
    console.log('📝 Creating temporary Korean post for indexing verification...');
    const tempPost = await prisma.post.create({
      data: {
        title: '신비로운 크로코다일 디자인 강좌',
        body: '이 강좌는 크로코다일의 비늘과 디테일을 드로잉하는 방법을 깊이 다룹니다.',
        category: 'creative',
        isPublished: true,
      }
    });

    // 조금 기다려 색인 유도 후 형태소 전문검색(FULLTEXT) 실행
    console.log('🧠 Running MATCH AGAINST query with [크로코] keyword...');
    const results = await prisma.$queryRawUnsafe(`
      SELECT id, title, MATCH(title, body) AGAINST ('크로코' IN BOOLEAN MODE) AS score
      FROM posts
      WHERE MATCH(title, body) AGAINST ('크로코' IN BOOLEAN MODE)
      ORDER BY score DESC
      LIMIT 10
    `);

    console.log('📊 Verification Search Results:', results);

    if (results.length > 0) {
      console.log('✅ CJK FULLTEXT n-gram index query successfully verified!');
    } else {
      console.warn('⚠️ Search did not return results. Rebuilding indices or configuring tokenizer size may be required.');
    }

    // 임시 포스트 정리
    await prisma.post.delete({
      where: { id: tempPost.id }
    });
    console.log('🧹 Cleaned up temporary post.');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

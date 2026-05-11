# Sample Data Seed 설계 스펙

**날짜:** 2026-05-11
**담당:** Gemini (구현), Claude (설계)
**브랜치:** `feature/sample-data-seed`

---

## 목적

CrocHub의 모든 기능에 현실감 있는 샘플 데이터를 주입하여:
1. 각 기능이 정상 동작하는지 검증
2. 방문자가 봤을 때 실제로 운영 중인 사이트처럼 보이게 함

적용 환경: 로컬 개발환경 + 운영 서버 모두 동일하게 적용.

---

## 페르소나

사이트 주인은 **나연 (Nayeon)**, 고등학교 1학년 여학생.
그림·음악·글·일상을 두루 다루는 멀티 크리에이터.
콘텐츠 언어: 한국어 위주, 영어 일부 혼합.

---

## 접근 방식: 도메인별 분리 Seed 모듈 (B안)

기존 `seed.ts`는 admin 계정 + MediaTypeConfig 전담으로 유지.
샘플 데이터는 `prisma/seeds/` 폴더에 도메인별로 분리.

### 파일 구조

```
backend/prisma/
├── seed.ts                      ← 기존 유지 (admin + MediaTypeConfig)
└── seeds/
    ├── index.ts                 ← 오케스트레이터
    ├── 00-users.seed.ts
    ├── 01-tags.seed.ts
    ├── 02-posts.seed.ts
    ├── 03-media.seed.ts
    ├── 04-comments.seed.ts
    ├── 05-guestbook.seed.ts
    ├── 06-schedule.seed.ts
    ├── 07-profile.seed.ts
    ├── 08-portfolio.seed.ts
    ├── 09-showcase.seed.ts
    ├── 10-collections.seed.ts
    ├── 11-layout.seed.ts
    ├── 12-seo.seed.ts
    ├── 13-analytics.seed.ts
    └── 14-notifications.seed.ts
```

### 실행 방법

```bash
# 전체 샘플 데이터 실행 (오케스트레이터)
cd backend
npx ts-node prisma/seeds/index.ts

# 특정 도메인만 재실행
npx ts-node prisma/seeds/04-comments.seed.ts

# 기존 admin/config seed는 그대로
npx prisma db seed
```

### 오케스트레이터 설계 (`index.ts`)

- 각 seed 파일을 순서대로 `import`하여 호출
- 파일 번호(00~14) 순서가 의존성 순서와 일치 (유저 → 태그 → 포스트 → 미디어 → 댓글 ...)
- 각 seed 함수는 멱등성 보장: 중복 실행 시 기존 데이터를 `upsert` 또는 `findFirst` 체크로 건너뜀
- 실행 로그: 각 seed 완료 시 `✅ [모듈명] seeded` 출력

---

## 각 Seed 모듈 상세

### 00-users.seed.ts — 방문자 유저 8명

댓글·방명록 작성자로 활용할 가상 계정.
비밀번호: `sample1234!` (bcrypt hash, rounds=10)

| nickname | email |
|---|---|
| 하늘이 | sky_hani@example.com |
| minji_art | minji.draws@example.com |
| 수현 언니 | suhyeon92@example.com |
| Lena | lena.music@example.com |
| 별빛소년 | starboy_kr@example.com |
| 이지은 | jeunee04@example.com |
| tomato_boy | ryu.tomy@example.com |
| 은하수 | milkyway_g@example.com |

구현 주의: `upsert({ where: { email }, ... })` 사용.

---

### 01-tags.seed.ts — 태그 20개

퍼플 계열(#6844c7 ~ #a78bfa) 색상 적용. 한국어 12개 + 영어 8개.

```
그림, 디지털아트, 음악, 일상, 감성, 독서기록, 공부법,
수학, 영어, 크로셰, DIY, 힐링,
Drawing, Music, Study, Creative, Daily, Illustration, Poetry, Film
```

슬러그: 한국어는 영문 음역(`geurim`, `digital-art` 등), 영어는 소문자 kebab-case.
구현 주의: `upsert({ where: { slug }, ... })`.

---

### 02-posts.seed.ts — 게시글 15개

`createdAt`을 현재 기준 1~90일 전으로 분산 → 오래 운영한 느낌.
모두 `isPublished: true`. `viewCount`는 20~400 사이 임의값.

**creative (6개)**
- "첫 디지털 드로잉 도전기"
- "이달의 크로셰 작품 완성 🧶"
- "음악으로 감정 풀어내기 — 피아노 커버"
- "봄 일러스트 시리즈 작업 과정"
- "내가 만든 뜨개 인형들 모음"
- "Digital Art Tool 비교 후기"

**blog (5개)**
- "요즘 읽고 있는 책들 추천"
- "봄비 오는 날의 카페 브이로그"
- "최애 플레이리스트 공유 🎵"
- "2026 상반기 돌아보기"
- "I've been drawing every day for 30 days"

**study (4개)**
- "수학 점화식 완전 정복하기"
- "영어 쉐도잉 30일 후기"
- "내가 쓰는 공부 루틴 공개"
- "시험 전날 벼락치기 대신 이걸 해봤어"

`body` 필드: 각 포스트당 3~5문장 분량의 실제 본문 텍스트 작성 (Lorem ipsum 금지).

포스트 생성 후 **ContentTag 연결**도 이 파일에서 처리:
- creative 포스트 → `그림`, `디지털아트`, `크로셰`, `Illustration` 등 관련 태그 2~3개
- blog 포스트 → `일상`, `감성`, `Music`, `Daily` 등 2~3개
- study 포스트 → `공부법`, `수학`, `영어`, `Study` 등 2~3개
- `upsert({ where: { tagId_contentType_contentId } })` 사용.

구현 주의: `findFirst({ where: { title } })` 체크 후 없으면 `create`.

---

### 03-media.seed.ts — 미디어 20개

실제 화면에 이미지가 렌더링되도록 공개 URL 사용.

**이미지 15개**
URL 패턴: `https://picsum.photos/seed/{slug}/800/600`
- `mimeType: 'image/jpeg'`, `fileCategory: 'image'`
- `width: 800`, `height: 600`
- `fileSize`: 100000~500000 (BigInt)
- 포스트 15개에 각 1개씩 연결 (`postId` 설정)

**오디오 3개**
URL: Internet Archive의 공개 도메인 mp3 샘플
- `mimeType: 'audio/mpeg'`, `fileCategory: 'audio'`
- `duration`: 120~240 (초)
- `postId: null` (standalone 미디어)

**문서 2개**
- `mimeType: 'application/pdf'`, `fileCategory: 'document'`
- `fileUrl`: 가상 경로 (예: `https://pub.crochub.dev/docs/portfolio-2026.pdf`)
- `postId: null`

구현 주의: `findFirst({ where: { fileName } })` 체크.

---

### 04-comments.seed.ts — 댓글 15개

각 댓글은 방문자 유저 8명 중 한 명이 작성.
포스트 15개 중 10개에 댓글 배치 (1~3개/포스트).

**관리자 답글 (`reply` 필드) 포함 댓글 6개:**
- 댓글: "우와 그림 진짜 예쁘다 ㅠㅠ 어떤 앱 써요?"
  답글: "감사해요! Procreate 써요 😊 다음 작품도 기대해주세요!"
- 댓글: "크로셰 인형 너무 귀엽다 ㅠ 판매 안 해요?"
  답글: "아직 판매는 안 하고 있어요 ㅎㅎ 나중에 고려해볼게요!"
- 댓글: "공부 루틴 도움 많이 됐어요. 감사합니다 💜"
  답글: "도움이 됐다니 너무 기뻐요! 화이팅이에요 🌟"
- 댓글: "I love your illustration style! So unique!"
  답글: "Thank you so much! It means a lot 💜"
- 댓글: "플레이리스트 취향 완전 저랑 똑같아요 ㅋㅋ"
  답글: "동생 생겼다 ㅋㅋ 다음 플리도 기대해줘요!"
- 댓글: "피아노 커버 어디서 들을 수 있어요?"
  답글: "포스트 안에 오디오 파일 올려뒀어요! 들어봐주세요 🎹"

`createdAt`: 포스트 생성일보다 1~7일 이후로 설정.
구현 주의: `findFirst({ where: { postId, userId } })` 체크.

---

### 05-guestbook.seed.ts — 방명록 15개

응원·감사·팬심 위주. 날짜 1~80일 분산.

예시 목록:
- "항상 응원해! 네 그림 볼 때마다 진짜 힐링돼 🌸"
- "오늘도 잘 보고 갑니다. 음악 취향 완전 제 스타일이에요"
- "I love your art style! Keep it up 💜"
- "크로셰 작품들 너무 예쁘다... 나도 배워보고 싶어"
- "블로그 감성 너무 좋아요. 자주 올게요!"
- "수학 포스트 덕분에 점화식 이해했어요 감사해요 🙏"
- "봄 일러스트 배경화면으로 쓰고 싶다 ㅠㅠ"
- "나연아 화이팅!! 항상 응원해 💜💜"
- "Your creativity inspires me every day!"
- "방명록 처음 남겨보는데 앞으로 자주 올게요"
- "오늘 처음 왔는데 완전 제 취향이에요. 자주 올게요 ✨"
- "그림 색감이 너무 예뻐요. 어떻게 공부하셨어요?"
- "크로셰 인형 만드는 과정 영상도 올려주세요 🥹"
- "나연님 블로그 보면 나도 뭔가 하고 싶어져요"
- "감성 충전하고 갑니다 🌿 다음 포스팅도 기대할게요!"

구현 주의: 각 유저당 1~3개씩 분산 배치.

---

### 06-schedule.seed.ts — 일정 12개

달력이 채워진 느낌. `color`는 이벤트 종류별 구분.

| 제목 | 시기 | color |
|---|---|---|
| 기말고사 | 과거 (60일 전) | #ef4444 |
| 미술 동아리 전시회 | 과거 (45일 전) | #8b5cf6 |
| 봄 일러스트 완성 마감 | 과거 (30일 전) | #6844c7 |
| 독서 클럽 모임 | 과거 (14일 전) | #10b981 |
| 피아노 연습 | 오늘 주변 | #f59e0b |
| 블로그 포스팅 마감 | 오늘 주변 | #6844c7 |
| 친구 생일 파티 🎉 | 5일 후 | #ec4899 |
| 수행평가 제출 | 10일 후 | #ef4444 |
| 크로셰 작품 촬영 | 14일 후 | #8b5cf6 |
| 여름 일러스트 기획 | 21일 후 | #6844c7 |
| 음악 커버 녹음 | 28일 후 | #f59e0b |
| 방학 시작 🏖️ | 45일 후 | #10b981 |

---

### 07-profile.seed.ts — ProfileSettings 2개

**ko 버전:**
```
displayName: "나연"
tagline: "그림·음악·글로 세상을 채우는 중 🎨🎵✍️"
bio: "안녕하세요! 그림 그리고, 음악 듣고, 글 쓰는 걸 좋아하는 고1 나연이에요.
      이 공간에 제가 만든 것들과 일상을 조금씩 담아가고 있어요.
      크로셰 인형, 디지털 드로잉, 피아노 커버까지 — 뭐든 만들어보는 중이에요 🧶"
school: "○○고등학교 1학년"
location: "Seoul, Korea"
interests: ["디지털아트", "음악", "독서", "크로셰", "영화"]
skills: ["Procreate", "Notion", "기타", "뜨개질", "글쓰기"]
achievements: [
  { title: "교내 미술대회 입선", date: "2025-11-01" },
  { title: "독서 클럽 우수 회원", date: "2025-12-01" }
]
socialLinks: { instagram: "https://instagram.com/nayeon.creates", github: "https://github.com/nayeon-dev" }
```

**en 버전:**
```
displayName: "Nayeon"
tagline: "Filling the world with art, music & words 🎨"
bio: "Hi! I'm Nayeon, a high school student who loves drawing, making music, and writing.
      This is my little corner of the internet where I share my creations and daily life."
interests: ["Digital Art", "Music", "Reading", "Crochet", "Film"]
skills: ["Procreate", "Digital Illustration", "Guitar", "Creative Writing"]
socialLinks: { instagram: "https://instagram.com/nayeon.creates", github: "https://github.com/nayeon-dev" }
```

구현 주의: `upsert({ where: { locale }, ... })`.

---

### 08-portfolio.seed.ts — PortfolioSection 6개

locale: `ko`, order 0~5.

| sectionKey | title | 내용 요약 |
|---|---|---|
| education | 학력 | ○○고등학교 재학 중 (2026~) |
| awards | 수상 | 교내 미술대회 입선, 독서 클럽 우수 회원 |
| projects | 프로젝트 | 크로셰 인형 시리즈, 음악 커버 EP, CrocHub 개발 |
| activities | 활동 | 미술 동아리 (부장), 독서 클럽, 자원봉사 |
| skills | 스킬 | Procreate, 기타, 뜨개질, Notion, 글쓰기 |
| goals | 목표 | 예술 관련 진학, 창작 활동 지속 확장 |

`items` 필드: 각 섹션에 2~4개 항목 (title, subtitle, date, desc 형식).
구현 주의: `findFirst({ where: { locale, sectionKey } })` 체크.

---

### 09-showcase.seed.ts — ShowcaseItem 6개

| title | slug | category | isFeatured |
|---|---|---|---|
| Spring Illustration Series | spring-illust-2026 | Digital Art | true |
| Rainy Days — Piano Covers EP | rainy-days-ep | Music | true |
| 크로셰 인형 컬렉션 Vol.1 | crochet-collection-vol1 | DIY & Craft | false |
| 일러스트 캐릭터 제작기 | character-design-process | Digital Art | false |
| 내가 쓴 시 모음 | poetry-collection | Writing | false |
| CrocHub — 개인 홈페이지 개발 | crochub-web | Full-Stack Web | false |

모두 `isPublished: true`, `locale: 'ko'`.
`tags`: 관련 태그 slug 배열 (JSON).
`publishedAt`: 각 포스트 createdAt에 맞춰 설정.
구현 주의: `upsert({ where: { slug }, ... })`.

---

### 10-collections.seed.ts — 컬렉션 4개 + CollectionItem 연결

| title | 연결 콘텐츠 |
|---|---|
| 봄 감성 모음 🌸 | creative 포스트 5개 |
| 공부 기록 아카이브 📚 | study 포스트 4개 |
| 음악·감성 플레이리스트 🎵 | blog 포스트 3개 + 오디오 미디어 |
| 작품 포트폴리오 ✨ | showcase 아이템 3개 |

모두 `isPublished: true`.
`CollectionItem.contentType`: `'post'` 또는 `'portfolio_item'` (showcase 아이템은 `'portfolio_item'` 사용 — collections.service.ts 기준).
`position`: 0부터 순서대로.
구현 주의: Collection은 `findFirst({ where: { title } })`, CollectionItem은 `upsert({ where: { collectionId_contentType_contentId } })`.

---

### 11-layout.seed.ts — ContentLayout 3개 섹션

| sectionKey | postIds | order | isVisible |
|---|---|---|---|
| featured | [post1.id, post2.id, post3.id] | 0 | true |
| recent_creative | [creative 포스트 4개 id] | 1 | true |
| recent_blog | [blog 포스트 3개 id] | 2 | true |

구현 주의: 포스트 ID는 02-posts.seed 실행 후 DB에서 title로 조회하여 동적으로 설정.
`findFirst({ where: { sectionKey } })` 체크 후 있으면 `deleteMany({ where: { sectionKey } })` 후 `create`.

---

### 12-seo.seed.ts — SeoSettings 8개 (ko/en × 4 페이지)

| routeKey | locale | title | description |
|---|---|---|---|
| home | ko | "나연의 크리에이티브 공간 — CrocHub" | "그림, 음악, 글로 채우는 나연의 개인 홈페이지" |
| home | en | "Nayeon's Creative Space — CrocHub" | "A personal homepage filled with art, music & words" |
| portfolio | ko | "포트폴리오 — 나연" | "나연의 작품과 프로젝트 모음" |
| portfolio | en | "Portfolio — Nayeon" | "A collection of Nayeon's works and projects" |
| blog | ko | "블로그 — 나연의 일상과 생각" | "일상, 감성, 책, 음악 이야기" |
| blog | en | "Blog — Nayeon's daily life & thoughts" | "Daily life, music, books, and more" |
| study | ko | "공부 기록 — 나연" | "수학, 영어, 공부 루틴 공유" |
| study | en | "Study Notes — Nayeon" | "Math, English, and study tips" |

구현 주의: `upsert({ where: { routeKey_locale }, ... })`.

---

### 13-analytics.seed.ts — DailyAnalyticsRollup 30일치

오늘 기준 -30일 ~ -1일. 이벤트: `page_view`, `post_view`, `guestbook_visit`.

볼륨 패턴 (현실감):
- 평일: count 15~40, uniqueSessions 10~30
- 주말: count 40~80, uniqueSessions 30~60
- 특정 날 (포스트 업로드일): 스파이크 (count 100~150)

각 날짜당 3개 이벤트 × 30일 = 90개 레코드.
구현 주의: 스키마에 유니크 인덱스가 없으므로 실행 전 `deleteMany({ where: { day: { gte: 30일전, lte: 어제 } } })` 후 `createMany` 방식 사용.

---

### 14-notifications.seed.ts — Notification 10개

`userId: null` (관리자 알림 패턴).

| type | title | isRead |
|---|---|---|
| new_comment | "새 댓글: '그림 진짜 예쁘다 ㅠㅠ'" | true |
| new_comment | "새 댓글: '크로셰 인형 판매 안 해요?'" | true |
| new_guestbook | "방명록: '항상 응원해! 💜'" | true |
| new_guestbook | "방명록: 'I love your art style!'" | true |
| new_guestbook | "방명록: '수학 포스트 덕분에 이해했어요'" | true |
| report_resolved | "신고 처리 완료: 스팸 댓글 숨김 처리됨" | true |
| broadcast | "시스템: SSL 인증서 갱신 완료" | true |
| new_comment | "새 댓글: '플레이리스트 취향 저격이에요'" | false |
| new_guestbook | "방명록: '나연아 화이팅!! 💜💜'" | false |
| new_comment | "새 댓글: '피아노 커버 어디서 들어요?'" | false |

`createdAt`: 최근 30일 이내 분산.
구현 주의: `findFirst({ where: { title } })` 체크.

---

## 멱등성 원칙

모든 seed 함수는 **중복 실행해도 안전**해야 한다:
- 고유 필드 기준 `upsert` 우선 사용
- `upsert`가 불가한 경우 `findFirst` 체크 후 없을 때만 `create`
- `DailyAnalyticsRollup`처럼 복합 유니크가 없는 경우: 실행 전 해당 범위 `deleteMany` 후 `createMany`

---

## 의존성 순서

```
00-users → 01-tags → 02-posts → 03-media
                                    ↓
                04-comments (postId + userId 필요)
                05-guestbook (userId 필요)
                10-collections (postId 필요)
                11-layout (postId 필요)
                09-showcase → 10-collections (showcaseId 필요)
06-schedule, 07-profile, 08-portfolio, 12-seo, 13-analytics, 14-notifications → 독립 실행 가능
```

---

## package.json 스크립트 추가

```json
{
  "scripts": {
    "seed:sample": "ts-node prisma/seeds/index.ts",
    "seed:all": "npx prisma db seed && ts-node prisma/seeds/index.ts"
  }
}
```

---

## 완료 기준

- `npm run seed:sample` 실행 시 오류 없이 완료
- 홈 피드에 게시글·이미지 표시
- 댓글·방명록 페이지에 데이터 표시
- 관리자 대시보드 댓글 목록·신고 현황 표시
- 포트폴리오·쇼케이스 페이지에 항목 표시
- 일정 달력에 12개 이벤트 표시
- 분석 차트에 30일 데이터 표시
- 두 번 실행해도 중복 데이터 없음 (멱등성)

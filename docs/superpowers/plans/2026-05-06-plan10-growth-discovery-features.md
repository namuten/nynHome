# CrocHub — Plan 10: Growth & Discovery 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**선행 조건:** Plan 1~3 Backend Core/API Contract 완료 + Plan 4~6 Frontend/Admin 완료 + Plan 7 Portfolio 완료 + Plan 8 Production Hardening 완료 + Plan 9 Community Safety 완료

**Goal:** 방문자가 콘텐츠를 더 잘 발견하고, 운영자가 새 콘텐츠를 팬에게 알릴 수 있는 기반을 만든다. 알림(in-app), 이메일 다이제스트, 한국어 전문검색, 태그/컬렉션 기능을 순서대로 구현한다.

**중요:**
- 이 Plan의 모든 DB 스키마 변경은 Prisma migration으로 적용한다.
- 한국어 전문검색은 MySQL `WITH PARSER ngram` 없이 구현하면 CJK 텍스트가 무음으로 실패한다 — 반드시 포함.
- 컬렉션은 JSON 컬럼이 아닌 관계형 pivot 테이블(`collection_items`)로 구현한다 — 역조회 불가 및 FK integrity 부재 방지.
- 알림/이메일은 개인정보 최소화 원칙 적용: 이메일은 운영자 1인 기준, 방문자 이메일 수집 최소화.

**Architecture:**
- Backend에 `notifications`, `search`, `tags`, `collections` 모듈을 추가한다.
- 이메일 발송은 `nodemailer` + SMTP(또는 SendGrid free tier)로 시작하고, 나중에 교체 가능하도록 adapter 패턴을 적용한다.
- 검색 API는 MySQL FULLTEXT index를 사용하고 결과에 `relevance score`를 포함한다.
- Plan 8 audit log와 연결해 관리자 태그/컬렉션 수정을 기록한다.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS + React Router + Express + Prisma + MySQL 8.0+

---

## Plan 10 범위

```text
Growth & Discovery
- In-app 알림 (댓글 달림, 방명록 작성, 신고 처리 결과)
- 알림 환경설정 (관리자용)
- 이메일 다이제스트 기초
- 전문검색 API (한국어 ngram 포함)
- 검색 결과 UI
- 태그 시스템 (콘텐츠 태깅, 태그 탐색)
- 컬렉션 시스템 (관계형 pivot 테이블)
- Admin 태그/컬렉션 관리 UI
- (선택) 브로드캐스트 알림 (관리자 → 모든 방문자 푸시)
```

Plan 11로 넘길 내용:
```text
- Mobile App (React Native) 전환 / PWA 고도화
- Offline Experience (Service Worker, background sync)
- App Store 배포 준비
```

---

## Task 목록

| # | 태스크 | 담당 | 비고 |
|---|--------|------|------|
| 1 | DB Schema — notifications, tags, collection_items | Gemini | Prisma migration |
| 2 | MySQL ngram 설정 확인 + FULLTEXT index | Gemini | `ngram_token_size=2` |
| 3 | Notifications API (생성, 조회, 읽음 처리) | Gemini | |
| 4 | Notifications UI (bell icon, dropdown, 환경설정) | Gemini | |
| 5 | Search API (FULLTEXT, ngram, 한국어) | Gemini | |
| 6 | Search UI (검색창, 결과 페이지) | Gemini | |
| 7 | Tags API (생성, 연결, 조회) | Gemini | |
| 8 | Collections API (pivot table 기반) | Gemini | |
| 9 | Admin Tags/Collections UI | Gemini | |
| 10 | 이메일 다이제스트 기초 (nodemailer + digest job) | Gemini | |
| 11 | API Contract 업데이트 + E2E regression | Codex | |

---

## Task 1: DB Schema — notifications, tags, collection_items

**담당:** Gemini  
**선행 조건:** Plan 8 완료 (audit_logs 테이블 존재)

### Steps

- [x] Step 1: `notifications` 테이블 Prisma schema 추가

```prisma
model Notification {
  id          Int      @id @default(autoincrement())
  userId      Int?     // nullable = 관리자 전용 알림이면 null
  type        String   // "new_comment" | "new_guestbook" | "report_resolved" | "broadcast"
  title       String   @db.VarChar(200)
  body        String   @db.VarChar(500)
  linkUrl     String?  @db.VarChar(500)
  isRead      Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())

  @@index([userId, isRead, createdAt])
  @@map("notifications")
}
```

- [x] Step 2: `notification_preferences` 테이블 추가 (관리자 알림 설정)

```prisma
model NotificationPreference {
  id               Int     @id @default(autoincrement())
  adminUserId      Int     @unique
  onNewComment     Boolean @default(true)
  onNewGuestbook   Boolean @default(true)
  onReportFlagged  Boolean @default(true)
  emailDigestFreq  String  @default("weekly") // "never" | "daily" | "weekly"
  emailAddress     String? @db.VarChar(320)
  updatedAt        DateTime @updatedAt

  @@map("notification_preferences")
}
```

- [x] Step 3: `tags` 테이블 추가

```prisma
model Tag {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(50)
  slug        String   @db.VarChar(50) @unique
  color       String?  @db.VarChar(7)  // hex color e.g. "#a78bfa"
  createdAt   DateTime @default(now())

  contentTags ContentTag[]

  @@index([slug])
  @@map("tags")
}

model ContentTag {
  id          Int    @id @default(autoincrement())
  tagId       Int
  contentType String // "post" | "image" | "video" | "portfolio_item"
  contentId   Int

  tag         Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([tagId, contentType, contentId])
  @@index([contentType, contentId])
  @@map("content_tags")
}
```

- [x] Step 4: `collections` 및 `collection_items` pivot 테이블 추가

```prisma
model Collection {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  description String?  @db.Text
  coverImageId Int?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  items       CollectionItem[]

  @@map("collections")
}

model CollectionItem {
  id             Int    @id @default(autoincrement())
  collectionId   Int
  contentType    String // "post" | "image" | "video" | "portfolio_item"
  contentId      Int
  position       Int    @default(0) // display order within collection

  collection     Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@unique([collectionId, contentType, contentId])
  @@index([collectionId, position])
  @@index([contentType, contentId])   // reverse lookup: "which collections contain this item?"
  @@map("collection_items")
}
```

> **주의:** 기존 코드에 `item_refs JSON` 컬럼을 사용하는 컬렉션 로직이 있다면 이 migration과 함께 제거한다. JSON 컬럼으로는 역조회(`이 콘텐츠가 속한 컬렉션 목록`)가 불가능하고 FK integrity가 없다.

- [x] Step 5: Prisma migration 실행

```bash
npx prisma migrate dev --name add_notifications_tags_collections
```

- [x] Step 6: 테스트 — `npx prisma db seed`로 샘플 태그/컬렉션/알림 3건씩 삽입 확인

**Commit:** `feat(db): add notifications, tags, collections schema with pivot table`

---

## Task 2: MySQL ngram 설정 확인 + FULLTEXT Index

**담당:** Gemini  
**선행 조건:** Task 1 완료

### 배경

MySQL 8.0 기본 설정에서는 한국어/중국어/일본어(CJK) 텍스트에 대한 FULLTEXT 검색이 작동하지 않는다. `WITH PARSER ngram`을 사용해야 하며, `ngram_token_size=2`가 필요하다.

### Steps

- [x] Step 1: MySQL 설정 확인 및 `my.cnf` 업데이트

```ini
# mysql/my.cnf (또는 docker-compose의 MySQL command args)
[mysqld]
ngram_token_size=2
```

Docker Compose 사용 시:
```yaml
# docker-compose.yml
services:
  mysql:
    command: --ngram_token_size=2
```

- [x] Step 2: Prisma migration에서 FULLTEXT index 생성

Prisma는 `WITH PARSER ngram` 구문을 직접 지원하지 않으므로 raw SQL migration을 사용한다.

```sql
-- prisma/migrations/XXXX_add_fulltext_indexes/migration.sql

-- posts 검색용 (title + content)
ALTER TABLE posts
  ADD FULLTEXT INDEX ft_posts_search (title, content) WITH PARSER ngram;

-- images 검색용 (title + description)
ALTER TABLE images
  ADD FULLTEXT INDEX ft_images_search (title, description) WITH PARSER ngram;

-- videos 검색용
ALTER TABLE videos
  ADD FULLTEXT INDEX ft_videos_search (title, description) WITH PARSER ngram;

-- portfolio_items 검색용
ALTER TABLE portfolio_items
  ADD FULLTEXT INDEX ft_portfolio_search (title, description) WITH PARSER ngram;

-- tags 검색용
ALTER TABLE tags
  ADD FULLTEXT INDEX ft_tags_search (name) WITH PARSER ngram;
```

> **주의:** 이 migration은 `prisma/migrations/`에 수동 `.sql` 파일로 배치하고 `prisma migrate resolve --applied` 로 표시하거나, `prisma db execute`를 사용한다. Prisma schema DSL에는 이 syntax가 없다.

- [x] Step 3: 테스트 — 한국어 키워드 "크로코다일" 검색 시 결과 반환 확인

```sql
SELECT id, title, MATCH(title, content) AGAINST ('크로코' IN BOOLEAN MODE) AS score
FROM posts
WHERE MATCH(title, content) AGAINST ('크로코' IN BOOLEAN MODE)
ORDER BY score DESC
LIMIT 10;
```

- [x] Step 4: `ngram_token_size=2` 로 index rebuild 필요 여부 확인

기존 FULLTEXT index가 있다면 `ngram_token_size` 변경 후 index를 DROP하고 재생성해야 한다.

**Commit:** `chore(db): configure ngram_token_size=2 and add fulltext indexes for CJK search`

---

## Task 3: Notifications API

**담당:** Gemini  
**선행 조건:** Task 1 완료

### Endpoints

```text
GET  /api/notifications          # 내 알림 목록 (페이지네이션, isRead 필터)
POST /api/notifications/read-all # 전체 읽음 처리
PUT  /api/notifications/:id/read # 개별 읽음 처리
GET  /api/notifications/unread-count # 읽지 않은 수 (badge용)
DELETE /api/notifications/:id    # 알림 삭제 (관리자만)

# 환경설정
GET  /api/notifications/preferences     # 관리자 알림 설정 조회
PUT  /api/notifications/preferences     # 관리자 알림 설정 수정

# 내부 헬퍼 (external API 아님, service 함수)
notificationService.create({ type, title, body, linkUrl, userId? })
```

### Steps

- [x] Step 1: `backend/src/modules/notifications/notifications.service.ts` 생성

핵심 함수:
```typescript
createNotification(data: { type: string; title: string; body: string; linkUrl?: string; userId?: number }): Promise<Notification>
getNotifications(params: { userId?: number; isRead?: boolean; page: number; limit: number }): Promise<{ items: Notification[]; total: number }>
markAsRead(ids: number[]): Promise<void>
getUnreadCount(userId?: number): Promise<number>
getPreferences(adminUserId: number): Promise<NotificationPreference>
updatePreferences(adminUserId: number, data: Partial<NotificationPreference>): Promise<NotificationPreference>
```

- [x] Step 2: `backend/src/modules/notifications/notifications.controller.ts` 생성

모든 엔드포인트 구현, `requireAuth` 미들웨어 적용 (관리자 전용).

- [x] Step 3: Plan 9 comment report 처리 시 알림 자동 생성 — `commentReports.service.ts`에 hook 추가

```typescript
// 신고 처리(approve/dismiss) 완료 시
await notificationService.create({
  type: 'report_resolved',
  title: '신고 처리 완료',
  body: `댓글 신고가 처리되었습니다.`,
  linkUrl: `/admin/moderation`
});
```

- [x] Step 4: `backend/src/modules/notifications/notifications.routes.ts` 등록

- [x] Step 5: 테스트 파일 `notifications.service.test.ts`:
  - `createNotification stores record`
  - `markAsRead sets isRead=true and readAt`
  - `getUnreadCount returns correct number`
  - `updatePreferences persists email digest settings`

**Commit:** `feat(notifications): add notifications API with preferences`

---

## Task 4: Notifications UI

**담당:** Gemini  
**선행 조건:** Task 3 완료

### Components

```text
frontend/src/components/notifications/
  NotificationBell.tsx      # header bell icon with unread badge
  NotificationDropdown.tsx  # dropdown list, mark-all-read button
  NotificationItem.tsx      # single notification row
  NotificationPrefsPage.tsx # /admin/notifications/preferences
```

### Steps

- [x] Step 1: `NotificationBell.tsx` — `GET /api/notifications/unread-count` 폴링 (30초), badge 표시

- [x] Step 2: `NotificationDropdown.tsx` — 최근 10건 표시, "전체 읽음", "전체 보기" 링크

- [x] Step 3: `/admin/notifications` 전체 알림 목록 페이지 — 필터(읽음/안읽음), 삭제

- [x] Step 4: `NotificationPrefsPage.tsx` — `/admin/notifications/preferences`
  - 알림 토글 (새 댓글, 새 방명록, 신고 접수)
  - 이메일 다이제스트 주기 선택 (없음 / 매일 / 매주)
  - 이메일 주소 입력 (관리자 본인)

- [x] Step 5: Admin 헤더에 `NotificationBell` 삽입

- [x] Step 6: 테스트 — bell 클릭 시 dropdown 표시, 알림 클릭 시 linkUrl로 이동, 읽음 처리 후 badge 감소

**Commit:** `feat(notifications): add notification bell, dropdown, preferences page`

---

## Task 5: Search API

**담당:** Gemini  
**선행 조건:** Task 2 완료 (FULLTEXT index)

### Endpoint

```text
GET /api/search?q=<query>&types=post,image,video,portfolio&page=1&limit=20
```

### Response

```json
{
  "query": "크로코",
  "results": [
    {
      "type": "post",
      "id": 42,
      "title": "크로코다일 스케일 드로잉",
      "excerpt": "...크로코다일 패턴을 그리면서...",
      "score": 1.234,
      "url": "/posts/42",
      "thumbnailUrl": null,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

### Steps

- [x] Step 1: `backend/src/modules/search/search.service.ts` 생성

```typescript
async search(params: {
  query: string;
  types: ('post' | 'image' | 'video' | 'portfolio')[];
  page: number;
  limit: number;
}): Promise<SearchResult>
```

각 type별로 FULLTEXT MATCH AGAINST 쿼리 실행 후 결과 병합, relevance score로 정렬.

```sql
-- posts 예시
SELECT id, title,
  SUBSTRING(content, 1, 150) AS excerpt,
  MATCH(title, content) AGAINST (? IN BOOLEAN MODE) AS score
FROM posts
WHERE MATCH(title, content) AGAINST (? IN BOOLEAN MODE)
  AND isPublished = true
ORDER BY score DESC
LIMIT ? OFFSET ?
```

- [x] Step 2: 쿼리 sanitization — SQL injection 방지, 특수문자(`+`, `-`, `*`, `"`) 이스케이프

- [x] Step 3: 빈 쿼리 가드 — `q`가 2자 미만이면 400 반환 (ngram_token_size=2 기준)

- [x] Step 4: `backend/src/modules/search/search.routes.ts` 등록, rate limit 적용 (30req/min)

- [x] Step 5: 테스트:
  - `search returns posts matching korean query`
  - `search with q shorter than 2 chars returns 400`
  - `search respects types filter`
  - `search returns score in descending order`

**Commit:** `feat(search): add fulltext search API with Korean ngram support`

---

## Task 6: Search UI

**담당:** Gemini  
**선행 조건:** Task 5 완료

### Components

```text
frontend/src/components/search/
  SearchBar.tsx         # 글로벌 검색창 (header)
  SearchResultPage.tsx  # /search?q=... 결과 페이지
  SearchResultCard.tsx  # 개별 결과 카드
```

### Steps

- [x] Step 1: `SearchBar.tsx` — debounce 300ms, Enter 키로 `/search` 페이지 이동

- [x] Step 2: `SearchResultPage.tsx` — URL query param `q` 읽어 API 호출, loading/empty/error state

- [x] Step 3: `SearchResultCard.tsx` — type 아이콘, title, excerpt, 날짜, 링크

- [x] Step 4: type 필터 탭 (전체 / 게시글 / 이미지 / 영상 / 포트폴리오)

- [x] Step 5: 페이지네이션 (결과 20건 단위)

- [x] Step 6: 검색어 2자 미만 시 "2자 이상 입력해주세요" 안내 메시지

- [x] Step 7: Public 헤더에 `SearchBar` 삽입

**Commit:** `feat(search): add search bar and result page`

---

## Task 7: Tags API

**담당:** Gemini  
**선행 조건:** Task 1 완료

### Endpoints

```text
# Public
GET  /api/tags                        # 전체 태그 목록 (+ 콘텐츠 수)
GET  /api/tags/:slug                  # 태그별 콘텐츠 목록

# Admin
POST   /api/admin/tags                # 태그 생성
PUT    /api/admin/tags/:id            # 태그 수정
DELETE /api/admin/tags/:id            # 태그 삭제 (관련 content_tags CASCADE)

POST   /api/admin/content-tags        # 콘텐츠에 태그 연결
DELETE /api/admin/content-tags        # 콘텐츠에서 태그 제거
# body: { contentType, contentId, tagId }
```

### Steps

- [x] Step 1: `backend/src/modules/tags/tags.service.ts`

```typescript
createTag(data: { name: string; slug: string; color?: string }): Promise<Tag>
getTags(): Promise<(Tag & { contentCount: number })[]>
getTagBySlug(slug: string): Promise<Tag | null>
getContentByTag(slug: string, page: number, limit: number): Promise<{ items: TaggedContent[]; total: number }>
attachTag(contentType: string, contentId: number, tagId: number): Promise<void>
detachTag(contentType: string, contentId: number, tagId: number): Promise<void>
deleteTag(id: number): Promise<void>
```

- [x] Step 2: slug 자동 생성 — `name`을 소문자, 공백 → `-`, 특수문자 제거

- [x] Step 3: `backend/src/modules/tags/tags.routes.ts` 등록, admin 엔드포인트에 `requireAuth` 적용

- [x] Step 4: 테스트:
  - `createTag generates unique slug`
  - `attachTag creates content_tags row`
  - `getContentByTag returns only content with that tag`
  - `deleteTag cascades content_tags`

**Commit:** `feat(tags): add tags API with content tagging`

---

## Task 8: Collections API

**담당:** Gemini  
**선행 조건:** Task 1 완료

### Endpoints

```text
# Public
GET  /api/collections               # 공개 컬렉션 목록
GET  /api/collections/:id           # 컬렉션 상세 (아이템 포함)

# Admin
POST   /api/admin/collections               # 컬렉션 생성
PUT    /api/admin/collections/:id           # 컬렉션 수정
DELETE /api/admin/collections/:id           # 컬렉션 삭제

POST   /api/admin/collections/:id/items     # 아이템 추가
DELETE /api/admin/collections/:id/items/:itemId # 아이템 제거
PUT    /api/admin/collections/:id/reorder   # 아이템 순서 변경
# body: { items: [{ contentType, contentId, position }] }
```

### Steps

- [x] Step 1: `backend/src/modules/collections/collections.service.ts`

```typescript
createCollection(data: { title: string; description?: string; coverImageId?: number }): Promise<Collection>
getCollections(published?: boolean): Promise<(Collection & { itemCount: number })[]>
getCollectionById(id: number): Promise<Collection & { items: CollectionItem[] } | null>
addItemToCollection(collectionId: number, contentType: string, contentId: number): Promise<CollectionItem>
removeItemFromCollection(collectionId: number, itemId: number): Promise<void>
reorderItems(collectionId: number, items: { contentType: string; contentId: number; position: number }[]): Promise<void>
```

- [x] Step 2: 역조회 확인 — `getCollectionsByContent(contentType, contentId)` 구현 (pivot table이므로 단순 JOIN)

- [x] Step 3: 아이템 추가 시 UNIQUE constraint 위반 → 409 Conflict 반환

- [x] Step 4: `backend/src/modules/collections/collections.routes.ts` 등록

- [x] Step 5: 테스트:
  - `addItemToCollection stores pivot row with position`
  - `addItemToCollection duplicate returns 409`
  - `reorderItems updates positions`
  - `getCollectionsByContent reverse lookup works`
  - `deleteCollection cascades collection_items`

**Commit:** `feat(collections): add collections API with pivot table`

---

## Task 9: Admin Tags/Collections UI

**담당:** Gemini  
**선행 조건:** Task 7, Task 8 완료

### Pages / Components

```text
frontend/src/pages/admin/
  tags/
    TagsListPage.tsx         # /admin/tags — 태그 목록, 생성, 수정, 삭제
  collections/
    CollectionsListPage.tsx  # /admin/collections — 컬렉션 목록
    CollectionEditPage.tsx   # /admin/collections/:id — 아이템 추가/제거/순서변경

frontend/src/components/admin/
  TagBadge.tsx               # 색상 있는 태그 chip
  ContentTagSelector.tsx     # 콘텐츠 편집 시 태그 선택 UI
  CollectionItemDnD.tsx      # drag-and-drop 순서 변경 (선택, react-beautiful-dnd 또는 @dnd-kit)
```

### Steps

- [x] Step 1: `TagsListPage.tsx` — 태그 목록 테이블, 인라인 색상 picker, slug 표시

- [x] Step 2: `ContentTagSelector.tsx` — 기존 게시글/이미지/영상 편집 폼에 삽입 가능한 multi-select 태그 컴포넌트

- [x] Step 3: `CollectionsListPage.tsx` — 컬렉션 목록, 공개/비공개 토글, 생성 모달

- [x] Step 4: `CollectionEditPage.tsx` — 아이템 검색 후 추가, 기존 아이템 제거, 드래그 순서 변경

- [x] Step 5: Admin 사이드바에 "태그 관리", "컬렉션 관리" 메뉴 추가

- [x] Step 6: Public 태그 탐색 페이지 `/tags` — 태그 클라우드, 태그 클릭 시 콘텐츠 목록

- [x] Step 7: 콘텐츠 카드에 태그 badge 표시 (최대 3개, 초과 시 +N)

**Commit:** `feat(admin): add tags and collections management UI`

---

## Task 10: 이메일 다이제스트 기초

**담당:** Gemini  
**선행 조건:** Task 3 (NotificationPreference) 완료

### Steps

- [ ] Step 1: `nodemailer` 의존성 추가

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

- [ ] Step 2: `backend/src/services/email.service.ts` — adapter 패턴

```typescript
interface EmailAdapter {
  send(opts: { to: string; subject: string; html: string }): Promise<void>
}

class NodemailerAdapter implements EmailAdapter { ... }
// 나중에 SendGridAdapter 등으로 교체 가능

export const emailService = new EmailService(new NodemailerAdapter())
```

- [ ] Step 3: `.env` 추가

```env
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your@gmail.com
EMAIL_SMTP_PASS=app-specific-password
EMAIL_FROM="CrocHub <your@gmail.com>"
```

> `.env.example`에 해당 키를 빈 값으로 추가하고 실제 값은 절대 커밋하지 않는다.

- [ ] Step 4: `backend/src/jobs/emailDigest.job.ts` — 다이제스트 생성 잡

  - `notification_preferences`에서 `emailDigestFreq !== 'never'` 인 관리자 조회
  - 마지막 다이제스트 발송 이후의 알림 집계
  - HTML 이메일 생성 (인라인 스타일, 브랜드 컬러 라벤더 퍼플)
  - `emailService.send()` 호출

- [ ] Step 5: Plan 8 스케줄 잡 패턴 참조해 `emailDigest.job.ts`를 cron에 등록 (매일 08:00, 매주 월요일 08:00)

- [ ] Step 6: 테스트:
  - `emailDigest.job collects unsent notifications`
  - `emailDigest.job skips users with emailDigestFreq=never`
  - `emailService.send calls nodemailer transport`

- [ ] Step 7: 이메일 발송 실패는 throw가 아닌 error log만 남긴다 — 다이제스트 실패가 메인 서비스에 영향 주지 않도록.

**Commit:** `feat(email): add email digest job with nodemailer adapter`

---

## Task 11: API Contract 업데이트 + E2E Regression

**담당:** Codex  
**선행 조건:** Task 3~10 완료

### Steps

- [ ] Step 1: `docs/superpowers/specs/` API contract 문서에 Plan 10 신규 엔드포인트 추가

```text
추가 항목:
  GET  /api/notifications
  POST /api/notifications/read-all
  PUT  /api/notifications/:id/read
  GET  /api/notifications/unread-count
  DELETE /api/notifications/:id
  GET  /api/notifications/preferences
  PUT  /api/notifications/preferences
  GET  /api/search
  GET  /api/tags
  GET  /api/tags/:slug
  POST /api/admin/tags
  PUT  /api/admin/tags/:id
  DELETE /api/admin/tags/:id
  POST /api/admin/content-tags
  DELETE /api/admin/content-tags
  GET  /api/collections
  GET  /api/collections/:id
  POST /api/admin/collections
  PUT  /api/admin/collections/:id
  DELETE /api/admin/collections/:id
  POST /api/admin/collections/:id/items
  DELETE /api/admin/collections/:id/items/:itemId
  PUT  /api/admin/collections/:id/reorder
```

- [ ] Step 2: E2E 회귀 테스트

```text
- Plan 9A 기능 (댓글 신고, 방명록)이 Plan 10 기능과 충돌 없이 동작
- 검색 결과에 숨김 처리된(isHidden=true) 콘텐츠가 포함되지 않음
- 알림 badge 카운트가 읽음 처리 후 감소
- 컬렉션 아이템 추가 후 역조회(getCollectionsByContent) 정상 동작
```

- [ ] Step 3: 보안 점검

```text
- 알림 목록 API: 타 사용자 알림 조회 불가 확인
- 검색 API: SQL injection 시도 (특수문자 포함 쿼리) → 안전한 결과 반환
- 관리자 전용 엔드포인트에 비인증 요청 → 401 반환
```

- [ ] Step 4: 성능 체크

```text
- 검색 쿼리 실행 계획(EXPLAIN) 확인 — FULLTEXT index 사용 여부
- 컬렉션 역조회 EXPLAIN — collection_items(contentType, contentId) index 사용 여부
```

**Commit:** `test(plan10): update api contract and add e2e regression for growth features`

---

## Plan 10 완료 기준

```text
✓ notifications 테이블, tags, content_tags, collections, collection_items 테이블 Prisma migration 완료
✓ MySQL ngram_token_size=2 설정 + FULLTEXT index WITH PARSER ngram 적용
✓ 알림 bell + dropdown + 환경설정 페이지 동작
✓ 한국어 2글자 검색어로 게시글/이미지/영상 검색 결과 반환
✓ 태그 생성/연결/탐색 UI 동작
✓ 컬렉션 아이템 추가/제거/순서변경 동작 (pivot table 기반)
✓ 이메일 다이제스트 잡이 dry-run으로 실행 가능
✓ API contract 문서 업데이트
✓ 보안: 알림/검색/admin 엔드포인트 인가 검증 통과
```

---

## Plan 11 예고

Plan 10 완료 후 다음 단계:

```text
Plan 11: Mobile App + Offline Experience
- React Native (Expo) 기반 모바일 앱
- Service Worker + Workbox 오프라인 캐시
- PWA 설치 배너 + App Store 배포 준비
- 백그라운드 동기화 (댓글 오프라인 작성 → 온라인 시 동기화)
```

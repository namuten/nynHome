# CrocHub Backend API Contract

이 문서는 프론트엔드 연동을 위한 백엔드 API 명세서입니다.

## 기본 정보
- **Base URL**: `/api`
- **인증 방식**: JWT (Header: `Authorization: Bearer <token>`)

## 공통 에러 포맷 (Error Response)
모든 에러는 다음 형식을 따릅니다.
```json
{
  "error": "ERROR_CODE",
  "message": "인간이 읽을 수 있는 에러 메시지 (선택)",
  "details": { "필드명": ["에러 상세"] }
}
```

### 공통 에러 코드 목록
- `VALIDATION_ERROR`: 잘못된 요청 (400)
- `UNAUTHORIZED`: 인증 실패 또는 토큰 없음 (401)
- `FORBIDDEN`: 권한 없음 (403)
- `NOT_FOUND`: 리소스 없음 (404)
- `INTERNAL_ERROR`: 서버 오류 (500)

---

## 1. Auth

### POST /api/auth/register
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "nickname": "닉네임"
  }
  ```
- **Response (201)**: `User` 객체

### POST /api/auth/login
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**: `AuthResponse`
  ```json
  {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "닉네임",
      "role": "user | admin"
    }
  }
  ```

---

## 2. Posts

### GET /api/posts
- **Auth**: Public
- **Query Parameters**:
  - `category` (optional): `creative | blog | study`
  - `page` (optional): number (기본값 1)
  - `limit` (optional): number (기본값 10)
- **Response (200)**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "title": "게시글 제목",
        "category": "blog",
        "thumbnailUrl": "url",
        "views": 0,
        "createdAt": "2026-05-06T00:00:00.000Z",
        "author": { "nickname": "작성자" },
        "_count": { "comments": 5 }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
  ```

### GET /api/posts/:id
- **Auth**: Public
- **Response (200)**: `PostDetail` 객체 (위 항목에 `body` 포함)

### POST /api/posts
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "title": "새 글",
    "body": "내용",
    "category": "creative",
    "thumbnailUrl": "optional_url",
    "isPublished": true
  }
  ```
- **Response (201)**: 생성된 Post 객체

### PUT /api/posts/:id
- **Auth**: Admin
- **Request Body**: POST와 동일 (모든 필드 optional)
- **Response (200)**: 수정된 Post 객체

### DELETE /api/posts/:id
- **Auth**: Admin
- **Response (204)**: No Content

---

## 3. Media

### POST /api/media/upload
- **Auth**: Admin
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: 업로드할 파일
  - `postId` (optional): 연결할 게시글 ID
- **Response (201)**:
  ```json
  {
    "id": 1,
    "fileUrl": "https://r2.example.com/file.jpg",
    "fileCategory": "image",
    "mimeType": "image/jpeg"
  }
  ```

### GET /api/media
- **Auth**: Admin
- **Response (200)**: Media 객체 배열

### DELETE /api/media/:id
- **Auth**: Admin
- **Response (204)**: No Content

---

## 4. Comments

### GET /api/posts/:postId/comments
- **Auth**: Public
- **Response (200)**: `CommentItem` 배열 (계층형)
  ```json
  [
    {
      "id": 1,
      "body": "댓글 내용",
      "createdAt": "2026-05-06T00:00:00.000Z",
      "author": { "id": 1, "nickname": "유저" },
      "isHidden": false,
      "adminReply": "관리자 답변",
      "replies": []
    }
  ]
  ```
  *(isHidden이 true인 경우 body는 "삭제되었거나 관리자에 의해 숨김 처리된 댓글입니다."로 마스킹됨)*

### POST /api/posts/:postId/comments
- **Auth**: User
- **Request Body**:
  ```json
  {
    "body": "댓글 내용",
    "parentId": 1 // (optional) 대댓글인 경우
  }
  ```
- **Response (201)**: 생성된 Comment 객체

### PUT /api/comments/:id/reply
- **Auth**: Admin
- **Request Body**:
  ```json
  { "reply": "관리자 답변 내용" }
  ```
- **Response (200)**: 업데이트된 Comment 객체

### DELETE /api/comments/:id
- **Auth**: Owner or Admin
- **Response (204)**: No Content (실제로는 `isHidden: true` 처리됨)

---

## 5. Schedules

### GET /api/schedules
- **Auth**: Public
- **Query Parameter**: `month` (optional, "YYYY-MM")
- **Response (200)**: `ScheduleItem` 배열
  ```json
  [
    {
      "id": 1,
      "title": "방송",
      "description": "상세 내용",
      "startAt": "2026-05-10T20:00:00.000Z",
      "endAt": "2026-05-10T22:00:00.000Z",
      "color": "#6844c7"
    }
  ]
  ```

### POST /api/schedules
- **Auth**: Admin
- **Request Body**: Schedule 생성 객체
- **Response (201)**: 생성된 Schedule 객체

### PUT /api/schedules/:id
- **Auth**: Admin
- **Request Body**: Schedule 수정 객체
- **Response (200)**: 수정된 Schedule 객체

### DELETE /api/schedules/:id
- **Auth**: Admin
- **Response (204)**: No Content

---

## 6. Layout

### GET /api/layout
- **Auth**: Public
- **Response (200)**: Layout 객체 배열
  ```json
  [
    {
      "sectionKey": "hero",
      "postIds": [1, 2],
      "order": 0,
      "isVisible": true
    }
  ]
  ```

### PUT /api/layout
- **Auth**: Admin
- **Request Body**: 위 응답 형식과 같은 배열
- **Response (200)**: 업데이트된 Layout 객체 배열

---

## 7. Push

### POST /api/push/subscribe
- **Auth**: User
- **Request Body**:
  ```json
  {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
  ```
- **Response (201)**: Subscription 객체

### POST /api/push/send
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "title": "푸시 제목",
    "body": "푸시 내용",
    "url": "/post/1"
  }
  ```
- **Response (200)**: `{ "sent": 5 }` (성공 발송 건수)

---

## 8. Admin

### GET /api/admin/dashboard
- **Auth**: Admin
- **Response (200)**:
  ```json
  {
    "metrics": {
      "postsTotal": 10,
      "publishedPosts": 8,
      "draftPosts": 2,
      "mediaTotal": 15,
      "usersTotal": 5,
      "commentsTotal": 20,
      "hiddenComments": 1,
      "schedulesThisMonth": 3,
      "pushSubscriptions": 4
    },
    "recentPosts": [],
    "recentMedia": [],
    "recentComments": [],
    "recentUsers": []
  }
  ```

### GET /api/admin/media-types
- **Auth**: Admin
- **Response (200)**: MediaTypeConfig 배열

### PUT /api/admin/media-types/:id
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "isAllowed": true,
    "maxSizeMb": 20
  }
  ```
- **Response (200)**: 업데이트된 MediaTypeConfig 객체

### GET /api/admin/users
- **Auth**: Admin
- **Query**: `page`, `limit`
- **Response (200)**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "email": "user@example.com",
        "nickname": "닉네임",
        "role": "user",
        "createdAt": "..."
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
  ```

### DELETE /api/admin/users/:id
- **Auth**: Admin
- **Response (204)**: No Content

---

## 9. Profile / Branding

### GET /api/profile
- **Auth**: Public
- **Query Parameters**:
  - `locale` (optional): `ko | en` (기본값 `ko`)
- **Response (200)**:
  ```json
  {
    "id": 1,
    "locale": "ko",
    "displayName": "홍길동",
    "tagline": "세상을 이롭게 하는 풀스택 개발자",
    "bio": "안녕하세요! 예술과 기술의 조화를 사랑하는 개발자 홍길동입니다.",
    "avatarUrl": "https://example.com/avatar.png",
    "coverImageUrl": "https://example.com/cover.png",
    "school": "한국대학교",
    "location": "서울, 대한민국",
    "emailPublic": "gildong@example.com",
    "socialLinks": {
      "github": "https://github.com",
      "instagram": "https://instagram.com"
    },
    "interests": ["프로그래밍", "디자인", "사진"],
    "skills": ["React", "TypeScript", "Node.js"],
    "achievements": [
      {
        "title": "우수상",
        "description": "공모전 수상",
        "date": "2026-02-20"
      }
    ],
    "updatedAt": "2026-05-06T00:00:00.000Z"
  }
  ```

### PUT /api/admin/profile/:locale
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "displayName": "홍길동",
    "tagline": "세상을 이롭게 하는 풀스택 개발자",
    "bio": "안녕하세요! 예술과 기술의 조화를 사랑하는 개발자 홍길동입니다.",
    "avatarUrl": "https://example.com/avatar.png",
    "coverImageUrl": "https://example.com/cover.png",
    "school": "한국대학교",
    "location": "서울, 대한민국",
    "emailPublic": "gildong@example.com",
    "socialLinks": {
      "github": "https://github.com"
    },
    "interests": ["프로그래밍"],
    "skills": ["React"],
    "achievements": [
      {
        "title": "우수상",
        "date": "2026-02-20"
      }
    ]
  }
  ```
- **Response (200)**: 업데이트된 Profile Settings 객체

---

## 10. Portfolio Sections

### GET /api/portfolio
- **Auth**: Public
- **Query Parameters**:
  - `locale` (optional): `ko | en` (기본값 `ko`)
- **Response (200)**:
  ```json
  {
    "locale": "ko",
    "sections": [
      {
        "id": 1,
        "locale": "ko",
        "sectionKey": "education",
        "title": "학력 사항",
        "body": "학력에 대한 간단 설명",
        "items": [
          {
            "title": "한국대학교",
            "subtitle": "컴퓨터공학과",
            "date": "2022 ~ 2026",
            "desc": "학점 4.0/4.5"
          }
        ],
        "order": 0,
        "isVisible": true,
        "createdAt": "2026-05-06T00:00:00.000Z",
        "updatedAt": "2026-05-06T00:00:00.000Z"
      }
    ]
  }
  ```

### POST /api/admin/portfolio/sections
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "locale": "ko",
    "sectionKey": "education",
    "title": "학력 사항",
    "body": "학력 설명",
    "items": [
      {
        "title": "한국대학교"
      }
    ],
    "order": 0,
    "isVisible": true
  }
  ```
- **Response (201)**: 생성된 PortfolioSection 객체

### PUT /api/admin/portfolio/sections/:id
- **Auth**: Admin
- **Request Body**: POST와 같음 (모든 필드 optional, locale 필드는 제외)
- **Response (200)**: 수정된 PortfolioSection 객체

### DELETE /api/admin/portfolio/sections/:id
- **Auth**: Admin
- **Response (204)**: No Content

### PUT /api/admin/portfolio/sections/reorder
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "ids": [2, 1, 3]
  }
  ```
- **Response (200)**: `{ "success": true }`

---

## 11. Showcase Items

### GET /api/showcase
- **Auth**: Public
- **Query Parameters**:
  - `locale` (optional): `ko | en`
  - `category` (optional): `string`
  - `featured` (optional): `true | false`
- **Response (200)**:
  ```json
  {
    "locale": "ko",
    "items": [
      {
        "id": 1,
        "title": "공개 WebGL 포털",
        "slug": "public-webgl-portal",
        "description": "설명",
        "category": "WebGL",
        "coverMediaId": 3,
        "mediaIds": [3, 4],
        "postId": null,
        "locale": "ko",
        "tags": ["React", "WebGL"],
        "isFeatured": true,
        "isPublished": true,
        "publishedAt": "2026-05-07T00:00:00.000Z",
        "order": 0,
        "createdAt": "2026-05-07T00:00:00.000Z",
        "updatedAt": "2026-05-07T00:00:00.000Z"
      }
    ]
  }
  ```

### GET /api/showcase/:slug
- **Auth**: Public
- **Response (200)**: 단일 ShowcaseItem 객체
- **Response (404)**: 존재하지 않거나 게시되지 않은 경우

### POST /api/admin/showcase
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "title": "신규 작품",
    "slug": "new-project",
    "category": "3D Graphics",
    "locale": "ko",
    "isPublished": true
  }
  ```
- **Response (201)**: 생성된 ShowcaseItem 객체
- **Response (409)**: 중복 슬러그인 경우 (`SLUG_DUPLICATE`)
- **Response (400)**: 유효하지 않은 미디어 ID이거나 잘못된 검증 스펙인 경우 (`VALIDATION_ERROR`)

### GET /api/admin/showcase/:id
- **Auth**: Admin
- **Response (200)**: 단일 ShowcaseItem 객체
- **Response (404)**: 존재하지 않는 경우

### PUT /api/admin/showcase/:id
- **Auth**: Admin
- **Request Body**: POST와 동일 (모든 필드 optional, locale 필드는 제외)
- **Response (200)**: 수정된 ShowcaseItem 객체

### DELETE /api/admin/showcase/:id
- **Auth**: Admin
- **Response (204)**: No Content

### PUT /api/admin/showcase/reorder
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "ids": [2, 1, 3]
  }
  ```
- **Response (200)**: `{ "success": true }`

## 12. SEO & Open Graph Settings

### GET /api/seo
- **Auth**: Public
- **Query Parameters**:
  - `routeKey` (string, required) - 예: "home", "portfolio", "blog"
  - `locale` (string, optional) - "ko" | "en" (기본값: "ko")
- **Response (200)**:
  ```json
  {
    "id": 1,
    "routeKey": "home",
    "locale": "ko",
    "title": "나만의 멋진 개발 홈피",
    "description": "크록허브 포트폴리오 메인 홈",
    "ogImageUrl": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    "keywords": ["블로그", "WebGL", "React"],
    "createdAt": "2026-05-07T00:00:00.000Z",
    "updatedAt": "2026-05-07T00:00:00.000Z"
  }
  ```

### PUT /api/admin/seo/:routeKey
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "title": "나만의 멋진 개발 홈피",
    "description": "크록허브 포트폴리오 메인 홈",
    "ogImageUrl": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    "keywords": ["블로그", "WebGL", "React"],
    "locale": "ko"
  }
  ```
- **Response (200)**: 생성 또는 수정된 SeoSettings 객체
- **Response (400)**: 유효하지 않은 검증 스펙인 경우 (`VALIDATION_ERROR`)

---

## 13. Security & Rate Limiting

플랫폼의 무결성과 디도스(DDoS) 방지, 그리고 댓글 도배 차단을 위해 Express 레이어 상단에 Rate Limiting 및 Spam Guard 필터가 작동 중입니다.

### 13.1 공통 응답 규격 (Error Formats)

#### API 요청 횟수 초과 (Rate Limited)
- **HTTP Status**: 429 Too Many Requests
- **Response Body**:
  ```json
  {
    "error": "RATE_LIMITED",
    "message": "너무 많은 로그인/가입 시도가 감지되었습니다. 잠시 후 다시 시도해주세요."
  }
  ```

#### 댓글 도배 감지 (Spam Detected)
- **HTTP Status**: 400 Bad Request 또는 429 Too Many Requests
- **Response Body**:
  ```json
  {
    "error": "SPAM_DETECTED",
    "message": "댓글에 너무 많은 링크(URL)가 포함되어 있습니다."
  }
  ```

### 13.2 레이트 리미트 정책 (Rate Limit Baseline)

- **로그인 & 회원가입 (`/api/auth/register`, `/api/auth/login`)**: IP당 10분 내 최대 5회 시도 가능
- **일반 댓글 작성 (`/api/posts/:postId/comments`)**: IP당 10분 내 최대 10회 작성 가능
- **글로벌 기본 가드 (`/api/*`)**: IP당 5분 내 최대 300회 호출 가능

### 13.3 댓글 스팸 가드 규칙 (Spam Guard Rules)

댓글 작성 API 호출 시 다음의 스팸 감지 가드가 엄격히 적용됩니다.
1. **URL 링크 개수 제한**: 단일 댓글 내에 URL 주소가 2개 초과로 연속 배치된 경우 거부 (`SPAM_DETECTED`)
2. **반복 연속 문자 도배 차단**: 동일한 문자가 consecutive하게 10회 이상 반복해서 나열된 경우 거부 (`SPAM_DETECTED`)
3. **단기 동일 댓글 연속 등록 방지**: 동일 사용자가 15초 이내에 동일한 내용의 댓글을 연속해서 이중 작성(Double Posting)하는 경우 거부 (`SPAM_DETECTED`)

---

## 14. Operational Audit Logs

관리자 계정에서 행한 자원 생성, 수정, 삭제 등의 중요 비즈니스 뮤테이션 활동 기록을 정밀 추적/보관합니다.

### GET /api/admin/audit-logs
- **Auth**: Admin
- **Query Parameters**:
  - `page` (optional): number (기본값 1)
  - `limit` (optional): number (기본값 20)
  - `action` (optional): string (특정 행위 필터, 예: `post.create`)
  - `resourceType` (optional): string (특정 리소스 종류 필터)
- **Response (200)**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "action": "media-types.put",
        "resourceType": "media-types",
        "resourceId": "5",
        "adminUserId": 1,
        "summary": "Admin executed PUT on media-types (ID: 5)",
        "metadata": {
          "path": "/api/admin/media-types/5",
          "statusCode": 200,
          "body": { "maxSizeMb": 25, "isAllowed": true }
        },
        "ipHash": "a1f5904cb9b7a33945e9cfb980...",
        "userAgentSummary": "Chrome on macOS",
        "createdAt": "2026-05-07T12:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
  ```

---

## 15. Privacy-Conscious Analytics

개인정보 보호(IP, Session 암호화 해싱)를 준수하며 사이트 유입 및 페이지 뷰 통계를 실시간으로 집계합니다.

### POST /api/analytics/events
- **Auth**: Public (익명 전송 가능)
- **Request Body**:
  ```json
  {
    "eventName": "page_view",
    "route": "/portfolio",
    "referrer": "https://google.com",
    "locale": "ko",
    "sessionId": "client-side-uuid-or-random-string",
    "metadata": {}
  }
  ```
- **Response (201)**:
  ```json
  {
    "status": "ACCEPTED",
    "eventId": "1"
  }
  ```

### GET /api/admin/analytics/summary
- **Auth**: Admin
- **Query Parameters**:
  - `from` (optional): ISO date / YYYY-MM-DD
  - `to` (optional): ISO date / YYYY-MM-DD
- **Response (200)**:
  ```json
  {
    "totalPageViews": 12450,
    "totalUniqueSessions": 3200,
    "avgViewsPerSession": 3.89,
    "timeline": [
      {
        "date": "2026-05-06",
        "pageViews": 450,
        "sessions": 120
      }
    ]
  }
  ```

### GET /api/admin/analytics/routes
- **Auth**: Admin
- **Query Parameters**:
  - `from` (optional): ISO date / YYYY-MM-DD
  - `to` (optional): ISO date / YYYY-MM-DD
  - `limit` (optional): number (기본값 15)
- **Response (200)**:
  ```json
  [
    {
      "route": "/portfolio",
      "pageViews": 8450,
      "uniqueSessions": 2100
    },
    {
      "route": "/blog",
      "pageViews": 3100,
      "uniqueSessions": 950
    }
  ]
  ```

### GET /api/admin/analytics/events
- **Auth**: Admin
- **Query Parameters**:
  - `from` (optional): ISO date / YYYY-MM-DD
  - `to` (optional): ISO date / YYYY-MM-DD
  - `eventName` (optional): string (예: `cta_click`)
- **Response (200)**: Event 객체 리스트 (최대 100건)

---

## 16. SEO Sitemap & Robots Directives

웹 검색 색인 수집봇(Spiders/Crawlers)을 유치하기 위해 표준 도메인 레벨 포맷의 색인 및 제어 파일을 제공합니다.

### GET /sitemap.xml
- **Auth**: Public (익명 전송 가능)
- **Response (200)**: XML 형식 sitemap 데이터 (`Content-Type: application/xml`)
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://crochub.dev</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>https://crochub.dev/post/1</loc>
      <lastmod>2026-05-07</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>
  </urlset>
  ```

### GET /robots.txt
- **Auth**: Public (익명 전송 가능)
- **Response (200)**: 평문 텍스트 규격 파일 (`Content-Type: text/plain`)
  ```text
  User-agent: *
  Allow: /
  Sitemap: https://crochub.dev/sitemap.xml
  ```

---

## 17. Image Optimization & Derivatives

업로드된 고용량 이미지를 모바일 및 웹 성능 최적화용 파생 썸네일(WebP)로 가공 및 관리하는 내부 어드민 제어부입니다.

### GET /api/media/:id/derivatives
- **Auth**: Admin
- **Response (200)**: 파생 파일 정보 목록
  ```json
  [
    {
      "id": 10,
      "mediaId": 5,
      "derivativeType": "thumb_small",
      "fileUrl": "https://pub.dev/derivatives/5/thumb_small.webp",
      "width": 320,
      "height": 320,
      "mimeType": "image/webp",
      "fileSize": 12450,
      "createdAt": "2026-05-07T12:00:00.000Z"
    }
  ]
  ```

### POST /api/media/:id/derivatives/regenerate
- **Auth**: Admin
- **Response (200)**:
  ```json
  {
    "status": "SUCCESS"
  }
  ```



---

## 18. Reports & Moderation

커뮤니티 안전을 위한 사용자 신고 및 어드민 모더레이션 관련 엔드포인트입니다.

### POST /api/comments/:id/reports
- **Auth**: User (로그인 필수)
- **Request Body**:
  ```json
  {
    "reason": "spam", // 'spam' | 'harassment' | 'personal_info' | 'inappropriate' | 'other'
    "description": "반복적인 광고성 댓글입니다."
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": 1,
    "commentId": 42,
    "reporterUserId": 5,
    "reason": "spam",
    "description": "반복적인 광고성 댓글입니다.",
    "status": "open",
    "resolutionNote": null,
    "resolvedByAdminId": null,
    "createdAt": "2026-05-07T12:00:00Z",
    "updatedAt": "2026-05-07T12:00:00Z"
  }
  ```
- **Error**:
  - `401`: UNAUTHORIZED
  - `400`: VALIDATION_ERROR (잘못된 사유 등)
  - `404`: COMMENT_NOT_FOUND (존재하지 않는 댓글)
  - `409`: ALREADY_REPORTED (이미 신고한 댓글)

### GET /api/admin/reports
- **Auth**: Admin
- **Query Params**:
  - `type` (optional): 'comment' | 'guestbook'
  - `status` (optional): 'open' | 'reviewing' | 'resolved' | 'rejected'
  - `page` (optional): default 1
  - `limit` (optional): default 20
- **Response (200)**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "commentId": 42,
        "reporterUserId": 5,
        "reason": "spam",
        "description": "...",
        "status": "open",
        "createdAt": "2026-05-07T12:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
  ```

### PATCH /api/admin/reports/:type/:id/status
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "status": "resolved",
    "resolutionNote": "숨김 처리 완료"
  }
  ```
- **Response (200)**: `CommentReport` 객체

### GET /api/admin/moderation/queue
- **Auth**: Admin
- **Query Params**:
  - `status` (optional): 'open' | 'reviewing'
  - `kind` (optional): 'comment' | 'guestbook'
- **Response (200)**:
  ```json
  [
    {
      "queueId": "comment_report_1",
      "kind": "comment",
      "targetId": 42,
      "contentBody": "스팸 내용",
      "reporter": "User123",
      "reason": "spam",
      "description": "...",
      "status": "open",
      "createdAt": "2026-05-07T12:00:00Z",
      "isHidden": false
    }
  ]
  ```

### PATCH /api/admin/comments/:id/moderation
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "isHidden": true,
    "hiddenReason": "spam"
  }
  ```
- **Response (200)**: 업데이트된 `Comment` 객체

## 19. Guestbook (방명록)

### GET /api/guestbook
- **Auth**: Public (None)
- **Query Params**:
  - `page` (optional): default 1
  - `limit` (optional): default 20
- **Response (200)**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "userId": 5,
        "body": "Nice web!",
        "isHidden": false,
        "createdAt": "2026-05-07T12:00:00Z",
        "user": {
          "id": 5,
          "nickname": "User123",
          "avatarUrl": "..."
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
  ```

### POST /api/guestbook
- **Auth**: User+
- **Request Body**:
  ```json
  {
    "body": "응원합니다!"
  }
  ```
- **Response (201)**: 생성된 `GuestbookEntry` 객체

### POST /api/guestbook/:id/reports
- **Auth**: User+
- **Request Body**:
  ```json
  {
    "reason": "spam",
    "description": "광고성 스팸 글입니다."
  }
  ```
- **Response (201)**: 생성된 `GuestbookReport` 객체

### PATCH /api/admin/guestbook/:id/moderation
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "isHidden": true,
    "hiddenReason": "spam"
  }
  ```
- **Response (200)**: 업데이트된 `GuestbookEntry` 객체

---

## 11. Notifications

### GET /api/notifications
- **Auth**: Authenticated User
- **Response (200)**:
  ```json
  [
    {
      "id": 1,
      "userId": 5,
      "type": "new_comment",
      "title": "새로운 댓글 알림",
      "body": "게시글에 새 의견이 작성되었습니다.",
      "linkUrl": "/post/10",
      "isRead": false,
      "createdAt": "2026-05-07T12:00:00Z"
    }
  ]
  ```

### POST /api/notifications/read-all
- **Auth**: Authenticated User
- **Response (200)**:
  ```json
  { "success": true, "count": 5 }
  ```

### PUT /api/notifications/:id/read
- **Auth**: Authenticated User
- **Response (200)**: 업데이트된 `Notification` 객체

### GET /api/notifications/unread-count
- **Auth**: Authenticated User
- **Response (200)**:
  ```json
  { "unreadCount": 3 }
  ```

### GET /api/notifications/preferences
- **Auth**: Admin
- **Response (200)**: `NotificationPreference` 객체

### PUT /api/notifications/preferences
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "onNewComment": true,
    "onNewGuestbook": true,
    "onReportFlagged": false,
    "emailDigestFreq": "daily | weekly | never",
    "emailAddress": "admin@crochub.dev"
  }
  ```
- **Response (200)**: 업데이트된 `NotificationPreference` 객체

---

## 12. Search

### GET /api/search
- **Auth**: Public
- **Query Params**:
  - `q`: 검색 키워드 (최소 2글자 이상, 한글 n-gram 지원)
- **Response (200)**:
  ```json
  {
    "posts": [
      {
        "id": 1,
        "title": "매칭된 포스트 제목",
        "category": "creative",
        "createdAt": "2026-05-07T12:00:00Z"
      }
    ],
    "showcases": [
      {
        "id": 2,
        "title": "매칭된 포트폴리오 쇼케이스",
        "slug": "portfolio-slug",
        "createdAt": "2026-05-07T12:00:00Z"
      }
    ]
  }
  ```

---

## 13. Tags

### GET /api/tags
- **Auth**: Public
- **Response (200)**: `Tag` 객체 리스트 (각 태그별 소속 콘텐츠 갯수 `contentCount` 포함)

### GET /api/tags/:slug
- **Auth**: Public
- **Response (200)**:
  ```json
  {
    "tag": {
      "id": 1,
      "name": "태그명",
      "slug": "tag-slug",
      "color": "#a78bfa"
    },
    "contents": {
      "posts": [...],
      "showcases": [...]
    }
  }
  ```

### POST /api/admin/tags
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "name": "신규 태그",
    "slug": "new-tag",
    "color": "#10b981"
  }
  ```
- **Response (201)**: 생성된 `Tag` 객체

### PUT /api/admin/tags/:id
- **Auth**: Admin
- **Request Body**: POST와 동일
- **Response (200)**: 업데이트된 `Tag` 객체

### DELETE /api/admin/tags/:id
- **Auth**: Admin
- **Response (204)**: No Content

---

## 14. Collections

### GET /api/collections
- **Auth**: Public
- **Response (200)**: `Collection` 객체 리스트 (각 컬렉션에 소속된 아이템 갯수 포함)

### GET /api/collections/:id
- **Auth**: Public
- **Response (200)**:
  ```json
  {
    "id": 1,
    "title": "컬렉션 주제",
    "description": "기획 상세",
    "isPublished": true,
    "items": [
      {
        "id": 10,
        "position": 1,
        "contentType": "post",
        "contentId": 5,
        "title": "포스트 제목",
        "createdAt": "2026-05-07T12:00:00Z"
      }
    ]
  }
  ```

### POST /api/admin/collections
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "title": "기획전 제목",
    "description": "상세 가이드",
    "isPublished": true
  }
  ```
- **Response (201)**: 생성된 `Collection` 객체

### PUT /api/admin/collections/:id
- **Auth**: Admin
- **Request Body**: POST와 동일 (전체 필드 optional)
- **Response (200)**: 업데이트된 `Collection` 객체

### DELETE /api/admin/collections/:id
- **Auth**: Admin
- **Response (204)**: No Content

### POST /api/admin/collections/:id/items
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "contentType": "post | showcase",
    "contentId": 12
  }
  ```
- **Response (201)**: 생성된 피벗 매핑 객체 (중복 시 409 Conflict 반환)

### DELETE /api/admin/collections/:id/items/:itemId
- **Auth**: Admin
- **Response (204)**: No Content

### PUT /api/admin/collections/:id/reorder
- **Auth**: Admin
- **Request Body**:
  ```json
  {
    "orderedItemIds": [2, 1, 3]
  }
  ```
- **Response (200)**: 성공 완료 안내 `{ "success": true }`



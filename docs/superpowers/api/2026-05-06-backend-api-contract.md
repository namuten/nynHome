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


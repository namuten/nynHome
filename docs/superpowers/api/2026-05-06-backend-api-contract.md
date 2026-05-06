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

# Push Campaign Management — 스펙

> **작성일:** 2026-05-13  
> **담당:** Gemini (구현), Claude (스펙)  
> **대상 브랜치:** `feature/push-campaign-management`

---

## 개요

관리자 페이지(`AdminPushPage`)에서 푸시 알림을 발송하고, 발송 이력과 통계를 관리하는 기능을 추가한다.

**범위:**
- 즉시 발송 (전체 구독자 OR 특정 유저)
- 발송 내용: 제목 + 본문 + 링크 URL + 이미지 URL (Rich Notification)
- 발송 이력 목록 (페이지네이션)
- 발송 통계 요약 (총 발송 수, 성공/실패 건수)

**범위 외 (다음 단계):**
- 예약 발송 (scheduled push)
- 그룹/세그먼트 타겟팅

---

## 1. 데이터베이스

### 1-1. Prisma 스키마 추가

`backend/prisma/schema.prisma`에 아래 모델을 추가한다.

```prisma
model PushCampaign {
  id            Int       @id @default(autoincrement())
  title         String    @db.VarChar(255)
  body          String    @db.Text
  imageUrl      String?   @db.VarChar(500)
  linkUrl       String?   @db.VarChar(500)
  targetType    String    // "all" | "user"
  targetUserId  Int?
  totalCount    Int       @default(0)
  successCount  Int       @default(0)
  failCount     Int       @default(0)
  sentAt        DateTime  @default(now())
  createdBy     Int
  createdAt     DateTime  @default(now())

  @@map("push_campaigns")
}
```

마이그레이션 실행: `npx prisma migrate dev --name add-push-campaigns`

---

## 2. 백엔드

### 2-1. push.types.ts 수정

`SendPushSchema`를 확장한다.

```typescript
export const SendPushSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  url: z.string().regex(/^\//, { message: "Internal path must start with '/'" }).optional(),
  imageUrl: z.string().url().optional(),           // 이미지 URL (신규)
  targetType: z.enum(['all', 'user']).default('all'), // 발송 대상 타입 (신규)
  targetUserId: z.number().int().positive().optional(), // 특정 유저 ID (신규)
});

export interface SendPushDto {
  title: string;
  body: string;
  url?: string;
  imageUrl?: string;
  targetType: 'all' | 'user';
  targetUserId?: number;
}
```

### 2-2. push.service.ts 수정

#### sendToAll — 이미지 지원 + 캠페인 기록

기존 `sendToAll`에 아래를 추가한다:
- FCM `notification` 필드에 `imageUrl` 추가
- Web Push payload에 `imageUrl` 추가
- 발송 완료 후 `PushCampaign` 레코드 생성

```typescript
// FCM message에 image 추가
notification: {
  title: dto.title,
  body: dto.body,
  imageUrl: dto.imageUrl,   // 추가
},

// Web Push payload에 imageUrl 추가
const payload = JSON.stringify({
  title: dto.title,
  body: dto.body,
  url: dto.url ?? '/',
  imageUrl: dto.imageUrl,   // 추가
});

// 발송 후 캠페인 기록
await prisma.pushCampaign.create({
  data: {
    title: dto.title,
    body: dto.body,
    imageUrl: dto.imageUrl ?? null,
    linkUrl: dto.url ?? null,
    targetType: 'all',
    totalCount: totalCount,
    successCount: successCount,
    failCount: failCount,
    sentAt: new Date(),
    createdBy: adminUserId,
  },
});
```

`sendToAll(dto, adminUserId: number)` 시그니처 변경 필요.

#### sendToUser — 신규 함수

특정 유저의 토큰만 조회하여 발송한다.

```typescript
export async function sendToUser(dto: SendPushDto, targetUserId: number, adminUserId: number): Promise<number> {
  // 1. 해당 유저의 Web Push 구독 조회
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: targetUserId },
  });

  // 2. 해당 유저의 Native 토큰 조회
  const devices = await prisma.nativeDevice.findMany({
    where: { userId: targetUserId },
  });

  // 발송 로직은 sendToAll과 동일 (단, 전체 조회 대신 위에서 조회한 값 사용)
  // 캠페인 기록 시 targetType: 'user', targetUserId: targetUserId 설정

  // 반환: successCount
}
```

#### getCampaignHistory — 신규 함수

```typescript
export async function getCampaignHistory(page = 1, limit = 20) {
  const [campaigns, total] = await Promise.all([
    prisma.pushCampaign.findMany({
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pushCampaign.count(),
  ]);
  return { campaigns, total, page, limit };
}
```

#### getCampaignStats — 신규 함수

```typescript
export async function getCampaignStats() {
  const result = await prisma.pushCampaign.aggregate({
    _count: { id: true },
    _sum: { totalCount: true, successCount: true, failCount: true },
  });
  return {
    totalCampaigns: result._count.id,
    totalSent: result._sum.totalCount ?? 0,
    totalSuccess: result._sum.successCount ?? 0,
    totalFail: result._sum.failCount ?? 0,
  };
}
```

### 2-3. push.router.ts 수정

기존 `POST /send` 수정 + 신규 엔드포인트 2개 추가.

```typescript
// 기존 /send — 전체 또는 유저 발송
router.post('/send', requireAuth, requireAdmin, validateBody(SendPushSchema), async (req: Request, res: Response) => {
  const adminUserId = req.user!.userId;
  const dto = req.body as SendPushDto;

  let sent: number;
  if (dto.targetType === 'user' && dto.targetUserId) {
    sent = await pushService.sendToUser(dto, dto.targetUserId, adminUserId);
  } else {
    sent = await pushService.sendToAll(dto, adminUserId);
  }
  res.json({ sent });
});

// 발송 이력 목록
router.get('/history', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await pushService.getCampaignHistory(page, limit);
  res.json(result);
});

// 발송 통계 요약
router.get('/stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const stats = await pushService.getCampaignStats();
  res.json(stats);
});
```

---

## 3. 프론트엔드

### 3-1. adminApi.ts 확인 및 추가

`frontend/src/lib/adminApi.ts`에 아래 메서드를 추가한다.

```typescript
// 기존 sendAdminPush 수정 (imageUrl, targetType, targetUserId 추가)
sendAdminPush: (payload: {
  title: string;
  body: string;
  url?: string;
  imageUrl?: string;
  targetType: 'all' | 'user';
  targetUserId?: number;
}) => api.post('/push/send', payload).then(r => r.data),

// 신규
getAdminPushHistory: (page = 1) =>
  api.get(`/push/history?page=${page}`).then(r => r.data),

getAdminPushStats: () =>
  api.get('/push/stats').then(r => r.data),
```

### 3-2. AdminPushPage.tsx 수정

기존 파일을 아래 구조로 확장한다. 기존 UI(Composer + 잠금화면 미리보기)는 유지하고, 신규 필드와 섹션을 추가한다.

#### 신규 상태 변수

```typescript
const [imageUrl, setImageUrl] = useState('');
const [targetType, setTargetType] = useState<'all' | 'user'>('all');
const [targetUserId, setTargetUserId] = useState('');
const [historyPage, setHistoryPage] = useState(1);
```

#### 폼 필드 추가 (기존 url 필드 아래에 삽입)

**이미지 URL 입력 필드:**
```
label: "푸시 알림 이미지 URL (선택)"
input type="url", placeholder="https://example.com/image.jpg"
value: imageUrl, onChange: setImageUrl
```

**발송 대상 선택:**
```
label: "발송 대상"
radio/select:
  - "전체 구독자" (value: 'all')  ← 기본값
  - "특정 유저" (value: 'user')
    → 'user' 선택 시 유저 ID 입력 필드 노출
      input type="number", placeholder="유저 ID"
      value: targetUserId, onChange: setTargetUserId
```

#### 잠금화면 미리보기에 이미지 추가

미리보기 배너에서 `imageUrl`이 있을 때 `<img>` 태그를 표시한다.

```tsx
{imageUrl && (
  <img
    src={imageUrl}
    alt="preview"
    className="w-full h-16 object-cover rounded-xl mt-1"
    onError={(e) => (e.currentTarget.style.display = 'none')}
  />
)}
```

#### 통계 카드 섹션 추가 (기존 통계 카드 영역 확장)

기존의 "총 푸시 알림 수신자" 카드 옆에 아래 카드를 추가한다:

```
카드 1: 총 캠페인 수       (stats.totalCampaigns)
카드 2: 총 발송 건수       (stats.totalSent)
카드 3: 성공률             (stats.totalSuccess / stats.totalSent * 100, %)
```

`useQuery(['admin', 'push', 'stats'], getAdminPushStats)` 사용.

#### 발송 이력 테이블 섹션 추가 (Composer 아래)

```
섹션 제목: "발송 이력"

테이블 컬럼:
- 발송 시각 (sentAt, 한국어 날짜 포맷)
- 제목 (title)
- 대상 (targetType === 'all' ? '전체' : `유저 #${targetUserId}`)
- 발송 수 (totalCount)
- 성공 (successCount)
- 실패 (failCount)
- 성공률 (successCount/totalCount*100 %)

페이지네이션: 이전/다음 버튼, 현재 페이지/총 페이지
```

`useQuery(['admin', 'push', 'history', historyPage], () => getAdminPushHistory(historyPage))` 사용.

---

## 4. 구현 순서 (Gemini 참고)

1. Prisma 스키마 추가 → 마이그레이션 실행
2. `push.types.ts` — `SendPushSchema` 확장
3. `push.service.ts` — `sendToAll` 수정, `sendToUser` / `getCampaignHistory` / `getCampaignStats` 추가
4. `push.router.ts` — 엔드포인트 수정 및 추가
5. `adminApi.ts` — 클라이언트 메서드 추가
6. `AdminPushPage.tsx` — 폼 필드, 통계 카드, 이력 테이블 추가

---

## 5. 체크리스트

- [ ] 마이그레이션 성공 확인
- [ ] 전체 발송 후 `push_campaigns` 레코드 생성 확인
- [ ] 개별 유저 발송 후 레코드 생성 확인
- [ ] `GET /push/history` 페이지네이션 동작 확인
- [ ] `GET /push/stats` 집계 값 정확성 확인
- [ ] 이미지가 있는 FCM 메시지 Android에서 이미지 노출 확인
- [ ] `targetUserId`가 없을 때 `targetType='user'` 방어 처리 확인

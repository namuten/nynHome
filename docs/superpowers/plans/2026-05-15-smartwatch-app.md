# CrocHub 스마트워치 앱 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wear OS 앱을 만들어 CrocHub 운영자가 손목에서 중요 알림(댓글, 방명록)을 확인하고 빠른 답변을 전송할 수 있게 한다.

**Architecture:** 백엔드가 FCM data 메시지를 Android 앱으로 전송하면, Android 앱의 `CrocHubMessagingService`가 이를 Wearable Data Layer API를 통해 Wear OS 앱으로 전달한다. Wear OS 앱은 알림 목록/상세/퀵액션 화면을 보여주고, 사용자 액션은 Android 앱을 통해 CrocHub 백엔드 API로 중계된다.

**Tech Stack:** Kotlin, Jetpack Compose for Wear OS, Wearable Data Layer API (MessageClient), Java (기존 Android 앱 레이어), TypeScript/Express/Prisma (백엔드), React/TypeScript (관리자 웹)

---

## 파일 맵

### 백엔드 (신규 생성)
- `backend/src/modules/watch/watch.router.ts` — 빠른 답변 문구 API 엔드포인트
- `backend/src/modules/watch/watch.service.ts` — 빠른 답변 CRUD 로직
- `backend/src/modules/watch/watch.types.ts` — DTO / Zod 스키마

### 백엔드 (수정)
- `backend/prisma/schema.prisma` — WatchQuickReply 모델 추가
- `backend/src/app.ts` — watch 라우터 등록
- `backend/src/modules/comments/comments.service.ts` — 댓글 생성 시 watch FCM 트리거
- `backend/src/modules/guestbook/guestbook.service.ts` — 방명록 등록 시 watch FCM 트리거
- `backend/src/modules/push/push.service.ts` — sendWatchNotification() 함수 추가

### Android 앱 (수정)
- `frontend/android/app/build.gradle` — `play-services-wearable` 의존성 추가
- `frontend/android/app/src/main/AndroidManifest.xml` — CrocHubMessagingService 등록
- `frontend/android/app/src/main/java/com/crochub/app/CrocHubMessagingService.java` — FCM 수신 → 워치 전달
- `frontend/android/app/src/main/java/com/crochub/app/PhoneWearListenerService.java` — 워치에서 오는 액션 처리 (좋아요, 답변)

### Wear OS 앱 (신규 모듈)
- `frontend/android/wear/build.gradle`
- `frontend/android/wear/src/main/AndroidManifest.xml`
- `frontend/android/wear/src/main/java/com/crochub/wear/MainActivity.kt`
- `frontend/android/wear/src/main/java/com/crochub/wear/data/WatchNotification.kt` — 데이터 모델
- `frontend/android/wear/src/main/java/com/crochub/wear/data/WatchDataLayer.kt` — 폰↔워치 통신
- `frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationListScreen.kt`
- `frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationDetailScreen.kt`
- `frontend/android/wear/src/main/java/com/crochub/wear/presentation/QuickReplyScreen.kt`
- `frontend/android/wear/src/main/java/com/crochub/wear/complication/UnreadCountComplication.kt`
- `frontend/android/settings.gradle` — wear 모듈 포함

### 관리자 웹 (신규/수정)
- `frontend/src/pages/admin/AdminWatchPage.tsx` — 빠른 답변 문구 설정 UI
- `frontend/src/routes/` — watch 설정 라우트 추가

---

## Task 1: DB 스키마 — WatchQuickReply 모델 추가

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: schema.prisma 하단에 모델 추가**

```prisma
model WatchQuickReply {
  id        Int      @id @default(autoincrement())
  body      String   @db.VarChar(100)
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("watch_quick_replies")
}
```

- [ ] **Step 2: 마이그레이션 생성 및 적용**

```bash
cd backend
npx prisma migrate dev --name add_watch_quick_reply
```

Expected: `✔  Your database is now in sync with your schema.`

- [ ] **Step 3: 기본 문구 시드 데이터 확인 (없으면 직접 삽입)**

```bash
npx prisma studio
```

`WatchQuickReply` 테이블에 아래 4개 행을 직접 추가:
- `body: "고마워요!", sortOrder: 0`
- `body: "곧 답변할게요 😊", sortOrder: 1`
- `body: "감사합니다 🐊", sortOrder: 2`
- `body: "방문해줘서 고마워요!", sortOrder: 3`

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "chore(db): add watch_quick_replies table"
```

---

## Task 2: 백엔드 — watch 모듈 (빠른 답변 API)

**Files:**
- Create: `backend/src/modules/watch/watch.types.ts`
- Create: `backend/src/modules/watch/watch.service.ts`
- Create: `backend/src/modules/watch/watch.router.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: watch.types.ts 생성**

```typescript
// backend/src/modules/watch/watch.types.ts
import { z } from 'zod';

export const UpdateQuickRepliesSchema = z.object({
  replies: z.array(
    z.object({
      id: z.number().int().optional(),
      body: z.string().min(1).max(100),
      sortOrder: z.number().int().min(0),
    })
  ).max(5),
});

export type UpdateQuickRepliesDto = z.infer<typeof UpdateQuickRepliesSchema>;
```

- [ ] **Step 2: watch.service.ts 생성**

```typescript
// backend/src/modules/watch/watch.service.ts
import { prisma } from '../../lib/prisma';
import { UpdateQuickRepliesDto } from './watch.types';

export async function getQuickReplies() {
  return prisma.watchQuickReply.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function updateQuickReplies(dto: UpdateQuickRepliesDto) {
  return prisma.$transaction(async (tx) => {
    await tx.watchQuickReply.deleteMany();
    return tx.watchQuickReply.createMany({
      data: dto.replies.map((r, i) => ({
        body: r.body,
        sortOrder: r.sortOrder ?? i,
      })),
    });
  });
}
```

- [ ] **Step 3: watch.router.ts 생성**

```typescript
// backend/src/modules/watch/watch.router.ts
import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { validateBody } from '../../lib/validation';
import * as watchService from './watch.service';
import { UpdateQuickRepliesSchema } from './watch.types';

const router = Router();

router.get('/quick-replies', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  const replies = await watchService.getQuickReplies();
  res.json(replies);
});

router.put('/quick-replies', requireAuth, requireAdmin, validateBody(UpdateQuickRepliesSchema), async (req: Request, res: Response) => {
  await watchService.updateQuickReplies(req.body);
  const updated = await watchService.getQuickReplies();
  res.json(updated);
});

export default router;
```

- [ ] **Step 4: app.ts에 watch 라우터 등록**

`backend/src/app.ts`에서 기존 import 블록 마지막 줄 뒤에 추가:

```typescript
import watchRouter from './modules/watch/watch.router';
```

라우터 등록 섹션에서 (예: `app.use('/api/notifications', notificationsRouter);` 뒤에):

```typescript
app.use('/api/watch', watchRouter);
```

- [ ] **Step 5: 수동 테스트 (백엔드 실행 후)**

```bash
# 빠른 답변 목록 조회 (admin 토큰 필요)
curl -H "Authorization: Bearer <admin_token>" http://localhost:3000/api/watch/quick-replies

# 빠른 답변 수정
curl -X PUT \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"replies":[{"body":"고마워요!","sortOrder":0},{"body":"감사합니다 🐊","sortOrder":1}]}' \
  http://localhost:3000/api/watch/quick-replies
```

Expected: 200 OK, JSON 배열 반환

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/watch/ backend/src/app.ts
git commit -m "feat(watch): add quick replies CRUD API"
```

---

## Task 3: 백엔드 — 댓글·방명록 생성 시 워치 FCM 전송

**Files:**
- Modify: `backend/src/modules/push/push.service.ts`
- Modify: `backend/src/modules/comments/comments.service.ts`
- Modify: `backend/src/modules/guestbook/guestbook.service.ts`

- [ ] **Step 1: push.service.ts에 sendWatchNotification() 추가**

`backend/src/modules/push/push.service.ts` 파일 하단에 추가:

```typescript
export async function sendWatchNotification(payload: {
  type: 'comment' | 'guestbook' | 'reply';
  refId: number;
  senderName: string;
  body: string;
}): Promise<void> {
  if (!firebaseAdmin) return;

  const adminDevices = await prisma.nativeDevice.findMany({
    where: { user: { role: 'admin' } },
  });

  if (adminDevices.length === 0) return;

  const tokens = adminDevices.map((d) => d.token);

  // data-only 메시지 — 알림 팝업 없이 앱에서만 처리
  const message = {
    tokens,
    data: {
      watchPriority: 'true',
      type: payload.type,
      refId: String(payload.refId),
      senderName: payload.senderName,
      body: payload.body.slice(0, 200),
    },
    android: {
      priority: 'high' as const,
    },
  };

  try {
    await firebaseAdmin.messaging().sendEachForMulticast(message);
  } catch (err) {
    console.error('[Watch FCM] 전송 실패:', err);
  }
}
```

- [ ] **Step 2: comments.service.ts — 댓글 생성 시 워치 알림 트리거**

`backend/src/modules/comments/comments.service.ts` 상단 import에 추가:

```typescript
import { sendWatchNotification } from '../push/push.service';
```

`createComment` 함수의 `return prisma.comment.create(...)` 부분을 수정:

```typescript
export async function createComment(postId: number, userId: number, dto: CreateCommentDto) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('NOT_FOUND');

  const comment = await prisma.comment.create({
    data: { body: dto.body, postId, userId },
    include: { user: { select: { nickname: true, avatarUrl: true } } },
  });

  await sendWatchNotification({
    type: 'comment',
    refId: comment.id,
    senderName: comment.user.nickname,
    body: dto.body,
  });

  return comment;
}
```

- [ ] **Step 3: guestbook.service.ts — 방명록 등록 시 워치 알림 트리거**

`backend/src/modules/guestbook/guestbook.service.ts` 상단 import에 추가:

```typescript
import { sendWatchNotification } from '../push/push.service';
```

`createEntry` 함수에서 방명록 엔트리 생성 후 알림 전송. `prisma.guestbookEntry.create(...)` 호출 이후:

```typescript
const entry = await prisma.guestbookEntry.create({ ... });

await sendWatchNotification({
  type: 'guestbook',
  refId: entry.id,
  senderName: entry.user?.nickname ?? '익명',
  body: data.body,
});

return entry;
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/modules/push/push.service.ts \
        backend/src/modules/comments/comments.service.ts \
        backend/src/modules/guestbook/guestbook.service.ts
git commit -m "feat(watch): trigger FCM data message to admin devices on comment/guestbook"
```

---

## Task 4: Android 앱 — Wearable 연동 레이어 추가

**Files:**
- Modify: `frontend/android/app/build.gradle`
- Modify: `frontend/android/app/src/main/AndroidManifest.xml`
- Create: `frontend/android/app/src/main/java/com/crochub/app/CrocHubMessagingService.java`
- Create: `frontend/android/app/src/main/java/com/crochub/app/PhoneWearListenerService.java`

- [ ] **Step 1: build.gradle에 wearable 의존성 추가**

`frontend/android/app/build.gradle`의 `dependencies` 블록에 추가:

```groovy
implementation 'com.google.android.gms:play-services-wearable:18.1.0'
```

- [ ] **Step 2: CrocHubMessagingService.java 생성**

FCM data 메시지를 수신해서 워치로 전달하는 서비스:

```java
// frontend/android/app/src/main/java/com/crochub/app/CrocHubMessagingService.java
package com.crochub.app;

import android.util.Log;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.google.android.gms.wearable.Wearable;
import com.google.android.gms.tasks.Tasks;
import com.google.android.gms.wearable.Node;
import org.json.JSONObject;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

public class CrocHubMessagingService extends FirebaseMessagingService {
    private static final String TAG = "CrocHubMsgService";
    private static final String WATCH_PATH = "/crochub/notification";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Map<String, String> data = remoteMessage.getData();
        if (!"true".equals(data.get("watchPriority"))) return;

        try {
            JSONObject payload = new JSONObject();
            payload.put("type", data.getOrDefault("type", ""));
            payload.put("refId", data.getOrDefault("refId", "0"));
            payload.put("senderName", data.getOrDefault("senderName", ""));
            payload.put("body", data.getOrDefault("body", ""));
            payload.put("timestamp", System.currentTimeMillis());

            byte[] bytes = payload.toString().getBytes();
            sendToWearNodes(bytes);
        } catch (Exception e) {
            Log.e(TAG, "워치 전달 실패", e);
        }
    }

    private void sendToWearNodes(byte[] payload) {
        new Thread(() -> {
            try {
                List<Node> nodes = Tasks.await(
                    Wearable.getNodeClient(this).getConnectedNodes()
                );
                for (Node node : nodes) {
                    Tasks.await(
                        Wearable.getMessageClient(this)
                            .sendMessage(node.getId(), WATCH_PATH, payload)
                    );
                    Log.d(TAG, "워치 노드에 전달 완료: " + node.getDisplayName());
                }
            } catch (ExecutionException | InterruptedException e) {
                Log.e(TAG, "워치 노드 전달 오류", e);
            }
        }).start();
    }
}
```

- [ ] **Step 3: PhoneWearListenerService.java 생성**

워치에서 오는 퀵액션(좋아요, 답변)을 처리하는 서비스:

```java
// frontend/android/app/src/main/java/com/crochub/app/PhoneWearListenerService.java
package com.crochub.app;

import android.util.Log;
import com.google.android.gms.wearable.MessageClient;
import com.google.android.gms.wearable.MessageEvent;
import com.google.android.gms.wearable.WearableListenerService;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class PhoneWearListenerService extends WearableListenerService {
    private static final String TAG = "PhoneWearListener";
    private static final String ACTION_PATH = "/crochub/action";
    // 실제 배포 URL로 교체 (또는 BuildConfig 상수로 관리)
    private static final String API_BASE = "https://your-crochub-domain.com/api";

    @Override
    public void onMessageReceived(MessageEvent event) {
        if (!ACTION_PATH.equals(event.getPath())) return;

        new Thread(() -> {
            try {
                String json = new String(event.getData(), StandardCharsets.UTF_8);
                JSONObject action = new JSONObject(json);
                String actionType = action.getString("actionType");
                int refId = action.getInt("refId");
                String authToken = action.optString("token", "");

                if ("like".equals(actionType)) {
                    postToApi("/comments/" + refId + "/like", "{}", authToken);
                } else if ("reply".equals(actionType)) {
                    String replyBody = action.getString("body");
                    String payload = "{\"reply\":\"" + replyBody + "\"}";
                    postToApi("/comments/" + refId + "/reply", payload, authToken);
                }
            } catch (Exception e) {
                Log.e(TAG, "액션 처리 실패", e);
            }
        }).start();
    }

    private void postToApi(String path, String body, String token) throws Exception {
        URL url = new URL(API_BASE + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setDoOutput(true);
        try (OutputStream os = conn.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
        }
        int code = conn.getResponseCode();
        Log.d(TAG, "API 응답: " + code + " for " + path);
        conn.disconnect();
    }
}
```

> **중요:** `API_BASE` 상수를 실제 도메인으로 교체하거나 `BuildConfig`로 환경별 관리할 것.

- [ ] **Step 4: AndroidManifest.xml에 서비스 등록**

`frontend/android/app/src/main/AndroidManifest.xml`의 `<application>` 태그 안에 추가:

```xml
<!-- CrocHub FCM → Watch 브리지 -->
<service
    android:name=".CrocHubMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>

<!-- 워치에서 오는 액션 처리 -->
<service
    android:name=".PhoneWearListenerService"
    android:exported="true">
    <intent-filter>
        <action android:name="com.google.android.gms.wearable.MESSAGE_RECEIVED" />
        <data
            android:host="*"
            android:pathPrefix="/crochub/action"
            android:scheme="wear" />
    </intent-filter>
</service>
```

- [ ] **Step 5: 빌드 확인**

```bash
cd frontend/android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew assembleDebug
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 6: Commit**

```bash
git add frontend/android/app/build.gradle \
        frontend/android/app/src/main/AndroidManifest.xml \
        "frontend/android/app/src/main/java/com/crochub/app/CrocHubMessagingService.java" \
        "frontend/android/app/src/main/java/com/crochub/app/PhoneWearListenerService.java"
git commit -m "feat(android): add Wearable bridge service for watch notification forwarding"
```

---

## Task 5: Wear OS 앱 — 모듈 설정

**Files:**
- Modify: `frontend/android/settings.gradle`
- Create: `frontend/android/wear/build.gradle`
- Create: `frontend/android/wear/src/main/AndroidManifest.xml`
- Create: `frontend/android/wear/src/main/res/values/themes.xml`

- [ ] **Step 1: settings.gradle에 wear 모듈 추가**

`frontend/android/settings.gradle`에 추가:

```groovy
include ':wear'
```

- [ ] **Step 2: wear/build.gradle 생성**

```groovy
// frontend/android/wear/build.gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.crochub.wear'
    compileSdk 34

    defaultConfig {
        applicationId "com.crochub.wear"
        minSdk 30
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildFeatures {
        compose true
    }

    composeOptions {
        kotlinCompilerExtensionVersion '1.5.8'
    }

    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.wear.compose:compose-material:1.3.0'
    implementation 'androidx.wear.compose:compose-foundation:1.3.0'
    implementation 'androidx.wear.compose:compose-navigation:1.3.0'
    implementation 'androidx.wear:wear:1.3.0'
    implementation 'com.google.android.gms:play-services-wearable:18.1.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation 'androidx.wear.watchface:watchface-complications-data-source:1.2.1'
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

- [ ] **Step 3: wear/src/main/AndroidManifest.xml 생성**

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-feature android:name="android.hardware.type.watch" />

    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="com.google.android.permission.PROVIDE_BACKGROUND" />

    <application
        android:icon="@mipmap/ic_launcher"
        android:label="CrocHub"
        android:theme="@style/WearTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".data.WatchMessageService"
            android:exported="true">
            <intent-filter>
                <action android:name="com.google.android.gms.wearable.MESSAGE_RECEIVED" />
                <data
                    android:host="*"
                    android:pathPrefix="/crochub/notification"
                    android:scheme="wear" />
            </intent-filter>
        </service>

        <service
            android:name=".complication.UnreadCountComplication"
            android:exported="true"
            android:permission="com.google.android.wearable.permission.BIND_COMPLICATION_PROVIDER">
            <intent-filter>
                <action android:name="androidx.wear.watchface.complications.datasource.ACTION_COMPLICATION_UPDATE_REQUEST" />
            </intent-filter>
            <meta-data
                android:name="android.support.wearable.complications.SUPPORTED_TYPES"
                android:value="SHORT_TEXT" />
            <meta-data
                android:name="android.support.wearable.complications.UPDATE_PERIOD_SECONDS"
                android:value="300" />
        </service>
    </application>
</manifest>
```

- [ ] **Step 4: themes.xml 생성**

```xml
<!-- frontend/android/wear/src/main/res/values/themes.xml -->
<resources>
    <style name="WearTheme" parent="@android:style/Theme.DeviceDefault" />
</resources>
```

- [ ] **Step 5: Commit**

```bash
git add frontend/android/settings.gradle frontend/android/wear/
git commit -m "chore(wear): scaffold Wear OS module structure"
```

---

## Task 6: Wear OS 앱 — 데이터 모델 & 통신 레이어

**Files:**
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/data/WatchNotification.kt`
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/data/WatchDataLayer.kt`
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/data/WatchMessageService.kt`

- [ ] **Step 1: WatchNotification.kt 생성 (데이터 모델)**

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/data/WatchNotification.kt
package com.crochub.wear.data

data class WatchNotification(
    val type: String,       // "comment" | "guestbook" | "reply"
    val refId: Int,
    val senderName: String,
    val body: String,
    val timestamp: Long,
    var isRead: Boolean = false,
)

data class QuickAction(
    val actionType: String, // "like" | "reply"
    val refId: Int,
    val body: String = "",
    val token: String = "",
)
```

- [ ] **Step 2: WatchDataLayer.kt 생성 (워치↔폰 통신)**

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/data/WatchDataLayer.kt
package com.crochub.wear.data

import android.content.Context
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.Wearable
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private val gson = Gson()
private const val ACTION_PATH = "/crochub/action"

suspend fun sendActionToPhone(context: Context, action: QuickAction) {
    withContext(Dispatchers.IO) {
        val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
        val payload = gson.toJson(action).toByteArray()
        nodes.forEach { node ->
            Tasks.await(
                Wearable.getMessageClient(context).sendMessage(node.id, ACTION_PATH, payload)
            )
        }
    }
}
```

- [ ] **Step 3: WatchMessageService.kt 생성 (폰→워치 메시지 수신)**

폰에서 전달된 알림을 인메모리 저장소에 보관하고 UI를 업데이트:

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/data/WatchMessageService.kt
package com.crochub.wear.data

import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import com.google.gson.Gson
import kotlinx.coroutines.flow.MutableStateFlow

object NotificationStore {
    val notifications = MutableStateFlow<List<WatchNotification>>(emptyList())

    fun add(notification: WatchNotification) {
        val current = notifications.value.toMutableList()
        current.add(0, notification)
        if (current.size > 20) current.removeAt(current.size - 1)
        notifications.value = current
    }

    fun markRead(refId: Int) {
        notifications.value = notifications.value.map {
            if (it.refId == refId) it.copy(isRead = true) else it
        }
    }

    fun unreadCount() = notifications.value.count { !it.isRead }
}

class WatchMessageService : WearableListenerService() {
    private val gson = Gson()

    override fun onMessageReceived(event: MessageEvent) {
        if (event.path != "/crochub/notification") return
        val json = String(event.data)
        val notification = gson.fromJson(json, WatchNotification::class.java)
        NotificationStore.add(notification)
    }
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/android/wear/src/main/java/com/crochub/wear/data/
git commit -m "feat(wear): add data models and phone-watch communication layer"
```

---

## Task 7: Wear OS 앱 — 알림 목록 화면

**Files:**
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationListScreen.kt`

- [ ] **Step 1: NotificationListScreen.kt 생성**

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationListScreen.kt
package com.crochub.wear.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.*
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.data.WatchNotification
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun NotificationListScreen(onItemClick: (WatchNotification) -> Unit) {
    val notifications by NotificationStore.notifications.collectAsState()

    if (notifications.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("새 알림 없음", fontSize = 14.sp, color = Color.Gray)
        }
        return
    }

    ScalingLazyColumn(modifier = Modifier.fillMaxSize()) {
        items(notifications) { notification ->
            NotificationItem(notification = notification, onClick = { onItemClick(notification) })
        }
    }
}

@Composable
fun NotificationItem(notification: WatchNotification, onClick: () -> Unit) {
    val icon = if (notification.type == "guestbook") "📓" else "💬"
    val time = SimpleDateFormat("HH:mm", Locale.getDefault())
        .format(Date(notification.timestamp))

    Chip(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 2.dp),
        onClick = onClick,
        label = {
            Text(
                "$icon ${notification.senderName}",
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                color = if (notification.isRead) Color.Gray else Color.White,
            )
        },
        secondaryLabel = {
            Text(
                notification.body,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                fontSize = 11.sp,
                color = Color.LightGray,
            )
        },
        colors = ChipDefaults.chipColors(
            backgroundColor = if (notification.isRead) Color(0xFF2A2A2A) else Color(0xFF7B5EA7)
        ),
    )
}
```

- [ ] **Step 2: 에뮬레이터에서 UI 확인**

Android Studio에서 Wear OS 에뮬레이터 실행 후 `NotificationListScreen`이 목록을 정상적으로 렌더링하는지 확인.

- [ ] **Step 3: Commit**

```bash
git add frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationListScreen.kt
git commit -m "feat(wear): add notification list screen"
```

---

## Task 8: Wear OS 앱 — 알림 상세 + 퀵 액션 화면

**Files:**
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationDetailScreen.kt`

- [ ] **Step 1: NotificationDetailScreen.kt 생성**

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationDetailScreen.kt
package com.crochub.wear.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.material.*
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.data.QuickAction
import com.crochub.wear.data.WatchNotification
import com.crochub.wear.data.sendActionToPhone
import kotlinx.coroutines.launch

@Composable
fun NotificationDetailScreen(
    notification: WatchNotification,
    authToken: String,
    onQuickReply: () -> Unit,
    onBack: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current

    LaunchedEffect(notification.refId) {
        NotificationStore.markRead(notification.refId)
    }

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize().padding(horizontal = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        item {
            Text(
                text = notification.senderName,
                fontSize = 13.sp,
                color = Color(0xFFBB86FC),
                modifier = Modifier.padding(top = 16.dp, bottom = 4.dp),
            )
        }
        item {
            Text(
                text = notification.body,
                fontSize = 12.sp,
                color = Color.White,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 12.dp),
            )
        }
        item {
            // 좋아요 버튼
            Chip(
                modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                onClick = {
                    scope.launch {
                        sendActionToPhone(
                            context,
                            QuickAction("like", notification.refId, token = authToken)
                        )
                        onBack()
                    }
                },
                label = { Text("❤️ 좋아요") },
                colors = ChipDefaults.chipColors(backgroundColor = Color(0xFF4A3F6B)),
            )
        }
        item {
            // 빠른 답변 버튼
            Chip(
                modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                onClick = onQuickReply,
                label = { Text("💬 빠른 답변") },
                colors = ChipDefaults.chipColors(backgroundColor = Color(0xFF3F4F6B)),
            )
        }
        item {
            // 읽음 처리 (뒤로)
            Chip(
                modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                onClick = onBack,
                label = { Text("✓ 확인") },
                colors = ChipDefaults.chipColors(backgroundColor = Color(0xFF2A2A2A)),
            )
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/android/wear/src/main/java/com/crochub/wear/presentation/NotificationDetailScreen.kt
git commit -m "feat(wear): add notification detail screen with quick actions"
```

---

## Task 9: Wear OS 앱 — 빠른 답변 선택 화면 + MainActivity 조합

**Files:**
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/presentation/QuickReplyScreen.kt`
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/MainActivity.kt`

- [ ] **Step 1: QuickReplyScreen.kt 생성**

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/presentation/QuickReplyScreen.kt
package com.crochub.wear.presentation

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.itemsIndexed
import androidx.wear.compose.material.*
import com.crochub.wear.data.QuickAction
import com.crochub.wear.data.WatchNotification
import com.crochub.wear.data.sendActionToPhone
import kotlinx.coroutines.launch

// 기본 문구 — 앱 초기에는 하드코딩, 향후 폰 앱에서 동기화
private val DEFAULT_REPLIES = listOf(
    "고마워요!",
    "곧 답변할게요 😊",
    "감사합니다 🐊",
    "방문해줘서 고마워요!",
)

@Composable
fun QuickReplyScreen(
    notification: WatchNotification,
    authToken: String,
    onSent: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current
    var sending by remember { mutableStateOf(false) }

    if (sending) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    ScalingLazyColumn(modifier = Modifier.fillMaxSize()) {
        itemsIndexed(DEFAULT_REPLIES) { _, reply ->
            Chip(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp),
                onClick = {
                    sending = true
                    scope.launch {
                        sendActionToPhone(
                            context,
                            QuickAction(
                                actionType = "reply",
                                refId = notification.refId,
                                body = reply,
                                token = authToken,
                            )
                        )
                        onSent()
                    }
                },
                label = { Text(reply, color = Color.White) },
                colors = ChipDefaults.chipColors(backgroundColor = Color(0xFF3F4F6B)),
            )
        }
    }
}
```

- [ ] **Step 2: MainActivity.kt 생성 (네비게이션 조립)**

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/MainActivity.kt
package com.crochub.wear

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.*
import androidx.navigation.NavType
import androidx.navigation.navArgument
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.crochub.wear.data.NotificationStore
import com.crochub.wear.data.WatchNotification
import com.crochub.wear.presentation.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // TODO: 실제 인증 토큰은 SharedPreferences 또는 폰 앱에서 DataClient로 동기화
        val authToken = "REPLACE_WITH_REAL_TOKEN"

        setContent {
            val navController = rememberSwipeDismissableNavController()
            val notifications by NotificationStore.notifications.collectAsState()
            var selectedNotification by remember { mutableStateOf<WatchNotification?>(null) }

            SwipeDismissableNavHost(navController = navController, startDestination = "list") {
                composable("list") {
                    NotificationListScreen(
                        onItemClick = { notification ->
                            selectedNotification = notification
                            navController.navigate("detail")
                        }
                    )
                }
                composable("detail") {
                    selectedNotification?.let { notification ->
                        NotificationDetailScreen(
                            notification = notification,
                            authToken = authToken,
                            onQuickReply = { navController.navigate("quickreply") },
                            onBack = { navController.popBackStack() },
                        )
                    }
                }
                composable("quickreply") {
                    selectedNotification?.let { notification ->
                        QuickReplyScreen(
                            notification = notification,
                            authToken = authToken,
                            onSent = { navController.popBackStack("list", inclusive = false) },
                        )
                    }
                }
            }
        }
    }
}
```

- [ ] **Step 3: 에뮬레이터에서 전체 플로우 확인**

Wear OS 에뮬레이터 실행 후:
1. `NotificationStore.add(...)` 테스트 데이터 추가하여 목록 확인
2. 항목 탭 → 상세 화면 진입 확인
3. 빠른 답변 탭 → 문구 목록 확인
4. 문구 선택 → 로딩 → 목록으로 복귀 확인

- [ ] **Step 4: Commit**

```bash
git add frontend/android/wear/src/main/java/com/crochub/wear/presentation/QuickReplyScreen.kt \
        frontend/android/wear/src/main/java/com/crochub/wear/MainActivity.kt
git commit -m "feat(wear): add quick reply screen and wire up navigation"
```

---

## Task 10: Wear OS 앱 — 워치페이스 Complication (미확인 알림 수)

**Files:**
- Create: `frontend/android/wear/src/main/java/com/crochub/wear/complication/UnreadCountComplication.kt`

- [ ] **Step 1: UnreadCountComplication.kt 생성**

```kotlin
// frontend/android/wear/src/main/java/com/crochub/wear/complication/UnreadCountComplication.kt
package com.crochub.wear.complication

import androidx.wear.watchface.complications.data.*
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.crochub.wear.data.NotificationStore

class UnreadCountComplication : SuspendingComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        if (type != ComplicationType.SHORT_TEXT) return null
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder("3").build(),
            contentDescription = PlainComplicationText.Builder("미확인 알림 3개").build(),
        ).build()
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        if (request.complicationType != ComplicationType.SHORT_TEXT) return null
        val count = NotificationStore.unreadCount()
        val text = if (count > 0) count.toString() else "–"
        return ShortTextComplicationData.Builder(
            text = PlainComplicationText.Builder(text).build(),
            contentDescription = PlainComplicationText.Builder("미확인 알림 $count 개").build(),
        ).build()
    }
}
```

- [ ] **Step 2: 빌드 최종 확인**

```bash
cd frontend/android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew :wear:assembleDebug
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step 3: Commit**

```bash
git add frontend/android/wear/src/main/java/com/crochub/wear/complication/
git commit -m "feat(wear): add unread count complication for watchface"
```

---

## Task 11: 관리자 웹 — 빠른 답변 문구 설정 페이지

**Files:**
- Create: `frontend/src/pages/admin/AdminWatchPage.tsx`
- Modify: `frontend/src/routes/` (라우트 추가)

- [ ] **Step 1: AdminWatchPage.tsx 생성**

```tsx
// frontend/src/pages/admin/AdminWatchPage.tsx
import { useState, useEffect } from 'react';

interface QuickReply {
  id?: number;
  body: string;
  sortOrder: number;
}

export default function AdminWatchPage() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/watch/quick-replies', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then(setReplies);
  }, []);

  const updateBody = (index: number, value: string) => {
    setReplies((prev) =>
      prev.map((r, i) => (i === index ? { ...r, body: value } : r))
    );
  };

  const addReply = () => {
    if (replies.length >= 5) return;
    setReplies((prev) => [...prev, { body: '', sortOrder: prev.length }]);
  };

  const removeReply = (index: number) => {
    setReplies((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/watch/quick-replies', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        replies: replies.map((r, i) => ({ ...r, sortOrder: i })),
      }),
    });
    setSaving(false);
    setMessage(res.ok ? '저장되었습니다 ✓' : '저장 실패');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '480px' }}>
      <h2>⌚ 워치 빠른 답변 설정</h2>
      <p style={{ color: '#888', fontSize: '13px' }}>
        스마트워치에서 보여줄 빠른 답변 문구를 설정합니다. 최대 5개.
      </p>

      {replies.map((reply, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            value={reply.body}
            onChange={(e) => updateBody(index, e.target.value)}
            maxLength={100}
            placeholder="답변 문구 입력"
            style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', background: '#1a1a2e', color: '#fff' }}
          />
          <button
            onClick={() => removeReply(index)}
            style={{ padding: '8px 12px', background: '#4a1a1a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            삭제
          </button>
        </div>
      ))}

      {replies.length < 5 && (
        <button
          onClick={addReply}
          style={{ marginBottom: '16px', padding: '8px 16px', background: '#2a2a4e', color: '#fff', border: '1px dashed #666', borderRadius: '8px', cursor: 'pointer' }}
        >
          + 문구 추가
        </button>
      )}

      <br />
      <button
        onClick={save}
        disabled={saving}
        style={{ padding: '10px 24px', background: '#7B5EA7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        {saving ? '저장 중...' : '저장'}
      </button>

      {message && <p style={{ marginTop: '8px', color: message.includes('✓') ? '#4CAF50' : '#f44336' }}>{message}</p>}
    </div>
  );
}
```

- [ ] **Step 2: 라우트 등록**

기존 관리자 라우트 파일(`frontend/src/routes/` 또는 `frontend/src/App.tsx`)에서 admin 라우트 목록에 추가:

```tsx
import AdminWatchPage from '../pages/admin/AdminWatchPage';

// 기존 admin 라우트 블록 안에 추가:
<Route path="/admin/watch" element={<AdminWatchPage />} />
```

- [ ] **Step 3: 관리자 사이드바 메뉴 링크 추가**

관리자 레이아웃 파일(`frontend/src/components/admin/` 또는 `AdminLayoutPage.tsx`)에서 사이드바 메뉴 항목 추가:

```tsx
{ label: '⌚ 워치 설정', path: '/admin/watch' }
```

- [ ] **Step 4: 브라우저에서 동작 확인**

1. `/admin/watch` 접속
2. 문구 목록 로드 확인
3. 문구 수정 후 저장 확인
4. 페이지 새로고침 후 변경사항 유지 확인

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/admin/AdminWatchPage.tsx frontend/src/routes/ frontend/src/App.tsx
git commit -m "feat(admin): add watch quick reply settings page"
```

---

## Task 12: 통합 테스트 체크리스트

아래 항목을 순서대로 확인한다. 실제 기기(안드로이드 폰 + Wear OS 워치)로 테스트 권장.

- [ ] **백엔드 → 폰 FCM 전달**
  - 테스트 댓글 또는 방명록 등록
  - 백엔드 로그에서 `[Watch FCM] 전송` 확인
  - 폰의 `CrocHubMessagingService` logcat에서 `watchPriority: true` 메시지 수신 확인

- [ ] **폰 → 워치 메시지 전달**
  - logcat 필터: `CrocHubMsgService`
  - `워치 노드에 전달 완료:` 로그 확인
  - 워치의 `WatchMessageService` logcat에서 메시지 수신 확인

- [ ] **워치 UI 알림 목록 표시**
  - 새 알림이 목록 상단에 표시되는지 확인
  - 읽지 않은 항목 강조색 (보라) 확인

- [ ] **워치 퀵 액션 — 좋아요**
  - 알림 상세 → 좋아요 탭
  - 폰 logcat에서 `PhoneWearListener: API 응답: 200 for /comments/...` 확인

- [ ] **워치 퀵 액션 — 빠른 답변**
  - 알림 상세 → 빠른 답변 → 문구 선택
  - 전송 완료 후 목록으로 복귀 확인
  - CrocHub 관리자 웹에서 해당 댓글에 답변이 달린 것 확인

- [ ] **워치페이스 Complication**
  - 워치페이스 편집 화면에서 CrocHub Complication 추가
  - 미확인 알림 수 표시 확인

- [ ] **관리자 웹 빠른 답변 설정**
  - 문구 수정 → 저장
  - (추후) 워치 앱이 동기화된 문구 표시하는지 확인

---

## 주의사항

- `PhoneWearListenerService.java`의 `API_BASE` 상수를 실제 배포 도메인으로 교체할 것
- `MainActivity.kt`의 `authToken`은 현재 하드코딩됨 — 추후 `DataClient`를 통해 폰 앱에서 안전하게 동기화하도록 개선 필요
- 워치의 빠른 답변 문구는 현재 하드코딩 — 추후 `/api/watch/quick-replies` API에서 DataClient로 동기화하도록 개선 가능

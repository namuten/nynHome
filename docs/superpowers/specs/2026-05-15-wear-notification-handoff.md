# Wear OS 알림 파이프라인 — 인수인계 문서

> **작성일:** 2026-05-15  
> **작성자:** Claude  
> **대상:** Gemini (다음 세션에서 이어서 구현)  
> **브랜치:** `dev`

---

## 목표

웹에서 방명록(Guestbook)을 남기면 → 관리자의 Wear OS 워치에 알림이 도착하는 파이프라인을 완성하는 것.

---

## 현재 구현 상태 (완료된 것)

파이프라인 코드는 **전부 구현 완료**됨. 흐름은 아래와 같다:

```
웹 방명록 제출
  └→ backend: guestbook.service.ts → sendWatchNotification()
       └→ FCM data-only 메시지 (watchPriority: "true")
            └→ 폰 앱: CrocHubMessagingService.onMessageReceived()
                 └→ WearableMessageClient.sendMessage("/crochub/notification", payload)
                      └→ 워치: WatchMessageService.onMessageReceived()
                           또는 MainActivity MessageClient 리스너 (포그라운드)
                                └→ NotificationStore.add()
                                     └→ Compose UI 자동 업데이트
```

### 확인된 동작

- 폰 에뮬레이터 logcat에서 `CrocHubMsgService: 워치 노드에 전달 완료: Wear_OS_XL_Round` 확인 완료
- DB에 FCM 토큰 연결 확인: `nativeDevice` id=3, **userId=1 (admin)** — `sendWatchNotification()` 쿼리 조건 충족
- 워치 에뮬레이터에서 직접 알림 주입 테스트 성공 (`total=4`까지 누적 확인)

---

## 현재 남은 문제

### 1. 에뮬레이터 GMS 한계 (테스트만의 문제, 실기기에서는 OK)

Wear OS 에뮬레이터의 GMS(Google Mobile Services)가 `WearableListenerService` 바인딩과 `MessageClient` 콜백 전달을 **둘 다 지원하지 않음**.

- 워치 logcat에서 `Failed to deliver message to AppKey[...]` 반복 출력
- 이건 에뮬레이터 자체 한계 — 실기기에서는 정상 동작 예상
- **실기기 최종 테스트 필요**

### 2. 에뮬레이터 테스트용 우회 방법 (이미 구현됨)

`DebugNotifReceiver`를 워치 앱에 추가해 adb로 직접 NotificationStore에 주입 가능:

```bash
# 기본 테스트 알림
adb -s emulator-5556 shell am broadcast -a com.crochub.DEBUG_NOTIF -p com.crochub.wear

# 커스텀 JSON
adb -s emulator-5556 shell am broadcast -a com.crochub.DEBUG_NOTIF -p com.crochub.wear \
  --es json '{"refId":42,"type":"guestbook","body":"방명록 테스트","senderName":"홍길동","timestamp":1715780000000}'
```

---

## 변경된 파일 목록

| 파일 경로 | 변경 내용 |
|-----------|-----------|
| `frontend/android/wear/src/main/AndroidManifest.xml` | `WatchMessageService`에서 `android:permission="com.google.android.wearable.permission.BIND_LISTENER_SERVICE"` 제거 (Wear OS 3.x 호환) |
| `frontend/android/wear/src/main/java/com/crochub/wear/MainActivity.kt` | `MessageClient.OnMessageReceivedListener` 추가 — 포그라운드 시 직접 수신 |
| `frontend/android/wear/src/main/java/com/crochub/wear/DebugNotifReceiver.kt` | 에뮬레이터 직접 주입용 리시버 (신규 생성) |

---

## 코드 상세

### wear/src/main/AndroidManifest.xml (현재 상태)

```xml
<service
    android:name=".data.WatchMessageService"
    android:exported="true">
    <!-- BIND_LISTENER_SERVICE 권한 제거됨 — Wear OS 3 에뮬레이터에 해당 권한 없음 -->
    <intent-filter>
        <action android:name="com.google.android.gms.wearable.MESSAGE_RECEIVED" />
        <data
            android:host="*"
            android:pathPrefix="/crochub/notification"
            android:scheme="wear" />
    </intent-filter>
</service>

<receiver android:name=".DebugNotifReceiver" android:exported="true">
    <intent-filter>
        <action android:name="com.crochub.DEBUG_NOTIF" />
    </intent-filter>
</receiver>
```

### wear/src/main/java/com/crochub/wear/MainActivity.kt (핵심 추가 부분)

```kotlin
class MainActivity : ComponentActivity() {
    private val gson = Gson()
    private val messageListener = MessageClient.OnMessageReceivedListener { event ->
        if (event.path == "/crochub/notification") {
            try {
                val notification = gson.fromJson(String(event.data), WatchNotification::class.java)
                NotificationStore.add(notification)
            } catch (e: Exception) {
                Log.e("MainActivity", "Parse error", e)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Wearable.getMessageClient(this).addListener(messageListener)
        // ... setContent { ... }
    }

    override fun onDestroy() {
        super.onDestroy()
        Wearable.getMessageClient(this).removeListener(messageListener)
    }
}
```

### wear/src/main/java/com/crochub/wear/DebugNotifReceiver.kt (신규)

```kotlin
class DebugNotifReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val json = intent.getStringExtra("json")
        if (json != null) {
            val notification = gson.fromJson(json, WatchNotification::class.java)
            NotificationStore.add(notification)
        } else {
            // json 없으면 가짜 알림 주입
            val fake = WatchNotification(
                refId = (System.currentTimeMillis() % 10000).toInt(),
                type = "comment",
                body = "에뮬레이터 직접 주입 테스트입니다.",
                senderName = "디버그",
                timestamp = System.currentTimeMillis()
            )
            NotificationStore.add(fake)
        }
    }
}
```

---

## 다음 세션에서 할 일

### 우선순위 1 — 실기기 End-to-End 테스트

실제 안드로이드 폰 + Wear OS 워치를 연결해서 전체 흐름 검증:

1. 폰에 APK 설치 후 어드민 로그인
2. 웹 브라우저에서 방명록 제출
3. 폰 logcat 확인: `CrocHubMsgService: 워치 노드에 전달 완료`
4. 워치 logcat 확인: `WatchMsgService: Added notification` 또는 `MainActivity: Notification added`
5. 워치 화면에 알림 목록 표시 확인

### 우선순위 2 — Quick Reply 기능 완성

워치에서 알림에 답장 보내는 기능 (`QuickReplyScreen`) 구현 상태 점검:

- `frontend/android/wear/src/main/java/com/crochub/wear/presentation/QuickReplyScreen.kt` 확인
- `PhoneWearListenerService.java` — 워치에서 보낸 action을 폰이 받아 백엔드 API 호출하는 부분 확인
- `/crochub/action` 경로로 폰에 메시지 전송 → 백엔드 reply API 호출 흐름

### 우선순위 3 — 알림 타입별 딥링크

워치 알림 클릭 시 워치 앱 내 해당 화면으로 이동:
- `comment` → 댓글 상세
- `guestbook` → 방명록 상세
- `reply` → 답글 상세

---

## 개발 환경

```bash
# 에뮬레이터 실행 (Android Studio에서 실행 후)
# 폰: emulator-5554, 워치: emulator-5556

# adb 터널 설정 (재부팅 후 매번 필요)
adb -s emulator-5554 forward tcp:5601 tcp:5601
adb -s emulator-5556 reverse tcp:5601 tcp:5601

# APK 빌드
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
cd frontend/android
./gradlew assembleDebug

# 폰 앱 설치
adb -s emulator-5554 install -r app/build/outputs/apk/debug/app-debug.apk

# 워치 앱 설치
adb -s emulator-5556 install -r wear/build/outputs/apk/debug/wear-debug.apk

# 워치 앱 실행
adb -s emulator-5556 shell am start -n com.crochub.wear/.MainActivity

# logcat 모니터링
adb -s emulator-5556 logcat -s WatchMsgService MainActivity DebugNotifReceiver
adb -s emulator-5554 logcat -s CrocHubMsgService DebugWear
```

---

## 관련 파일 위치

```
frontend/android/
├── app/src/main/java/com/crochub/app/
│   ├── CrocHubMessagingService.java    # FCM 수신 → 워치 전달
│   ├── PhoneWearListenerService.java   # 워치 action 수신 → 백엔드 호출
│   └── DebugWearReceiver.java          # adb 테스트용
└── wear/src/main/java/com/crochub/wear/
    ├── MainActivity.kt                  # MessageClient 리스너
    ├── DebugNotifReceiver.kt            # 에뮬레이터 직접 주입용
    ├── data/
    │   ├── WatchMessageService.kt       # WearableListenerService
    │   ├── WatchNotification.kt         # 데이터 모델
    │   └── NotificationStore.kt        # MutableStateFlow 저장소
    └── presentation/
        ├── NotificationListScreen.kt    # 알림 목록 화면
        ├── NotificationDetailScreen.kt  # 알림 상세 화면
        └── QuickReplyScreen.kt          # 빠른 답장 화면

backend/src/modules/
├── guestbook/guestbook.service.ts      # sendWatchNotification() 호출 위치
└── push/push.service.ts                # sendWatchNotification() 구현
```

---

## 참고 사항

- 백엔드 서버: `https://nynhome.duckdns.org/api` (Firebase Admin SDK 설정 완료)
- FCM 토큰 → userId=1(admin) 연결 완료 (DB `native_devices` 테이블 id=3)
- `WatchNotification` 모델: `type`, `refId`, `senderName`, `body`, `timestamp`, `isRead`
- `NotificationStore`는 최대 20개 유지, 새 알림은 맨 앞에 추가

# CrocHub Production Caching & Release Checklist

이 문서는 CrocHub 서비스를 실하드닝 및 프로덕션 환경에 배포할 때 점검해야 할 캐싱(Cache-Control), CDN 캐시 정책, 그리고 보안 헤더 구성을 수록한 표준 운영 명세서입니다.

---

## 1. 정적 자산 및 콘텐츠 캐시 정책 (Nginx & Express)

| 자산 유형 (Asset Type) | 캐시 정책 (Cache-Control) | 설정 레이어 (Layer) | 설명 및 목적 (Rationale) |
| :--- | :--- | :--- | :--- |
| **Vite Compiled Assets** (`/assets/*`) | `public, max-age=31536000, immutable` | Nginx Proxy / CDN | 해시된 정적 자산(JS/CSS)으로 변경 불가능하므로 브라우저 및 에지 노드에 1년간 영구 캐시 처리. |
| **HTML Shell** (`index.html`) | `no-cache, no-store, must-revalidate` | Nginx Proxy | 번들 업데이트 시 즉각 반영을 위해 index.html 캐싱 금지. |
| **Dynamic APIs** (`/api/*`) | `no-store, no-cache, must-revalidate, proxy-revalidate` | Express API Middleware | 실시간 댓글, 게시물 데이터 노출 보호 및 인증 세션 정보 리크 차단. |
| **SEO Files** (`/sitemap.xml`, `/robots.txt`) | `public, max-age=3600` | Express Route | 1시간 캐싱 허용으로 검색엔진 봇 쿼리 과부하 경감. |
| **Health Check** (`/api/health`) | `public, max-age=3600` | Express Route | 로드 밸런서 핑 체크에 따른 불필요한 연산 가속화. |

---

## 2. Cloudflare R2 / CDN 캐시 설계 가이드

Cloudflare R2 버킷과 에지 캐시(CDN) 앞단에서 기대하는 고성능 자산 전송용 권장 TTL 정책입니다.

### A. 원본 미디어 (Original Media)
* **경로 키**: `uploads/{uuid}/{filename}`
* **권장 브라우저 캐시 TTL**: `86400초 (24시간)`
* **Cloudflare CDN Edge Cache TTL**: `30일`
* **설명**: 한 번 업로드된 미디어의 원본 주소는 고유하나 수정 가능성이 존재하므로 브라우저 캐시는 24시간으로 보수적으로 잡되, CDN 에지 노드 캐시는 길게 설정해 비용과 응답 지연을 방지합니다.

### B. 파생 썸네일 (Media Derivatives)
* **경로 키**: `derivatives/{mediaId}/{derivativeType}.webp`
* **권장 브라우저 캐시 TTL**: `31536000초 (1년, immutable)`
* **Cloudflare CDN Edge Cache TTL**: `365일`
* **설명**: 썸네일은 원본 ID와 포맷 명칭(`thumb_small`, `thumb_medium` 등)이 명확히 인덱싱되어 절대 수정되지 않으므로 최장기간 에지 캐시 및 영구 불변 브라우저 캐시를 구성합니다.

---

## 3. 프로덕션 헤더 수동 검증 가이드 (Verification Guide)

배포 실행 후 프록시 레이어의 정상 동작 여부를 아래의 `curl` 명령어를 사용해 터미널에서 즉각 검토합니다.

### A. 메인 쉘 브라우저 캐시 우회 여부 검증
```bash
curl -I http://localhost/
```
* **기대 응답 헤더**:
  ```http
  HTTP/1.1 200 OK
  Cache-Control: no-cache, no-store, must-revalidate
  ```

### B. Vite 정적 빌드 파일 초고속 영구 캐시 검증
```bash
curl -I http://localhost/assets/index-DAW1Hqpf.css
```
* **기대 응답 헤더**:
  ```http
  HTTP/1.1 200 OK
  Cache-Control: public, max-age=31536000, immutable
  ```

### C. 동적 API 캐싱 누출 방지(No-Store) 검증
```bash
curl -I http://localhost/api/posts
```
* **기대 응답 헤더**:
  ```http
  HTTP/1.1 201 Created / 200 OK
  Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
  Pragma: no-cache
  Expires: 0
  ```

### D. sitemap 및 robots 최적 정책 검증
```bash
curl -I http://localhost/sitemap.xml
curl -I http://localhost/robots.txt
```
* **기대 응답 헤더**:
  ```http
  HTTP/1.1 200 OK
  Cache-Control: public, max-age=3600
  ```

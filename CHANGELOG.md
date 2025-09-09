# CHANGELOG

## Week 1 — TypeScript 심화 + zod + 폼/a11y

### Day 1 — API 타입 세이프티

- Result 패턴 (`ok`, `err`) 도입
- AppError 타입 정의
  - `NetworkError` / `TimeoutError` / `HttpError` / `ParseError` / `ValidationError`
- fetchJson<T>() 구현
  - 타임아웃 처리 (AbortController + setTimeout)
  - AbortSignal 병합
  - 런타임 검증 (zod)
- 단위 테스트 5개 작성
  - 성공 케이스
  - HTTP 500 → HttpError
  - 파싱 실패 → ParseError (`raw` 본문 확인)
  - TimeoutError 재현 (~20ms)
  - ValidationError (필드 누락)
- README에 Day 1 요약 추가

---

### Day 2 — DTO ↔ ViewModel 매핑 & 유틸 타입

**요약**: 서버 응답과 화면 표시를 분리하고, 매핑 레이어에서 포맷팅/라벨/파생 필드를 표준화.

- 타입
  - `UserDTO` / `UserVM` 정의
- 매핑
  - `createMapper<Src, Dest>()` 제네릭 매퍼 추가
  - `userMap`(키 매핑) + `derive`(파생 필드: `joinedAt`, `planLabel`, `badge`, `city`)
  - invalid date 가드(`parseDate`: 실패 시 epoch)
- 화면 적용
  - `UserDetail` 컴포넌트 VM 기반 렌더
  - `UserList` 추가: DTO[] → VM[] 변환 후 렌더
  - 컴포넌트 내 포맷팅/라벨 계산 로직 제거
- 테스트
  - `mapping.user.test.ts` **2 케이스 PASS** (기본/옵셔널)
  - `mapping.user.extra.test.ts` **2 케이스 추가** (라벨/배지, invalid date)
    - ※ alias 설정 필요 시 상대경로로 임시 통과
- 개발 환경
  - Vite dev server 스크립트 및 `index.html`/`main.tsx`/`App.tsx` 구성
  - `@` 경로 alias(`tsconfig.paths`) + `vite-tsconfig-paths` 적용
- 지표(예시)
  - 매핑 적용 화면: **1 → 2**
  - 화면 내 포맷팅 로직 제거: **-24 LOC**
  - 단위 테스트: **+2 통과** (+2 작성)

---

### Day 3 — zod 스키마 & 검증 파이프

**요약**: 스키마를 중첩/교차 규칙까지 확장하고, `fetchJson`과 결합해 **런타임 안전망** 강화.

- 추가
  - `AddressSchema`, `UserSchema`(중첩, `coerce.date`, `superRefine` 규칙)
  - `pageSchema(item)` 제네릭 → `UserPageSchema`
  - `type User = z.infer<typeof UserSchema>` 타입 동기화
- 변경/개선
  - `fetchJson(url, { schema })` 경로에서 검증 실패 시 `ValidationError(issues[])` 표준화
  - (보강) 기본 `Accept` 헤더 추가, JSON 파싱 실패 시 `ParseError`에 `raw` 보존
- 테스트
  - `api/__tests__/fetchJson.test.ts` 보강: 총 **7 케이스 PASS**
    - 성공(JSON), `parse: "text"`, 스키마 검증 성공/실패
    - HTTP 에러 → `HttpError(status, body)`
    - JSON 깨짐 → `ParseError(raw)`
    - 타임아웃 → `TimeoutError(timeoutMs)`
- 지표(예시)
  - 런타임 파싱 오류: **3 → 0** (샘플 API 기준)
  - 검증 실패 메시지 표준화 적용 범위: **100%**
  - 테스트: **+2 케이스 추가**

---

### Infra — 모노레포 전환 & SDK MVP 빌드 (2025-09-09)

- 루트 `package.json`에 **workspaces** 추가: `["packages/*", "apps/*"]`
- `packages/api-safety-sdk` 패키지 스캐폴드
  - `package.json`(exports, build 스크립트), `tsconfig.build.json`, `src/index.ts`(re-export)
  - **빌드 통과** → `dist/` 생성 (SDK **0.1.0 MVP**)
  - `zod@4` 정합성 확보(루트와 동일 버전)
- 스크립트
  - `build:sdk`: `npm -w packages/api-safety-sdk run build`
- 스모크
  - 레퍼런스 앱에서 `fetchJson` 호출 성공 (성공/Decode/Timeout/Http 시나리오 확인)
- 지표(예시)
  - SDK 빌드 실패: **1 → 0**
  - 배포물(dist) 크기(esm+cjs+d.ts): 기록 시작

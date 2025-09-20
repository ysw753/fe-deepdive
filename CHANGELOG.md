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

### Day 4 — 데모앱 스캐폴드 + 로그인 폼(a11y/RHF+zod) (2025-09-10)

**요약**: Next.js 데모앱을 추가하고 `/login` 폼을 RHF+zod로 구현. SDK의 `applyFormError`를 연동해
서버 에러를 폼 에러로 자동 매핑. Tailwind로 스타일 표준화 및 접근성(a11y) 보강.

- 데모앱
  - `apps/demo-dashboard` 추가(App Router)
  - 페이지: `/login` (이메일/비밀번호)
  - 실행 스크립트: `dev:demo`(기본), **Windows 이슈 시** `dev:demo:webpack`
- 폼/a11y
  - `loginSchema` (`zod`): `email().min(…)`, `password.min(8)`
  - RHF 클라 검증 실패 시 **최초 에러 필드로 포커스**
  - 전역 에러 배너: `role="alert"`, `aria-live="polite"`
  - `FormField` 컴포넌트: `aria-describedby`로 에러/힌트 연결
- SDK 연동
  - `applyFormError`로 서버 에러 매핑
    - `parseFieldErrors` 결과가 있으면 필드별 `setError`
    - 없을 경우 **status → field** 매핑(예: `400/401 → password`)
    - 그 외 전역 에러 메시지(`errorToMessage`)
- 스타일/빌드
  - Tailwind 설치 및 구성: `@tailwindcss/postcss` 기반(PostCSS 플러그인)
  - 전역 CSS에 `@import 'tailwindcss'` + `@tailwind base/components/utilities`
- 의존성/환경
  - `react-hook-form ^7.55`, `@hookform/resolvers ^5.2.1`, `zod ^4.1.5`로 **Zod v4 호환** 정렬
  - (개발기) Next 15 Turbopack panic 발생 시 webpack dev로 회피 스크립트 추가
- 테스트
  - `schemas.test.ts`: 이메일/비밀번호 유효성 (성공/실패) **PASS**
  - `applyFormError.test.ts`: 필드 에러/상태 매핑/전역 에러 분기 **PASS**
- 지표(예시)
  - **Invalid 제출 시 네트워크 요청**: 0 (클라 검증 차단)
  - **첫 에러 필드 포커스율**: 100%
  - 단위 테스트: **+5 케이스**(데모앱 영역)

### Day 5 — 회원가입 폼 완성(Zod 전면화) · 테스트 안정화 · 타입 정리 (2025-09-11)

**요약**  
`/signup`을 RHF 필드 검증 없이 **Zod 단일 소스**로 운영.  
비동기 **아이디 중복검사(superRefine)**와 **파일 5MB 제한**을 스키마에 통합하고,  
환경(브라우저/JSDOM/SSR) 불문 **동일 동작** 보장.  
RHF 제네릭/Resolver 타입 불일치 해결, Vitest **hoisted mock**로 네트워크 의존 제거.

---

#### 변경/추가

- **스키마(`signupSchema`)**
  - 교차 규칙: `password === confirmPassword` (`refine`)
  - 비동기 규칙: `username` **중복검사** (`superRefine`)
    - 10초 **TTL 캐시**로 동일 값 재검증 시 서버 호출 감소
  - 파일 입력: `File | FileList | file-like` 허용 → **transform**으로 `File | undefined` 정규화
    - **5MB 제한**(refine), `typeof window` 분기 제거(환경 독립)
- **RHF 연동/타입**
  - 타입 분리: `type SignupInput = z.input<typeof signupSchema>`, `type SignupOutput = z.output<typeof signupSchema>`
  - `useForm<SignupInput>({ resolver: zodResolver(signupSchema), mode: 'onChange', reValidateMode: 'onBlur' })`
  - 제출: `parseAsync(raw)`로 **출력 타입 확정** 후 API 호출 → Resolver 제네릭 불일치(TS2322/2345) 제거
- **SDK 연동**
  - `applyFormError` 상태 매핑: 예) `409 → username` 포커스/필드 에러, 그 외 전역 배너(`role="alert"`)
- **FormField/a11y**
  - `forwardRef`로 RHF 핸들러/`ref` 원형 전달
  - `aria-describedby`로 힌트·에러 텍스트 연결 유지
- **테스트(Vitest)**
  - `signupSchema`: **`safeParseAsync`** 채택 (superRefine async 대응)
  - `usernameUniqueValidator` **hoisted mock** 적용 → 실제 네트워크 차단
  - 5MB 초과 파일 케이스 정확히 실패하도록 스키마 수정(환경 독립 transform)

---

### Day 6 — a11y 스모크 테스트 및 개선

**요약**: 접근성(a11y) 기본 스모크 테스트를 수행하고, 폼/버튼/포커스 링 관련 개선 작업 반영.

- 점검 항목
  - 키보드 탭 순서 확인 (폼 → 버튼 → 알림 메시지 순서 정상)
  - 포커스 링(Outline) 시인성 확보
- 변경/개선
  - `<FormField>`에 `aria-describedby`, `role="alert"` 추가
  - 버튼에 `disabled` + `aria-disabled` 동시 적용
  - 서버 오류 메시지 전역 `<p role="alert">` 렌더 보강

## Week 2 — 렌더링 최적화 + 가상화 + Suspense

### Day 1: 병목 식별(/users 페이지 Profiler)

**요약**  
`/users` 페이지를 만들고, 더미 데이터 기반 `UserList`/`UserCard` 렌더링을 로그 및 Profiler로 추적.  
렌더링 병목 후보(리스트/카드 반복 렌더링) 식별하고, `memo`와 `heavyWork`로 성능 체감 실험 진행.

#### 추가/변경

- **lib/api/users.ts**
  - 실제 API 대신 **더미 데이터(fetch delay 포함)** 반환하도록 구현
  - `getUsers()` 함수 → 50ms 딜레이 후 `User[]` 제공

- **lib/profiler.ts**
  - `logRender(name, extra)` 유틸 추가
  - 개발 모드에서 렌더링 시각/컴포넌트명 출력

- **types/user.ts**
  - `User` 타입 정의 (`id`, `name`, `email`)

- **features/users/**
  - `UserList.tsx`: `useEffect`+`useState`로 `getUsers()` 호출 후 `UserCard[]` 렌더
  - `UserCard.tsx`: `logRender` 호출 + `heavyWork(5ms)` 삽입 (병목 시뮬레이션)
  - `UserCard`를 `memo()`로 감싸 중복 렌더 최소화
  - 콘솔 로그로 렌더링 횟수 확인 가능

- **app/users/page.tsx**
  - `UserList` 임포트 후 `/users` 경로에서 렌더

- **app/layout.tsx**
  - 헤더 내 `/users` 네비게이션 링크 추가

### Day 2: 메모화 + 디바운스 검색 최적화

**요약**  
`/users` 페이지에 검색, 추가/삭제 기능을 붙이고, `useMemo`/`useCallback`/`memo` 최적화와  
300ms 디바운스 검색 적용. 또한 Day6에서 만든 `FormField` 컴포넌트로 a11y 개선 반영.

#### 추가/변경

- **features/users/UsersClient.tsx**
  - `useState`로 `query`, `name`, `email` 상태 관리
  - `useEffect` + `setTimeout`으로 검색어 300ms 디바운스 처리
  - `useMemo`로 `filteredUsers` 계산 → `users`/`debouncedQuery` 변경 시에만 필터링
  - `useCallback`으로 `handleAdd`, `handleDelete` 메모화
  - 검색 인풋 및 추가 폼에 `FormField` 적용 (라벨/힌트/에러/포커스링 지원)
  - Tab 이동 시 버튼까지 포커스 가능하도록 구조 개선

- **features/users/UserCard.tsx**
  - `memo(UserCardBase)` 적용해 불필요한 리렌더링 최소화
  - `onClick` + `onDelete` 분리, 이벤트 전파 중단(`stopPropagation`) 처리

- **app/users/page.tsx**
  - 서버에서 받은 `initialUsers`를 `UsersClient`로 전달

**체감 효과**

- 검색 시 입력할 때마다 500개 전부 필터링하지 않고, 디바운스로 부하 완화
- 불필요한 렌더링 차단 → 500개 리스트에서 FPS 안정화
- 접근성(a11y) 준수한 입력/버튼 제공 → 실무 환경과 유사하게 개선

### Day 3: 가상화 (react-window / react-virtuoso)

**요약**  
`/users` 페이지에 가상화 스크롤을 도입하여 대량 데이터(최대 10k)에서도 FPS 저하 없이 부드럽게 동작.  
`react-window`와 `react-virtuoso` 두 라이브러리로 비교 구현, Default 모드와 동일한 UI로 통일.

#### 추가/변경

- **features/users/VirtualUserListWindow.tsx**
  - `FixedSizeList`(`react-window`)를 사용해 고정 높이 기반 가상화 구현
  - `height`, `itemCount`, `itemSize` 지정 → 화면에 보이는 아이템만 DOM 유지
  - 각 아이템 렌더링 시 `console.count`로 렌더링 횟수 확인 가능

- **features/users/VirtualUserListVirtuoso.tsx**
  - `Virtuoso`(`react-virtuoso`)를 사용해 가상화 구현
  - 동적 높이 지원 가능, 기본은 고정 높이 리스트로 설정
  - 스크롤 시 보이는 영역만 효율적으로 렌더링

- **features/users/UsersClient.tsx**
  - 모드 전환 버튼 추가 → `default` / `window` / `virtuoso` 3가지 모드 지원
  - Default 모드도 스크롤 컨테이너 안에서 렌더링되도록 스타일 수정
  - 유저 삭제(`handleDelete`) 및 추가(`handleAdd`) 로직은 공통으로 유지

- **features/users/UserList.tsx**
  - 기존 Default 리스트도 가상화 UI와 비슷하게 `overflow-y: auto` 컨테이너 적용
  - 스크롤 환경 통일

**체감 효과**

- Default 모드: 스크롤 시 수천 개 아이템이 한꺼번에 렌더 → FPS 급격히 하락 (20~30fps)
- Virtualized 모드: 스크롤해도 화면 내 10~20개만 렌더 → FPS 60 근처 유지
- 데이터 10k행 이상에서도 스크롤 부드럽게 동작, 성능 개선 체감 확실

### Day 4: 가상화 상태에서 행 선택/컨텍스트 메뉴/셀 편집 유지 버그 픽스

**요약**  
가상화 모드(`react-window`, `react-virtuoso`)에서도 행 선택, 컨텍스트 메뉴, 셀 편집 동작이 정상적으로 유지되도록 버그 수정.  
스크롤 시 메뉴가 잔상처럼 남는 문제와 편집 상태 초기화 문제를 해결해 UX를 개선함.

#### 추가/변경

- **features/users/UsersClient.tsx**
  - 우클릭 시 해당 유저를 자동으로 선택 상태에 반영
  - 스크롤 이벤트 발생 시 컨텍스트 메뉴 자동 닫힘 처리 추가

- **features/users/ContextMenu.tsx**
  - ESC 키, 외부 클릭 시 닫기 로직 유지
  - 스크롤 시 자동 닫히도록 개선
  - hover 시 border-radius가 잘리지 않도록 스타일 개선

- **features/users/UserCard.tsx**
  - 편집 모드 UX 통일 → Enter: 저장 / Esc: 취소 / blur: 자동 저장

**체감 효과**

- 컨텍스트 메뉴 hover 시 둥근 모서리가 정상적으로 보임
- Default / Window / Virtuoso 모드에서 동일한 행 선택 및 편집 경험 제공
- 스크롤 시 메뉴가 사라져 잔상 없는 깔끔한 UX 확보

### Day 5: React Query 도입 + Suspense/에러 핸들링/Prefetching 적용

**요약**  
데이터 fetching을 React Query 기반으로 전환하고, Suspense와 ErrorBoundary를 적용해 로딩/에러 UI를 명확하게 구분.  
Mutation과 Prefetching을 추가해 실제 서비스에 가까운 데이터 흐름을 구현하고 UX를 개선함.

#### 추가/변경

- **lib/api/users.ts**
  - `getUsers`를 실제 API 호출(fetch) 기반으로 변경
  - 1% 확률로 랜덤 에러 발생하도록 구현 → ErrorBoundary 테스트 가능
  - `addUser`, `deleteUser` API 함수 추가 (실제 API 대체용 더미 구현)
  - `prefetchUsers` 함수 작성 → SSR 시 데이터 미리 로드 가능

- **features/users/UsersClient.tsx**
  - 기존 로컬 상태 기반 추가/삭제 로직을 `useMutation` + React Query 캐시 업데이트 방식으로 교체
  - `useSuspenseQuery` 적용해 데이터 로딩 시 `<Suspense fallback={<SkeletonUserList />}>`로 스켈레톤 표시
  - `retry: false` 옵션으로 랜덤 에러 발생 시 즉시 `ErrorFallback` UI 노출

- **features/users/ErrorFallback.tsx**
  - 에러 발생 시 사용자에게 메시지 표시하는 컴포넌트 추가

- **app/users/page.tsx**
  - `ErrorBoundary`와 `Suspense`를 결합해 로딩/에러 핸들링을 페이지 단에서 처리
  - `prefetchUsers` 적용 가능 구조 마련

**체감 효과**

- 로딩 중에는 Skeleton UI, 실패 시 에러 UI, 성공 시 리스트로 전환 → 사용자 경험 일관성 강화
- 유저 추가/삭제 시 API 지연과 무관하게 캐시 업데이트로 빠른 UI 반영
- 새로고침 시 Prefetching 효과로 스켈레톤 노출 최소화
- 서비스 수준에 가까운 **데이터 로딩/에러/상호작용 경험** 확보

### Day 6: 성능 계측 (LCP/TTI, 렌더 횟수, 스크롤 FPS 비교)

**요약**  
Default / React-Window / React-Virtuoso 각각의 렌더링 전략에 대해 성능 지표를 측정.  
Web Vitals(FCP, LCP, TTFB, CLS), TTI(Time To Interactive), 렌더 횟수, 스크롤 FPS를 비교하여  
실제 사용자 경험에서 어떤 차이가 발생하는지 수치로 검증함.

#### 추가/변경

- **lib/metrics.ts**
  - `web-vitals` 기반 FCP, LCP, CLS, TTFB 로깅 함수 추가
  - `initWebVitalsLogging` 작성 → 페이지 로드 시 지표 자동 수집

- **lib/tti.ts**
  - `tti-polyfill` 기반 TTI 측정 유틸 추가
  - `[TTI] xxx ms` 로그로 Default / Window / Virtuoso 비교 가능

- **lib/fpsMeter.ts**
  - `requestAnimationFrame` 기반 FPS 측정 유틸 작성
  - 스크롤 중 FPS 하락 여부 로그 기록

- **lib/profiler.ts**
  - `logRender` 유틸 추가 → `UserCard` 등 컴포넌트 렌더 횟수 추적

- **components/PerfMonitor.tsx**
  - 위 측정 유틸들을 통합해 lifecycle에서 실행
  - UsersClient를 `<PerfMonitor>`로 감싸 성능 측정 적용

#### 측정 결과 (요약)

- **Default**
  - LCP: 756ms / TTI: 518ms / FPS 안정적(141~145, 단일 구간 44)
- **React-Window**
  - LCP: 1140ms / TTI: 812ms / FPS 안정적(140대)
- **React-Virtuoso**
  - LCP: 540ms / TTI: 223ms / FPS 매우 안정적(282~290)

#### 체감 효과

- Default는 전체적으로 안정적이나 초기 렌더링이 상대적으로 늦음
- React-Window는 Virtualization 구조로 메모리 효율적이지만 초기 로딩이 가장 느림
- React-Virtuoso는 LCP/TTI/FPS 모두 뛰어나 실제 서비스 적용에 가장 유리
- **전략별 성능 차이를 정량적으로 비교**해 서비스 특성에 맞는 선택 가능

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

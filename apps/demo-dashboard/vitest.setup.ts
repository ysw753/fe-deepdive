import '@testing-library/jest-dom';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

import { expect, afterEach, vi } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
afterEach(() => {
  cleanup(); // ← 각 테스트 후 DOM 비움
  vi.clearAllMocks(); // ← 모의함수도 리셋
  vi.useRealTimers(); // 혹시 남아있는 가짜 타이머 복구
});

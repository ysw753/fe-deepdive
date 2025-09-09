// src/api/zod-utils.ts
import { type ZodError } from 'zod';
import type { ValidationIssue } from './errors';

// ZodError -> ValidationIssue[] 평탄화
export const flattenZodIssues = (e: ZodError): ValidationIssue[] =>
  e.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));

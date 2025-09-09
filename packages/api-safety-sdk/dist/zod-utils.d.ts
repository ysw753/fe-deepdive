import { type ZodError } from 'zod';
import type { ValidationIssue } from './errors';
export declare const flattenZodIssues: (e: ZodError) => ValidationIssue[];

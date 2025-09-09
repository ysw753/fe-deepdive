// ZodError -> ValidationIssue[] 평탄화
export const flattenZodIssues = (e) => e.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
}));

// Form error helpers shared across vendor pages.
// Parses API errors (incl. Zod-style issues[]) into a per-field map so the
// offending placeholder gets a red border instead of clearing all data.

export function extractFieldErrors(error: any): Record<string, string> {
  const issues = error?.response?.data?.issues;
  if (!Array.isArray(issues) || issues.length === 0) {
    return {};
  }
  const fieldErrors: Record<string, string> = {};
  issues.forEach((issue: any) => {
    const path = Array.isArray(issue?.path) ? issue.path[0] : issue?.path;
    if (path && issue?.message && !fieldErrors[path]) {
      fieldErrors[String(path)] = String(issue.message);
    }
  });
  return fieldErrors;
}

export function extractErrorMessage(error: any, fallback = 'Something went wrong'): string {
  if (error?.response?.data?.issues?.[0]?.message) {
    return error.response.data.issues[0].message;
  }
  if (error?.response?.data?.message) return error.response.data.message;
  if (typeof error?.response?.data?.error === 'string') return error.response.data.error;
  if (error?.message) return error.message;
  return fallback;
}

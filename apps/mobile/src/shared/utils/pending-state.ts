// Module-level store to pass large OCR text without URL params
let _pendingSnippet: string | null = null;
export function consumePendingSnippet(): string | null {
  const text = _pendingSnippet;
  _pendingSnippet = null;
  return text;
}
export function setPendingSnippet(text: string) {
  _pendingSnippet = text;
}

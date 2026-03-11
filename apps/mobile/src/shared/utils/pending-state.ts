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

// Module-level store for voice reflection data
let _pendingReflection: { transcription: string; audioUri: string } | null =
  null;
export function consumePendingReflection(): {
  transcription: string;
  audioUri: string;
} | null {
  const data = _pendingReflection;
  _pendingReflection = null;
  return data;
}
export function setPendingReflection(data: {
  transcription: string;
  audioUri: string;
}) {
  _pendingReflection = data;
}

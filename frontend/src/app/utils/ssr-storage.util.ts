

export function safeGetStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return (
      window.localStorage?.getItem(key) ??
      window.sessionStorage?.getItem(key) ??
      null
    );
  } catch {
    return null;
  }
}

export function safeSetSessionItem(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage?.setItem(key, value);
  } catch {}
}

export function safeRemoveSessionItem(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage?.removeItem(key);
  } catch {}
}

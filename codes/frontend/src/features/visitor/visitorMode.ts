/** Visitor / guest explore mode — session only, no auth token. */

const VISITOR_KEY = 'yaqout_visitor_mode';

export function enterVisitorMode(): void {
  try {
    sessionStorage.setItem(VISITOR_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function exitVisitorMode(): void {
  try {
    sessionStorage.removeItem(VISITOR_KEY);
  } catch {
    /* ignore */
  }
}

export function isVisitorMode(): boolean {
  try {
    return sessionStorage.getItem(VISITOR_KEY) === '1';
  } catch {
    return false;
  }
}

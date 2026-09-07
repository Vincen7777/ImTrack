export interface MockActionOptions {
  /** Delay in ms before resolving, simulating a network request. */
  delay?: number;
}

/**
 * Simulates an async auth request (sign in / sign up / Google OAuth)
 * that resolves after `delay` ms. Mirrors the old `Im.mockSubmitRedirect`
 * / `Im.handleMockOAuth` helpers from app.js (which wasn't part of the
 * upload — this is a reconstruction), except it returns a promise
 * instead of touching the DOM directly, so the calling component owns
 * the loading state and does the redirect itself via react-router.
 */
export function mockAuthRequest({ delay = 900 }: MockActionOptions = {}): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

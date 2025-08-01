// ...existing code...
/**
 * Assertion helpers for k6 checks
 */
import { check } from 'k6';

export function assertStatus(response, expected = 200) {
  return check(response, {
    [`status is ${expected}`]: (r) => r.status === expected,
  });
}

export function assertBodyContains(response, text) {
  return check(response, {
    [`body contains ${text}`]: (r) => r.body && r.body.includes(text),
  });
}
// ...existing code...

/**
 * The current user id, held outside React so non-component modules (storage
 * scoping in particular) can read "who is logged in" synchronously. Nothing
 * else lives here — this is not a session store, just a mirror of
 * AuthContext's `user.id`, updated by AuthContext on login/logout/user fetch.
 *
 * `null` means "no authenticated user" (anonymous visitor or logged out).
 */
let currentUserId = null;

export function setCurrentUserId(id) {
  currentUserId = id ?? null;
}

export function getCurrentUserId() {
  return currentUserId;
}

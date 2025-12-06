"use client";

"use client";

import { AuthResponse } from "@/store/types";

// NOTE: Tokens should be stored in secure cookies by the backend.
// These helpers are now no-ops so we never write access/refresh tokens to localStorage.

export const persistAuthSession = (_payload: AuthResponse) => {
  // do not persist anything in localStorage
};

export const readAuthSession = (): AuthResponse | null => {
  // always return null so the app relies on cookies + /me
  return null;
};

export const clearAuthSession = () => {
  // nothing to clear
};


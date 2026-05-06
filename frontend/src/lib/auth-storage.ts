import type { AuthResponse } from '../types/api';

const AUTH_KEY = 'crochub.auth';

export const authStorage = {
  get: (): AuthResponse | null => {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
  },
  set: (data: AuthResponse): void => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
  },
  clear: (): void => {
    localStorage.removeItem(AUTH_KEY);
  },
};

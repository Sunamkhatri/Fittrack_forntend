// Centralized path definitions for the FitTrack API.
//
// Paths are relative to the axios instance baseURL (see axios-instance.ts),
// which already points at the versioned root. Keeping them here means a route
// rename is a one-line change rather than a grep across the app.

export const API = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    ME: "/auth/me",
    WHOAMI: "/auth/whoami",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
  },

  USERS: {
    PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    PROFILE_IMAGE: "/users/profile-image",
    TRAINERS: "/users/trainers",
    CLIENTS: "/users/clients",
  },

  PAYMENTS: {
    INITIATE: "/payments/initiate",
    VERIFY: "/payments/verify",
  },

  ADMIN: {
    USERS: {
      GET: "/admin/users",
      GET_ONE: (id: string) => `/admin/users/${id}`,
      CREATE: "/admin/users",
      UPDATE: (id: string) => `/admin/users/${id}`,
      DELETE: (id: string) => `/admin/users/${id}`,
    },
    REVENUE: "/admin/users/revenue/all",
  },
} as const;

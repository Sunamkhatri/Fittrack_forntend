// Single source of truth for where the FitTrack API lives.
//
// NEXT_PUBLIC_API_BASE_URL is the API *origin* (no path), e.g. http://localhost:8089.
// Every client builds its paths from API_V1 so that pointing the app at a deployed
// backend is a one-variable change.

const DEFAULT_ORIGIN = "http://localhost:8089";

export const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_ORIGIN
).replace(/\/+$/, "");

export const API_V1 = `${API_ORIGIN}/api/v1`;

import { createAuthClient } from "better-auth/react";

const baseURL =
  import.meta.env.VITE_AUTH_BASE_URL?.trim() ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3005");

export const authClient = createAuthClient({
  baseURL,
});


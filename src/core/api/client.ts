/**
 * API Client — centralised fetch wrapper for the Laravel backend.
 *
 * Environment variable:
 *   NEXT_PUBLIC_API_BASE_URL  (e.g. http://localhost:8000/api)
 *
 * Features:
 *   - Automatic bearer-token injection from sessionStorage
 *   - JSON body serialisation (or raw FormData for file uploads)
 *   - Standardised error shape
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

/* ────────────────────────────────────────────── */
/*  Token helpers                                 */
/* ────────────────────────────────────────────── */

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
  if (typeof window !== "undefined") {
    if (token) {
      sessionStorage.setItem("auth_token", token);
    } else {
      sessionStorage.removeItem("auth_token");
    }
  }
}

export function getToken(): string | null {
  if (_token) return _token;
  if (typeof window !== "undefined") {
    _token = sessionStorage.getItem("auth_token");
  }
  return _token;
}

export function clearToken() {
  _token = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_token");
  }
}

/* ────────────────────────────────────────────── */
/*  Error type                                    */
/* ────────────────────────────────────────────── */

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/* ────────────────────────────────────────────── */
/*  Core fetch                                    */
/* ────────────────────────────────────────────── */

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  /** Pass true when body is FormData (file uploads) */
  multipart?: boolean;
  /** Skip auth header (for public endpoints) */
  noAuth?: boolean;
}

export async function api<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params, multipart = false, noAuth = false } = opts;

  // Build URL with query params
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) qs.set(k, String(v));
    }
    const str = qs.toString();
    if (str) url += `?${str}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (!multipart) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token && !noAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: multipart ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) return {} as T;

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      json.message ?? `Request failed (${res.status})`,
      res.status,
      json.errors
    );
  }

  return json as T;
}

/* ────────────────────────────────────────────── */
/*  Convenience wrappers                          */
/* ────────────────────────────────────────────── */

export const get = <T = unknown>(path: string, params?: Record<string, string | number | undefined>) =>
  api<T>(path, { params });

export const post = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body });

export const put = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: "PUT", body });

export const patch = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: "PATCH", body });

export const del = <T = unknown>(path: string) =>
  api<T>(path, { method: "DELETE" });

export const upload = <T = unknown>(path: string, formData: FormData, method = "POST") =>
  api<T>(path, { method, body: formData, multipart: true });

/* ────────────────────────────────────────────── */
/*  Public endpoint helpers (noAuth)              */
/* ────────────────────────────────────────────── */

export const publicPost = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body, noAuth: true });

export const publicGet = <T = unknown>(path: string, params?: Record<string, string | number | undefined>) =>
  api<T>(path, { params, noAuth: true });

export const publicUpload = <T = unknown>(path: string, formData: FormData) =>
  api<T>(path, { method: "POST", body: formData, multipart: true, noAuth: true });

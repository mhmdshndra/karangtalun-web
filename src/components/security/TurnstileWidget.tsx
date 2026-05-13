"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Config ──────────────────────────────────────────────────
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Production detection: NODE_ENV is "production" when built with `next build`.
 * In production, Turnstile is REQUIRED — forms must not silently bypass.
 * In development, forms work without Turnstile if site key is not set.
 */
const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const TURNSTILE_REQUIRED = IS_PRODUCTION || !!SITE_KEY;

/**
 * Check if a Turnstile token is present. Call before submit.
 * Returns empty string if OK, error message if blocked.
 */
export function requireTurnstileToken(token: string): string {
  if (token) return "";
  if (IS_PRODUCTION) return "Verifikasi keamanan gagal. Konfigurasi Turnstile tidak valid atau belum diselesaikan.";
  if (SITE_KEY) return "Mohon selesaikan verifikasi keamanan.";
  return ""; // dev without key — allow through
}

// ─── Global script loader (singleton) ────────────────────────
let scriptLoaded = false;
let scriptLoading = false;
const onLoadQueue: (() => void)[] = [];

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    if (scriptLoading) { onLoadQueue.push(resolve); return; }
    scriptLoading = true;
    const s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.async = true;
    s.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      resolve();
      onLoadQueue.forEach((fn) => fn());
      onLoadQueue.length = 0;
    };
    s.onerror = () => { scriptLoading = false; resolve(); };
    document.head.appendChild(s);
  });
}

// ─── Hook ────────────────────────────────────────────────────
export function useTurnstileToken() {
  const [token, setToken] = useState("");
  const resetRef = useRef<(() => void) | null>(null);

  const reset = useCallback(() => {
    setToken("");
    resetRef.current?.();
  }, []);

  return { token, setToken, reset, resetRef };
}

// ─── Widget Props ────────────────────────────────────────────
interface TurnstileWidgetProps {
  onToken: (t: string) => void;
  resetRef?: React.MutableRefObject<(() => void) | null>;
}

// ─── Widget Component ────────────────────────────────────────
export default function TurnstileWidget({ onToken, resetRef }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip entirely if no site key configured (dev mode)
    if (!SITE_KEY || !containerRef.current) return;

    let mounted = true;

    loadScript().then(() => {
      if (!mounted || !containerRef.current) return;
      const w = window as unknown as Record<string, unknown>;
      const turnstile = w.turnstile as {
        render: (el: HTMLElement, opts: Record<string, unknown>) => string;
        reset: (id: string) => void;
        remove: (id: string) => void;
      } | undefined;
      if (!turnstile) return;

      // Remove previous widget if exists
      if (widgetIdRef.current) {
        try { turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
      }

      widgetIdRef.current = turnstile.render(containerRef.current!, {
        sitekey: SITE_KEY,
        callback: (t: string) => { if (mounted) onToken(t); },
        "expired-callback": () => { if (mounted) onToken(""); },
        "error-callback": () => { if (mounted) onToken(""); },
        theme: "auto",
        size: "flexible",
      });

      // Expose reset function
      if (resetRef) {
        resetRef.current = () => {
          if (widgetIdRef.current && turnstile) {
            try { turnstile.reset(widgetIdRef.current); } catch { /* ignore */ }
          }
          onToken("");
        };
      }
    });

    return () => {
      mounted = false;
      if (widgetIdRef.current) {
        const w = window as unknown as Record<string, unknown>;
        const turnstile = w.turnstile as { remove: (id: string) => void } | undefined;
        if (turnstile) {
          try { turnstile.remove(widgetIdRef.current); } catch { /* ignore */ }
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Production without site key = configuration error
  if (!SITE_KEY && IS_PRODUCTION) {
    return <div style={{ marginTop: "0.25rem", padding: "0.5rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, color: "#dc2626", fontSize: "0.75rem" }}>Konfigurasi keamanan belum lengkap. Hubungi administrator.</div>;
  }

  // Dev without site key — don't render
  if (!SITE_KEY) return null;

  return <div ref={containerRef} style={{ marginTop: "0.25rem" }} />;
}

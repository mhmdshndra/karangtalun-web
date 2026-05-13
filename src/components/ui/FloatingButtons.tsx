"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText, Accessibility, ZoomIn, ZoomOut, RotateCcw,
  Moon, Contrast, EyeOff,
  Type, Minus, Link2, Image, Pause, MousePointer,
  X, Wrench,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";

// ─── A11Y STATE ──────────────────────────────────────────────

interface A11yState {
  fontSize: number;
  highContrast: boolean;
  grayscale: boolean;
  invertColor: boolean;
  highlightLinks: boolean;
  hideImages: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
  readingGuide: boolean;
}

const DEFAULT_A11Y: A11yState = {
  fontSize: 100,
  highContrast: false,
  grayscale: false,
  invertColor: false,
  highlightLinks: false,
  hideImages: false,
  stopAnimations: false,
  bigCursor: false,
  readingGuide: false,
};

const A11Y_TOGGLES: { key: keyof A11yState; label: string; icon: typeof EyeOff }[] = [
  { key: "highContrast", label: "Kontras Tinggi", icon: Contrast },
  { key: "grayscale", label: "Grayscale", icon: EyeOff },
  { key: "invertColor", label: "Invert Warna", icon: Minus },
  { key: "highlightLinks", label: "Sorot Tautan", icon: Link2 },
  { key: "hideImages", label: "Sembunyikan Gambar", icon: Image },
  { key: "stopAnimations", label: "Hentikan Animasi", icon: Pause },
  { key: "bigCursor", label: "Kursor Besar", icon: MousePointer },
  { key: "readingGuide", label: "Garis Pembaca", icon: Type },
];

// ─── MAIN COMPONENT ─────────────────────────────────────────

export default function FloatingButtons() {
  const { user } = useAuth();
  const [accessOpen, setAccessOpen] = useState(false);
  const [a11y, setA11y] = useState<A11yState>(DEFAULT_A11Y);

  // Mobile: single tool button with expand
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Draggable state
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // Layanan button only visible for public (not logged in) and warga role
  const showLayanan = !user || (user.role !== "admin_desa" && user.role !== "staf_layanan");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Draggable handlers for mobile
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!isMobile) return;
    const el = containerRef.current;
    if (!el) return;
    dragState.current = {
      dragging: true,
      startX: e.clientX - pos.x,
      startY: e.clientY - pos.y,
      offsetX: pos.x,
      offsetY: pos.y,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  }, [isMobile, pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dx - dragState.current.offsetX) > 4 || Math.abs(dy - dragState.current.offsetY) > 4) {
      dragState.current.moved = true;
    }
    // Clamp within viewport
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    setPos({
      x: Math.max(-(maxX - 60), Math.min(0, dx)),
      y: Math.max(-(maxY - 60), Math.min(0, dy)),
    });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const wasDrag = dragState.current.moved;
    dragState.current.dragging = false;
    if (wasDrag) {
      setHasDragged(true);
      // Reset drag flag after a tick so click handlers can check
      setTimeout(() => setHasDragged(false), 50);
    }
    const el = containerRef.current;
    if (el) el.releasePointerCapture(e.pointerId);
  }, []);

  const applyA11y = useCallback((next: A11yState) => {
    const root = document.documentElement;
    root.style.fontSize = `${next.fontSize}%`;
    root.classList.toggle("a11y-high-contrast", next.highContrast);
    root.classList.toggle("a11y-grayscale", next.grayscale);
    root.classList.toggle("a11y-invert", next.invertColor);
    root.classList.toggle("a11y-highlight-links", next.highlightLinks);
    root.classList.toggle("a11y-hide-images", next.hideImages);
    root.classList.toggle("a11y-stop-animations", next.stopAnimations);
    root.classList.toggle("a11y-big-cursor", next.bigCursor);
    root.classList.toggle("a11y-reading-guide", next.readingGuide);
    setA11y(next);
  }, []);

  const toggle = (key: keyof A11yState) => {
    if (key === "fontSize") return;
    applyA11y({ ...a11y, [key]: !a11y[key as keyof A11yState] });
  };

  const changeFontSize = (delta: number) => {
    const next = Math.max(80, Math.min(150, a11y.fontSize + delta));
    applyA11y({ ...a11y, fontSize: next });
  };

  const resetAll = () => {
    applyA11y(DEFAULT_A11Y);
    const root = document.documentElement;
    root.style.fontSize = "100%";
    [
      "a11y-high-contrast", "a11y-grayscale", "a11y-invert", "a11y-highlight-links",
      "a11y-hide-images", "a11y-stop-animations", "a11y-big-cursor", "a11y-reading-guide",
    ].forEach((c) => root.classList.remove(c));
  };

  const toggleDark = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  // ─── MOBILE LAYOUT: Single draggable tool button ───────────
  if (isMobile) {
    return (
      <>
        <style jsx global>{`
          .a11y-high-contrast { filter: contrast(1.5) !important; }
          .a11y-grayscale { filter: grayscale(1) !important; }
          .a11y-invert { filter: invert(1) hue-rotate(180deg) !important; }
          .a11y-highlight-links a { outline: 2px solid #b8860b !important; outline-offset: 2px !important; text-decoration: underline !important; }
          .a11y-hide-images img, .a11y-hide-images picture, .a11y-hide-images svg:not(.a11y-keep) { visibility: hidden !important; }
          .a11y-stop-animations *, .a11y-stop-animations *::before, .a11y-stop-animations *::after { animation: none !important; transition: none !important; }
          .a11y-big-cursor, .a11y-big-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23b8860b' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E") 16 16, auto !important; }
          .a11y-reading-guide #reading-guide-line { display: block !important; }
        `}</style>

        {a11y.readingGuide && <ReadingGuideLine />}

        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            position: "fixed",
            bottom: `${1.25 - pos.y / 16}rem`,
            right: `${1.25 - pos.x / 16}rem`,
            zIndex: 50,
            touchAction: "none",
            userSelect: "none",
          }}
        >
          {/* Expanded menu */}
          {mobileOpen && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem",
              marginBottom: "0.5rem",
            }}>
              {/* Accessibility panel */}
              {accessOpen && (
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    width: "220px",
                    maxHeight: "calc(100vh - 160px)",
                    overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="px-3.5 py-2 flex items-center justify-between" style={{ background: "var(--primary)" }}>
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Aksesibilitas</span>
                    <button onClick={() => setAccessOpen(false)} className="p-0.5 rounded hover:bg-white/10 transition-colors" aria-label="Tutup">
                      <X size={13} color="white" />
                    </button>
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[11px] font-medium" style={{ color: "var(--foreground)" }}>Ukuran Teks</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => changeFontSize(-10)} className="w-6 h-6 rounded border flex items-center justify-center" style={{ borderColor: "var(--border)" }} aria-label="Perkecil"><ZoomOut size={11} style={{ color: "var(--foreground)" }} /></button>
                        <span className="text-[10px] font-mono w-9 text-center" style={{ color: "var(--foreground)" }}>{a11y.fontSize}%</span>
                        <button onClick={() => changeFontSize(10)} className="w-6 h-6 rounded border flex items-center justify-center" style={{ borderColor: "var(--border)" }} aria-label="Perbesar"><ZoomIn size={11} style={{ color: "var(--foreground)" }} /></button>
                      </div>
                    </div>
                    <button onClick={toggleDark} className="w-full flex items-center justify-between py-1.5 px-2.5 rounded border text-[11px] font-medium" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      <span className="flex items-center gap-1.5"><Moon size={11} /> Ganti Tema</span>
                    </button>
                    {A11Y_TOGGLES.map((t) => {
                      const active = a11y[t.key] as boolean;
                      return (
                        <button key={t.key} onClick={() => toggle(t.key)} className="w-full flex items-center justify-between py-1.5 px-2.5 rounded border text-[11px] font-medium" style={{ borderColor: active ? "var(--primary)" : "var(--border)", background: active ? "var(--accent-light)" : "transparent", color: "var(--foreground)" }}>
                          <span className="flex items-center gap-1.5"><t.icon size={11} /> {t.label}</span>
                          <span className="text-[9px] font-bold" style={{ color: active ? "var(--primary)" : "var(--foreground)", opacity: active ? 1 : 0.3 }}>{active ? "ON" : "OFF"}</span>
                        </button>
                      );
                    })}
                    <button onClick={resetAll} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border text-[11px] font-bold" style={{ borderColor: "var(--border)", color: "#dc2626" }}>
                      <RotateCcw size={11} /> Reset Semua
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <button
                onClick={(e) => { e.stopPropagation(); if (!hasDragged) setAccessOpen(!accessOpen); }}
                className="a11y-keep flex items-center gap-1.5 px-3 h-9 rounded-full border font-bold text-[11px] shadow-md"
                style={{
                  background: accessOpen ? "var(--foreground)" : "var(--surface)",
                  borderColor: accessOpen ? "var(--foreground)" : "var(--border)",
                  color: accessOpen ? "var(--background)" : "var(--primary)",
                }}
              >
                <Accessibility size={14} /> Aksesibilitas
              </button>

              {showLayanan && (
                <Link
                  href="/layanan"
                  onClick={(e) => { if (hasDragged) e.preventDefault(); }}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-full font-bold text-[11px] shadow-md"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)", textDecoration: "none" }}
                >
                  <FileText size={14} /> Layanan
                </Link>
              )}
            </div>
          )}

          {/* Main tool button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => { if (!hasDragged) { setMobileOpen(!mobileOpen); if (mobileOpen) setAccessOpen(false); } }}
              aria-label="Menu Alat"
              className="a11y-keep w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: mobileOpen ? "var(--foreground)" : "var(--primary)",
                color: mobileOpen ? "var(--background)" : "#fff",
                border: "2px solid rgba(255,255,255,0.2)",
                transition: "background 0.2s, transform 0.2s",
                transform: mobileOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              {mobileOpen ? <X size={18} /> : <Wrench size={18} />}
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── DESKTOP LAYOUT: Original style but layanan goes directly to /layanan ─
  return (
    <>
      <style jsx global>{`
        .a11y-high-contrast { filter: contrast(1.5) !important; }
        .a11y-grayscale { filter: grayscale(1) !important; }
        .a11y-invert { filter: invert(1) hue-rotate(180deg) !important; }
        .a11y-highlight-links a { outline: 2px solid #b8860b !important; outline-offset: 2px !important; text-decoration: underline !important; }
        .a11y-hide-images img, .a11y-hide-images picture, .a11y-hide-images svg:not(.a11y-keep) { visibility: hidden !important; }
        .a11y-stop-animations *, .a11y-stop-animations *::before, .a11y-stop-animations *::after { animation: none !important; transition: none !important; }
        .a11y-big-cursor, .a11y-big-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23b8860b' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E") 16 16, auto !important; }
        .a11y-reading-guide #reading-guide-line { display: block !important; }
      `}</style>

      {a11y.readingGuide && <ReadingGuideLine />}

      <div className="floating-container">
        {/* Accessibility Panel */}
        {accessOpen && (
          <div
            className="rounded-lg border overflow-hidden"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              width: "220px",
              maxHeight: "calc(100vh - 110px)",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              marginBottom: "0.375rem",
            }}
          >
            <div className="px-3.5 py-2 flex items-center justify-between" style={{ background: "var(--primary)" }}>
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">Aksesibilitas</span>
              <button onClick={() => setAccessOpen(false)} aria-label="Tutup panel aksesibilitas" className="p-0.5 rounded hover:bg-white/10 transition-colors">
                <X size={13} color="white" />
              </button>
            </div>
            <div className="p-2.5 space-y-1.5">
              <div className="flex items-center justify-between py-1">
                <span className="text-[11px] font-medium" style={{ color: "var(--foreground)" }}>Ukuran Teks</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => changeFontSize(-10)} className="w-6 h-6 rounded border flex items-center justify-center hover:border-primary transition-colors" style={{ borderColor: "var(--border)" }} aria-label="Perkecil teks"><ZoomOut size={11} style={{ color: "var(--foreground)" }} /></button>
                  <span className="text-[10px] font-mono w-9 text-center" style={{ color: "var(--foreground)" }}>{a11y.fontSize}%</span>
                  <button onClick={() => changeFontSize(10)} className="w-6 h-6 rounded border flex items-center justify-center hover:border-primary transition-colors" style={{ borderColor: "var(--border)" }} aria-label="Perbesar teks"><ZoomIn size={11} style={{ color: "var(--foreground)" }} /></button>
                </div>
              </div>
              <button onClick={toggleDark} className="w-full flex items-center justify-between py-1.5 px-2.5 rounded border text-[11px] font-medium hover:border-primary transition-colors" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <span className="flex items-center gap-1.5"><Moon size={11} /> Ganti Tema</span>
              </button>
              {A11Y_TOGGLES.map((t) => {
                const active = a11y[t.key] as boolean;
                return (
                  <button key={t.key} onClick={() => toggle(t.key)} className="w-full flex items-center justify-between py-1.5 px-2.5 rounded border text-[11px] font-medium hover:border-primary transition-colors" style={{ borderColor: active ? "var(--primary)" : "var(--border)", background: active ? "var(--accent-light)" : "transparent", color: "var(--foreground)" }}>
                    <span className="flex items-center gap-1.5"><t.icon size={11} /> {t.label}</span>
                    <span className="text-[9px] font-bold" style={{ color: active ? "var(--primary)" : "var(--foreground)", opacity: active ? 1 : 0.3 }}>{active ? "ON" : "OFF"}</span>
                  </button>
                );
              })}
              <button onClick={resetAll} className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border text-[11px] font-bold hover:border-primary transition-colors" style={{ borderColor: "var(--border)", color: "#dc2626" }}>
                <RotateCcw size={11} /> Reset Semua
              </button>
            </div>
          </div>
        )}

        {/* Button Row */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => { setAccessOpen(!accessOpen); }}
            aria-label="Menu Aksesibilitas"
            className="a11y-keep w-9 h-9 rounded-full border flex items-center justify-center transition-all shadow-md hover:shadow-lg"
            style={{
              background: accessOpen ? "var(--foreground)" : "var(--surface)",
              borderColor: accessOpen ? "var(--foreground)" : "var(--border)",
              color: accessOpen ? "var(--background)" : "var(--primary)",
            }}>
            <Accessibility size={15} />
          </button>
          {showLayanan && (
            <Link
              href="/layanan"
              className="flex items-center gap-1.5 px-3.5 h-9 rounded-full font-bold text-[11px] shadow-md hover:shadow-lg transition-all"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", textDecoration: "none" }}
            >
              <FileText size={13} />
              Layanan
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

function ReadingGuideLine() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const handler = (e: MouseEvent) => setY(e.clientY);
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <>
      <div style={{ position: "fixed", left: 0, right: 0, top: 0, height: Math.max(0, y - 40), background: "rgba(0,0,0,0.06)", pointerEvents: "none", zIndex: 9998, transition: "height 0.05s linear" }} />
      <div id="reading-guide-line" style={{ position: "fixed", left: 0, right: 0, top: y - 2, height: 4, background: "rgba(184,134,11,0.5)", pointerEvents: "none", zIndex: 9999, boxShadow: "0 0 12px rgba(184,134,11,0.3), 0 2px 4px rgba(184,134,11,0.2)", borderRadius: 2, transition: "top 0.05s linear" }} />
      <div style={{ position: "fixed", left: 0, right: 0, top: y + 28, bottom: 0, background: "rgba(0,0,0,0.06)", pointerEvents: "none", zIndex: 9998, transition: "top 0.05s linear" }} />
    </>
  );
}

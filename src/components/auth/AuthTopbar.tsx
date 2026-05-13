"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Moon, Sun } from "lucide-react";
import DesaLogo from "@/components/ui/DesaLogo";
import { useCms } from "@/core/cms/useCmsStore";

/**
 * Auth page topbar — consistent with the public AppHeader.
 * Shows: logo desa, nama desa, tombol beranda, tombol tema.
 */
export default function AuthTopbar() {
  const { cms } = useCms();
  const namaDesa = cms.identitasDesa.namaDesa || "Karangtalun";
  const kecamatan = cms.identitasDesa.kecamatan || "Tanon";
  const kabupaten = cms.identitasDesa.kabupaten || "Sragen";

  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.875rem 1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        background: "rgba(10,18,38,0.6)",
      }}
    >
      {/* Logo + Nama Desa */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
        <DesaLogo size={32} />
        <div>
          <p style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 700, lineHeight: 1.2 }}>
            Desa {namaDesa}
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6rem", lineHeight: 1.2 }}>
            Kec. {kecamatan}, Kab. {kabupaten}
          </p>
        </div>
      </Link>

      {/* Actions: Tema + Beranda */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle tema"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textDecoration: "none",
            padding: "0.375rem 0.75rem",
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            transition: "all 0.2s",
          }}
        >
          <ChevronLeft size={14} /> Beranda
        </Link>
      </div>
    </header>
  );
}

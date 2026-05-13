"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock, ChevronRight, Search, Lock,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SectionHeader, EmptyState } from "@/components/ui";
import { useCms } from "@/core/cms/useCmsStore";
import { useAuth } from "@/core/context/AuthContext";

import { ASSETS } from "@/core/constants/assets";
import type { LayananPublik } from "@/core/types";

const ICON_MAP: Record<string, string> = {
  home: ASSETS.icons.layananDokumen,
  heart: ASSETS.icons.layananSosial,
  shield: ASSETS.icons.layananKeamanan,
  briefcase: ASSETS.icons.layananEkonomi,
  tool: ASSETS.icons.layananInfrastruktur,
  "alert-triangle": ASSETS.icons.layananDarurat,
  "message-square": ASSETS.icons.layananPengaduan,
};

const KATEGORI_COLOR: Record<string, string> = {
  kependudukan: "#1a3a6e",
  sosial: "#7c3aed",
  ekonomi: "#b8860b",
  keamanan: "#dc2626",
  infrastruktur: "#0891b2",
  umum: "#6b7280",
};

const KATEGORI_LABELS: Record<string, string> = {
  kependudukan: "Kependudukan",
  sosial: "Sosial",
  ekonomi: "Ekonomi",
  keamanan: "Keamanan",
  infrastruktur: "Infrastruktur",
  umum: "Umum",
};

// Map icon by kategori for CMS items that don't have icon field
const KATEGORI_ICON: Record<string, string> = {
  kependudukan: "home",
  sosial: "heart",
  ekonomi: "briefcase",
  keamanan: "alert-triangle",
  infrastruktur: "tool",
  umum: "message-square",
};

// Unified item type used in this page
interface LayananItem {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  estimasiWaktu: string;
  biaya: string;
  icon: string;
  routeSlug: string;
  butuhLogin: boolean;
  tipeLayanan: "surat" | "laporan";
}

export default function LayananPage() {
  const { cms } = useCms();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("semua");

  const isWarga = user?.role === "warga";

  // Build unified layanan list from CMS
  const cmsLayanan = cms.layananPublik.filter((l) => l.aktif);

  const allLayanan: LayananItem[] = cmsLayanan.map((l) => ({
        id: l.id,
        nama: l.nama,
        deskripsi: l.deskripsi,
        kategori: (l.kategori || "umum").toLowerCase(),
        estimasiWaktu: l.estimasiWaktu,
        biaya: l.biaya,
        icon: KATEGORI_ICON[(l.kategori || "umum").toLowerCase()] || "home",
        routeSlug: l.routeSlug || l.id,
        butuhLogin: l.butuhLogin,
        tipeLayanan: (l.tipeLayanan as "surat" | "laporan") || (l.butuhLogin ? "surat" : "laporan"),
      }));

  // Build deduplicated category tabs from canonical list, only show categories that exist in items
  const existingKats = new Set(allLayanan.map((l) => l.kategori));
  const categories: { id: string; label: string }[] = [
    { id: "semua", label: "Semua Layanan" },
    ...Object.entries(KATEGORI_LABELS)
      .filter(([id]) => existingKats.has(id))
      .map(([id, label]) => ({ id, label })),
  ];

  const filtered = allLayanan.filter((l) => {
    const matchSearch =
      l.nama.toLowerCase().includes(search.toLowerCase()) ||
      l.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategori === "semua" || l.kategori === kategori;
    return matchSearch && matchKategori;
  });

  // Determine card href: use routeSlug to build proper URL
  const getCardHref = (item: LayananItem): string => {
    return `/layanan/${item.routeSlug}`;
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Layanan & Aduan" }]} />

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "2.5rem 1rem", color: "#fff", textAlign: "center",
        }}
      >
        {/* Background image - static */}
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src={ASSETS.backgrounds.desa2}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(26,58,110,0.78) 0%, rgba(15,35,71,0.85) 100%)",
          }} />
        </div>
        <div style={{ maxWidth: 560, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#b8860b", marginBottom: "0.4rem", fontWeight: 600 }}>Pelayanan Publik</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.3rem, 3.5vw, 2rem)", fontWeight: 700, marginBottom: "0.75rem" }}>Layanan & Aduan Desa</h1>
          <p style={{ opacity: 0.8, fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Ajukan permohonan surat, layanan administrasi, dan laporan kepada Pemerintah Desa Karangtalun.
          </p>
          <div style={{ position: "relative", maxWidth: 440, margin: "0 auto" }}>
            <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="text"
              placeholder="Cari layanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: 4, border: "none", fontSize: "0.875rem", background: "#fff", color: "#1f2937", boxSizing: "border-box" }}
            />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <section style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 1rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "0.375rem", overflowX: "auto", padding: "0.75rem 0" }}>
          {categories.map((k) => (
            <button
              key={k.id}
              onClick={() => setKategori(k.id)}
              style={{
                padding: "0.375rem 1rem", borderRadius: 2, border: "1px solid",
                borderColor: kategori === k.id ? "var(--primary)" : "var(--border)",
                background: kategori === k.id ? "var(--primary)" : "transparent",
                color: kategori === k.id ? "#fff" : "var(--foreground)",
                fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
      </section>

      {/* Layanan cards */}
      <section style={{ padding: "2.5rem 1rem", background: "var(--background)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader title="Daftar Layanan" subtitle={`${filtered.length} layanan tersedia`} />

          {filtered.length === 0 ? (
            <EmptyState title="Layanan Tidak Ditemukan" description="Tidak ada layanan yang sesuai dengan pencarian Anda." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
              {filtered.map((layanan) => {
                const catColor = KATEGORI_COLOR[layanan.kategori] || "var(--primary)";
                // Surat warga items are locked for non-warga users
                const isLocked = layanan.butuhLogin && !isWarga;
                const cardHref = isLocked ? "/login" : getCardHref(layanan);

                return (
                  <Link key={layanan.id} href={cardHref} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 2,
                        padding: "1.25rem",
                        cursor: isLocked ? "not-allowed" : "pointer",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        overflow: "hidden",
                        filter: isLocked ? "grayscale(1)" : "none",
                        opacity: isLocked ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isLocked) {
                          e.currentTarget.style.borderColor = "var(--primary)";
                          e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Locked overlay */}
                      {isLocked && (
                        <div style={{
                          position: "absolute", inset: 0, zIndex: 2,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(0,0,0,0.08)",
                          borderRadius: 2,
                        }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: "50%",
                            background: "rgba(0,0,0,0.5)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Lock size={24} style={{ color: "#fff" }} />
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", marginBottom: "0.75rem" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 2, background: catColor + "0c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ display: "inline-block", width: 20, height: 20, backgroundColor: catColor, WebkitMaskImage: `url(${ICON_MAP[layanan.icon] || ASSETS.icons.layananDokumen})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center", maskImage: `url(${ICON_MAP[layanan.icon] || ASSETS.icons.layananDokumen})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "inline-block", padding: "0.1rem 0.4rem", borderRadius: 2, background: catColor + "0c", color: catColor, fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.375rem" }}>
                            {KATEGORI_LABELS[layanan.kategori] || layanan.kategori}
                          </span>
                          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)", lineHeight: 1.3 }}>{layanan.nama}</h3>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.5, flex: 1, marginBottom: "0.875rem" }}>{layanan.deskripsi}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          <Clock size={12} /><span>{layanan.estimasiWaktu}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600, color: isLocked ? "var(--text-muted)" : "var(--primary)" }}>
                          {isLocked ? (
                            <>
                              <Lock size={12} /> Khusus Warga
                            </>
                          ) : (
                            <>
                              Ajukan <ChevronRight size={14} />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Help section */}
      <section style={{ background: "var(--surface)", padding: "2.5rem 1rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.5rem" }}>Butuh Bantuan?</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Datang langsung ke Kantor Desa atau hubungi kami:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
            {[
              { label: "Kantor Desa", value: cms.identitasDesa.alamat || "Jl. Raya Karangtalun No. 1" },
              { label: "Telepon", value: cms.identitasDesa.telepon || "(0265) 123-4567" },
              { label: "Jam Pelayanan", value: cms.headerFooter.jamPelayanan || "Sen–Jum, 08.00–15.00 WIB" },
            ].map((item) => (
              <div key={item.label} style={{ padding: "0.75rem 1.25rem", background: "var(--surface-hover)", border: "1px solid var(--border)", borderRadius: 2, minWidth: 180 }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.125rem" }}>{item.label}</p>
                <p style={{ fontWeight: 700, color: "var(--foreground)", fontSize: "0.8rem" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

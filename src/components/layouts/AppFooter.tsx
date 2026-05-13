"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, ExternalLink, Shield, Siren, Cross, Flame } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { SITE_CONFIG } from "@/core/constants/siteConfig";
import DesaLogo from "@/components/ui/DesaLogo";

const TAUTAN_TERKAIT = [
  { label: "Kemendesa PDTT", url: "https://kemendesa.go.id" },
  { label: "Kab. Sragen", url: "https://sragenkab.go.id" },
  { label: "JDIH Sragen", url: "https://jdih.sragenkab.go.id" },
  { label: "Cek DPT Online", url: "https://cekdptonline.kpu.go.id" },
];

const KONTAK_DARURAT = [
  { label: "Keamanan / Polsek", nomor: "110", icon: Shield },
  { label: "Ambulans", nomor: "118 / 119", icon: Cross },
  { label: "Pemadam Kebakaran", nomor: "113", icon: Flame },
  { label: "SAR / Bencana", nomor: "115", icon: Siren },
];

const SOSMED_SVGS: Record<string, React.ReactNode> = {
  Instagram: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  Twitter: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
};

export default function AppFooter() {
  const { cms } = useCms();

  // CMS data with fallbacks
  const id = cms.identitasDesa;
  const hf = cms.headerFooter;
  const namaDesa = id.namaDesa || SITE_CONFIG.nama;
  const kecamatan = id.kecamatan || SITE_CONFIG.kecamatan;
  const kabupaten = id.kabupaten || SITE_CONFIG.kabupaten;
  const provinsi = id.provinsi || SITE_CONFIG.provinsi;
  const alamat = id.alamat || SITE_CONFIG.alamat;
  const telepon = id.telepon || SITE_CONFIG.telepon;
  const email = id.email || SITE_CONFIG.email;
  const kodeDesa = id.kodeDesa || SITE_CONFIG.kodeDesa;
  const kodePos = id.kodePos || SITE_CONFIG.kodePos;
  const tahunAnggaran = id.tahunAnggaran || SITE_CONFIG.tahunAnggaran;
  const teksFooter = hf.teksFooter || `© ${new Date().getFullYear()} Pemerintah Desa ${namaDesa}. Hak Cipta Dilindungi.`;
  const jamPelayanan = hf.jamPelayanan || "Senin - Jumat: 08.00 - 15.00 WIB";

  // CMS social media links
  const sosmedLinks = hf.linkSosmed && hf.linkSosmed.length > 0
    ? hf.linkSosmed.filter((s) => s.url)
    : [
        { platform: "Instagram", url: "https://instagram.com/desakarangtalun" },
        { platform: "Facebook", url: "https://facebook.com/desakarangtalun" },
      ];

  // CMS navigasi links
  const navigasi = hf.menuNavigasi && hf.menuNavigasi.length > 0
    ? hf.menuNavigasi.slice().sort((a, b) => a.urutan - b.urutan).map((m) => ({ label: m.label, path: m.href }))
    : [
        { label: "Beranda", path: "/" },
        { label: "Profil Desa", path: "/profil" },
        { label: "Berita", path: "/berita" },
        { label: "UMKM", path: "/umkm" },
        { label: "Layanan", path: "/layanan" },
        { label: "PPID", path: "/ppid" },
      ];

  return (
    <footer style={{ background: "#141720", color: "rgba(255,255,255,0.8)" }}>
      {/* Main Footer */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">

          {/* Col 1: Identity + Social */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <DesaLogo size={38} variant="white" />
              <div>
                <p className="font-bold text-white text-sm tracking-wide leading-tight">PEMERINTAH DESA {namaDesa.toUpperCase()}</p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Kec. {kecamatan}, Kab. {kabupaten}, Prov. {provinsi}
                </p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              <div className="flex items-start gap-2">
                <MapPin size={13} className="mt-0.5 shrink-0" />
                <span>{alamat}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="shrink-0" />
                <a href={`tel:${telepon}`} className="hover:text-white transition-colors">{telepon}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
              </div>
            </div>
            {jamPelayanan && (
              <p className="text-[11px] mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                Jam Pelayanan: {jamPelayanan}
              </p>
            )}

            {/* Social Media from CMS */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                Media Sosial
              </p>
              <div className="flex items-center gap-2">
                {sosmedLinks.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="w-8 h-8 rounded flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
                  >
                    {SOSMED_SVGS[s.platform] || <span className="text-[10px] font-bold">{s.platform.charAt(0)}</span>}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Navigasi from CMS */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-3">Navigasi</h4>
            <ul className="space-y-1.5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {navigasi.map((n) => (
                <li key={n.path}>
                  <Link href={n.path} className="hover:text-white transition-colors">{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Tautan Terkait */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-3">Tautan Terkait</h4>
            <ul className="space-y-1.5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {TAUTAN_TERKAIT.map((t) => (
                <li key={t.url}>
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <ExternalLink size={10} className="shrink-0" />
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Kode Desa: {kodeDesa}</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Kode Pos: {kodePos}</p>
            </div>
          </div>

          {/* Col 4: Kontak Darurat */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-white mb-3">Kontak Darurat</h4>
            <div className="space-y-2">
              {KONTAK_DARURAT.map((k) => (
                <div key={k.label} className="flex items-center gap-2.5 p-2 rounded" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ background: "rgba(220,38,38,0.15)" }}>
                    <k.icon size={13} style={{ color: "#f87171" }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-white leading-tight">{k.label}</p>
                    <p className="text-[11px] font-mono" style={{ color: "#f87171" }}>
                      <a href={`tel:${k.nomor.replace(/\s*\/\s*/g, "")}`} className="hover:underline">{k.nomor}</a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-3.5 flex flex-col md:flex-row items-center justify-between gap-1.5 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          <span>{teksFooter}</span>
          <span>Portal Desa Digital — Tahun Anggaran {tahunAnggaran}</span>
        </div>
      </div>
    </footer>
  );
}

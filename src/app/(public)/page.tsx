"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users, Activity, Map, FileText, ArrowRight, ChevronRight,
  Award, TrendingUp, Building2
} from "lucide-react";
import { SITE_CONFIG } from "@/core/constants/siteConfig";
import { ASSETS, DESA_PHOTOS } from "@/core/constants/assets";
import { useCms } from "@/core/cms/useCmsStore";
import { fetchStatistikKependudukan, type StatistikKependudukan } from "@/core/utils/wargaStats";


import { NewsCard, ProductCard, SectionHeader } from "@/components/ui/index";

// ─── STAT ICON COMPONENT ────────────────────────────────────
function StatIcon({ assetPath, fallbackIcon: FallbackIcon, size = 20 }: {
  assetPath: string;
  fallbackIcon: React.ComponentType<any>;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return <FallbackIcon size={size} style={{ color: "#f5d98a" }} />;
  }

  return (
    <Image
      src={assetPath}
      alt=""
      width={size}
      height={size}
      className="object-contain"
      style={{ filter: "brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(15deg) brightness(1.2)" }}
      onError={() => setImgError(true)}
    />
  );
}

// ─── HERO SECTION ────────────────────────────────────────────
function HeroBanner() {
  const { cms } = useCms();
  const heroBg = ASSETS.backgrounds.hero;
  const namaDesa = cms.identitasDesa.namaDesa || SITE_CONFIG.nama;

  const quickLinks = [
    { icon: Users, label: "Profil Desa", desc: "Sejarah & Aparatur", path: "/profil" },
    { icon: Activity, label: "Infografis", desc: "Data & Statistik", path: "/infografis" },
    { icon: Map, label: "Peta Desa", desc: "Geografis & Lokasi", path: "/peta" },
    { icon: FileText, label: "Layanan", desc: "Administrasi Surat", path: "/layanan" },
  ];

  return (
    <section
      className="relative w-full flex flex-col justify-end items-center"
      style={{ minHeight: "85vh", overflow: "hidden" }}
    >
      <div className="absolute inset-0" style={{ background: "var(--primary)" }}>
        <img
          src={heroBg}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.35 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(26,58,110,0.6) 0%, rgba(26,58,110,0.85) 100%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 lg:px-10 pb-16 pt-32">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.3em" }}>
            Portal Resmi
          </p>
          <h1
            className="font-black uppercase leading-tight mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "white",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              lineHeight: 1,
            }}
          >
            Desa<br />
            <span style={{ color: "#f5d98a" }}>{namaDesa}</span>
          </h1>
          <p className="text-sm md:text-base mb-8 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            Mewujudkan masyarakat yang sejahtera, mandiri, dan berbudaya melalui pelayanan digital yang transparan dan inovatif.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/layanan"
              className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-sm transition-all"
              style={{ background: "#f5d98a", color: "#1a1a1a" }}
            >
              <FileText size={16} /> Ajukan Layanan
            </Link>
            <Link
              href="/profil"
              className="flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-sm border transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.4)", color: "white" }}
            >
              Profil Desa <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12">
          {quickLinks.map((ql) => (
            <Link
              key={ql.path}
              href={ql.path}
              className="group flex items-center gap-3 p-4 rounded-sm border transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                borderColor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <ql.icon size={20} style={{ color: "#f5d98a", flexShrink: 0 }} />
              <div>
                <p className="text-xs font-bold text-white">{ql.label}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{ql.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SAMBUTAN SECTION ────────────────────────────────────────
function SambutanKades() {
  const { cms } = useCms();
  const [imgError, setImgError] = useState(false);
  const namaDesa = cms.identitasDesa.namaDesa || SITE_CONFIG.nama;
  const namaKades = cms.identitasDesa.namaKades || SITE_CONFIG.namaKades;
  const jabatanKades = cms.identitasDesa.jabatanKades || SITE_CONFIG.jabatanKades;
  const fotoKades = cms.profilDesa.fotoKades || ASSETS.officials.kades;
  const sambutanBg = DESA_PHOTOS[0];
  const sambutan = cms.profilDesa.sambutan;

  return (
    <section id="sambutan" className="reveal relative py-20" style={{ overflow: "hidden" }}>
      <div className="absolute inset-0" style={{ opacity: 0.04 }}>
        <Image src={sambutanBg} alt="" fill className="object-cover" />
      </div>
      <div className="absolute inset-0" style={{ background: "var(--background)" }} />

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10">
        <SectionHeader title="Kata Sambutan" subtitle={`Kepala Desa ${namaDesa}`} />
        <div
          className="flex flex-col md:flex-row gap-8 p-6 md:p-10 rounded-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="shrink-0 flex flex-col items-center text-center" style={{ minWidth: "120px" }}>
            <div
              className="w-24 h-24 rounded-sm overflow-hidden mb-3 flex items-center justify-center"
              style={{ border: "2px solid var(--primary)", background: "var(--accent-light)" }}
            >
              {imgError ? (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--primary)" }}>
                  <span className="text-2xl font-black" style={{ color: "var(--primary-foreground)" }}>
                    {namaKades.charAt(0)}
                  </span>
                </div>
              ) : (
                <Image
                  src={fotoKades}
                  alt={namaKades}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
            <p className="font-bold text-xs" style={{ color: "var(--foreground)" }}>{namaKades}</p>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{jabatanKades}</p>
          </div>
          <div className="flex-1">
            <h3
              className="text-xl md:text-2xl font-black mb-3"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
            >
              Assalamu&apos;alaikum Wr. Wb.
            </h3>
            {sambutan ? (
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{sambutan}</p>
            ) : (
              <>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                  Puji syukur kehadirat Tuhan Yang Maha Esa atas limpahan rahmat dan hidayah-Nya, sehingga website resmi Desa {namaDesa} ini dapat hadir sebagai wujud komitmen kami dalam memberikan pelayanan publik yang transparan, cepat, dan akuntabel.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Melalui portal digital ini, kami berkomitmen untuk memberikan pelayanan administrasi yang mudah diakses, menyajikan data desa yang terbuka, serta memajukan UMKM lokal Karangtalun agar mampu bersaing di era modern.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STATISTIK SECTION ───────────────────────────────────────
function StatistikSingkat() {
  const { cms } = useCms();
  const statistikBg = DESA_PHOTOS[1];
  const info = cms.infografis;
  // Kependudukan dari backend /statistik/kependudukan
  const [wargaStats, setWargaStats] = useState<StatistikKependudukan>({ totalPenduduk: 0, totalKK: 0, lakiLaki: 0, perempuan: 0, pendidikan: [], pekerjaan: [], kelompokUsia: [] });
  useEffect(() => { fetchStatistikKependudukan().then(setWargaStats); }, []);

  const stats = [
    { assetIcon: ASSETS.icons.penduduk, fallbackIcon: Users, label: "Total Penduduk", value: wargaStats.totalPenduduk.toLocaleString("id"), sub: "Jiwa terdaftar" },
    { assetIcon: ASSETS.icons.kk, fallbackIcon: Building2, label: "Kepala Keluarga", value: wargaStats.totalKK.toLocaleString("id"), sub: "KK aktif" },
    { assetIcon: ASSETS.icons.apbdes, fallbackIcon: TrendingUp, label: "APBDes", value: info.apbdesTotal ? `Rp ${(info.apbdesTotal / 1000000000).toFixed(2)} M` : "-", sub: `Anggaran ${cms.identitasDesa.tahunAnggaran || new Date().getFullYear()}` },
    { assetIcon: ASSETS.icons.idm, fallbackIcon: Award, label: "Status IDM", value: info.idmStatus || "-", sub: info.idmSkor ? `Skor ${info.idmSkor.toFixed(4)}` : "Belum tersedia" },
  ];

  return (
    <section className="reveal relative" id="statistik" style={{ overflow: "hidden" }}>
      <div className="absolute inset-0">
        <Image src={statistikBg} alt="" fill className="object-cover" style={{ opacity: 0.15 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(26,58,110,0.93) 0%, rgba(15,36,71,0.95) 100%)" }} />
      </div>

      <div className="relative py-12 max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="w-10 h-10 rounded mx-auto mb-3 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                <StatIcon assetPath={s.assetIcon} fallbackIcon={s.fallbackIcon} size={20} />
              </div>
              <p
                className="font-black text-xl md:text-2xl"
                style={{ color: "white", fontFamily: "var(--font-display)" }}
              >
                {s.value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                {s.label}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BERITA SECTION ──────────────────────────────────────────
function BeritaTerbaru() {
  const { cms } = useCms();

  // CMS berita filtered by Terbit
  const cmsBerita = cms.berita.filter((b) => b.status === "Terbit");
  const berita = cmsBerita.slice(0, 3);

  return (
    <section id="berita" className="reveal py-20" style={{ background: "var(--surface-hover)" }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <SectionHeader
          title="Berita & Pengumuman"
          subtitle="Informasi terkini dari Desa Karangtalun"
          action={
            <Link
              href="/berita"
              className="flex items-center gap-2 text-xs font-bold transition-colors"
              style={{ color: "var(--primary)" }}
            >
              Lihat Semua <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {berita.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── UMKM SECTION ────────────────────────────────────────────
function SorotanUmkm() {
  const { cms } = useCms();
  const umkmBg = DESA_PHOTOS[2];

  // CMS umkm filtered by aktif
  const cmsUmkm = cms.umkm.filter((u) => u.aktif);
  const produk = cmsUmkm.slice(0, 4);

  return (
    <section id="umkm" className="reveal relative py-20" style={{ overflow: "hidden" }}>
      <div className="absolute inset-0" style={{ opacity: 0.03 }}>
        <Image src={umkmBg} alt="" fill className="object-cover" />
      </div>
      <div className="absolute inset-0" style={{ background: "var(--background)" }} />

      <div className="relative max-w-[1440px] mx-auto px-6 lg:px-10">
        <SectionHeader
          title="UMKM Karangtalun"
          subtitle="Produk unggulan usaha mikro desa"
          action={
            <Link
              href="/umkm"
              className="flex items-center gap-2 text-xs font-bold transition-colors"
              style={{ color: "var(--primary)" }}
            >
              Semua Produk <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {produk.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function BerandaPage() {
  return (
    <>
      <HeroBanner />
      <SambutanKades />
      <StatistikSingkat />
      <BeritaTerbaru />
      <SorotanUmkm />
    </>
  );
}

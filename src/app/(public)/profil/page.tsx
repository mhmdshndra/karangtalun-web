"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import { SITE_CONFIG } from "@/core/constants/siteConfig";
import { DESA_PHOTOS } from "@/core/constants/assets";
import { useCms } from "@/core/cms/useCmsStore";

import { SectionHeader } from "@/components/ui/index";
import Breadcrumb from "@/components/ui/Breadcrumb";
import AparaturGrid from "@/components/ui/AparaturGrid";
import InfrastrukturCard from "@/components/ui/InfrastrukturCard";
import type { FasilitasItem } from "@/components/ui/InfrastrukturCard";

// ─── MOZAIK HERO ──────────────────────────────────────────────
function MozaikHero() {
  const { cms } = useCms();
  const namaDesa = cms.identitasDesa.namaDesa || SITE_CONFIG.nama;
  const kecamatan = cms.identitasDesa.kecamatan || SITE_CONFIG.kecamatan;
  const kabupaten = cms.identitasDesa.kabupaten || SITE_CONFIG.kabupaten;
  const provinsi = cms.identitasDesa.provinsi || SITE_CONFIG.provinsi;

  // 4 static images from public/assets/backgrounds
  const heroImages = [
    DESA_PHOTOS[0],
    DESA_PHOTOS[1],
    DESA_PHOTOS[2],
    DESA_PHOTOS[3],
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  // phase: 0 = full image, 1 = mosaic transition revealing next
  const [phase, setPhase] = useState<0 | 1>(0);

  useEffect(() => {
    // Cycle: show full (3s) -> mosaic reveal (2s) -> next full ...
    const timer = setInterval(() => {
      setPhase((p) => {
        if (p === 0) return 1; // start mosaic transition
        // mosaic done, move to next image
        setActiveIdx((prev) => (prev + 1) % 4);
        return 0;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentImg = heroImages[activeIdx];
  const nextImg = heroImages[(activeIdx + 1) % 4];

  return (
    <section
      className="relative flex items-end overflow-hidden"
      style={{ height: "45vh", minHeight: "320px", background: "var(--primary)" }}
    >
      {/* Base: current full image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${currentImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Mosaic overlay: 4 quadrants of next image that fade in staggered during phase 1 */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {[0, 1, 2, 3].map((qi) => (
          <div key={qi} className="relative overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${nextImg})`,
                backgroundSize: "200% 200%",
                backgroundPosition: `${qi % 2 === 0 ? "left" : "right"} ${qi < 2 ? "top" : "bottom"}`,
                opacity: phase === 1 ? 1 : 0,
                transition: `opacity 1.2s ease-in-out ${qi * 0.25}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, rgba(26,58,110,0.55) 0%, rgba(15,36,71,0.88) 100%)",
        }}
      />

      {/* Subtle grid line overlay for mozaik effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "50% 50%",
      }} />

      {/* Text content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-10 pb-12 w-full">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Pemerintah Desa
        </p>
        <h1
          className="text-4xl md:text-6xl font-black text-white uppercase"
          style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
        >
          {namaDesa}
        </h1>
        <p
          className="text-sm mt-2"
          style={{ color: "rgba(255,255,255,0.7)", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
        >
          Kec. {kecamatan}, Kab. {kabupaten}, {provinsi}
        </p>
      </div>
    </section>
  );
}

// ─── POTENSI CARD — SIMPLE, NO ICON ───────────────────────────
function PotensiCard({ title, desc, image }: {
  title: string; desc: string; image: string;
}) {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!image && !imgError;

  return (
    <div
      className="relative overflow-hidden group"
      style={{
        borderRadius: 2,
        border: "1px solid var(--border)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        minHeight: 180,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Background image */}
      {hasImage ? (
        <>
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)",
          }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: "var(--surface)" }} />
      )}

      {/* Content — simple: just title and description */}
      <div className="relative z-10 p-5 flex flex-col justify-end h-full" style={{ minHeight: 180 }}>
        <h3
          className="font-bold text-sm mb-1.5"
          style={{
            color: hasImage ? "#fff" : "var(--foreground)",
            textShadow: hasImage ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
          }}
        >
          {title}
        </h3>
        <p
          className="text-xs leading-relaxed"
          style={{
            color: hasImage ? "rgba(255,255,255,0.85)" : "var(--text-muted)",
            textShadow: hasImage ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function ProfilPage() {
  const { cms } = useCms();

  // CMS aparatur (aktif, sorted by urutan)
  const cmsAparatur = cms.aparatur.filter((a) => a.aktif).sort((a, b) => a.urutan - b.urutan);

  // Categorize aparatur by kategoriJabatan
  const pimpinan = cmsAparatur.filter((a) => a.kategoriJabatan === "Pimpinan" || a.kategoriJabatan === "pimpinan");
  const perangkat = cmsAparatur.filter((a) => a.kategoriJabatan === "Perangkat" || a.kategoriJabatan === "perangkat");
  const kadus = cmsAparatur.filter((a) => a.kategoriJabatan === "Kadus" || a.kategoriJabatan === "kadus" || a.kategoriJabatan === "Kepala Dusun");

  const identitas = cms.identitasDesa;
  const profil = cms.profilDesa;

  // CMS galeri (aktif, sorted by urutan)
  const galeri = cms.galeri.filter((g) => g.aktif).sort((a, b) => a.urutan - b.urutan);

  // Visi & Misi from CMS
  const visi = profil.visi || '"Terwujudnya Desa Karangtalun yang Maju, Mandiri, Sejahtera, dan Berbudaya Berlandaskan Nilai-Nilai Gotong Royong"';
  const misi = profil.misi.length > 0 ? profil.misi : [
    "Meningkatkan kualitas pelayanan publik yang cepat, transparan, dan akuntabel",
    "Mengembangkan potensi ekonomi lokal melalui UMKM dan BUMDes",
    "Meningkatkan kualitas sumber daya manusia melalui pendidikan dan kesehatan",
    "Membangun infrastruktur desa yang memadai dan berkeadilan",
    "Melestarikan nilai-nilai budaya dan kearifan lokal",
  ];

  // FASILITAS DATA — from CMS
  const cmsFasilitas = cms.fasilitas
    .filter((f) => f.aktif)
    .sort((a, b) => a.urutan - b.urutan);
  const FASILITAS_DATA: FasilitasItem[] = cmsFasilitas.map((f) => ({
    nama: f.nama,
    keterangan: f.deskripsi,
    jumlah: f.label,
    foto: f.gambar || undefined,
    units: f.titikLokasi
      .sort((a, b) => a.urutan - b.urutan)
      .map((tl) => ({
        nama: tl.nama,
        lokasi: tl.routeLink || undefined,
      })),
  }));

  // POTENSI DATA — from CMS (no icons, simple)
  const potensiData = cms.potensiDesa
    .filter((p) => p.aktif)
    .sort((a, b) => a.urutan - b.urutan);

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Profil Desa" }]} />
      <MozaikHero />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-16 space-y-20">

        {/* Sejarah */}
        <section id="sejarah" className="reveal scroll-mt-24">
          <SectionHeader title="Sejarah Desa" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="prose text-sm leading-relaxed space-y-4" style={{ color: "var(--text-muted)" }}>
              {profil.sejarah ? (
                <p>{profil.sejarah}</p>
              ) : (
                <>
                  <p>Desa Karangtalun merupakan salah satu desa di Kecamatan Tanon, Kabupaten Sragen, Provinsi Jawa Tengah. Berdasarkan catatan sejarah lokal, desa ini didirikan pada tahun 1948 pasca kemerdekaan Republik Indonesia.</p>
                  <p>Nama &quot;Karangtalun&quot; berasal dari kata &quot;karang&quot; yang berarti tempat atau perkampungan, dan &quot;talun&quot; yang berarti hutan belukar. Konon pada awal pemukiman, kawasan ini masih berupa hutan lebat yang kemudian dibuka oleh para leluhur untuk dijadikan lahan pertanian.</p>
                  <p>Seiring perkembangan waktu, Desa Karangtalun tumbuh menjadi desa yang maju dengan berbagai potensi unggulan di bidang pertanian, kerajinan tangan, dan pengembangan UMKM. Saat ini desa berhasil mencapai status IDM &quot;Maju&quot; dengan skor 0.8152 pada tahun 2024.</p>
                </>
              )}
            </div>
            <div className="p-6 rounded-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <h3 className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: "var(--primary)" }}>Data Geografis</h3>
              <div className="space-y-3 text-sm">
                {[
                  ["Kode Desa", identitas.kodeDesa || SITE_CONFIG.kodeDesa],
                  ["Kecamatan", identitas.kecamatan || SITE_CONFIG.kecamatan],
                  ["Kabupaten", identitas.kabupaten || SITE_CONFIG.kabupaten],
                  ["Provinsi", identitas.provinsi || SITE_CONFIG.provinsi],
                  ["Kode Pos", identitas.kodePos || SITE_CONFIG.kodePos],
                  ["Luas Wilayah", "±245 Ha"],
                  ["Jumlah Dusun", "3 Dusun"],
                  ["Jumlah RT/RW", "15 RT / 5 RW"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>{k}</span>
                    <span className="font-bold" style={{ color: "var(--foreground)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Visi Misi */}
        <section id="visi-misi" className="reveal scroll-mt-24">
          <SectionHeader title="Visi & Misi" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-sm" style={{ background: "var(--primary)", color: "white" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>Visi</p>
              <p className="text-xl font-black leading-tight" style={{ fontFamily: "var(--font-display)" }}>{visi}</p>
            </div>
            <div className="p-8 rounded-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>Misi</p>
              <ol className="space-y-3 text-sm" style={{ color: "var(--foreground)" }}>
                {misi.map((m, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5" style={{ background: "var(--primary)", color: "white" }}>{i + 1}</span>
                    <span style={{ color: "var(--text-muted)" }}>{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Potensi — simple, no icon, from CMS */}
        {potensiData.length > 0 && (
        <section id="potensi" className="reveal scroll-mt-24">
          <SectionHeader title="Potensi Desa" subtitle="Keunggulan dan potensi yang dimiliki Desa Karangtalun" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {potensiData.map((p) => (
              <PotensiCard
                key={p.id}
                title={p.judul}
                desc={p.deskripsi}
                image={p.gambar}
              />
            ))}
          </div>
        </section>
        )}

        {/* Aparatur */}
        <section id="sotk" className="reveal scroll-mt-24">
          <SectionHeader title="Aparatur Desa" subtitle="Struktur organisasi pemerintahan Desa Karangtalun" />
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 2, padding: "1.5rem 1rem" }}>
            <AparaturGrid pimpinan={pimpinan} perangkat={perangkat} kadus={kadus} />
          </div>
        </section>

        {/* Galeri — if CMS has data */}
        {galeri.length > 0 && (
          <section id="galeri" className="reveal scroll-mt-24">
            <SectionHeader title="Galeri Kegiatan" subtitle="Dokumentasi kegiatan Desa Karangtalun" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galeri.map((g) => (
                <div key={g.id} className="relative rounded-sm overflow-hidden" style={{ aspectRatio: "4/3", border: "1px solid var(--border)" }}>
                  <Image src={g.url} alt={g.judul} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-bold text-white line-clamp-1">{g.judul}</p>
                    <p className="text-[10px] text-white/60">{g.tanggal}</p>
                    {g.deskripsi && <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">{g.deskripsi}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fasilitas & Infrastruktur */}
        <section id="fasilitas" className="reveal scroll-mt-24">
          <SectionHeader title="Fasilitas & Infrastruktur" subtitle="Sarana dan prasarana yang tersedia di Desa Karangtalun" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FASILITAS_DATA.map((f) => (
              <InfrastrukturCard key={f.nama} item={f} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

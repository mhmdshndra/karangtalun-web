/**
 * Centralized asset paths with fallback support.
 * Admin can replace files in public/assets/ without code changes.
 *
 * LOKASI ASET: public/assets/
 *   logos/        — logo desa (PNG)
 *   icons/        — ikon statistik (SVG)
 *   backgrounds/  — foto desa untuk hero, auth, section bg
 *   auth/         — emblem auth page
 *   officials/    — foto aparatur desa
 *   facilities/   — foto fasilitas & infrastruktur
 *   gallery/      — foto galeri kegiatan
 *   products/     — foto produk UMKM
 *   news/         — thumbnail berita
 */

export const ASSETS = {
  logos: {
    /** Logo resmi desa — ganti file ini di public/assets/logos/ */
    desa: "/assets/logos/logo-desa.png",
    /** Logo desa versi putih (untuk dark bg) */
    desaWhite: "/assets/logos/logo-desa-white.png",
  },
  icons: {
    // Beranda statistik
    penduduk: "/assets/icons/ic-penduduk.svg",
    kk: "/assets/icons/ic-kk.svg",
    apbdes: "/assets/icons/ic-apbdes.svg",
    idm: "/assets/icons/ic-idm.svg",
    // Profil desa — potensi
    pertanian: "/assets/icons/ic-pertanian.svg",
    umkm: "/assets/icons/ic-umkm.svg",
    wisata: "/assets/icons/ic-wisata.svg",
    bumdes: "/assets/icons/ic-bumdes.svg",
    lokasi: "/assets/icons/ic-lokasi.svg",
    digital: "/assets/icons/ic-digital.svg",
    // IDM — pilar ketahanan
    sosial: "/assets/icons/ic-sosial.svg",
    ekonomi: "/assets/icons/ic-ekonomi.svg",
    ekologi: "/assets/icons/ic-ekologi.svg",
    // Layanan — kategori
    layananDokumen: "/assets/icons/ic-layanan-dokumen.svg",
    layananSosial: "/assets/icons/ic-layanan-sosial.svg",
    layananKeamanan: "/assets/icons/ic-layanan-keamanan.svg",
    layananEkonomi: "/assets/icons/ic-layanan-ekonomi.svg",
    layananInfrastruktur: "/assets/icons/ic-layanan-infrastruktur.svg",
    layananDarurat: "/assets/icons/ic-layanan-darurat.svg",
    layananPengaduan: "/assets/icons/ic-layanan-pengaduan.svg",
  },
  backgrounds: {
    /** Foto utama hero & banner profil */
    hero: "/assets/backgrounds/hero-desa.jpg",
    /** Background auth pages */
    auth: "/assets/backgrounds/auth-bg.jpg",
    /** Foto desa untuk section background (sambutan, statistik, UMKM, hero profil) */
    desa1: "/assets/backgrounds/desa-1.jpg",
    desa2: "/assets/backgrounds/desa-2.jpg",
    desa3: "/assets/backgrounds/desa-3.jpg",
  },
  auth: {
    emblem: "/assets/auth/emblem-desa.png",
  },
  officials: {
    kades: "/assets/officials/kades.jpg",
  },
  facilities: {
    placeholder: "/assets/facilities/placeholder.jpg",
    balaiDesa: "/assets/facilities/balai-desa.jpg",
    puskesmas: "/assets/facilities/puskesmas.jpg",
    sekolah: "/assets/facilities/sekolah.jpg",
    masjid: "/assets/facilities/masjid.jpg",
    pasar: "/assets/facilities/pasar.jpg",
    jalan: "/assets/facilities/jalan.jpg",
  },
  gallery: {
    /** Foto galeri kegiatan — admin ganti di public/assets/gallery/ */
    foto1: "/assets/gallery/galeri-1.jpg",
    foto2: "/assets/gallery/galeri-2.jpg",
    foto3: "/assets/gallery/galeri-3.jpg",
    foto4: "/assets/gallery/galeri-4.jpg",
    foto5: "/assets/gallery/galeri-5.jpg",
    foto6: "/assets/gallery/galeri-6.jpg",
  },
  news: {
    /** Thumbnail berita — admin ganti di public/assets/news/ */
    berita1: "/assets/news/berita-1.jpg",
    berita2: "/assets/news/berita-2.jpg",
    berita3: "/assets/news/berita-3.jpg",
    berita4: "/assets/news/berita-4.jpg",
    berita5: "/assets/news/berita-5.jpg",
    berita6: "/assets/news/berita-6.jpg",
  },
  products: {
    /** Foto produk UMKM — admin ganti di public/assets/products/ */
    placeholder: "/assets/products/placeholder.jpg",
  },
} as const;

/**
 * Desa photo paths for mosaic / gallery backgrounds.
 * Used on homepage sections and profil hero (mozaik).
 * Admin: ganti file di public/assets/backgrounds/
 */
export const DESA_PHOTOS = [
  ASSETS.backgrounds.desa1,
  ASSETS.backgrounds.desa2,
  ASSETS.backgrounds.desa3,
  ASSETS.backgrounds.hero,
] as const;

/**
 * DesaLogo component — shows village logo with text fallback.
 * Designed to be used in navbar, footer, and auth pages.
 */
export function getLogoFallbackInitials(): string {
  return "KT";
}

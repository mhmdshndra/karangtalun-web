/**
 * Application constants — reference data used across pages.
 * Extracted from mock files. These are UI display constants, NOT mock data.
 */

import type { JenisSuratOption } from "@/core/types";

// ─── JENIS SURAT OPTIONS ─────────────────────────────────────

export const JENIS_SURAT_OPTIONS: JenisSuratOption[] = [
  {
    value: "surat_keterangan_domisili",
    label: "Surat Keterangan Domisili",
    deskripsi: "Surat keterangan tempat tinggal yang dikeluarkan oleh pemerintah desa.",
    estimasi: "1–2 hari kerja",
    persyaratan: ["Fotokopi KTP", "Fotokopi KK", "Surat pengantar RT/RW"],
  },
  {
    value: "surat_keterangan_tidak_mampu",
    label: "Surat Keterangan Tidak Mampu (SKTM)",
    deskripsi: "Surat keterangan untuk warga yang tergolong keluarga kurang mampu.",
    estimasi: "1–2 hari kerja",
    persyaratan: ["Fotokopi KTP", "Fotokopi KK", "Surat pengantar RT/RW", "Bukti pendukung (foto rumah, dll)"],
  },
  {
    value: "surat_pengantar_skck",
    label: "Surat Pengantar SKCK",
    deskripsi: "Surat pengantar untuk pembuatan SKCK di kepolisian.",
    estimasi: "1 hari kerja",
    persyaratan: ["Fotokopi KTP", "Fotokopi KK", "Pas foto 4x6 (3 lembar)", "Surat pengantar RT/RW"],
  },
  {
    value: "surat_keterangan_usaha",
    label: "Surat Keterangan Usaha",
    deskripsi: "Surat keterangan yang menerangkan bahwa warga memiliki usaha.",
    estimasi: "1–2 hari kerja",
    persyaratan: ["Fotokopi KTP", "Fotokopi KK", "Surat pengantar RT/RW", "Foto tempat usaha"],
  },
];

export function getJenisSuratByValue(value: string): JenisSuratOption | undefined {
  return JENIS_SURAT_OPTIONS.find((j) => j.value === value);
}

// ─── KATEGORI LAPORAN ────────────────────────────────────────

export const KATEGORI_LAPORAN_OPTIONS = [
  { value: "infrastruktur", label: "Infrastruktur", deskripsi: "Jalan, jembatan, irigasi, bangunan" },
  { value: "kamtibmas", label: "Keamanan & Ketertiban", deskripsi: "Keamanan lingkungan, ketertiban umum" },
  { value: "umum", label: "Umum", deskripsi: "Lingkungan, sosial, dan lainnya" },
];

// ─── PPID CATEGORIES ─────────────────────────────────────────

export const PPID_CATEGORIES = {
  berkala: "Informasi Berkala",
  serta_merta: "Informasi Serta Merta",
  setiap_saat: "Informasi Setiap Saat",
  dasar_hukum: "Dasar Hukum",
} as const;

// ─── IDM TABEL INDIKATOR ────────────────────────────────────

export const IDM_TABEL_INDIKATOR = [
  { dimensi: "Ketahanan Sosial", indikator: "Akses Pendidikan", nilai: "Ada", skor: 1.0, status: "Tercapai" },
  { dimensi: "Ketahanan Sosial", indikator: "Akses Kesehatan", nilai: "Posyandu Aktif", skor: 1.0, status: "Tercapai" },
  { dimensi: "Ketahanan Sosial", indikator: "Modal Sosial", nilai: "Karang Taruna Aktif", skor: 1.0, status: "Tercapai" },
  { dimensi: "Ketahanan Ekonomi", indikator: "Keberagaman Produksi", nilai: "< 5 Jenis", skor: 0.5, status: "Perlu Peningkatan" },
  { dimensi: "Ketahanan Ekonomi", indikator: "BUMDes", nilai: "Aktif", skor: 1.0, status: "Tercapai" },
  { dimensi: "Ketahanan Ekonomi", indikator: "Akses Distribusi", nilai: "Pasar Desa Ada", skor: 0.5, status: "Perlu Peningkatan" },
  { dimensi: "Ketahanan Ekologi", indikator: "Kualitas Air", nilai: "Layak", skor: 1.0, status: "Tercapai" },
  { dimensi: "Ketahanan Ekologi", indikator: "Mitigasi Bencana", nilai: "Tim Siaga Ada", skor: 1.0, status: "Tercapai" },
  { dimensi: "Ketahanan Ekologi", indikator: "Pembuangan Sampah", nilai: "TPS Ada", skor: 0.8, status: "Tercapai" },
];

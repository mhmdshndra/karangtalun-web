// ─── EXISTING TYPES ──────────────────────────────────────────

export interface BeritaItem {
  id: string;
  slug: string;
  judul: string;
  kategori: string;
  penulis: string;
  tanggal: string;
  waktu: string;
  views: number;
  status: "Terbit" | "Draft" | "Diarsipkan";
  tipe: "Artikel" | "Video";
  sumberVideo?: "Upload" | "Link";
  linkVideo?: string;
  thumbnail?: string;
  konten: string;
  isFeatured?: boolean;
}

export interface UmkmProduct {
  id: number;
  slug: string;
  category: string;
  name: string;
  seller: string;
  rt_rw: string;
  whatsapp_number: string;
  price: number;
  likes: number;
  images: string[];
  description: string;
}

export interface PpidDocument {
  id: number;
  title: string;
  category: string;
  date: string;
  downloads: number;
  fileUrl?: string;
}

export interface LayananPublik {
  id: string;
  nama: string;
  deskripsi: string;
  icon: string;
  estimasiWaktu: string;
  biaya: string;
  kategori: string;
  persyaratan: string[];
  prosedur: string[];
}

export interface IdmData {
  tahun: number;
  skor: number;
  status: string;
  sosial: number;
  ekonomi: number;
  ekologi: number;
}

export interface AparaturDesa {
  id: number;
  nama: string;
  jabatan: string;
  foto?: string;
  rt_rw?: string;
}

export interface GaleriItem {
  id: number;
  judul: string;
  url: string;
  kategori: string;
  tanggal: string;
}

// ─── ROLE SYSTEM ─────────────────────────────────────────────

export type UserRole = "admin_desa" | "staf_layanan" | "warga" | "public";

export type StatusAktivasi = "belum_aktivasi" | "aktif" | "nonaktif";

export interface AppUser {
  id: string;
  nama_lengkap: string;
  nik: string;
  no_kk: string;
  role: UserRole;
  /** ID petugas (hanya untuk admin_desa / staf_layanan) */
  id_petugas?: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  rt_rw?: string;
  foto?: string;
  /** Status aktivasi akun — warga harus aktivasi sendiri via /register */
  status_aktivasi: StatusAktivasi;
  /** Password hash (mock: plaintext) — diset saat aktivasi */
  password?: string;
  /** Tanggal aktivasi akun */
  tanggal_aktivasi?: string;
}

// ─── KARTU KELUARGA ──────────────────────────────────────────

export type StatusHubungan = "Kepala Keluarga" | "Istri" | "Anak" | "Orang Tua" | "Lainnya";
export type JenisKelamin = "Laki-laki" | "Perempuan";
export type StatusPerkawinan = "Belum Kawin" | "Kawin" | "Cerai Hidup" | "Cerai Mati";
export type Agama = "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu";
export type Pendidikan = "Tidak/Belum Sekolah" | "SD/Sederajat" | "SMP/Sederajat" | "SMA/Sederajat" | "D1" | "D2" | "D3" | "S1" | "S2" | "S3";

export interface AnggotaKK {
  nik: string;
  nama_lengkap: string;
  jenis_kelamin: JenisKelamin;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: Agama;
  pendidikan: Pendidikan;
  pekerjaan: string;
  status_perkawinan: StatusPerkawinan;
  status_hubungan: StatusHubungan;
  kewarganegaraan: string;
}

export interface KartuKeluarga {
  no_kk: string;
  kepala_keluarga: string;
  alamat: string;
  rt_rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  anggota: AnggotaKK[];
}

// ─── E-SURAT ─────────────────────────────────────────────────

export type JenisSurat =
  | "surat_keterangan_domisili"
  | "surat_keterangan_tidak_mampu"
  | "surat_pengantar_skck"
  | "surat_keterangan_usaha";

export interface JenisSuratOption {
  value: JenisSurat;
  label: string;
  deskripsi: string;
  estimasi: string;
  persyaratan: string[];
}

export type StatusPengajuan = "Menunggu" | "Diproses" | "Selesai" | "Ditolak";

export interface PengajuanSurat {
  id: string;
  jenis_surat: JenisSurat;
  jenis_surat_label: string;
  nomor_tiket: string;
  nomor_surat?: string;
  tanggal_pengajuan: string;
  tanggal_diperbarui: string;
  status: StatusPengajuan;
  /** Akun warga yang login & mengajukan (≥17 tahun) */
  diajukan_oleh: {
    nik: string;
    nama_lengkap: string;
  };
  /** Anggota KK yang menjadi subjek surat (bisa < 17 tahun) */
  pemohon: {
    nik: string;
    nama_lengkap: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: JenisKelamin;
    pekerjaan: string;
    alamat: string;
    status_hubungan: StatusHubungan;
  };
  keperluan: string;
  catatan_admin?: string;
  berkas_lampiran?: string[];
  /** Path file surat yang sudah jadi (diisi backend setelah status Selesai) */
  file_surat?: string;
}

// ─── NOTIFIKASI ──────────────────────────────────────────────

export type NotifikasiTipe =
  | "surat_masuk" | "surat_diproses" | "surat_selesai" | "surat_ditolak"
  | "info" | "pengumuman"
  | "laporan_masuk" | "laporan_diproses" | "laporan_selesai"
  | "permohonan_masuk" | "permohonan_diproses" | "permohonan_selesai";

export interface Notifikasi {
  id: string;
  tipe: NotifikasiTipe;
  judul: string;
  pesan: string;
  tanggal: string;
  dibaca: boolean;
  link?: string;
  target_role?: string;
  target_nik?: string;
  target_user_id?: string;
  target_email?: string;
}

// ─── LAPORAN / ADUAN ──────────────────────────────────────────

export type KategoriLaporan = "infrastruktur" | "kamtibmas" | "umum";
export type StatusLaporan = "Dikirim" | "Ditindaklanjuti" | "Selesai";

export interface LaporanAduan {
  id: string;
  nomor_tiket: string;
  kategori: KategoriLaporan;
  nama_pelapor: string;
  alamat_pelapor: string;
  kontak_pelapor: string;
  deskripsi: string;
  lokasi_kejadian: string;
  tanggal_laporan: string;
  tanggal_diperbarui: string;
  status: StatusLaporan;
  lampiran: string[];
  catatan_admin?: string;
  pelapor_user_id?: string;
  pelapor_nik?: string;
  cf_turnstile_token?: string;
}

// ─── PERMOHONAN INFORMASI PPID ────────────────────────────────

export type StatusPermohonan = "Dikirim" | "Diproses" | "Dijawab" | "Ditolak";

export interface PermohonanInformasi {
  id: string;
  nomor_permohonan: string;
  nama_pemohon: string;
  alamat_pemohon: string;
  kontak_pemohon: string;
  tujuan_permohonan: string;
  informasi_diminta: string;
  tanggal_permohonan: string;
  tanggal_diperbarui: string;
  status: StatusPermohonan;
  lampiran: string[];
  file_balasan?: string[];
  catatan_admin?: string;
  pemohon_user_id?: string;
  pemohon_nik?: string;
  cf_turnstile_token?: string;
}

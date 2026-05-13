// ─── CMS TYPES ──────────────────────────────────────────────

export interface CmsIdentitasDesa {
  namaDesa: string;
  kodeDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  alamat: string;
  email: string;
  telepon: string;
  mapsUrl: string;
  koordinat: { lat: number; lng: number };
  namaKades: string;
  jabatanKades: string;
  tahunAnggaran: string;
  sosialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
}

// CmsMedia removed — logo, favicon, and default images are now static assets
// managed via public/assets/ paths in src/core/constants/assets.ts.
// Foto Kades is managed in CmsProfilDesa (alongside sambutan).

// CmsBackground removed — hero backgrounds are now static files
// served from public/assets/backgrounds/ via src/core/constants/assets.ts.
// Potensi and fasilitas images use static asset fallbacks directly.

export interface CmsBerita {
  id: string;
  judul: string;
  slug: string;
  kategori: string;
  penulis: string;
  tanggal: string;
  waktu: string;
  views: number;
  status: "Terbit" | "Draft" | "Diarsipkan";
  tipe: "Artikel" | "Video";
  linkVideo?: string;
  thumbnail: string;
  konten: string;
  isFeatured: boolean;
}

export interface CmsGaleri {
  id: string;
  judul: string;
  url: string;
  kategori: string;
  tanggal: string;
  deskripsi: string;
  urutan: number;
  aktif: boolean;
}

export interface CmsPotensiDesa {
  id: string;
  judul: string;
  deskripsi: string;
  gambar: string;
  urutan: number;
  aktif: boolean;
}

export interface CmsTitikLokasi {
  id: string;
  nama: string;
  label: string;
  lat: number;
  lng: number;
  routeLink: string;
  urutan: number;
}

export interface CmsFasilitas {
  id: string;
  nama: string;
  deskripsi: string;
  gambar: string;
  label: string;
  urutan: number;
  aktif: boolean;
  titikLokasi: CmsTitikLokasi[];
}

export interface CmsUmkm {
  id: string;
  nama: string;
  slug: string;
  kategori: string;
  namaPenjual: string;
  rtRw: string;
  whatsapp: string;
  harga: number;
  foto: string;
  deskripsi: string;
  likes: number;
  aktif: boolean;
  unggulan: boolean;
}

export interface CmsAparatur {
  id: string;
  nama: string;
  jabatan: string;
  foto: string;
  kategoriJabatan: string;
  urutan: number;
  aktif: boolean;
}

export interface CmsProfilDesa {
  sejarah: string;
  visi: string;
  misi: string[];
  potensi: string;
  sambutan: string;
  fotoKades: string;
  strukturPemerintahan: string;
  fasilitas: string;
}

export interface CmsLayananPublik {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: string;
  estimasiWaktu: string;
  biaya: string;
  persyaratan: string[];
  prosedur: string[];
  aktif: boolean;
  butuhLogin: boolean;
  instruksi: string;
  /** Route slug for frontend link, e.g. "suket-domisili", "lapor-infrastruktur" */
  routeSlug: string;
  /** "surat" = permohonan surat warga, "laporan" = laporan/aduan publik */
  tipeLayanan: "surat" | "laporan";
}

export interface CmsPpidDokumen {
  id: string;
  judul: string;
  kategori: string;
  tanggal: string;
  fileUrl: string;
  aktif: boolean;
  urutan: number;
}

export interface CmsPetaDesa {
  id: string;
  nama: string;
  kategori: string;
  lat: number;
  lng: number;
  deskripsi: string;
  alamat: string;
  aktif: boolean;
  warna: string;
}

export interface CmsInfografis {
  jumlahPenduduk: number;
  jumlahKK: number;
  apbdesTotal: number;
  apbdesRealisasi: number;
  idmSkor: number;
  idmStatus: string;
  stuntingTotal: number;
  stuntingKasus: number;
  dataBansos: { program: string; penerima: number; anggaran: string }[];
  sdgsCapaian: { no: number; title: string; persen: number }[];
}

export interface CmsHeaderFooter {
  menuNavigasi: { label: string; href: string; urutan: number }[];
  teksFooter: string;
  kontakFooter: string;
  jamPelayanan: string;
  linkSosmed: { platform: string; url: string }[];
  tombolWa: string;
}

export interface CmsData {
  identitasDesa: CmsIdentitasDesa;
  berita: CmsBerita[];
  galeri: CmsGaleri[];
  umkm: CmsUmkm[];
  aparatur: CmsAparatur[];
  profilDesa: CmsProfilDesa;
  potensiDesa: CmsPotensiDesa[];
  fasilitas: CmsFasilitas[];
  layananPublik: CmsLayananPublik[];
  ppidDokumen: CmsPpidDokumen[];
  petaDesa: CmsPetaDesa[];
  infografis: CmsInfografis;
  headerFooter: CmsHeaderFooter;
}

export const SITE_CONFIG = {
  nama: "Karangtalun",
  kodeDesa: "33.14.07.2005",
  kecamatan: "Tanon",
  kabupaten: "Sragen",
  provinsi: "Jawa Tengah",
  kodePos: "57277",
  alamat: "Jl. Raya Karangtalun No. 1, Dusun I, Kec. Tanon, Kab. Sragen, Jawa Tengah 57277",
  email: "pemdes@karangtalun.desa.id",
  telepon: "0812-3456-7890",
  mapsUrl: "https://maps.google.com/?q=Karangtalun,Tanon,Sragen,Jawa+Tengah",
  logoPath: "/logo-desa.png",
  namaKades: "Budi Santoso, S.IP.",
  jabatanKades: "Kepala Desa Karangtalun",
  tahunAnggaran: "2026",
  koordinat: { lat: -7.3574, lng: 111.0089 },
} as const;

export const NAV_LINKS = [
  {
    name: "Beranda",
    path: "/",
    dropdown: [
      { name: "Sambutan", href: "/#sambutan" },
      { name: "Statistik", href: "/#statistik" },
      { name: "Berita", href: "/#berita" },
      { name: "UMKM", href: "/#umkm" },
    ],
  },
  {
    name: "Profil Desa",
    path: "/profil",
    dropdown: [
      { name: "Sejarah", href: "/profil#sejarah" },
      { name: "Visi & Misi", href: "/profil#visi-misi" },
      { name: "Potensi", href: "/profil#potensi" },
      { name: "Aparatur", href: "/profil#sotk" },
      { name: "Infrastruktur", href: "/profil#fasilitas" },
    ],
  },
  {
    name: "Infografis",
    path: "/infografis",
    dropdown: [
      { name: "Penduduk", href: "/infografis#penduduk" },
      { name: "APBDes", href: "/infografis#apbdes" },
      { name: "Stunting", href: "/infografis#stunting" },
      { name: "Bansos", href: "/infografis#bansos" },
      { name: "SDGs Desa", href: "/infografis#sdgs" },
    ],
  },
  { name: "Peta Desa", path: "/peta" },
  { name: "IDM", path: "/idm" },
  { name: "Berita", path: "/berita" },
  { name: "UMKM", path: "/umkm" },
  {
    name: "Layanan",
    path: "/layanan",
    dropdown: [
      { name: "Surat Domisili", href: "/layanan/suket-domisili" },
      { name: "SKTM", href: "/layanan/sktm" },
      { name: "Pengantar SKCK", href: "/layanan/pengantar-skck" },
      { name: "Surat Usaha", href: "/layanan/suket-usaha" },
      { name: "Lapor Infrastruktur", href: "/layanan/lapor-infrastruktur" },
      { name: "Lapor Kamtibmas", href: "/layanan/lapor-kamtibmas" },
      { name: "Lapor Umum", href: "/layanan/lapor-umum" },
    ],
  },
  {
    name: "PPID",
    path: "/ppid",
    dropdown: [
      { name: "Informasi Berkala", href: "/ppid/informasi-berkala" },
      { name: "Informasi Serta Merta", href: "/ppid/informasi-serta-merta" },
      { name: "Informasi Setiap Saat", href: "/ppid/informasi-setiap-saat" },
      { name: "Dasar Hukum", href: "/ppid/dasar-hukum" },
      { name: "Permohonan Informasi", href: "/ppid/permohonan" },
    ],
  },
];

export const LAYANAN_LINKS = [
  { label: "Permohonan Surat Domisili", path: "/layanan/suket-domisili", icon: "FileText" },
  { label: "Surat Keterangan Tidak Mampu", path: "/layanan/sktm", icon: "HeartHandshake" },
  { label: "Pengantar SKCK", path: "/layanan/pengantar-skck", icon: "Shield" },
  { label: "Surat Keterangan Usaha", path: "/layanan/suket-usaha", icon: "Briefcase" },
  { label: "Lapor Infrastruktur", path: "/layanan/lapor-infrastruktur", icon: "Construction" },
  { label: "Lapor Kamtibmas", path: "/layanan/lapor-kamtibmas", icon: "AlertTriangle" },
  { label: "Lapor Umum", path: "/layanan/lapor-umum", icon: "MessageSquare" },
];

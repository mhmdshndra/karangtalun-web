import type { CmsData } from "./cmsTypes";

/**
 * Empty CMS data — structural defaults only.
 * Used as initial state before backend responds and as fallback if backend is unreachable.
 * Contains NO dummy content — all arrays are empty, all strings are empty or minimal.
 * Real data must come from backend API endpoints (/api/cms/*).
 */
export const defaultCmsData: CmsData = {
  identitasDesa: {
    namaDesa: "",
    kodeDesa: "",
    kecamatan: "",
    kabupaten: "",
    provinsi: "",
    kodePos: "",
    alamat: "",
    email: "",
    telepon: "",
    mapsUrl: "",
    koordinat: { lat: 0, lng: 0 },
    namaKades: "",
    jabatanKades: "",
    tahunAnggaran: "",
    sosialMedia: {},
  },
  profilDesa: {
    sejarah: "",
    visi: "",
    misi: [],
    potensi: "",
    sambutan: "",
    fotoKades: "",
    strukturPemerintahan: "",
    fasilitas: "",
  },
  berita: [],
  galeri: [],
  umkm: [],
  aparatur: [],
  potensiDesa: [],
  fasilitas: [],
  layananPublik: [],
  ppidDokumen: [],
  petaDesa: [],
  infografis: {
    jumlahPenduduk: 0,
    jumlahKK: 0,
    apbdesTotal: 0,
    apbdesRealisasi: 0,
    idmSkor: 0,
    idmStatus: "",
    stuntingTotal: 0,
    stuntingKasus: 0,
    dataBansos: [],
    sdgsCapaian: [],
  },
  headerFooter: {
    menuNavigasi: [],
    teksFooter: "",
    kontakFooter: "",
    jamPelayanan: "",
    linkSosmed: [],
    tombolWa: "",
  },
};

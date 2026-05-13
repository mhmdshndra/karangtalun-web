"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  CmsData, CmsBerita, CmsGaleri, CmsUmkm, CmsAparatur,
  CmsLayananPublik, CmsPpidDokumen, CmsPetaDesa,
  CmsIdentitasDesa, CmsProfilDesa, CmsInfografis, CmsHeaderFooter,
  CmsPotensiDesa, CmsFasilitas,
} from "./cmsTypes";
import { defaultCmsData } from "./defaultCmsData";
import { publicGet, get, put, post, del, upload } from "@/core/api/client";
import { __pendingFiles } from "@/components/admin/CmsComponents";

/* ── Helpers ── */

interface ApiRes<T = unknown> { success: boolean; data?: T }
interface PaginatedRes<T> { success: boolean; data: T[] }

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

function getApiOrigin() {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return "http://localhost:8000";
  }
}

function mediaUrl(src?: string | null): string {
  if (!src) return "";

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("#")
  ) {
    return src;
  }

  const clean = src
    .replace(/^public\//, "")
    .replace(/^storage\//, "")
    .replace(/^\/+/, "");

  return `${getApiOrigin()}/storage/${clean}`;
}

function normalizeCmsMedia(data: CmsData): CmsData {
  return {
    ...data,
    profilDesa: {
      ...data.profilDesa,
      fotoKades: mediaUrl(data.profilDesa.fotoKades),
    },
    berita: data.berita.map((item) => ({
      ...item,
      thumbnail: mediaUrl(item.thumbnail),
    })),
    galeri: data.galeri.map((item) => ({
      ...item,
      url: mediaUrl(item.url),
    })),
    umkm: data.umkm.map((item) => ({
      ...item,
      foto: mediaUrl(item.foto),
    })),
    aparatur: data.aparatur.map((item) => ({
      ...item,
      foto: mediaUrl(item.foto),
    })),
    potensiDesa: data.potensiDesa.map((item) => ({
      ...item,
      gambar: mediaUrl(item.gambar),
    })),
    fasilitas: data.fasilitas.map((item) => ({
      ...item,
      gambar: mediaUrl(item.gambar),
    })),
    ppidDokumen: data.ppidDokumen.map((item) => ({
      ...item,
      fileUrl: mediaUrl(item.fileUrl),
    })),
  };
}

function normalizeSavedByEndpoint<T>(endpoint: string, item: T): T {
  if (!item || typeof item !== "object") return item;

  const basePath = endpoint.split("/")[0];
  const data = item as Record<string, unknown>;

  if (basePath === "berita") {
    return {
      ...data,
      thumbnail: mediaUrl(data.thumbnail as string | undefined),
    } as T;
  }

  if (basePath === "galeri") {
    return {
      ...data,
      url: mediaUrl(data.url as string | undefined),
    } as T;
  }

  if (basePath === "umkm") {
    return {
      ...data,
      foto: mediaUrl(data.foto as string | undefined),
    } as T;
  }

  if (basePath === "aparatur") {
    return {
      ...data,
      foto: mediaUrl(data.foto as string | undefined),
    } as T;
  }

  if (basePath === "potensi-desa") {
    return {
      ...data,
      gambar: mediaUrl(data.gambar as string | undefined),
    } as T;
  }

  if (basePath === "fasilitas") {
    return {
      ...data,
      gambar: mediaUrl(data.gambar as string | undefined),
    } as T;
  }

  if (basePath === "profil-desa") {
    return {
      ...data,
      fotoKades: mediaUrl(data.fotoKades as string | undefined),
    } as T;
  }

  if (basePath === "ppid-dokumen") {
    return {
      ...data,
      fileUrl: mediaUrl(data.fileUrl as string | undefined),
    } as T;
  }

  return item;
}

/**
 * Build FormData from a plain object, attaching any pending File objects
 * from the ImageUploadPreview registry.
 * fileFieldMap: maps the object key (camelCase) → backend field name & registry key.
 * e.g. { thumbnail: "thumbnail", foto: "foto", fotoKades: "foto_kades" }
 */
function buildFormData(body: Record<string, unknown>, fileFieldMap: Record<string, string>): { formData: FormData; hasFiles: boolean } {
  const fd = new FormData();
  let hasFiles = false;

  for (const [key, val] of Object.entries(body)) {
    const backendField = fileFieldMap[key];
    if (backendField) {
      // Check pending file registry first
      const file = __pendingFiles.get(backendField) || __pendingFiles.get(key);
      if (file) {
        fd.append(backendField, file);
        __pendingFiles.delete(backendField);
        __pendingFiles.delete(key);
        hasFiles = true;
        continue;
      }
      // If value is a data URI (base64), skip — shouldn't send raw base64 to backend
      if (typeof val === "string" && val.startsWith("data:")) continue;
    }
    // Append normal fields
    if (val === null || val === undefined) continue;
    if (typeof val === "boolean") { fd.append(key, val ? "1" : "0"); continue; }
    if (Array.isArray(val)) { fd.append(key, JSON.stringify(val)); continue; }
    if (typeof val === "object") { fd.append(key, JSON.stringify(val)); continue; }
    fd.append(key, String(val));
  }
  return { formData: fd, hasFiles };
}

/** Known image field mappings per CMS endpoint */
const CMS_FILE_FIELDS: Record<string, Record<string, string>> = {
  "berita": { thumbnail: "thumbnail" },
  "galeri": { url: "foto", foto: "foto" },
  "umkm": { foto: "foto", foto_produk: "foto" },
  "aparatur": { foto: "foto", foto_aparatur: "foto" },
  "potensi-desa": { gambar: "gambar" },
  "fasilitas": { gambar: "gambar" },
  "profil-desa": { fotoKades: "foto_kades", foto_kades: "foto_kades" },
  "ppid-dokumen": { fileUrl: "file_url" },
};

async function fetchSection<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const res = await publicGet<ApiRes<T>>(`/cms/${endpoint}`);
    return res.success && res.data ? res.data : fallback;
  } catch {
    return fallback;
  }
}

async function fetchArraySection<T>(endpoint: string, fallback: T[]): Promise<T[]> {
  try {
    const res = await publicGet<ApiRes<T[]>>(`/cms/${endpoint}`);
    if (res.success && Array.isArray(res.data)) return res.data;
    // paginated response shape
    const paginated = res as unknown as PaginatedRes<T>;
    if (paginated.success && Array.isArray(paginated.data)) return paginated.data;
    return fallback;
  } catch {
    return fallback;
  }
}

/* ── Context type ── */

interface CmsContextType {
  cms: CmsData;
  isLoading: boolean;
  loadError: boolean;
  updateIdentitasDesa: (data: CmsIdentitasDesa) => Promise<void>;
  addBerita: (item: Omit<CmsBerita, "id">) => Promise<void>;
  updateBerita: (id: string, item: Partial<CmsBerita>) => Promise<void>;
  deleteBerita: (id: string) => Promise<void>;
  addGaleri: (item: Omit<CmsGaleri, "id">) => Promise<void>;
  updateGaleri: (id: string, item: Partial<CmsGaleri>) => Promise<void>;
  deleteGaleri: (id: string) => Promise<void>;
  addUmkm: (item: Omit<CmsUmkm, "id">) => Promise<void>;
  updateUmkm: (id: string, item: Partial<CmsUmkm>) => Promise<void>;
  deleteUmkm: (id: string) => Promise<void>;
  addAparatur: (item: Omit<CmsAparatur, "id">) => Promise<void>;
  updateAparatur: (id: string, item: Partial<CmsAparatur>) => Promise<void>;
  deleteAparatur: (id: string) => Promise<void>;
  updateProfilDesa: (data: CmsProfilDesa) => Promise<void>;
  addPotensiDesa: (item: Omit<CmsPotensiDesa, "id">) => Promise<void>;
  updatePotensiDesa: (id: string, item: Partial<CmsPotensiDesa>) => Promise<void>;
  deletePotensiDesa: (id: string) => Promise<void>;
  addFasilitas: (item: Omit<CmsFasilitas, "id">) => Promise<void>;
  updateFasilitas: (id: string, item: Partial<CmsFasilitas>) => Promise<void>;
  deleteFasilitas: (id: string) => Promise<void>;
  addLayanan: (item: Omit<CmsLayananPublik, "id">) => Promise<void>;
  updateLayanan: (id: string, item: Partial<CmsLayananPublik>) => Promise<void>;
  deleteLayanan: (id: string) => Promise<void>;
  addPpidDokumen: (item: Omit<CmsPpidDokumen, "id">) => Promise<void>;
  updatePpidDokumen: (id: string, item: Partial<CmsPpidDokumen>) => Promise<void>;
  deletePpidDokumen: (id: string) => Promise<void>;
  addPetaDesa: (item: Omit<CmsPetaDesa, "id">) => Promise<void>;
  updatePetaDesa: (id: string, item: Partial<CmsPetaDesa>) => Promise<void>;
  deletePetaDesa: (id: string) => Promise<void>;
  updateInfografis: (data: CmsInfografis) => Promise<void>;
  updateHeaderFooter: (data: CmsHeaderFooter) => Promise<void>;
  resetCms: () => void;
}

const CmsContext = createContext<CmsContextType | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [cms, setCms] = useState<CmsData>(defaultCmsData);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [
          identitasDesa, profilDesa, berita, galeri, umkm, aparatur,
          potensiDesa, fasilitas, layananPublik, ppidDokumen, petaDesa,
          infografis, headerFooter,
        ] = await Promise.all([
          fetchSection("identitas-desa", defaultCmsData.identitasDesa),
          fetchSection("profil-desa", defaultCmsData.profilDesa),
          fetchArraySection<CmsBerita>("berita", defaultCmsData.berita),
          fetchArraySection<CmsGaleri>("galeri", defaultCmsData.galeri),
          fetchArraySection<CmsUmkm>("umkm", defaultCmsData.umkm),
          fetchArraySection<CmsAparatur>("aparatur", defaultCmsData.aparatur),
          fetchArraySection<CmsPotensiDesa>("potensi-desa", defaultCmsData.potensiDesa),
          fetchArraySection<CmsFasilitas>("fasilitas", defaultCmsData.fasilitas),
          fetchArraySection<CmsLayananPublik>("layanan-publik", defaultCmsData.layananPublik),
          fetchArraySection<CmsPpidDokumen>("ppid-dokumen", defaultCmsData.ppidDokumen),
          fetchArraySection<CmsPetaDesa>("peta-desa", defaultCmsData.petaDesa),
          fetchSection("infografis", defaultCmsData.infografis),
          fetchSection("header-footer", defaultCmsData.headerFooter),
        ]);
        // Cek apakah semua section kosong (indikasi semua API gagal)
        const allEmpty = berita.length === 0 && galeri.length === 0 && umkm.length === 0
          && aparatur.length === 0 && !identitasDesa.namaDesa;
        if (allEmpty) setLoadError(true);

        const nextCms = {
          identitasDesa, profilDesa, berita, galeri, umkm, aparatur,
          potensiDesa, fasilitas, layananPublik, ppidDokumen, petaDesa,
          infografis, headerFooter,
        };

        setCms(normalizeCmsMedia(nextCms));
      } catch {
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ── Admin mutations (auto-detect files → FormData, errors propagate) ── */

  const adminPut = useCallback(async (ep: string, body: unknown): Promise<unknown> => {
    const basePath = ep.split("/")[0];
    const fileMap = CMS_FILE_FIELDS[basePath] || {};
    const hasPendingFiles = Array.from(__pendingFiles.keys()).some(k => Object.values(fileMap).includes(k) || Object.keys(fileMap).includes(k));

    if (hasPendingFiles && typeof body === "object" && body !== null) {
      const { formData } = buildFormData(body as Record<string, unknown>, fileMap);
      formData.append("_method", "PUT");
      const r = await upload<ApiRes>(`/admin/cms/${ep}`, formData, "POST");
      return r.data ? normalizeSavedByEndpoint(basePath, r.data) : r.data;
    } else {
      const r = await put<ApiRes>(`/admin/cms/${ep}`, body);
      return r.data ? normalizeSavedByEndpoint(basePath, r.data) : r.data;
    }
  }, []);

  const adminPost = useCallback(async (ep: string, body: unknown) => {
    const fileMap = CMS_FILE_FIELDS[ep] || {};
    const hasPendingFiles = Array.from(__pendingFiles.keys()).some(k => Object.values(fileMap).includes(k) || Object.keys(fileMap).includes(k));

    if (hasPendingFiles && typeof body === "object" && body !== null) {
      const { formData } = buildFormData(body as Record<string, unknown>, fileMap);
      const r = await upload<ApiRes>(`/admin/cms/${ep}`, formData, "POST");
      return r.data ? normalizeSavedByEndpoint(ep, r.data) : r.data;
    } else {
      const r = await post<ApiRes>(`/admin/cms/${ep}`, body);
      return r.data ? normalizeSavedByEndpoint(ep, r.data) : r.data;
    }
  }, []);

  const adminDel = useCallback(async (ep: string) => {
    await del(`/admin/cms/${ep}`);
  }, []);

  // Identitas
  const updateIdentitasDesa = useCallback(async (data: CmsIdentitasDesa) => {
    const saved = await adminPut("identitas-desa", data);
    setCms(p => ({ ...p, identitasDesa: (saved as CmsIdentitasDesa) ?? data }));
  }, [adminPut]);

  // Berita
  const addBerita = useCallback(async (item: Omit<CmsBerita, "id">) => {
    const saved = await adminPost("berita", item);
    if (saved) setCms(p => ({ ...p, berita: [...p.berita, saved as CmsBerita] }));
  }, [adminPost]);
  const updateBerita = useCallback(async (id: string, item: Partial<CmsBerita>) => {
    const saved = await adminPut(`berita/${id}`, item);
    setCms(p => ({ ...p, berita: p.berita.map(b => b.id === id ? (saved as CmsBerita) ?? { ...b, ...item } : b) }));
  }, [adminPut]);
  const deleteBerita = useCallback(async (id: string) => {
    await adminDel(`berita/${id}`);
    setCms(p => ({ ...p, berita: p.berita.filter(b => b.id !== id) }));
  }, [adminDel]);

  // Galeri
  const addGaleri = useCallback(async (item: Omit<CmsGaleri, "id">) => {
    const saved = await adminPost("galeri", item);
    if (saved) setCms(p => ({ ...p, galeri: [...p.galeri, saved as CmsGaleri] }));
  }, [adminPost]);
  const updateGaleri = useCallback(async (id: string, item: Partial<CmsGaleri>) => {
    const saved = await adminPut(`galeri/${id}`, item);
    setCms(p => ({ ...p, galeri: p.galeri.map(g => g.id === id ? (saved as CmsGaleri) ?? { ...g, ...item } : g) }));
  }, [adminPut]);
  const deleteGaleri = useCallback(async (id: string) => {
    await adminDel(`galeri/${id}`);
    setCms(p => ({ ...p, galeri: p.galeri.filter(g => g.id !== id) }));
  }, [adminDel]);

  // UMKM
  const addUmkm = useCallback(async (item: Omit<CmsUmkm, "id">) => {
    const saved = await adminPost("umkm", item);
    if (saved) setCms(p => ({ ...p, umkm: [...p.umkm, saved as CmsUmkm] }));
  }, [adminPost]);
  const updateUmkm = useCallback(async (id: string, item: Partial<CmsUmkm>) => {
    const saved = await adminPut(`umkm/${id}`, item);
    setCms(p => ({ ...p, umkm: p.umkm.map(u => u.id === id ? (saved as CmsUmkm) ?? { ...u, ...item } : u) }));
  }, [adminPut]);
  const deleteUmkm = useCallback(async (id: string) => {
    await adminDel(`umkm/${id}`);
    setCms(p => ({ ...p, umkm: p.umkm.filter(u => u.id !== id) }));
  }, [adminDel]);

  // Aparatur
  const addAparatur = useCallback(async (item: Omit<CmsAparatur, "id">) => {
    const saved = await adminPost("aparatur", item);
    if (saved) setCms(p => ({ ...p, aparatur: [...p.aparatur, saved as CmsAparatur] }));
  }, [adminPost]);
  const updateAparatur = useCallback(async (id: string, item: Partial<CmsAparatur>) => {
    const saved = await adminPut(`aparatur/${id}`, item);
    setCms(p => ({ ...p, aparatur: p.aparatur.map(a => a.id === id ? (saved as CmsAparatur) ?? { ...a, ...item } : a) }));
  }, [adminPut]);
  const deleteAparatur = useCallback(async (id: string) => {
    await adminDel(`aparatur/${id}`);
    setCms(p => ({ ...p, aparatur: p.aparatur.filter(a => a.id !== id) }));
  }, [adminDel]);

  // ProfilDesa
  const updateProfilDesa = useCallback(async (data: CmsProfilDesa) => {
    const saved = await adminPut("profil-desa", data);
    setCms(p => ({ ...p, profilDesa: (saved as CmsProfilDesa) ?? data }));
  }, [adminPut]);

  // PotensiDesa
  const addPotensiDesa = useCallback(async (item: Omit<CmsPotensiDesa, "id">) => {
    const saved = await adminPost("potensi-desa", item);
    if (saved) setCms(p => ({ ...p, potensiDesa: [...p.potensiDesa, saved as CmsPotensiDesa] }));
  }, [adminPost]);
  const updatePotensiDesa = useCallback(async (id: string, item: Partial<CmsPotensiDesa>) => {
    const saved = await adminPut(`potensi-desa/${id}`, item);
    setCms(p => ({ ...p, potensiDesa: p.potensiDesa.map(x => x.id === id ? (saved as CmsPotensiDesa) ?? { ...x, ...item } : x) }));
  }, [adminPut]);
  const deletePotensiDesa = useCallback(async (id: string) => {
    await adminDel(`potensi-desa/${id}`);
    setCms(p => ({ ...p, potensiDesa: p.potensiDesa.filter(x => x.id !== id) }));
  }, [adminDel]);

  // Fasilitas
  const addFasilitas = useCallback(async (item: Omit<CmsFasilitas, "id">) => {
    const saved = await adminPost("fasilitas", item);
    if (saved) setCms(p => ({ ...p, fasilitas: [...p.fasilitas, saved as CmsFasilitas] }));
  }, [adminPost]);
  const updateFasilitas = useCallback(async (id: string, item: Partial<CmsFasilitas>) => {
    const saved = await adminPut(`fasilitas/${id}`, item);
    setCms(p => ({ ...p, fasilitas: p.fasilitas.map(f => f.id === id ? (saved as CmsFasilitas) ?? { ...f, ...item } : f) }));
  }, [adminPut]);
  const deleteFasilitas = useCallback(async (id: string) => {
    await adminDel(`fasilitas/${id}`);
    setCms(p => ({ ...p, fasilitas: p.fasilitas.filter(f => f.id !== id) }));
  }, [adminDel]);

  // LayananPublik
  const addLayanan = useCallback(async (item: Omit<CmsLayananPublik, "id">) => {
    const saved = await adminPost("layanan-publik", item);
    if (saved) setCms(p => ({ ...p, layananPublik: [...p.layananPublik, saved as CmsLayananPublik] }));
  }, [adminPost]);
  const updateLayanan = useCallback(async (id: string, item: Partial<CmsLayananPublik>) => {
    const saved = await adminPut(`layanan-publik/${id}`, item);
    setCms(p => ({ ...p, layananPublik: p.layananPublik.map(l => l.id === id ? (saved as CmsLayananPublik) ?? { ...l, ...item } : l) }));
  }, [adminPut]);
  const deleteLayanan = useCallback(async (id: string) => {
    await adminDel(`layanan-publik/${id}`);
    setCms(p => ({ ...p, layananPublik: p.layananPublik.filter(l => l.id !== id) }));
  }, [adminDel]);

  // PpidDokumen
  const addPpidDokumen = useCallback(async (item: Omit<CmsPpidDokumen, "id">) => {
    const saved = await adminPost("ppid-dokumen", item);
    if (saved) setCms(p => ({ ...p, ppidDokumen: [...p.ppidDokumen, saved as CmsPpidDokumen] }));
  }, [adminPost]);
  const updatePpidDokumen = useCallback(async (id: string, item: Partial<CmsPpidDokumen>) => {
    const saved = await adminPut(`ppid-dokumen/${id}`, item);
    setCms(p => ({ ...p, ppidDokumen: p.ppidDokumen.map(d => d.id === id ? (saved as CmsPpidDokumen) ?? { ...d, ...item } : d) }));
  }, [adminPut]);
  const deletePpidDokumen = useCallback(async (id: string) => {
    await adminDel(`ppid-dokumen/${id}`);
    setCms(p => ({ ...p, ppidDokumen: p.ppidDokumen.filter(d => d.id !== id) }));
  }, [adminDel]);

  // PetaDesa
  const addPetaDesa = useCallback(async (item: Omit<CmsPetaDesa, "id">) => {
    const saved = await adminPost("peta-desa", item);
    if (saved) setCms(p => ({ ...p, petaDesa: [...p.petaDesa, saved as CmsPetaDesa] }));
  }, [adminPost]);
  const updatePetaDesa = useCallback(async (id: string, item: Partial<CmsPetaDesa>) => {
    const saved = await adminPut(`peta-desa/${id}`, item);
    setCms(p => ({ ...p, petaDesa: p.petaDesa.map(pt => pt.id === id ? (saved as CmsPetaDesa) ?? { ...pt, ...item } : pt) }));
  }, [adminPut]);
  const deletePetaDesa = useCallback(async (id: string) => {
    await adminDel(`peta-desa/${id}`);
    setCms(p => ({ ...p, petaDesa: p.petaDesa.filter(pt => pt.id !== id) }));
  }, [adminDel]);

  // Infografis
  const updateInfografis = useCallback(async (data: CmsInfografis) => {
    const saved = await adminPut("infografis", data);
    setCms(p => ({ ...p, infografis: (saved as CmsInfografis) ?? data }));
  }, [adminPut]);

  // HeaderFooter
  const updateHeaderFooter = useCallback(async (data: CmsHeaderFooter) => {
    const saved = await adminPut("header-footer", data);
    setCms(p => ({ ...p, headerFooter: (saved as CmsHeaderFooter) ?? data }));
  }, [adminPut]);

  const resetCms = useCallback(() => setCms(defaultCmsData), []);

  return (
    <CmsContext.Provider value={{
      cms, isLoading, loadError,
      updateIdentitasDesa,
      addBerita, updateBerita, deleteBerita,
      addGaleri, updateGaleri, deleteGaleri,
      addUmkm, updateUmkm, deleteUmkm,
      addAparatur, updateAparatur, deleteAparatur,
      updateProfilDesa,
      addPotensiDesa, updatePotensiDesa, deletePotensiDesa,
      addFasilitas, updateFasilitas, deleteFasilitas,
      addLayanan, updateLayanan, deleteLayanan,
      addPpidDokumen, updatePpidDokumen, deletePpidDokumen,
      addPetaDesa, updatePetaDesa, deletePetaDesa,
      updateInfografis, updateHeaderFooter, resetCms,
    }}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used within CmsProvider");
  return ctx;
}
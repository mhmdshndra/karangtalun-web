"use client";

import {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo, type ReactNode,
} from "react";
import type {
  PengajuanSurat, Notifikasi, StatusPengajuan,
  LaporanAduan, PermohonanInformasi, StatusLaporan, StatusPermohonan,
} from "@/core/types";
import { get, post, put, upload } from "@/core/api/client";
import { useAuth } from "./AuthContext";

/* ── Backend response shapes ── */

interface PaginatedRes<T> { success: boolean; data: T[]; meta?: unknown }
interface SingleRes<T> { success: boolean; data: T; message: string }
interface NotifRes extends PaginatedRes<Notifikasi> { unread_count: number }

/* ── Context type — backward-compatible with original mock-based interface ── */

interface ServiceDataContextType {
  // Data arrays (auto-fetched)
  riwayatSurat: PengajuanSurat[];
  laporanList: LaporanAduan[];
  permohonanList: PermohonanInformasi[];
  notifikasi: Notifikasi[];
  isLoaded: boolean;
  unreadCount: number;

  // Surat — accepts PengajuanSurat object (backward-compat with callers)
  addPengajuan: (pengajuan: PengajuanSurat) => void;
  updatePengajuanStatus: (id: string, status: StatusPengajuan, catatan?: string, nomorSurat?: string) => Promise<void>;
  addBerkasToPengajuan: (id: string, filename: string) => void;

  // Laporan — accepts LaporanAduan object
  addLaporan: (laporan: LaporanAduan, files?: File[]) => Promise<LaporanAduan | void>;
  updateLaporanStatus: (id: string, status: StatusLaporan, catatan?: string) => Promise<void>;

  // Permohonan — accepts PermohonanInformasi object
  addPermohonan: (permohonan: PermohonanInformasi, files?: File[]) => Promise<PermohonanInformasi | void>;
  updatePermohonanStatus: (id: string, status: StatusPermohonan, catatan?: string, fileBalasan?: File) => Promise<void>;

  // Notifikasi
  addNotifikasi: (notif: Omit<Notifikasi, "id">) => void;
  markAsRead: (id: string) => void;
  markAllRead: (userRole?: string, userNik?: string, userId?: string) => void;

  // Filtered getters (backward-compatible)
  getNotifikasiForUser: (role: string, nik?: string, userId?: string) => Notifikasi[];
  getUnreadCountForUser: (role: string, nik?: string, userId?: string) => number;
  getSuratForUser: (role: string, nik?: string) => PengajuanSurat[];
  getLaporanForUser: (role: string, userId?: string, nik?: string) => LaporanAduan[];
  getPermohonanForUser: (role: string, userId?: string, nik?: string) => PermohonanInformasi[];

  // Refresh
  refreshSurat: () => void;
  refreshLaporan: () => void;
  refreshPermohonan: () => void;
  refreshNotifikasi: () => void;
}

const ServiceDataContext = createContext<ServiceDataContextType | null>(null);

/* ── Provider ── */

export function ServiceDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [riwayatSurat, setRiwayatSurat] = useState<PengajuanSurat[]>([]);
  const [laporanList, setLaporanList] = useState<LaporanAduan[]>([]);
  const [permohonanList, setPermohonanList] = useState<PermohonanInformasi[]>([]);
  const [notifikasi, setNotifikasi] = useState<Notifikasi[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const isStafOrAdmin = user?.role === "admin_desa" || user?.role === "staf_layanan";
  const suratPrefix = isStafOrAdmin ? "/staf" : "/warga";
  const laporanPrefix = isStafOrAdmin ? "/staf" : "/warga";
  const permohonanPrefix = isStafOrAdmin ? "/staf" : "/warga";

  /* ── Fetch helpers ── */

  const fetchSurat = useCallback(async () => {
    if (!user) return;
    try {
      const res = await get<PaginatedRes<PengajuanSurat>>(`${suratPrefix}/surat`, { per_page: 100 });
      if (res.success) setRiwayatSurat(res.data);
    } catch { /* swallow */ }
  }, [user, suratPrefix]);

  const fetchLaporan = useCallback(async () => {
    if (!user) return;
    try {
      const res = await get<PaginatedRes<LaporanAduan>>(`${laporanPrefix}/laporan`, { per_page: 100 });
      if (res.success) setLaporanList(res.data);
    } catch { /* swallow */ }
  }, [user, laporanPrefix]);

  const fetchPermohonan = useCallback(async () => {
    if (!user) return;
    try {
      const res = await get<PaginatedRes<PermohonanInformasi>>(`${permohonanPrefix}/permohonan`, { per_page: 100 });
      if (res.success) setPermohonanList(res.data);
    } catch { /* swallow */ }
  }, [user, permohonanPrefix]);

  const fetchNotifikasi = useCallback(async () => {
    if (!user) return;
    try {
      const res = await get<NotifRes>("/notifikasi", { per_page: 50 });
      if (res.success) {
        setNotifikasi(res.data);
        setUnreadCount(res.unread_count ?? 0);
      }
    } catch { /* swallow */ }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (!user) {
      setRiwayatSurat([]); setLaporanList([]); setPermohonanList([]);
      setNotifikasi([]); setUnreadCount(0); setIsLoaded(false);
      return;
    }
    Promise.all([fetchSurat(), fetchLaporan(), fetchPermohonan(), fetchNotifikasi()])
      .finally(() => setIsLoaded(true));
  }, [user, fetchSurat, fetchLaporan, fetchPermohonan, fetchNotifikasi]);

  /* ── Surat — e-surat page calls API directly; this is for refreshing list ── */

  const addPengajuan = useCallback((_pengajuan: PengajuanSurat) => {
    // No-op: e-surat page calls POST /warga/surat directly and then calls refreshSurat()
    // This function is kept for interface compatibility but should not be used for production data
    fetchSurat();
  }, [fetchSurat]);

  const updatePengajuanStatus = useCallback(async (id: string, status: StatusPengajuan, catatan?: string, nomorSurat?: string) => {
    await put(`/staf/surat/${id}/status`, {
      status,
      ...(catatan ? { catatan_admin: catatan } : {}),
      ...(nomorSurat ? { nomor_surat: nomorSurat } : {}),
    });
    // Only update state after backend confirms
    setRiwayatSurat(prev => prev.map(s => s.id === id ? { ...s, status, catatan_admin: catatan ?? s.catatan_admin, nomor_surat: nomorSurat ?? s.nomor_surat } : s));
  }, []);

  const addBerkasToPengajuan = useCallback((id: string, filename: string) => {
    // This is a legacy interface that accepts filename string.
    // File uploads are handled separately via FileUpload component.
    setRiwayatSurat(prev => prev.map(s => {
      if (s.id === id) {
        const existing = s.berkas_lampiran || [];
        return { ...s, berkas_lampiran: [...existing, filename] };
      }
      return s;
    }));
  }, []);

  /* ── Laporan ── */

  const addLaporan = useCallback(async (laporan: LaporanAduan, files?: File[]) => {
    const isPublic = !user || user.role === "public";
    const endpoint = isPublic ? "/laporan" : "/warga/laporan";
    const extra = laporan as LaporanAduan & { lokasi_gps?: string; cf_turnstile_token?: string };

    let res: SingleRes<LaporanAduan>;

    if (files && files.length > 0) {
      const fd = new FormData();
      fd.append("kategori", laporan.kategori);
      fd.append("nama_pelapor", laporan.nama_pelapor);
      fd.append("alamat_pelapor", laporan.alamat_pelapor || "");
      fd.append("kontak_pelapor", laporan.kontak_pelapor);
      fd.append("deskripsi", laporan.deskripsi);
      fd.append("lokasi_kejadian", laporan.lokasi_kejadian || "");
      if (extra.lokasi_gps) fd.append("lokasi_gps", extra.lokasi_gps);
      if (extra.cf_turnstile_token) fd.append("cf_turnstile_token", extra.cf_turnstile_token);
      files.forEach(f => fd.append("lampiran[]", f));

      if (isPublic) {
        const { publicUpload } = await import("@/core/api/client");
        res = await publicUpload<SingleRes<LaporanAduan>>(endpoint, fd);
      } else {
        res = await upload(endpoint, fd);
      }
    } else {
      const body: Record<string, unknown> = {
        kategori: laporan.kategori,
        nama_pelapor: laporan.nama_pelapor,
        alamat_pelapor: laporan.alamat_pelapor,
        kontak_pelapor: laporan.kontak_pelapor,
        deskripsi: laporan.deskripsi,
        lokasi_kejadian: laporan.lokasi_kejadian,
      };
      if (extra.cf_turnstile_token) body.cf_turnstile_token = extra.cf_turnstile_token;

      if (isPublic) {
        const { publicPost } = await import("@/core/api/client");
        res = await publicPost<SingleRes<LaporanAduan>>(endpoint, body);
      } else {
        res = await post<SingleRes<LaporanAduan>>(endpoint, body);
      }
    }

    if (res.success && res.data) {
      setLaporanList(prev => [res.data, ...prev]);
      return res.data;
    }
    throw new Error("Gagal mengirim laporan.");
  }, [user]);

  const updateLaporanStatus = useCallback(async (id: string, status: StatusLaporan, catatan?: string) => {
    await put(`/staf/laporan/${id}/status`, {
      status,
      ...(catatan ? { catatan_admin: catatan } : {}),
    });
    setLaporanList(prev => prev.map(l => l.id === id ? { ...l, status, catatan_admin: catatan ?? l.catatan_admin } : l));
  }, []);

  /* ── Permohonan ── */

  const addPermohonan = useCallback(async (permohonan: PermohonanInformasi, files?: File[]) => {
    const isPublic = !user || user.role === "public";
    const endpoint = isPublic ? "/ppid/permohonan" : "/warga/permohonan";
    const extra = permohonan as PermohonanInformasi & { cf_turnstile_token?: string };

    let res: SingleRes<PermohonanInformasi>;

    if (files && files.length > 0) {
      const fd = new FormData();
      fd.append("nama_pemohon", permohonan.nama_pemohon);
      fd.append("alamat_pemohon", permohonan.alamat_pemohon || "");
      fd.append("kontak_pemohon", permohonan.kontak_pemohon);
      fd.append("tujuan_permohonan", permohonan.tujuan_permohonan || "");
      fd.append("informasi_diminta", permohonan.informasi_diminta);
      if (extra.cf_turnstile_token) fd.append("cf_turnstile_token", extra.cf_turnstile_token);
      files.forEach(f => fd.append("lampiran[]", f));

      if (isPublic) {
        const { publicUpload } = await import("@/core/api/client");
        res = await publicUpload<SingleRes<PermohonanInformasi>>(endpoint, fd);
      } else {
        res = await upload(endpoint, fd);
      }
    } else {
      const body: Record<string, unknown> = {
        nama_pemohon: permohonan.nama_pemohon,
        alamat_pemohon: permohonan.alamat_pemohon,
        kontak_pemohon: permohonan.kontak_pemohon,
        tujuan_permohonan: permohonan.tujuan_permohonan,
        informasi_diminta: permohonan.informasi_diminta,
      };
      if (extra.cf_turnstile_token) body.cf_turnstile_token = extra.cf_turnstile_token;

      if (isPublic) {
        const { publicPost } = await import("@/core/api/client");
        res = await publicPost<SingleRes<PermohonanInformasi>>(endpoint, body);
      } else {
        res = await post<SingleRes<PermohonanInformasi>>(endpoint, body);
      }
    }

    if (res.success && res.data) {
      setPermohonanList(prev => [res.data, ...prev]);
      return res.data;
    }
    throw new Error("Gagal mengirim permohonan.");
  }, [user]);

  const updatePermohonanStatus = useCallback(async (id: string, status: StatusPermohonan, catatan?: string, fileBalasan?: File) => {
    if (fileBalasan) {
      // Use POST with FormData for file uploads (multipart)
      const fd = new FormData();
      fd.append("status", status);
      if (catatan) fd.append("catatan_admin", catatan);
      fd.append("file_balasan", fileBalasan);
      await upload(`/staf/permohonan/${id}/status`, fd, "POST");
    } else {
      await put(`/staf/permohonan/${id}/status`, {
        status,
        ...(catatan ? { catatan_admin: catatan } : {}),
      });
    }
    // Only update state after backend confirms
    setPermohonanList(prev => prev.map(p => p.id === id ? {
      ...p, status,
      catatan_admin: catatan ?? p.catatan_admin,
    } : p));
  }, []);

  /* ── Notifikasi ── */

  const addNotifikasi = useCallback((_notif: Omit<Notifikasi, "id">) => {
    // No-op: backend creates notifications via NotificationService.
    // Callers should use refreshNotifikasi() after successful backend actions.
    fetchNotifikasi();
  }, [fetchNotifikasi]);

  const markAsRead = useCallback((id: string) => {
    put(`/notifikasi/${id}/read`).catch(() => {});
    setNotifikasi(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback((_userRole?: string, _userNik?: string, _userId?: string) => {
    put("/notifikasi/read-all").catch(() => {});
    setNotifikasi(prev => prev.map(n => ({ ...n, dibaca: true })));
    setUnreadCount(0);
  }, []);

  /* ── Filtered getters (backward-compatible — data is already filtered by backend per role) ── */

  const getNotifikasiForUser = useCallback((_role: string, _nik?: string, _userId?: string): Notifikasi[] => {
    return notifikasi;
  }, [notifikasi]);

  const getUnreadCountForUser = useCallback((_role: string, _nik?: string, _userId?: string): number => {
    return unreadCount;
  }, [unreadCount]);

  const getSuratForUser = useCallback((_role: string, _nik?: string): PengajuanSurat[] => {
    return riwayatSurat;
  }, [riwayatSurat]);

  const getLaporanForUser = useCallback((_role: string, _userId?: string, _nik?: string): LaporanAduan[] => {
    return laporanList;
  }, [laporanList]);

  const getPermohonanForUser = useCallback((_role: string, _userId?: string, _nik?: string): PermohonanInformasi[] => {
    return permohonanList;
  }, [permohonanList]);

  return (
    <ServiceDataContext.Provider
      value={{
        riwayatSurat, laporanList, permohonanList, notifikasi,
        isLoaded, unreadCount,
        addPengajuan, updatePengajuanStatus, addBerkasToPengajuan,
        addLaporan, updateLaporanStatus,
        addPermohonan, updatePermohonanStatus,
        addNotifikasi, markAsRead, markAllRead,
        getNotifikasiForUser, getUnreadCountForUser,
        getSuratForUser, getLaporanForUser, getPermohonanForUser,
        refreshSurat: fetchSurat,
        refreshLaporan: fetchLaporan,
        refreshPermohonan: fetchPermohonan,
        refreshNotifikasi: fetchNotifikasi,
      }}
    >
      {children}
    </ServiceDataContext.Provider>
  );
}

export function useServiceData() {
  const ctx = useContext(ServiceDataContext);
  if (!ctx) throw new Error("useServiceData must be used within ServiceDataProvider");
  return ctx;
}

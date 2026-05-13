"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type {
  AppUser, PengajuanSurat, Notifikasi, UserRole, StatusPengajuan,
  LaporanAduan, PermohonanInformasi, StatusLaporan, StatusPermohonan,
  KartuKeluarga,
} from "@/core/types";
import {
  api, post, get, setToken, getToken, clearToken,
} from "@/core/api/client";

const ROLE_ACCESS: Record<UserRole, string[]> = {
  admin_desa: ["*"],
  staf_layanan: ["/staf"],
  warga: ["/warga"],
  public: ["/layanan", "/ppid"],
};

/* ── Response shapes from backend ── */

interface LoginResponse {
  success: boolean;
  message: string;
  data?: { user: AppUser; token: string };
}

interface MeResponse {
  success: boolean;
  data?: AppUser;
}

interface KKResponse {
  success: boolean;
  data?: KartuKeluarga;
}

/* ── Context type ── */

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: (
    identifier: string,
    password: string,
    loginType?: "warga" | "petugas",
    cf_turnstile_token?: string,
  ) => Promise<{ success: boolean; message: string; role?: UserRole }>;
  logout: () => void;
  hasAccess: (path: string) => boolean;
  updateUser: (updatedUser: AppUser) => void;
  refreshUser: () => void;
  /** KartuKeluarga data (fetched from backend for warga) */
  kk: KartuKeluarga | null;

  // Legacy compatibility — delegated to ServiceDataContext via AppProviders
  notifikasi: Notifikasi[];
  riwayatSurat: PengajuanSurat[];
  laporanList: LaporanAduan[];
  permohonanList: PermohonanInformasi[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  addNotifikasi: (notif: Omit<Notifikasi, "id">) => void;
  addPengajuan: (pengajuan: PengajuanSurat) => void;
  updatePengajuanStatus: (id: string, status: StatusPengajuan, catatan?: string, nomorSurat?: string) => void;
  addBerkasToPengajuan: (id: string, filename: string) => void;
  addLaporan: (laporan: LaporanAduan) => void;
  updateLaporanStatus: (id: string, status: StatusLaporan, catatan?: string) => void;
  addPermohonan: (permohonan: PermohonanInformasi) => void;
  updatePermohonanStatus: (id: string, status: StatusPermohonan, catatan?: string, fileBalasan?: string[]) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ── Provider ── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [kk, setKk] = useState<KartuKeluarga | null>(null);

  // On mount: restore session from token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    get<MeResponse>("/auth/me")
      .then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          clearToken();
        }
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch KK when user changes (for warga)
  useEffect(() => {
    if (!user || user.role !== "warga") {
      setKk(null);
      return;
    }
    get<KKResponse>("/warga/kk")
      .then((res) => {
        if (res.success && res.data) {
          setKk(res.data);
        } else {
          setKk(null);
        }
      })
      .catch(() => {
        setKk(null);
      });
  }, [user]);

  const login = useCallback(
    async (
      identifier: string,
      password: string,
      loginType: "warga" | "petugas" = "warga",
      cf_turnstile_token?: string,
    ): Promise<{ success: boolean; message: string; role?: UserRole }> => {
      try {
        const res = await api<LoginResponse>("/auth/login", {
          method: "POST",
          body: {
            identifier,
            password,
            login_type: loginType,
            cf_turnstile_token: cf_turnstile_token ?? "",
          },
          noAuth: true,
        });

        if (res.success && res.data) {
          setToken(res.data.token);
          setUser(res.data.user);
          return {
            success: true,
            message: res.message,
            role: res.data.user.role,
          };
        }

        return { success: false, message: res.message ?? "Login gagal." };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan saat login.";
        return { success: false, message };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await post("/auth/logout");
    } catch {
      // ignore — token may already be expired
    } finally {
      clearToken();
      setUser(null);
      setKk(null);
    }
  }, []);

  const hasAccess = useCallback(
    (path: string): boolean => {
      const role = user?.role || "public";
      const allowed = ROLE_ACCESS[role];
      if (allowed.includes("*")) return true;
      return allowed.some((p) => path.startsWith(p));
    },
    [user],
  );

  const updateUser = useCallback((updatedUser: AppUser) => {
    setUser(updatedUser);
  }, []);

  const refreshUser = useCallback(() => {
    get<MeResponse>("/auth/me")
      .then((res) => {
        if (res.success && res.data) setUser(res.data);
      })
      .catch(() => { /* swallow */ });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = useCallback(() => {}, []);

  return (
    <AuthContext.Provider
      value={{
        user, isLoading, kk,
        login, logout, hasAccess,
        updateUser, refreshUser,
        // Legacy stubs — real impl is in ServiceDataContext
        notifikasi: [],
        riwayatSurat: [],
        laporanList: [],
        permohonanList: [],
        unreadCount: 0,
        markAsRead: noop as never,
        markAllRead: noop,
        addNotifikasi: noop as never,
        addPengajuan: noop as never,
        updatePengajuanStatus: noop as never,
        addBerkasToPengajuan: noop as never,
        addLaporan: noop as never,
        updateLaporanStatus: noop as never,
        addPermohonan: noop as never,
        updatePermohonanStatus: noop as never,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

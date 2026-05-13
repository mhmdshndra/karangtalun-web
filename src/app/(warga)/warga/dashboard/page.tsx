"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle, XCircle, AlertCircle,
  ArrowRight, Bell, BellOff, ChevronRight, Loader2,
  Send, History, Eye, Home, Users, User,
  ClipboardList, Search, MessageSquare, Shield,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge, LoadingState } from "@/components/ui";
import { formatTanggal, hitungUmur } from "@/core/utils/helpers";
import type { StatusPengajuan, NotifikasiTipe, UserRole } from "@/core/types";

const STATUS_MAP: Record<StatusPengajuan, { variant: "success" | "warning" | "danger" | "info"; icon: typeof Clock; color: string }> = {
  Menunggu: { variant: "warning", icon: Clock, color: "#d97706" },
  Diproses: { variant: "info", icon: Loader2, color: "#2563eb" },
  Selesai: { variant: "success", icon: CheckCircle, color: "#16a34a" },
  Ditolak: { variant: "danger", icon: XCircle, color: "#dc2626" },
};

const NOTIF_ICON_MAP: Record<string, { icon: typeof Bell; color: string }> = {
  surat_masuk: { icon: FileText, color: "#b8860b" },
  surat_diproses: { icon: Loader2, color: "#2563eb" },
  surat_selesai: { icon: CheckCircle, color: "#16a34a" },
  surat_ditolak: { icon: XCircle, color: "#dc2626" },
  info: { icon: AlertCircle, color: "#2563eb" },
  pengumuman: { icon: Bell, color: "#b8860b" },
  laporan_masuk: { icon: ClipboardList, color: "#b8860b" },
  laporan_diproses: { icon: Loader2, color: "#2563eb" },
  laporan_selesai: { icon: CheckCircle, color: "#16a34a" },
  permohonan_masuk: { icon: Search, color: "#b8860b" },
  permohonan_diproses: { icon: Loader2, color: "#2563eb" },
  permohonan_selesai: { icon: CheckCircle, color: "#16a34a" },
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin_desa: "Admin Desa", staf_layanan: "Staf Layanan", warga: "Warga", public: "Publik",
};
const ROLE_COLORS: Record<UserRole, string> = {
  admin_desa: "#dc2626", staf_layanan: "#2563eb", warga: "#b8860b", public: "#6b7280",
};

export default function DashboardPage() {
  const { user, kk } = useAuth();
  const { getSuratForUser, getNotifikasiForUser, getUnreadCountForUser, markAsRead, markAllRead } = useServiceData();
  const [notifTab, setNotifTab] = useState<"semua" | "belum">("semua");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showKK, setShowKK] = useState(false);

  const riwayatSurat = getSuratForUser(user?.role || "warga", user?.nik);
  const notifikasi = getNotifikasiForUser(user?.role || "warga", user?.nik, user?.id);
  const unreadCount = getUnreadCountForUser(user?.role || "warga", user?.nik, user?.id);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingData(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // kk from useAuth()

  // Identify KK members who appear in active pengajuan
  const representedNiks = useMemo(() => {
    const niks = new Set<string>();
    riwayatSurat.forEach((s) => {
      if (s.status !== "Selesai" && s.status !== "Ditolak") {
        niks.add(s.pemohon.nik);
      }
    });
    return niks;
  }, [riwayatSurat]);

  if (!user || !kk) return null;

  // Stats
  const total = riwayatSurat.length;
  const menunggu = riwayatSurat.filter((s) => s.status === "Menunggu").length;
  const diproses = riwayatSurat.filter((s) => s.status === "Diproses").length;
  const selesai = riwayatSurat.filter((s) => s.status === "Selesai").length;
  const ditolak = riwayatSurat.filter((s) => s.status === "Ditolak").length;

  const stats = [
    { label: "Total Pengajuan", value: total, color: "var(--primary)", icon: FileText },
    { label: "Menunggu", value: menunggu, color: "#d97706", icon: Clock },
    { label: "Diproses", value: diproses, color: "#2563eb", icon: Loader2 },
    { label: "Selesai", value: selesai, color: "#16a34a", icon: CheckCircle },
    { label: "Ditolak", value: ditolak, color: "#dc2626", icon: XCircle },
  ];

  const recentSurat = riwayatSurat.slice(0, 4);
  const filteredNotif = notifTab === "belum" ? notifikasi.filter((n) => !n.dibaca) : notifikasi;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--foreground)" }}>
        <Link href="/" className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <Home size={11} /> Beranda
        </Link>
        <ChevronRight size={10} className="opacity-30" />
        <span className="font-bold" style={{ color: "var(--primary)" }}>Dashboard</span>
      </nav>

      {/* Profile Card */}
      <div className="govt-card overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-4" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0 relative"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
            {user.nama_lengkap.charAt(0).toUpperCase()}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: "#dc2626", color: "#fff", border: "2px solid var(--primary)" }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base lg:text-lg font-black">{user.nama_lengkap}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ background: ROLE_COLORS[user.role], color: "#fff" }}>
                {ROLE_LABELS[user.role]}
              </span>
              <span className="text-[11px] opacity-70">NIK: {user.nik}</span>
              <span className="text-[11px] opacity-70">No. KK: {user.no_kk}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/warga/profil"
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded border transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}>
              <User size={12} /> Profil
            </Link>
          </div>
        </div>

        {/* KK Quick Info */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 text-xs">
            <Users size={14} style={{ color: "var(--accent)" }} />
            <span className="opacity-60">Kartu Keluarga:</span>
            <strong>{kk?.kepala_keluarga}</strong>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              {kk?.anggota.length ?? 0} anggota
            </span>
          </div>
          <button onClick={() => setShowKK(!showKK)}
            className="text-[11px] font-bold flex items-center gap-1 transition-colors"
            style={{ color: "var(--primary)" }}>
            {showKK ? "Tutup" : "Lihat Anggota"}{" "}
            <ChevronRight size={12} className={`transition-transform ${showKK ? "rotate-90" : ""}`} />
          </button>
        </div>

        {/* KK Anggota Expandable */}
        {showKK && (
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--surface-hover)" }}>
                    {["No", "Nama", "NIK", "L/P", "Usia", "Hubungan", "Pekerjaan", "Status"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider opacity-50 text-[10px]"
                        style={{ borderBottom: "1px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(kk?.anggota ?? []).map((a, i) => {
                    const umur = hitungUmur(a.tanggal_lahir);
                    const isMinor = umur < 17;
                    const isRepresented = representedNiks.has(a.nik);
                    return (
                      <tr key={a.nik}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          opacity: isMinor ? 0.6 : 1,
                          filter: isMinor ? "grayscale(40%)" : "none",
                        }}>
                        <td className="px-4 py-2.5 font-bold opacity-40">{i + 1}</td>
                        <td className="px-4 py-2.5 font-bold">
                          {a.nama_lengkap}
                          {isMinor && (
                            <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded"
                              style={{ background: "#fef3c7", color: "#92400e" }}>
                              <Shield size={8} className="inline mr-0.5" style={{ verticalAlign: "-1px" }} />minor
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] opacity-60">{a.nik}</td>
                        <td className="px-4 py-2.5">{a.jenis_kelamin === "Laki-laki" ? "L" : "P"}</td>
                        <td className="px-4 py-2.5">{umur} thn</td>
                        <td className="px-4 py-2.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: a.status_hubungan === "Kepala Keluarga" ? "var(--primary)" : "var(--accent-light)",
                              color: a.status_hubungan === "Kepala Keluarga" ? "#fff" : "var(--accent)",
                            }}>{a.status_hubungan}</span>
                        </td>
                        <td className="px-4 py-2.5">{a.pekerjaan}</td>
                        <td className="px-4 py-2.5">
                          {isRepresented && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: "#dbeafe", color: "#1e40af" }}>
                              Diwakili
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile Cards */}
            <div className="md:hidden p-3 space-y-2">
              {(kk?.anggota ?? []).map((a) => {
                const umur = hitungUmur(a.tanggal_lahir);
                const isMinor = umur < 17;
                const isRepresented = representedNiks.has(a.nik);
                return (
                  <div key={a.nik}
                    className="flex items-center gap-3 p-3 rounded border"
                    style={{
                      borderColor: isRepresented ? "#93c5fd" : "var(--border)",
                      opacity: isMinor ? 0.65 : 1,
                      filter: isMinor ? "grayscale(40%)" : "none",
                      background: isRepresented ? "#eff6ff" : "transparent",
                    }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: a.status_hubungan === "Kepala Keluarga" ? "var(--primary)" : "var(--accent-light)",
                        color: a.status_hubungan === "Kepala Keluarga" ? "#fff" : "var(--accent)",
                      }}>
                      {a.nama_lengkap.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                        {a.nama_lengkap}
                        {isMinor && <span className="ml-1 text-[8px] px-1 py-0.5 rounded" style={{ background: "#fef3c7", color: "#92400e" }}>minor</span>}
                      </p>
                      <p className="text-[10px] opacity-50">{a.status_hubungan} · {umur} thn · {a.pekerjaan}</p>
                      {isRepresented && (
                        <span className="text-[9px] font-bold mt-0.5 inline-block px-1.5 py-0.5 rounded" style={{ background: "#dbeafe", color: "#1e40af" }}>Diwakili dalam pengajuan aktif</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Loading Simulation */}
      {isLoadingData ? (
        <div className="govt-card p-8">
          <LoadingState message="Memuat data dashboard..." rows={4} />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="govt-card p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded flex items-center justify-center shrink-0"
                  style={{ background: `${s.color}15`, color: s.color }}>
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] font-medium opacity-60 leading-tight">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/warga/e-surat" className="govt-card p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                <Send size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold group-hover:text-primary transition-colors" style={{ color: "var(--foreground)" }}>Ajukan E-Surat</p>
                <p className="text-xs opacity-50 mt-0.5">Pilih anggota KK & jenis surat</p>
              </div>
              <ArrowRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)" }} />
            </Link>
            <Link href="/warga/riwayat" className="govt-card p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0"
                style={{ background: "var(--accent)", color: "#fff" }}>
                <History size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold group-hover:text-primary transition-colors" style={{ color: "var(--foreground)" }}>Cek Riwayat</p>
                <p className="text-xs opacity-50 mt-0.5">{ditolak > 0 ? `${ditolak} ditolak · ` : ""}{diproses > 0 ? `${diproses} diproses` : "Lihat semua"}</p>
              </div>
              <ArrowRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)" }} />
            </Link>
            <Link href="/warga/layanan/laporan-aduan" className="govt-card p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0"
                style={{ background: "#dc2626", color: "#fff" }}>
                <ClipboardList size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold group-hover:text-primary transition-colors" style={{ color: "var(--foreground)" }}>Laporan / Aduan</p>
                <p className="text-xs opacity-50 mt-0.5">Laporkan masalah di desa</p>
              </div>
              <ArrowRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)" }} />
            </Link>
            <Link href="/warga/layanan/permohonan-informasi" className="govt-card p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded flex items-center justify-center shrink-0"
                style={{ background: "#7c3aed", color: "#fff" }}>
                <Search size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold group-hover:text-primary transition-colors" style={{ color: "var(--foreground)" }}>Permohonan Info</p>
                <p className="text-xs opacity-50 mt-0.5">PPID — Keterbukaan informasi</p>
              </div>
              <ArrowRight size={16} className="opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: "var(--primary)" }} />
            </Link>
          </div>

          {/* Two Column: Recent Pengajuan + Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Pengajuan */}
            <div className="govt-card overflow-hidden">
              <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>Pengajuan Terbaru</h3>
                <Link href="/warga/riwayat" className="text-[11px] font-bold flex items-center gap-1" style={{ color: "var(--primary)" }}>
                  Lihat Semua <ChevronRight size={12} />
                </Link>
              </div>
              {recentSurat.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText size={32} className="mx-auto mb-2 opacity-20" style={{ color: "var(--foreground)" }} />
                  <p className="text-xs opacity-50">Belum ada pengajuan surat.</p>
                </div>
              ) : (
                <div>
                  {recentSurat.map((s) => {
                    const sm = STATUS_MAP[s.status];
                    const isMinorPemohon = hitungUmur(s.pemohon.tanggal_lahir) < 17;
                    return (
                      <Link key={s.id} href={`/warga/riwayat/${s.id}`}
                        className="block px-5 py-3.5 border-b last:border-b-0 flex items-center gap-3 transition-colors hover:bg-surface-hover"
                        style={{ borderColor: "var(--border)" }}>
                        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                          style={{ background: `${sm.color}15` }}>
                          <sm.icon size={14} style={{ color: sm.color }}
                            className={s.status === "Diproses" ? "animate-spin" : ""} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{s.jenis_surat_label}</p>
                          <p className="text-[10px] opacity-50 mt-0.5">
                            {s.nomor_tiket} · a.n. {s.pemohon.nama_lengkap}
                            {isMinorPemohon && s.diajukan_oleh.nik !== s.pemohon.nik && (
                              <span className="ml-1" style={{ color: "#b8860b" }}>(diwakili {s.diajukan_oleh.nama_lengkap})</span>
                            )}
                          </p>
                        </div>
                        <StatusBadge label={s.status} variant={sm.variant} size="sm" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="govt-card overflow-hidden">
              <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
                  Notifikasi
                  {unreadCount > 0 && (
                    <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full"
                      style={{ background: "#dc2626", color: "#fff" }}>{unreadCount}</span>
                  )}
                </h3>
                <div className="flex items-center gap-2">
                  {(["semua", "belum"] as const).map((t) => (
                    <button key={t} onClick={() => setNotifTab(t)}
                      className="text-[11px] font-bold px-2 py-1 rounded transition-colors"
                      style={{
                        color: notifTab === t ? "var(--primary)" : "var(--foreground)",
                        background: notifTab === t ? "var(--accent-light)" : "transparent",
                        opacity: notifTab === t ? 1 : 0.5,
                      }}>
                      {t === "semua" ? "Semua" : "Belum Dibaca"}
                    </button>
                  ))}
                </div>
              </div>
              {unreadCount > 0 && (
                <div className="px-5 py-2 border-b flex justify-end" style={{ borderColor: "var(--border)" }}>
                  <button onClick={() => markAllRead(user?.role, user?.nik, user?.id)} className="text-[11px] font-medium flex items-center gap-1 transition-colors"
                    style={{ color: "var(--primary)" }}>
                    <BellOff size={11} /> Tandai semua dibaca
                  </button>
                </div>
              )}
              <div className="max-h-80 overflow-y-auto">
                {filteredNotif.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell size={32} className="mx-auto mb-2 opacity-20" style={{ color: "var(--foreground)" }} />
                    <p className="text-xs opacity-50">{notifTab === "belum" ? "Semua notifikasi sudah dibaca." : "Belum ada notifikasi."}</p>
                  </div>
                ) : (
                  filteredNotif.map((n) => {
                    const ni = NOTIF_ICON_MAP[n.tipe] || NOTIF_ICON_MAP.info;
                    return (
                      <button key={n.id}
                        className="w-full text-left px-5 py-3.5 border-b last:border-b-0 flex items-start gap-3 transition-colors hover:bg-surface-hover"
                        style={{ borderColor: "var(--border)", background: n.dibaca ? "transparent" : "var(--accent-light)" }}
                        onClick={() => markAsRead(n.id)}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${ni.color}15`, color: ni.color }}>
                          <ni.icon size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>
                            {n.judul}
                            {!n.dibaca && <span className="inline-block w-1.5 h-1.5 rounded-full ml-1.5 align-middle" style={{ background: "#dc2626" }} />}
                          </p>
                          <p className="text-[11px] opacity-60 line-clamp-2 mt-0.5">{n.pesan}</p>
                          <p className="text-[10px] opacity-30 mt-1">
                            {new Date(n.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

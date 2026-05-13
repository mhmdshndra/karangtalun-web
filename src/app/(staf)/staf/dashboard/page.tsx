"use client";

import Link from "next/link";
import { FileText, ClipboardList, BookOpen, Clock, CheckCircle, AlertCircle, ArrowRight, Bell } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";

export default function StafDashboardPage() {
  const { user } = useAuth();
  const { riwayatSurat, laporanList, permohonanList, getUnreadCountForUser, getNotifikasiForUser } = useServiceData();
  const unreadCount = getUnreadCountForUser("staf_layanan", user?.nik, user?.id);
  const notifikasi = getNotifikasiForUser("staf_layanan", user?.nik, user?.id);

  const suratMenunggu = riwayatSurat.filter((s) => s.status === "Menunggu").length;
  const suratDiproses = riwayatSurat.filter((s) => s.status === "Diproses").length;
  const laporanBaru = laporanList.filter((l) => l.status === "Dikirim").length;
  const prmBaru = permohonanList.filter((p) => p.status === "Dikirim").length;

  const stats = [
    { label: "Surat Menunggu", value: suratMenunggu, color: "#d97706", icon: Clock, href: "/staf/pengajuan-surat" },
    { label: "Surat Diproses", value: suratDiproses, color: "#2563eb", icon: FileText, href: "/staf/pengajuan-surat" },
    { label: "Laporan Baru", value: laporanBaru, color: "#dc2626", icon: ClipboardList, href: "/staf/laporan-aduan" },
    { label: "Permohonan PPID", value: prmBaru, color: "#7c3aed", icon: BookOpen, href: "/staf/permohonan-ppid" },
  ];

  const recentSurat = riwayatSurat.slice(0, 5);
  const recentNotif = notifikasi.slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Panel Staf Layanan
        </h1>
        <p className="text-sm opacity-50 mt-1">Selamat datang, {user?.nama_lengkap?.split(",")[0]}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((st) => (
          <Link key={st.label} href={st.href} className="govt-card p-4 flex items-center gap-3 group">
            <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: `${st.color}20`, color: st.color }}>
              <st.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black" style={{ color: st.color }}>{st.value}</p>
              <p className="text-[11px] opacity-50 font-medium">{st.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Pengajuan */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-xs font-bold uppercase tracking-wider">Pengajuan Surat Terbaru</h3>
            <Link href="/staf/pengajuan-surat" className="text-[11px] font-bold flex items-center gap-1" style={{ color: "#2563eb" }}>
              Lihat Semua <ArrowRight size={10} />
            </Link>
          </div>
          {recentSurat.length === 0 ? (
            <div className="p-8 text-center"><p className="text-xs opacity-40">Belum ada pengajuan.</p></div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentSurat.map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{s.jenis_surat_label}</p>
                    <p className="text-[11px] opacity-50 truncate">a.n. {s.pemohon.nama_lengkap} · {s.nomor_tiket}</p>
                  </div>
                  <StatusBadge label={s.status} variant={s.status === "Selesai" ? "success" : s.status === "Ditolak" ? "danger" : s.status === "Diproses" ? "info" : "warning"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider">Notifikasi</h3>
              {unreadCount > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#dc2626", color: "#fff" }}>{unreadCount}</span>}
            </div>
          </div>
          {recentNotif.length === 0 ? (
            <div className="p-8 text-center"><Bell size={20} className="mx-auto mb-2 opacity-15" /><p className="text-xs opacity-40">Tidak ada notifikasi.</p></div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentNotif.map((n) => (
                <div key={n.id} className="px-5 py-3" style={{ background: n.dibaca ? "transparent" : "var(--accent-light)" }}>
                  <p className="text-xs font-bold">{n.judul}</p>
                  <p className="text-[11px] opacity-50 truncate mt-0.5">{n.pesan}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

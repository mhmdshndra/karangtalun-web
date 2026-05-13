"use client";

import Link from "next/link";
import { FileText, ClipboardList, BookOpen, Users, Clock, CheckCircle, AlertCircle, ArrowRight, Bell, Settings } from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { riwayatSurat, laporanList, permohonanList, getUnreadCountForUser } = useServiceData();

  const suratTotal = riwayatSurat.length;
  const suratMenunggu = riwayatSurat.filter((s) => s.status === "Menunggu").length;
  const laporanTotal = laporanList.length;
  const laporanBaru = laporanList.filter((l) => l.status === "Dikirim").length;
  const prmTotal = permohonanList.length;
  const prmBaru = permohonanList.filter((p) => p.status === "Dikirim").length;
  const unreadCount = getUnreadCountForUser("admin_desa", user?.nik, user?.id);

  const stats = [
    { label: "Total Surat", value: suratTotal, sub: `${suratMenunggu} menunggu`, color: "#1a3a6e", icon: FileText, href: "/admin/pengajuan-surat" },
    { label: "Total Laporan", value: laporanTotal, sub: `${laporanBaru} baru`, color: "#dc2626", icon: ClipboardList, href: "/admin/laporan-aduan" },
    { label: "Total Permohonan", value: prmTotal, sub: `${prmBaru} baru`, color: "#7c3aed", icon: BookOpen, href: "/admin/permohonan-ppid" },
    { label: "Notifikasi", value: unreadCount, sub: "belum dibaca", color: "#d97706", icon: Bell, href: "/admin/dashboard" },
  ];

  const recentSurat = riwayatSurat.slice(0, 5);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Panel Admin Desa
        </h1>
        <p className="text-sm opacity-50 mt-1">Selamat datang, {user?.nama_lengkap?.split(",")[0]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((st) => (
          <Link key={st.label} href={st.href} className="govt-card p-4 group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: `${st.color}20`, color: st.color }}>
                <st.icon size={20} />
              </div>
              <p className="text-2xl font-black" style={{ color: st.color }}>{st.value}</p>
            </div>
            <p className="text-xs font-bold">{st.label}</p>
            <p className="text-[10px] opacity-40">{st.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Surat */}
      <div className="govt-card overflow-hidden">
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-xs font-bold uppercase tracking-wider">Pengajuan Terbaru</h3>
          <Link href="/admin/pengajuan-surat" className="text-[11px] font-bold flex items-center gap-1" style={{ color: "#dc2626" }}>
            Lihat Semua <ArrowRight size={10} />
          </Link>
        </div>
        {recentSurat.length === 0 ? (
          <div className="p-8 text-center"><p className="text-xs opacity-40">Belum ada data.</p></div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentSurat.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{s.jenis_surat_label}</p>
                  <p className="text-[11px] opacity-50 truncate">{s.nomor_tiket} · a.n. {s.pemohon.nama_lengkap}</p>
                </div>
                <StatusBadge label={s.status} variant={s.status === "Selesai" ? "success" : s.status === "Ditolak" ? "danger" : s.status === "Diproses" ? "info" : "warning"} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Placeholder */}
      <div className="govt-card p-8 text-center mt-4">
        <Settings size={32} className="mx-auto mb-3 opacity-15" />
        <p className="text-sm font-bold opacity-40">Halaman kelola detail akan dikembangkan di tahap berikutnya.</p>
        <p className="text-xs opacity-25 mt-1">Struktur routing, layout, dan konteks sudah siap.</p>
      </div>
    </div>
  );
}

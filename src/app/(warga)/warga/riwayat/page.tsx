"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle, XCircle, Loader2, Filter,
  ChevronDown, ChevronRight, MapPin, User, Calendar,
  Briefcase, Hash, MessageSquare, Search, Home, Eye,
  Send, Shield,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge, LoadingState } from "@/components/ui";
import { formatTanggal, hitungUmur } from "@/core/utils/helpers";
import Timeline from "@/components/ui/Timeline";
import type { StatusPengajuan, PengajuanSurat } from "@/core/types";

const STATUS_OPTIONS: { value: StatusPengajuan | ""; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "Menunggu", label: "Menunggu" },
  { value: "Diproses", label: "Diproses" },
  { value: "Selesai", label: "Selesai" },
  { value: "Ditolak", label: "Ditolak" },
];

const STATUS_STYLE: Record<StatusPengajuan, { variant: "success" | "warning" | "danger" | "info"; color: string; icon: typeof Clock }> = {
  Menunggu: { variant: "warning", color: "#d97706", icon: Clock },
  Diproses: { variant: "info", color: "#2563eb", icon: Loader2 },
  Selesai: { variant: "success", color: "#16a34a", icon: CheckCircle },
  Ditolak: { variant: "danger", color: "#dc2626", icon: XCircle },
};

function getTimelineSteps(status: StatusPengajuan) {
  const isDitolak = status === "Ditolak";
  const steps = [
    { label: "Pengajuan Diterima", status: "Menunggu" },
    { label: "Sedang Diverifikasi", status: "Diproses" },
    { label: "Surat Selesai", status: "Selesai" },
  ];
  const currentIdx = isDitolak ? 1 : steps.findIndex((s) => s.status === status);
  return steps.map((s, i) => ({
    label: isDitolak && i === 1 ? "Ditolak" : s.label,
    status: isDitolak && i === 1 ? "rejected" as const
      : !isDitolak && i <= currentIdx ? "done" as const
      : !isDitolak && i === currentIdx + 1 ? "pending" as const
      : "pending" as const,
  }));
}

export default function RiwayatPage() {
  const { user } = useAuth();
  const { getSuratForUser } = useServiceData();
  const riwayatSurat = getSuratForUser(user?.role || "warga", user?.nik);
  const [filterStatus, setFilterStatus] = useState<StatusPengajuan | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingData(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let result = riwayatSurat;
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) => s.jenis_surat_label.toLowerCase().includes(q) ||
          s.pemohon.nama_lengkap.toLowerCase().includes(q) ||
          s.nomor_tiket.toLowerCase().includes(q) ||
          s.keperluan.toLowerCase().includes(q)
      );
    }
    return result;
  }, [riwayatSurat, filterStatus, searchQuery]);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] mb-5" style={{ color: "var(--foreground)" }}>
        <Link href="/warga/dashboard" className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <Home size={11} /> Dashboard
        </Link>
        <ChevronRight size={10} className="opacity-30" />
        <span className="font-bold" style={{ color: "var(--primary)" }}>Riwayat Pengajuan</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Riwayat Pengajuan
          </h1>
          <p className="text-sm opacity-60 mt-1">{riwayatSurat.length} pengajuan tercatat</p>
        </div>
        <Link href="/warga/e-surat"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold transition-all"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          <Send size={14} /> Ajukan Baru
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" style={{ color: "var(--foreground)" }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan jenis surat, nama, atau nomor tiket..."
            className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none transition-colors"
            style={{ background: "var(--surface)", borderColor: searchQuery ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>✕</button>
          )}
        </div>
        <button onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-3 py-2.5 rounded border text-xs font-bold transition-colors hover:border-primary shrink-0"
          style={{
            borderColor: filterStatus ? "var(--primary)" : "var(--border)",
            color: filterStatus ? "var(--primary)" : "var(--foreground)",
            background: filterStatus ? "var(--accent-light)" : "var(--surface)",
          }}>
          <Filter size={14} /> Filter
          {filterStatus && (
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--primary)", color: "#fff" }}>1</span>
          )}
        </button>
      </div>

      {/* Filter Options */}
      {showFilter && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 rounded" style={{ background: "var(--surface-hover)" }}>
          {STATUS_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
              className="text-[11px] font-bold px-3 py-1.5 rounded transition-colors"
              style={{
                background: filterStatus === opt.value ? "var(--primary)" : "var(--surface)",
                color: filterStatus === opt.value ? "#fff" : "var(--foreground)",
              }}>{opt.label}</button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoadingData ? (
        <div className="govt-card p-8">
          <LoadingState message="Memuat riwayat pengajuan..." rows={3} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="govt-card p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 opacity-20" style={{ color: "var(--foreground)" }} />
          <p className="text-sm font-bold opacity-50">
            {searchQuery ? `Tidak ditemukan hasil untuk "${searchQuery}"` : filterStatus ? `Tidak ada pengajuan "${filterStatus}"` : "Belum ada pengajuan."}
          </p>
          {(searchQuery || filterStatus) && (
            <button onClick={() => { setSearchQuery(""); setFilterStatus(""); }}
              className="mt-3 text-xs font-bold" style={{ color: "var(--primary)" }}>Reset Filter</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {(searchQuery || filterStatus) && (
            <p className="text-[11px] opacity-40 mb-1">{filtered.length} hasil ditemukan</p>
          )}
          {filtered.map((s) => {
            const st = STATUS_STYLE[s.status];
            const isExpanded = expandedId === s.id;
            const isMinorPemohon = hitungUmur(s.pemohon.tanggal_lahir) < 17;
            const isDiwakili = s.diajukan_oleh.nik !== s.pemohon.nik;

            return (
              <div key={s.id} className="govt-card overflow-hidden">
                <button className="w-full text-left px-5 py-4 flex items-center gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0"
                    style={{ background: `${st.color}15`, color: st.color }}>
                    <st.icon size={18} className={s.status === "Diproses" ? "animate-spin" : ""} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{s.jenis_surat_label}</p>
                    <p className="text-[11px] opacity-50 mt-0.5">
                      {s.nomor_tiket} · a.n. {s.pemohon.nama_lengkap}
                      {isMinorPemohon && isDiwakili && (
                        <span className="ml-1" style={{ color: "#b8860b" }}>
                          <Shield size={9} className="inline mr-0.5" style={{ verticalAlign: "-1px" }} />
                          diwakili {s.diajukan_oleh.nama_lengkap}
                        </span>
                      )}
                      {" "}· {formatTanggal(s.tanggal_pengajuan)}
                    </p>
                  </div>
                  <StatusBadge label={s.status} variant={st.variant} />
                  <ChevronDown size={16}
                    className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                    style={{ color: "var(--foreground)", opacity: 0.3 }} />
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="my-4">
                      <Timeline steps={getTimelineSteps(s.status)} variant="horizontal" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                      <DetailRow icon={Hash} label="Nomor Tiket" value={s.nomor_tiket} />
                      {s.nomor_surat && <DetailRow icon={FileText} label="Nomor Surat" value={s.nomor_surat} />}
                      <DetailRow icon={User} label="Pemohon" value={s.pemohon.nama_lengkap} />
                      <DetailRow icon={Hash} label="NIK Pemohon" value={s.pemohon.nik} />
                      {isDiwakili && (
                        <DetailRow icon={Shield} label="Diajukan Oleh (Wakil)" value={s.diajukan_oleh.nama_lengkap} />
                      )}
                      <DetailRow icon={Calendar} label="Tanggal Pengajuan" value={formatTanggal(s.tanggal_pengajuan)} />
                      <DetailRow icon={Calendar} label="Terakhir Diperbarui" value={formatTanggal(s.tanggal_diperbarui)} />
                      <DetailRow icon={MapPin} label="Alamat" value={s.pemohon.alamat} />
                      <DetailRow icon={Briefcase} label="Pekerjaan" value={s.pemohon.pekerjaan} />
                    </div>

                    <div className="mt-4 p-3 rounded" style={{ background: "var(--surface-hover)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Keperluan</p>
                      <p className="text-xs" style={{ color: "var(--foreground)" }}>{s.keperluan}</p>
                    </div>

                    {s.catatan_admin && (
                      <div className="mt-3 p-3 rounded flex items-start gap-2"
                        style={{
                          background: s.status === "Ditolak" ? "#fee2e2" : "#dbeafe",
                          border: `1px solid ${s.status === "Ditolak" ? "#fca5a5" : "#93c5fd"}`,
                        }}>
                        <MessageSquare size={14} className="shrink-0 mt-0.5"
                          style={{ color: s.status === "Ditolak" ? "#dc2626" : "#2563eb" }} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: s.status === "Ditolak" ? "#991b1b" : "#1e40af" }}>
                            Catatan dari Petugas Desa
                          </p>
                          <p className="text-xs" style={{ color: s.status === "Ditolak" ? "#991b1b" : "#1e40af" }}>{s.catatan_admin}</p>
                        </div>
                      </div>
                    )}

                    {s.berkas_lampiran && s.berkas_lampiran.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Berkas Lampiran</p>
                        <div className="flex flex-wrap gap-2">
                          {s.berkas_lampiran.map((f, i) => (
                            <span key={i} className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1"
                              style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                              <FileText size={10} /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t flex items-center justify-end" style={{ borderColor: "var(--border)" }}>
                      <Link href={`/warga/riwayat/${s.id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                        <Eye size={13} /> Lihat Detail Lengkap
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <Link href="/warga/e-surat"
        className="sm:hidden fixed bottom-20 right-4 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
        <Send size={20} />
      </Link>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={13} className="shrink-0 mt-0.5 opacity-40" style={{ color: "var(--foreground)" }} />
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40">{label}</p>
        <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{value}</p>
      </div>
    </div>
  );
}

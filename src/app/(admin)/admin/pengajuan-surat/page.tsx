"use client";

import { useState, useMemo } from "react";
import {
  FileText, Clock, CheckCircle, XCircle, Loader2, Search, X,
  ChevronDown, User, Calendar, Hash, MessageSquare, Play,
} from "lucide-react";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";
import Timeline from "@/components/ui/Timeline";
import type { StatusPengajuan } from "@/core/types";

const STATUS_STYLE: Record<StatusPengajuan, { variant: "success" | "warning" | "danger" | "info"; color: string }> = {
  Menunggu: { variant: "warning", color: "#d97706" },
  Diproses: { variant: "info", color: "#2563eb" },
  Selesai: { variant: "success", color: "#16a34a" },
  Ditolak: { variant: "danger", color: "#dc2626" },
};

function getTimelineSteps(status: StatusPengajuan) {
  const steps = [
    { label: "Diajukan", status: "Menunggu" as const },
    { label: "Diproses", status: "Diproses" as const },
    { label: "Selesai", status: "Selesai" as const },
  ];
  const rejected = status === "Ditolak";
  const currentIdx = rejected ? 1 : steps.findIndex((s) => s.status === status);
  return steps.map((s, i) => ({
    label: s.label,
    status: rejected && i === 1 ? ("rejected" as const) : i <= currentIdx ? ("done" as const) : ("pending" as const),
  }));
}

export default function AdminPengajuanSuratPage() {
  const { riwayatSurat, updatePengajuanStatus, refreshNotifikasi } = useServiceData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusPengajuan | "">("");
  const [searchQ, setSearchQ] = useState("");
  const [simulating, setSimulating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = riwayatSurat;
    if (filterStatus) result = result.filter((s) => s.status === filterStatus);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (s) => s.nomor_tiket.toLowerCase().includes(q) || s.jenis_surat_label.toLowerCase().includes(q) ||
          s.pemohon.nama_lengkap.toLowerCase().includes(q)
      );
    }
    return result;
  }, [riwayatSurat, filterStatus, searchQ]);

  const handleProcess = async (id: string, newStatus: StatusPengajuan) => {
    setSimulating(id);
    const catatan = newStatus === "Diproses"
      ? "Pengajuan sedang diverifikasi oleh admin desa."
      : newStatus === "Selesai"
      ? "Surat telah selesai dan dapat diambil di kantor desa."
      : "Pengajuan ditolak karena berkas tidak lengkap. Silakan ajukan ulang.";
    try {
      await updatePengajuanStatus(id, newStatus, catatan);
      refreshNotifikasi();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status surat.");
    }
    setSimulating(null);
  };

  const counts = {
    all: riwayatSurat.length,
    menunggu: riwayatSurat.filter((s) => s.status === "Menunggu").length,
    diproses: riwayatSurat.filter((s) => s.status === "Diproses").length,
    selesai: riwayatSurat.filter((s) => s.status === "Selesai").length,
    ditolak: riwayatSurat.filter((s) => s.status === "Ditolak").length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Kelola Pengajuan Surat
        </h1>
        <p className="text-sm opacity-50 mt-1">Verifikasi dan proses pengajuan surat dari warga</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-2 mb-5">
        {[
          { label: "Total", value: counts.all, color: "var(--foreground)" },
          { label: "Menunggu", value: counts.menunggu, color: "#d97706" },
          { label: "Diproses", value: counts.diproses, color: "#2563eb" },
          { label: "Selesai", value: counts.selesai, color: "#16a34a" },
          { label: "Ditolak", value: counts.ditolak, color: "#dc2626" },
        ].map((st) => (
          <div key={st.label} className="govt-card p-3 text-center">
            <p className="text-xl font-black" style={{ color: st.color }}>{st.value}</p>
            <p className="text-[10px] opacity-50 font-bold">{st.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari pengajuan..."
            className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none"
            style={{ background: "var(--surface)", borderColor: searchQ ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />
          {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "var(--foreground)", opacity: 0.4 }} /></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["", "Menunggu", "Diproses", "Selesai", "Ditolak"] as (StatusPengajuan | "")[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="text-[11px] font-bold px-3 py-2 rounded transition-colors"
              style={{ background: filterStatus === s ? "#dc2626" : "var(--surface)", color: filterStatus === s ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>
              {s || "Semua"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="govt-card p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold opacity-50">{searchQ || filterStatus ? "Tidak ditemukan." : "Belum ada pengajuan surat."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const st = STATUS_STYLE[s.status];
            const isExpanded = expandedId === s.id;
            const nextStatuses: { status: StatusPengajuan; label: string; color: string }[] = [];
            if (s.status === "Menunggu") { nextStatuses.push({ status: "Diproses", label: "Proses", color: "#2563eb" }); nextStatuses.push({ status: "Ditolak", label: "Tolak", color: "#dc2626" }); }
            if (s.status === "Diproses") { nextStatuses.push({ status: "Selesai", label: "Selesaikan", color: "#16a34a" }); nextStatuses.push({ status: "Ditolak", label: "Tolak", color: "#dc2626" }); }

            return (
              <div key={s.id} className="govt-card overflow-hidden">
                <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: `${st.color}15`, color: st.color }}><FileText size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{s.jenis_surat_label}</p>
                    <p className="text-[11px] opacity-50 mt-0.5 truncate">{s.nomor_tiket} · a.n. {s.pemohon.nama_lengkap} · {new Date(s.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <StatusBadge label={s.status} variant={st.variant} />
                  <ChevronDown size={16} className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--foreground)", opacity: 0.3 }} />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
                    <div className="mt-4"><Timeline steps={getTimelineSteps(s.status)} variant="horizontal" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                      <DetailRow icon={Hash} label="Nomor Tiket" value={s.nomor_tiket} />
                      <DetailRow icon={User} label="Diajukan Oleh" value={s.diajukan_oleh.nama_lengkap} />
                      <DetailRow icon={User} label="Pemohon (Subjek)" value={s.pemohon.nama_lengkap} />
                      <DetailRow icon={Calendar} label="Tanggal Pengajuan" value={new Date(s.tanggal_pengajuan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                      <DetailRow icon={FileText} label="Keperluan" value={s.keperluan} />
                      {s.nomor_surat && <DetailRow icon={Hash} label="Nomor Surat" value={s.nomor_surat} />}
                    </div>
                    {s.catatan_admin && (
                      <div className="p-3 rounded flex items-start gap-2" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
                        <MessageSquare size={14} className="shrink-0 mt-0.5" style={{ color: "#2563eb" }} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#1e40af" }}>Catatan Admin</p>
                          <p className="text-xs" style={{ color: "#1e40af" }}>{s.catatan_admin}</p>
                        </div>
                      </div>
                    )}
                    {nextStatuses.length > 0 && (
                      <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-2">Aksi Admin</p>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((ns) => (
                            <button key={ns.status} onClick={() => handleProcess(s.id, ns.status)} disabled={simulating === s.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold transition-all"
                              style={{ background: simulating === s.id ? "var(--border)" : ns.color, color: "#fff" }}>
                              {simulating === s.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} />}
                              {ns.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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

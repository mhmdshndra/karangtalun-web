"use client";

import { useState, useMemo } from "react";
import {
  ClipboardList, Clock, CheckCircle, Loader2, Search, X,
  ChevronDown, User, Calendar, Hash, MessageSquare, Play, MapPin, Phone, FileText,
} from "lucide-react";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";
import Timeline from "@/components/ui/Timeline";
import { KATEGORI_LAPORAN_OPTIONS } from "@/core/constants/appConstants";
import type { StatusLaporan } from "@/core/types";

const STATUS_STYLE: Record<StatusLaporan, { variant: "success" | "warning" | "info"; color: string }> = {
  Dikirim: { variant: "warning", color: "#d97706" },
  Ditindaklanjuti: { variant: "info", color: "#2563eb" },
  Selesai: { variant: "success", color: "#16a34a" },
};

function getTimelineSteps(status: StatusLaporan) {
  const steps = [
    { label: "Dikirim", status: "Dikirim" as const },
    { label: "Ditindaklanjuti", status: "Ditindaklanjuti" as const },
    { label: "Selesai", status: "Selesai" as const },
  ];
  const currentIdx = steps.findIndex((s) => s.status === status);
  return steps.map((s, i) => ({ label: s.label, status: i <= currentIdx ? ("done" as const) : ("pending" as const) }));
}

export default function AdminLaporanAduanPage() {
  const { laporanList, updateLaporanStatus, refreshNotifikasi } = useServiceData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusLaporan | "">("");
  const [searchQ, setSearchQ] = useState("");
  const [simulating, setSimulating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = laporanList;
    if (filterStatus) result = result.filter((l) => l.status === filterStatus);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (l) => l.nomor_tiket.toLowerCase().includes(q) || l.deskripsi.toLowerCase().includes(q) ||
          l.nama_pelapor.toLowerCase().includes(q) || l.lokasi_kejadian.toLowerCase().includes(q)
      );
    }
    return result;
  }, [laporanList, filterStatus, searchQ]);

  const handleSimulate = async (id: string, newStatus: StatusLaporan) => {
    setSimulating(id);
    const catatan = newStatus === "Ditindaklanjuti"
      ? "Laporan sedang diverifikasi dan ditindaklanjuti oleh petugas terkait."
      : "Laporan telah selesai ditindaklanjuti. Terima kasih atas partisipasi Anda.";
    try {
      await updateLaporanStatus(id, newStatus, catatan);
      refreshNotifikasi();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status laporan.");
    }
    setSimulating(null);
  };

  const counts = {
    all: laporanList.length,
    dikirim: laporanList.filter((l) => l.status === "Dikirim").length,
    proses: laporanList.filter((l) => l.status === "Ditindaklanjuti").length,
    selesai: laporanList.filter((l) => l.status === "Selesai").length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Kelola Laporan / Aduan</h1>
        <p className="text-sm opacity-50 mt-1">Tindaklanjuti laporan dan aduan dari warga</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: "Total", value: counts.all, color: "var(--foreground)" },
          { label: "Baru", value: counts.dikirim, color: "#d97706" },
          { label: "Proses", value: counts.proses, color: "#2563eb" },
          { label: "Selesai", value: counts.selesai, color: "#16a34a" },
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
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Cari laporan..."
            className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none"
            style={{ background: "var(--surface)", borderColor: searchQ ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />
          {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "var(--foreground)", opacity: 0.4 }} /></button>}
        </div>
        <div className="flex gap-2">
          {(["", "Dikirim", "Ditindaklanjuti", "Selesai"] as (StatusLaporan | "")[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="text-[11px] font-bold px-3 py-2 rounded transition-colors"
              style={{ background: filterStatus === s ? "#dc2626" : "var(--surface)", color: filterStatus === s ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>
              {s || "Semua"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="govt-card p-12 text-center">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold opacity-50">{searchQ || filterStatus ? "Tidak ditemukan." : "Belum ada laporan."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lap) => {
            const st = STATUS_STYLE[lap.status];
            const isExpanded = expandedId === lap.id;
            const nextStatuses: { status: StatusLaporan; label: string; color: string }[] = [];
            if (lap.status === "Dikirim") nextStatuses.push({ status: "Ditindaklanjuti", label: "Tindaklanjuti", color: "#2563eb" });
            if (lap.status === "Dikirim" || lap.status === "Ditindaklanjuti") nextStatuses.push({ status: "Selesai", label: "Selesaikan", color: "#16a34a" });

            return (
              <div key={lap.id} className="govt-card overflow-hidden">
                <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpandedId(isExpanded ? null : lap.id)}>
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: `${st.color}15`, color: st.color }}>
                    <ClipboardList size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                      {KATEGORI_LAPORAN_OPTIONS.find((k) => k.value === lap.kategori)?.label || lap.kategori}
                    </p>
                    <p className="text-[11px] opacity-50 mt-0.5 truncate">{lap.nomor_tiket} · {lap.nama_pelapor} · {new Date(lap.tanggal_laporan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <StatusBadge label={lap.status} variant={st.variant} />
                  <ChevronDown size={16} className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--foreground)", opacity: 0.3 }} />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
                    <div className="mt-4"><Timeline steps={getTimelineSteps(lap.status)} variant="horizontal" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                      <DetailRow icon={Hash} label="Nomor Tiket" value={lap.nomor_tiket} />
                      <DetailRow icon={User} label="Pelapor" value={lap.nama_pelapor} />
                      <DetailRow icon={Phone} label="Kontak" value={lap.kontak_pelapor} />
                      <DetailRow icon={MapPin} label="Alamat" value={lap.alamat_pelapor} />
                      <DetailRow icon={MapPin} label="Lokasi Kejadian" value={lap.lokasi_kejadian} />
                      <DetailRow icon={Calendar} label="Tanggal" value={new Date(lap.tanggal_laporan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                    </div>
                    <div className="p-3 rounded" style={{ background: "var(--surface-hover)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Deskripsi</p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>{lap.deskripsi}</p>
                    </div>
                    {lap.catatan_admin && (
                      <div className="p-3 rounded flex items-start gap-2" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
                        <MessageSquare size={14} className="shrink-0 mt-0.5" style={{ color: "#2563eb" }} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#1e40af" }}>Catatan Admin</p>
                          <p className="text-xs" style={{ color: "#1e40af" }}>{lap.catatan_admin}</p>
                        </div>
                      </div>
                    )}
                    {lap.lampiran.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Lampiran</p>
                        <div className="flex flex-wrap gap-2">
                          {lap.lampiran.map((f, i) => (
                            <span key={i} className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                              <FileText size={10} /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {nextStatuses.length > 0 && (
                      <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-2">Aksi Admin</p>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((ns) => (
                            <button key={ns.status} onClick={() => handleSimulate(lap.id, ns.status)} disabled={simulating === lap.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold transition-all"
                              style={{ background: simulating === lap.id ? "var(--border)" : ns.color, color: "#fff" }}>
                              {simulating === lap.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} />}
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

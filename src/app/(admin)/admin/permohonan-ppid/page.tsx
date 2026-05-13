"use client";

import { useState, useMemo } from "react";
import {
  BookOpen, Clock, CheckCircle, Loader2, Search, X,
  ChevronDown, User, Calendar, Hash, MessageSquare, Play, FileText, Phone,
} from "lucide-react";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";
import Timeline from "@/components/ui/Timeline";
import type { StatusPermohonan } from "@/core/types";

const STATUS_STYLE: Record<StatusPermohonan, { variant: "success" | "warning" | "info" | "danger"; color: string }> = {
  Dikirim: { variant: "warning", color: "#d97706" },
  Diproses: { variant: "info", color: "#2563eb" },
  Dijawab: { variant: "success", color: "#16a34a" },
  Ditolak: { variant: "danger", color: "#dc2626" },
};

function getTimelineSteps(status: StatusPermohonan) {
  const steps = [
    { label: "Dikirim", status: "Dikirim" as const },
    { label: "Diproses", status: "Diproses" as const },
    { label: "Dijawab", status: "Dijawab" as const },
  ];
  const rejected = status === "Ditolak";
  const currentIdx = rejected ? 1 : steps.findIndex((s) => s.status === status);
  return steps.map((s, i) => ({
    label: s.label,
    status: rejected && i === 1 ? ("rejected" as const) : i <= currentIdx ? ("done" as const) : ("pending" as const),
  }));
}

export default function AdminPermohonanPpidPage() {
  const { permohonanList, updatePermohonanStatus, refreshNotifikasi } = useServiceData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusPermohonan | "">("");
  const [searchQ, setSearchQ] = useState("");
  const [simulating, setSimulating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = permohonanList;
    if (filterStatus) result = result.filter((p) => p.status === filterStatus);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (p) => p.nomor_permohonan.toLowerCase().includes(q) || p.informasi_diminta.toLowerCase().includes(q) ||
          p.nama_pemohon.toLowerCase().includes(q)
      );
    }
    return result;
  }, [permohonanList, filterStatus, searchQ]);

  const handleSimulate = async (id: string, newStatus: StatusPermohonan) => {
    setSimulating(id);
    const catatan = newStatus === "Diproses"
      ? "Permohonan sedang diproses dan dikompilasi oleh PPID desa."
      : newStatus === "Dijawab"
      ? "Informasi yang diminta telah disediakan."
      : "Permohonan ditolak: informasi yang diminta termasuk informasi yang dikecualikan.";
    try {
      await updatePermohonanStatus(id, newStatus, catatan, undefined);
      refreshNotifikasi();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status permohonan.");
    }
    setSimulating(null);
  };

  const counts = {
    all: permohonanList.length,
    dikirim: permohonanList.filter((p) => p.status === "Dikirim").length,
    diproses: permohonanList.filter((p) => p.status === "Diproses").length,
    dijawab: permohonanList.filter((p) => p.status === "Dijawab").length,
    ditolak: permohonanList.filter((p) => p.status === "Ditolak").length,
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Kelola Permohonan PPID</h1>
        <p className="text-sm opacity-50 mt-1">Proses permohonan informasi publik dari masyarakat</p>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-5">
        {[
          { label: "Total", value: counts.all, color: "var(--foreground)" },
          { label: "Baru", value: counts.dikirim, color: "#d97706" },
          { label: "Proses", value: counts.diproses, color: "#2563eb" },
          { label: "Dijawab", value: counts.dijawab, color: "#16a34a" },
          { label: "Ditolak", value: counts.ditolak, color: "#dc2626" },
        ].map((st) => (
          <div key={st.label} className="govt-card p-3 text-center">
            <p className="text-xl font-black" style={{ color: st.color }}>{st.value}</p>
            <p className="text-[10px] opacity-50 font-bold">{st.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Cari permohonan..."
            className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none"
            style={{ background: "var(--surface)", borderColor: searchQ ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />
          {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "var(--foreground)", opacity: 0.4 }} /></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["", "Dikirim", "Diproses", "Dijawab", "Ditolak"] as (StatusPermohonan | "")[]).map((s) => (
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
          <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-bold opacity-50">{searchQ || filterStatus ? "Tidak ditemukan." : "Belum ada permohonan."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((prm) => {
            const st = STATUS_STYLE[prm.status];
            const isExpanded = expandedId === prm.id;
            const nextStatuses: { status: StatusPermohonan; label: string; color: string }[] = [];
            if (prm.status === "Dikirim") { nextStatuses.push({ status: "Diproses", label: "Proses", color: "#2563eb" }); nextStatuses.push({ status: "Ditolak", label: "Tolak", color: "#dc2626" }); }
            if (prm.status === "Diproses") { nextStatuses.push({ status: "Dijawab", label: "Jawab", color: "#16a34a" }); nextStatuses.push({ status: "Ditolak", label: "Tolak", color: "#dc2626" }); }

            return (
              <div key={prm.id} className="govt-card overflow-hidden">
                <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpandedId(isExpanded ? null : prm.id)}>
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: `${st.color}15`, color: st.color }}>
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{prm.informasi_diminta}</p>
                    <p className="text-[11px] opacity-50 mt-0.5 truncate">{prm.nomor_permohonan} · {prm.nama_pemohon} · {new Date(prm.tanggal_permohonan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <StatusBadge label={prm.status} variant={st.variant} />
                  <ChevronDown size={16} className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--foreground)", opacity: 0.3 }} />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
                    <div className="mt-4"><Timeline steps={getTimelineSteps(prm.status)} variant="horizontal" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                      <DetailRow icon={Hash} label="Nomor Permohonan" value={prm.nomor_permohonan} />
                      <DetailRow icon={User} label="Pemohon" value={prm.nama_pemohon} />
                      <DetailRow icon={Phone} label="Kontak" value={prm.kontak_pemohon} />
                      <DetailRow icon={Calendar} label="Tanggal" value={new Date(prm.tanggal_permohonan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                    </div>
                    <div className="p-3 rounded" style={{ background: "var(--surface-hover)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Tujuan Permohonan</p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>{prm.tujuan_permohonan}</p>
                    </div>
                    <div className="p-3 rounded" style={{ background: "var(--surface-hover)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Informasi yang Diminta</p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>{prm.informasi_diminta}</p>
                    </div>
                    {prm.catatan_admin && (
                      <div className="p-3 rounded flex items-start gap-2" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
                        <MessageSquare size={14} className="shrink-0 mt-0.5" style={{ color: "#2563eb" }} />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#1e40af" }}>Catatan Admin</p>
                          <p className="text-xs" style={{ color: "#1e40af" }}>{prm.catatan_admin}</p>
                        </div>
                      </div>
                    )}
                    {(prm.lampiran.length > 0 || (prm.file_balasan && prm.file_balasan.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {prm.lampiran.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Lampiran Pemohon</p>
                            <div className="flex flex-wrap gap-2">
                              {prm.lampiran.map((f, i) => (
                                <span key={i} className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                                  <FileText size={10} /> {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {prm.file_balasan && prm.file_balasan.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">File Balasan</p>
                            <div className="flex flex-wrap gap-2">
                              {prm.file_balasan.map((f, i) => (
                                <span key={i} className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1" style={{ background: "#dcfce7", color: "#166534" }}>
                                  <FileText size={10} /> {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {nextStatuses.length > 0 && (
                      <div className="pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-2">Aksi Admin</p>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map((ns) => (
                            <button key={ns.status} onClick={() => handleSimulate(prm.id, ns.status)} disabled={simulating === prm.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold transition-all"
                              style={{ background: simulating === prm.id ? "var(--border)" : ns.color, color: "#fff" }}>
                              {simulating === prm.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} />}
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

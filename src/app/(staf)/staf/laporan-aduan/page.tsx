"use client";

import { useState } from "react";
import { ClipboardList, Search, Filter, Eye, CheckCircle, Clock, AlertCircle, MapPin } from "lucide-react";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";
import type { StatusLaporan } from "@/core/types";

const STATUS_FILTER: { value: StatusLaporan | "Semua"; label: string }[] = [
  { value: "Semua", label: "Semua" },
  { value: "Dikirim", label: "Dikirim" },
  { value: "Ditindaklanjuti", label: "Ditindaklanjuti" },
  { value: "Selesai", label: "Selesai" },
];

const KATEGORI_LABEL: Record<string, string> = {
  infrastruktur: "Infrastruktur",
  kamtibmas: "Keamanan & Ketertiban",
  umum: "Umum",
};

function getStatusVariant(status: StatusLaporan) {
  switch (status) {
    case "Selesai": return "success" as const;
    case "Ditindaklanjuti": return "info" as const;
    default: return "warning" as const;
  }
}

export default function StafLaporanAduanPage() {
  const { laporanList, updateLaporanStatus, refreshNotifikasi } = useServiceData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusLaporan | "Semua">("Semua");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState<{ id: string; action: "tindaklanjuti" | "selesai" } | null>(null);
  const [catatan, setCatatan] = useState("");

  const filtered = laporanList.filter((l) => {
    if (statusFilter !== "Semua" && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.nama_pelapor.toLowerCase().includes(q) ||
        l.deskripsi.toLowerCase().includes(q) ||
        l.nomor_tiket.toLowerCase().includes(q) ||
        l.lokasi_kejadian.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = async (id: string, action: "tindaklanjuti" | "selesai") => {
    const status: StatusLaporan = action === "tindaklanjuti" ? "Ditindaklanjuti" : "Selesai";
    try {
      await updateLaporanStatus(id, status, catatan || undefined);
      refreshNotifikasi();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status laporan.");
    }
    setActionForm(null);
    setCatatan("");
  };

  const detail = detailId ? laporanList.find((l) => l.id === detailId) : null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          <ClipboardList size={22} style={{ color: "#2563eb" }} />
          Laporan & Aduan
        </h1>
        <p className="text-sm opacity-50 mt-1">Kelola laporan dan aduan dari masyarakat</p>
      </div>

      {/* Filter & Search */}
      <div className="govt-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--foreground)" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pelapor, deskripsi, atau lokasi..."
              className="w-full pl-9 pr-4 py-2.5 rounded border text-xs"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="opacity-40 shrink-0" style={{ color: "var(--foreground)" }} />
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTER.map((f) => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className="px-3 py-1.5 rounded text-[11px] font-bold transition-colors"
                  style={{
                    background: statusFilter === f.value ? "#2563eb" : "var(--surface-hover)",
                    color: statusFilter === f.value ? "#fff" : "var(--foreground)",
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Baru Masuk", count: laporanList.filter((l) => l.status === "Dikirim").length, color: "#d97706" },
          { label: "Ditindaklanjuti", count: laporanList.filter((l) => l.status === "Ditindaklanjuti").length, color: "#2563eb" },
          { label: "Selesai", count: laporanList.filter((l) => l.status === "Selesai").length, color: "#16a34a" },
        ].map((st) => (
          <div key={st.label} className="govt-card p-3 text-center">
            <p className="text-xl font-black" style={{ color: st.color }}>{st.count}</p>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">{st.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="govt-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={36} className="mx-auto mb-3 opacity-15" />
            <p className="text-sm font-bold opacity-40">Tidak ada laporan ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((l) => (
              <div key={l.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>
                      {KATEGORI_LABEL[l.kategori] || l.kategori}
                    </span>
                    <span className="text-[10px] font-mono opacity-40">{l.nomor_tiket}</span>
                  </div>
                  <p className="text-xs font-bold truncate">{l.deskripsi.length > 80 ? l.deskripsi.slice(0, 80) + "..." : l.deskripsi}</p>
                  <p className="text-[11px] opacity-50 flex items-center gap-1 mt-1">
                    <MapPin size={10} /> {l.lokasi_kejadian} · {l.nama_pelapor} · {formatDate(l.tanggal_laporan)}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <StatusBadge label={l.status} variant={getStatusVariant(l.status)} />
                  <button onClick={() => setDetailId(l.id)}
                    className="p-2 rounded border hover:border-primary transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Lihat Detail">
                    <Eye size={14} />
                  </button>
                  {l.status === "Dikirim" && (
                    <button onClick={() => { setActionForm({ id: l.id, action: "tindaklanjuti" }); setCatatan(""); }}
                      className="px-3 py-1.5 rounded text-[11px] font-bold" style={{ background: "#2563eb", color: "#fff" }}>
                      Tindaklanjuti
                    </button>
                  )}
                  {l.status === "Ditindaklanjuti" && (
                    <button onClick={() => { setActionForm({ id: l.id, action: "selesai" }); setCatatan(""); }}
                      className="px-3 py-1.5 rounded text-[11px] font-bold" style={{ background: "#16a34a", color: "#fff" }}>
                      Selesai
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-lg border overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-bold">Detail Laporan</h3>
              <button onClick={() => setDetailId(null)} className="p-1" style={{ color: "var(--foreground)" }}>✕</button>
            </div>
            <div className="p-5 space-y-3 text-xs" style={{ color: "var(--foreground)" }}>
              <div className="flex justify-between"><span className="opacity-50">Nomor Tiket</span><span className="font-bold">{detail.nomor_tiket}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Kategori</span><span className="font-bold">{KATEGORI_LABEL[detail.kategori]}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Pelapor</span><span className="font-bold">{detail.nama_pelapor}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Alamat</span><span>{detail.alamat_pelapor}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Kontak</span><span className="font-mono">{detail.kontak_pelapor}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Lokasi Kejadian</span><span>{detail.lokasi_kejadian}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Tanggal</span><span>{formatDate(detail.tanggal_laporan)}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Status</span><StatusBadge label={detail.status} variant={getStatusVariant(detail.status)} /></div>
              <div><span className="opacity-50 block mb-1">Deskripsi</span><p className="p-2 rounded" style={{ background: "var(--surface-hover)" }}>{detail.deskripsi}</p></div>
              {detail.catatan_admin && <div><span className="opacity-50 block mb-1">Catatan</span><p className="p-2 rounded" style={{ background: "var(--surface-hover)" }}>{detail.catatan_admin}</p></div>}
              {detail.lampiran.length > 0 && (
                <div><span className="opacity-50 block mb-1">Lampiran</span>
                  <div className="flex flex-wrap gap-1">{detail.lampiran.map((f, i) => (
                    <span key={i} className="px-2 py-1 rounded text-[10px] font-mono" style={{ background: "var(--surface-hover)" }}>{f}</span>
                  ))}</div>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t text-right" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setDetailId(null)} className="px-4 py-2 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-lg border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: actionForm.action === "selesai" ? "#16a34a" : "#2563eb" }}>
              <h3 className="text-sm font-bold text-white">{actionForm.action === "selesai" ? "Selesaikan Laporan" : "Tindaklanjuti Laporan"}</h3>
            </div>
            <div className="p-5">
              <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>Catatan Tindak Lanjut</label>
              <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                rows={3} placeholder="Tuliskan catatan tindak lanjut..."
                className="w-full px-3 py-2 rounded border text-xs resize-none"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setActionForm(null)} className="px-4 py-2 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Batal</button>
              <button onClick={() => handleAction(actionForm.id, actionForm.action)}
                className="px-4 py-2 rounded text-xs font-bold text-white"
                style={{ background: actionForm.action === "selesai" ? "#16a34a" : "#2563eb" }}>
                {actionForm.action === "selesai" ? "Selesaikan" : "Tindaklanjuti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

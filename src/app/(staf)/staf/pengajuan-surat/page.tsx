"use client";

import { useState } from "react";
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";
import { formatTanggal } from "@/core/utils/helpers";
import type { StatusPengajuan } from "@/core/types";

const STATUS_FILTER: { value: StatusPengajuan | "Semua"; label: string }[] = [
  { value: "Semua", label: "Semua" },
  { value: "Menunggu", label: "Menunggu" },
  { value: "Diproses", label: "Diproses" },
  { value: "Selesai", label: "Selesai" },
  { value: "Ditolak", label: "Ditolak" },
];

function getStatusVariant(status: StatusPengajuan) {
  switch (status) {
    case "Selesai": return "success";
    case "Diproses": return "info";
    case "Ditolak": return "danger";
    default: return "warning";
  }
}

function getStatusIcon(status: StatusPengajuan) {
  switch (status) {
    case "Selesai": return CheckCircle;
    case "Diproses": return Clock;
    case "Ditolak": return XCircle;
    default: return AlertCircle;
  }
}

export default function StafPengajuanSuratPage() {
  const { riwayatSurat, updatePengajuanStatus, refreshNotifikasi } = useServiceData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusPengajuan | "Semua">("Semua");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState<{ id: string; action: "terima" | "tolak" } | null>(null);
  const [catatan, setCatatan] = useState("");
  const [nomorSurat, setNomorSurat] = useState("");

  const filtered = riwayatSurat.filter((s) => {
    if (statusFilter !== "Semua" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.jenis_surat_label.toLowerCase().includes(q) ||
        s.pemohon.nama_lengkap.toLowerCase().includes(q) ||
        s.nomor_tiket.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = async (id: string, action: "terima" | "tolak") => {
    try {
      if (action === "terima") {
        const status: StatusPengajuan = "Selesai";
        await updatePengajuanStatus(id, status, catatan || "Surat telah selesai diproses.", nomorSurat || undefined);
      } else {
        await updatePengajuanStatus(id, "Ditolak", catatan || "Pengajuan ditolak karena berkas tidak lengkap.");
      }
      refreshNotifikasi();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status surat.");
    }
    setActionForm(null);
    setCatatan("");
    setNomorSurat("");
  };

  const detail = detailId ? riwayatSurat.find((s) => s.id === detailId) : null;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          <FileText size={22} style={{ color: "#2563eb" }} />
          Pengajuan Surat
        </h1>
        <p className="text-sm opacity-50 mt-1">Kelola pengajuan surat dari warga</p>
      </div>

      {/* Filter & Search */}
      <div className="govt-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--foreground)" }} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pemohon, jenis surat, atau nomor tiket..."
              className="w-full pl-9 pr-4 py-2.5 rounded border text-xs"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
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

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Menunggu", count: riwayatSurat.filter((s) => s.status === "Menunggu").length, color: "#d97706" },
          { label: "Diproses", count: riwayatSurat.filter((s) => s.status === "Diproses").length, color: "#2563eb" },
          { label: "Selesai", count: riwayatSurat.filter((s) => s.status === "Selesai").length, color: "#16a34a" },
          { label: "Ditolak", count: riwayatSurat.filter((s) => s.status === "Ditolak").length, color: "#dc2626" },
        ].map((st) => (
          <div key={st.label} className="govt-card p-3 text-center">
            <p className="text-xl font-black" style={{ color: st.color }}>{st.count}</p>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-wider">{st.label}</p>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="govt-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={36} className="mx-auto mb-3 opacity-15" />
            <p className="text-sm font-bold opacity-40">Tidak ada pengajuan surat ditemukan.</p>
            <p className="text-xs opacity-30 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((s) => {
              const Icon = getStatusIcon(s.status);
              return (
                <div key={s.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ background: `${getStatusVariant(s.status) === "success" ? "#16a34a" : getStatusVariant(s.status) === "info" ? "#2563eb" : getStatusVariant(s.status) === "danger" ? "#dc2626" : "#d97706"}15` }}>
                      <Icon size={16} style={{ color: getStatusVariant(s.status) === "success" ? "#16a34a" : getStatusVariant(s.status) === "info" ? "#2563eb" : getStatusVariant(s.status) === "danger" ? "#dc2626" : "#d97706" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{s.jenis_surat_label}</p>
                      <p className="text-[11px] opacity-50 truncate">a.n. {s.pemohon.nama_lengkap} · {s.nomor_tiket}</p>
                      <p className="text-[10px] opacity-40 mt-0.5">{formatTanggal(s.tanggal_pengajuan)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <StatusBadge label={s.status} variant={getStatusVariant(s.status)} />
                    <button onClick={() => setDetailId(s.id)}
                      className="p-2 rounded border hover:border-primary transition-colors"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      title="Lihat Detail">
                      <Eye size={14} />
                    </button>
                    {(s.status === "Menunggu" || s.status === "Diproses") && (
                      <>
                        <button onClick={() => { setActionForm({ id: s.id, action: "terima" }); setCatatan(""); setNomorSurat(""); }}
                          className="px-3 py-1.5 rounded text-[11px] font-bold"
                          style={{ background: "#16a34a", color: "#fff" }}>
                          Setujui
                        </button>
                        <button onClick={() => { setActionForm({ id: s.id, action: "tolak" }); setCatatan(""); }}
                          className="px-3 py-1.5 rounded text-[11px] font-bold"
                          style={{ background: "#dc2626", color: "#fff" }}>
                          Tolak
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-lg rounded-lg border overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-bold">Detail Pengajuan</h3>
              <button onClick={() => setDetailId(null)} className="p-1" style={{ color: "var(--foreground)" }}>✕</button>
            </div>
            <div className="p-5 space-y-3 text-xs" style={{ color: "var(--foreground)" }}>
              <div className="flex justify-between"><span className="opacity-50">Nomor Tiket</span><span className="font-bold">{detail.nomor_tiket}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Jenis Surat</span><span className="font-bold">{detail.jenis_surat_label}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Pemohon</span><span className="font-bold">{detail.pemohon.nama_lengkap}</span></div>
              <div className="flex justify-between"><span className="opacity-50">NIK Pemohon</span><span className="font-mono">{detail.pemohon.nik}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Diajukan oleh</span><span className="font-bold">{detail.diajukan_oleh.nama_lengkap}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Tanggal Pengajuan</span><span>{formatTanggal(detail.tanggal_pengajuan)}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Status</span><StatusBadge label={detail.status} variant={getStatusVariant(detail.status)} /></div>
              {detail.nomor_surat && <div className="flex justify-between"><span className="opacity-50">Nomor Surat</span><span className="font-mono font-bold">{detail.nomor_surat}</span></div>}
              <div><span className="opacity-50 block mb-1">Keperluan</span><p className="p-2 rounded" style={{ background: "var(--surface-hover)" }}>{detail.keperluan}</p></div>
              {detail.catatan_admin && <div><span className="opacity-50 block mb-1">Catatan Admin</span><p className="p-2 rounded" style={{ background: "var(--surface-hover)" }}>{detail.catatan_admin}</p></div>}
              {detail.berkas_lampiran && detail.berkas_lampiran.length > 0 && (
                <div><span className="opacity-50 block mb-1">Berkas Lampiran</span>
                  <div className="flex flex-wrap gap-1">{detail.berkas_lampiran.map((f, i) => (
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
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: actionForm.action === "terima" ? "#16a34a" : "#dc2626" }}>
              <h3 className="text-sm font-bold text-white">{actionForm.action === "terima" ? "Setujui Pengajuan" : "Tolak Pengajuan"}</h3>
            </div>
            <div className="p-5 space-y-4">
              {actionForm.action === "terima" && (
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>Nomor Surat (opsional)</label>
                  <input type="text" value={nomorSurat} onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Contoh: 140/50/KT/V/2025"
                    className="w-full px-3 py-2 rounded border text-xs"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>Catatan</label>
                <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  rows={3} placeholder={actionForm.action === "terima" ? "Surat telah selesai diproses." : "Alasan penolakan..."}
                  className="w-full px-3 py-2 rounded border text-xs resize-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setActionForm(null)} className="px-4 py-2 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Batal</button>
              <button onClick={() => handleAction(actionForm.id, actionForm.action)}
                className="px-4 py-2 rounded text-xs font-bold text-white"
                style={{ background: actionForm.action === "terima" ? "#16a34a" : "#dc2626" }}>
                {actionForm.action === "terima" ? "Setujui" : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

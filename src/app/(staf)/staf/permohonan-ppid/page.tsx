"use client";

import { useState } from "react";
import { BookOpen, Search, Filter, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";
import type { StatusPermohonan } from "@/core/types";

const STATUS_FILTER: { value: StatusPermohonan | "Semua"; label: string }[] = [
  { value: "Semua", label: "Semua" },
  { value: "Dikirim", label: "Dikirim" },
  { value: "Diproses", label: "Diproses" },
  { value: "Dijawab", label: "Dijawab" },
  { value: "Ditolak", label: "Ditolak" },
];

function getStatusVariant(status: StatusPermohonan) {
  switch (status) {
    case "Dijawab": return "success" as const;
    case "Diproses": return "info" as const;
    case "Ditolak": return "danger" as const;
    default: return "warning" as const;
  }
}

export default function StafPermohonanPpidPage() {
  const { permohonanList, updatePermohonanStatus, refreshNotifikasi } = useServiceData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusPermohonan | "Semua">("Semua");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionForm, setActionForm] = useState<{ id: string; action: "proses" | "jawab" | "tolak" } | null>(null);
  const [catatan, setCatatan] = useState("");
  const [fileBalasan, setFileBalasan] = useState<File | null>(null);

  const filtered = permohonanList.filter((p) => {
    if (statusFilter !== "Semua" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.nama_pemohon.toLowerCase().includes(q) ||
        p.informasi_diminta.toLowerCase().includes(q) ||
        p.nomor_permohonan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAction = async (id: string, action: "proses" | "jawab" | "tolak") => {
    const statusMap: Record<string, StatusPermohonan> = {
      proses: "Diproses",
      jawab: "Dijawab",
      tolak: "Ditolak",
    };
    const status = statusMap[action];
    const file = action === "jawab" && fileBalasan ? fileBalasan : undefined;
    try {
      await updatePermohonanStatus(id, status, catatan || undefined, file);
      refreshNotifikasi();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memperbarui status permohonan.");
    }
    setActionForm(null);
    setCatatan("");
    setFileBalasan(null);
  };

  const detail = detailId ? permohonanList.find((p) => p.id === detailId) : null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black flex items-center gap-2" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          <BookOpen size={22} style={{ color: "#2563eb" }} />
          Permohonan Informasi (PPID)
        </h1>
        <p className="text-sm opacity-50 mt-1">Kelola permohonan informasi publik dari masyarakat</p>
      </div>

      {/* Filter & Search */}
      <div className="govt-card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: "var(--foreground)" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pemohon, informasi yang diminta, atau nomor permohonan..."
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Baru", count: permohonanList.filter((p) => p.status === "Dikirim").length, color: "#d97706" },
          { label: "Diproses", count: permohonanList.filter((p) => p.status === "Diproses").length, color: "#2563eb" },
          { label: "Dijawab", count: permohonanList.filter((p) => p.status === "Dijawab").length, color: "#16a34a" },
          { label: "Ditolak", count: permohonanList.filter((p) => p.status === "Ditolak").length, color: "#dc2626" },
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
            <BookOpen size={36} className="mx-auto mb-3 opacity-15" />
            <p className="text-sm font-bold opacity-40">Tidak ada permohonan ditemukan.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((p) => (
              <div key={p.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono opacity-40">{p.nomor_permohonan}</span>
                  </div>
                  <p className="text-xs font-bold truncate">{p.informasi_diminta}</p>
                  <p className="text-[11px] opacity-50 mt-1">
                    {p.nama_pemohon} · {formatDate(p.tanggal_permohonan)}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 flex-wrap">
                  <StatusBadge label={p.status} variant={getStatusVariant(p.status)} />
                  <button onClick={() => setDetailId(p.id)}
                    className="p-2 rounded border hover:border-primary transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }} title="Lihat Detail">
                    <Eye size={14} />
                  </button>
                  {p.status === "Dikirim" && (
                    <button onClick={() => { setActionForm({ id: p.id, action: "proses" }); setCatatan(""); }}
                      className="px-3 py-1.5 rounded text-[11px] font-bold" style={{ background: "#2563eb", color: "#fff" }}>
                      Proses
                    </button>
                  )}
                  {p.status === "Diproses" && (
                    <>
                      <button onClick={() => { setActionForm({ id: p.id, action: "jawab" }); setCatatan(""); setFileBalasan(null); }}
                        className="px-3 py-1.5 rounded text-[11px] font-bold" style={{ background: "#16a34a", color: "#fff" }}>
                        Jawab
                      </button>
                      <button onClick={() => { setActionForm({ id: p.id, action: "tolak" }); setCatatan(""); }}
                        className="px-3 py-1.5 rounded text-[11px] font-bold" style={{ background: "#dc2626", color: "#fff" }}>
                        Tolak
                      </button>
                    </>
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
              <h3 className="text-sm font-bold">Detail Permohonan</h3>
              <button onClick={() => setDetailId(null)} className="p-1" style={{ color: "var(--foreground)" }}>✕</button>
            </div>
            <div className="p-5 space-y-3 text-xs" style={{ color: "var(--foreground)" }}>
              <div className="flex justify-between"><span className="opacity-50">Nomor</span><span className="font-bold">{detail.nomor_permohonan}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Pemohon</span><span className="font-bold">{detail.nama_pemohon}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Alamat</span><span>{detail.alamat_pemohon}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Kontak</span><span className="font-mono">{detail.kontak_pemohon}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Tanggal</span><span>{formatDate(detail.tanggal_permohonan)}</span></div>
              <div className="flex justify-between"><span className="opacity-50">Status</span><StatusBadge label={detail.status} variant={getStatusVariant(detail.status)} /></div>
              <div><span className="opacity-50 block mb-1">Tujuan Permohonan</span><p className="p-2 rounded" style={{ background: "var(--surface-hover)" }}>{detail.tujuan_permohonan}</p></div>
              <div><span className="opacity-50 block mb-1">Informasi yang Diminta</span><p className="p-2 rounded" style={{ background: "var(--surface-hover)" }}>{detail.informasi_diminta}</p></div>
              {detail.catatan_admin && <div><span className="opacity-50 block mb-1">Catatan</span><p className="p-2 rounded" style={{ background: "var(--surface-hover)" }}>{detail.catatan_admin}</p></div>}
              {detail.lampiran.length > 0 && (
                <div><span className="opacity-50 block mb-1">Lampiran Pemohon</span>
                  <div className="flex flex-wrap gap-1">{detail.lampiran.map((f, i) => (
                    <span key={i} className="px-2 py-1 rounded text-[10px] font-mono" style={{ background: "var(--surface-hover)" }}>{f}</span>
                  ))}</div>
                </div>
              )}
              {detail.file_balasan && detail.file_balasan.length > 0 && (
                <div><span className="opacity-50 block mb-1">File Balasan</span>
                  <div className="flex flex-wrap gap-1">{detail.file_balasan.map((f, i) => (
                    <span key={i} className="px-2 py-1 rounded text-[10px] font-mono font-bold" style={{ background: "#dbeafe", color: "#1e40af" }}>{f}</span>
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
            <div className="px-5 py-4 border-b" style={{
              borderColor: "var(--border)",
              background: actionForm.action === "jawab" ? "#16a34a" : actionForm.action === "tolak" ? "#dc2626" : "#2563eb",
            }}>
              <h3 className="text-sm font-bold text-white">
                {actionForm.action === "jawab" ? "Jawab Permohonan" : actionForm.action === "tolak" ? "Tolak Permohonan" : "Proses Permohonan"}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>Catatan</label>
                <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)}
                  rows={3} placeholder={actionForm.action === "tolak" ? "Alasan penolakan..." : "Catatan untuk pemohon..."}
                  className="w-full px-3 py-2 rounded border text-xs resize-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
              </div>
              {actionForm.action === "jawab" && (
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>File Balasan</label>
                  <input type="file" onChange={(e) => setFileBalasan(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 rounded border text-xs"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                  {fileBalasan && <p className="text-[10px] mt-1" style={{ color: "#16a34a" }}>1 file dipilih: {fileBalasan.name}</p>}
                  <p className="text-[10px] opacity-40 mt-1" style={{ color: "var(--foreground)" }}>Pilih file balasan untuk pemohon.</p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setActionForm(null)} className="px-4 py-2 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Batal</button>
              <button onClick={() => handleAction(actionForm.id, actionForm.action)}
                className="px-4 py-2 rounded text-xs font-bold text-white"
                style={{ background: actionForm.action === "jawab" ? "#16a34a" : actionForm.action === "tolak" ? "#dc2626" : "#2563eb" }}>
                {actionForm.action === "jawab" ? "Kirim Jawaban" : actionForm.action === "tolak" ? "Tolak" : "Proses"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

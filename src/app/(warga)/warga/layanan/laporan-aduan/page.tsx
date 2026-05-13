"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Home, ChevronRight, ArrowLeft, ClipboardList, Send, AlertCircle,
  Clock, Loader2, CheckCircle, ChevronDown, MapPin, User, Phone,
  Hash, Calendar, MessageSquare, FileText, Filter, Search, X,
  Shield, Eye,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge, LoadingState, EmptyState } from "@/components/ui";
import Timeline from "@/components/ui/Timeline";
import FileUpload from "@/components/ui/FileUpload";
import { KATEGORI_LAPORAN_OPTIONS } from "@/core/constants/appConstants";
import { post } from "@/core/api/client";
import type { LaporanAduan, KategoriLaporan, StatusLaporan } from "@/core/types";

const STATUS_STYLE: Record<StatusLaporan, { variant: "success" | "warning" | "info"; color: string; icon: typeof Clock }> = {
  Dikirim: { variant: "warning", color: "#d97706", icon: Clock },
  Ditindaklanjuti: { variant: "info", color: "#2563eb", icon: Loader2 },
  Selesai: { variant: "success", color: "#16a34a", icon: CheckCircle },
};

function getTimelineSteps(status: StatusLaporan) {
  const steps = [
    { label: "Laporan Dikirim", status: "Dikirim" as const },
    { label: "Ditindaklanjuti", status: "Ditindaklanjuti" as const },
    { label: "Selesai", status: "Selesai" as const },
  ];
  const currentIdx = steps.findIndex((s) => s.status === status);
  return steps.map((s, i) => ({
    label: s.label,
    status: i <= currentIdx ? ("done" as const) : ("pending" as const),
  }));
}

interface FormData {
  kategori: KategoriLaporan | "";
  nama: string;
  alamat: string;
  kontak: string;
  deskripsi: string;
  lokasi: string;
}

const INITIAL_FORM: FormData = { kategori: "", nama: "", alamat: "", kontak: "", deskripsi: "", lokasi: "" };

export default function LaporanAduanPage() {
  const { user } = useAuth();
  const { getLaporanForUser, refreshLaporan, refreshNotifikasi } = useServiceData();
  const laporanList = getLaporanForUser(user?.role || "warga", user?.id, user?.nik);
  const [tab, setTab] = useState<"list" | "form">("list");
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [files, setFiles] = useState<string[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ nomor: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusLaporan | "">("");
  const [searchQ, setSearchQ] = useState("");

  // Prefill user data
  const prefillForm = () => {
    setForm({
      ...INITIAL_FORM,
      nama: user?.nama_lengkap || "",
      alamat: user?.alamat || "Dukuh Krajan RT 02/RW 01, Desa Karangtalun",
      kontak: user?.telepon || "081234567890",
    });
    setFiles([]);
    setFileObjects([]);
    setErrors({});
    setSubmitted(null);
    setTab("form");
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.kategori) e.kategori = "Pilih kategori laporan";
    if (!form.nama.trim()) e.nama = "Nama wajib diisi";
    if (!form.alamat.trim()) e.alamat = "Alamat wajib diisi";
    if (!form.kontak.trim()) e.kontak = "Kontak wajib diisi";
    else if (!/^0\d{9,12}$/.test(form.kontak.replace(/[\s-]/g, ""))) e.kontak = "Format nomor HP tidak valid";
    if (!form.deskripsi.trim()) e.deskripsi = "Deskripsi wajib diisi";
    else if (form.deskripsi.trim().length < 20) e.deskripsi = "Deskripsi minimal 20 karakter";
    if (!form.lokasi.trim()) e.lokasi = "Lokasi kejadian wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      let res: { success: boolean; data: LaporanAduan; message: string };

      if (fileObjects.length > 0) {
        const fd = new FormData();
        fd.append("kategori", form.kategori);
        fd.append("nama_pelapor", form.nama);
        fd.append("alamat_pelapor", form.alamat);
        fd.append("kontak_pelapor", form.kontak);
        fd.append("deskripsi", form.deskripsi);
        fd.append("lokasi_kejadian", form.lokasi);
        fileObjects.forEach(f => fd.append("lampiran[]", f));

        const { upload: apiUpload } = await import("@/core/api/client");
        res = await apiUpload<{ success: boolean; data: LaporanAduan; message: string }>("/warga/laporan", fd);
      } else {
        res = await post<{ success: boolean; data: LaporanAduan; message: string }>("/warga/laporan", {
          kategori: form.kategori,
          nama_pelapor: form.nama,
          alamat_pelapor: form.alamat,
          kontak_pelapor: form.kontak,
          deskripsi: form.deskripsi,
          lokasi_kejadian: form.lokasi,
        });
      }

      if (res.success && res.data) {
        refreshLaporan();
        refreshNotifikasi();
        setSubmitted({ nomor: res.data.nomor_tiket || "-" });
      } else {
        alert(res.message || "Gagal mengirim laporan.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const Field = ({ label, field, type = "text", placeholder, rows }: {
    label: string; field: keyof FormData; type?: string; placeholder?: string; rows?: number;
  }) => (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider opacity-60 block mb-1.5">{label} *</label>
      {rows ? (
        <textarea value={form[field]} onChange={(e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: undefined }); }}
          placeholder={placeholder} rows={rows}
          className="w-full px-3 py-2.5 rounded border text-xs outline-none transition-colors resize-none"
          style={{ background: "var(--surface)", borderColor: errors[field] ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />
      ) : (
        <input type={type} value={form[field]} onChange={(e) => { setForm({ ...form, [field]: e.target.value }); setErrors({ ...errors, [field]: undefined }); }}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded border text-xs outline-none transition-colors"
          style={{ background: "var(--surface)", borderColor: errors[field] ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />
      )}
      {errors[field] && <p className="text-[10px] mt-1 font-medium" style={{ color: "#dc2626" }}>{errors[field]}</p>}
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] mb-5" style={{ color: "var(--foreground)" }}>
        <Link href="/warga/dashboard" className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <Home size={11} /> Dashboard
        </Link>
        <ChevronRight size={10} className="opacity-30" />
        <span className="opacity-50">Layanan</span>
        <ChevronRight size={10} className="opacity-30" />
        <span className="font-bold" style={{ color: "var(--primary)" }}>Laporan / Aduan</span>
      </nav>

      <Link href="/warga/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold mb-4 transition-colors" style={{ color: "var(--primary)" }}>
        <ArrowLeft size={14} /> Kembali ke Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Laporan / Aduan
          </h1>
          <p className="text-sm opacity-60 mt-1">Sampaikan laporan atau aduan terkait desa</p>
        </div>
        {tab === "list" ? (
          <button onClick={prefillForm}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold transition-all"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Send size={14} /> Buat Laporan Baru
          </button>
        ) : (
          <button onClick={() => { setTab("list"); setSubmitted(null); }}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold transition-all"
            style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
            <ClipboardList size={14} /> Lihat Daftar
          </button>
        )}
      </div>

      {/* Tab Buttons Mobile */}
      <div className="sm:hidden flex gap-2 mb-4">
        <button onClick={() => { setTab("list"); setSubmitted(null); }}
          className="flex-1 text-xs font-bold py-2.5 rounded transition-colors"
          style={{ background: tab === "list" ? "var(--primary)" : "var(--surface)", color: tab === "list" ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>
          Daftar Laporan
        </button>
        <button onClick={prefillForm}
          className="flex-1 text-xs font-bold py-2.5 rounded transition-colors"
          style={{ background: tab === "form" ? "var(--primary)" : "var(--surface)", color: tab === "form" ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>
          Buat Laporan
        </button>
      </div>

      {/* ─── FORM TAB ─── */}
      {tab === "form" && !submitted && (
        <div className="govt-card p-5 lg:p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: "#dc262615", color: "#dc2626" }}>
              <ClipboardList size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Formulir Laporan / Aduan</h2>
              <p className="text-[11px] opacity-50">Isi data di bawah ini dengan lengkap</p>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider opacity-60 block mb-2">Kategori Laporan *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {KATEGORI_LAPORAN_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => { setForm({ ...form, kategori: opt.value as KategoriLaporan }); setErrors({ ...errors, kategori: undefined }); }}
                  className="text-left p-3 rounded border transition-all"
                  style={{
                    borderColor: form.kategori === opt.value ? "var(--primary)" : errors.kategori ? "#dc2626" : "var(--border)",
                    background: form.kategori === opt.value ? "var(--accent-light)" : "var(--surface)",
                  }}>
                  <p className="text-xs font-bold" style={{ color: form.kategori === opt.value ? "var(--primary)" : "var(--foreground)" }}>{opt.label}</p>
                  <p className="text-[10px] opacity-50 mt-0.5">{opt.deskripsi}</p>
                </button>
              ))}
            </div>
            {errors.kategori && <p className="text-[10px] mt-1 font-medium" style={{ color: "#dc2626" }}>{errors.kategori}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Pelapor" field="nama" placeholder="Nama lengkap" />
            <Field label="Kontak (No. HP)" field="kontak" placeholder="081234567890" type="tel" />
          </div>
          <Field label="Alamat Pelapor" field="alamat" placeholder="Alamat lengkap" />
          <Field label="Lokasi Kejadian" field="lokasi" placeholder="Lokasi spesifik kejadian/masalah" />
          <Field label="Deskripsi Laporan" field="deskripsi" placeholder="Jelaskan secara detail (min. 20 karakter)..." rows={5} />

          {/* File Upload */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider opacity-60 block mb-2">Lampiran (Opsional)</label>
            <FileUpload
              files={files}
              onUpload={(f) => setFiles([...files, f])}
              onFileSelect={(file) => setFileObjects(prev => [...prev, file])}
              onRemove={(f) => {
                const idx = files.indexOf(f);
                setFiles(files.filter((x) => x !== f));
                if (idx >= 0) setFileObjects(prev => prev.filter((_, i) => i !== idx));
              }}
              label="Klik atau seret foto / dokumen pendukung"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => { setTab("list"); setSubmitted(null); }}
              className="px-4 py-2.5 rounded text-xs font-bold"
              style={{ color: "var(--foreground)", background: "var(--surface-hover)" }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded text-xs font-bold transition-all"
              style={{ background: submitting ? "var(--border)" : "var(--primary)", color: "#fff", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Mengirim...</> : <><Send size={14} /> Kirim Laporan</>}
            </button>
          </div>
        </div>
      )}

      {/* ─── SUCCESS ─── */}
      {tab === "form" && submitted && (
        <div className="govt-card p-8 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#16a34a20", color: "#16a34a" }}>
            <CheckCircle size={32} />
          </div>
          <h2 className="text-lg font-black mb-2" style={{ color: "var(--foreground)" }}>Laporan Berhasil Dikirim!</h2>
          <p className="text-sm opacity-60 mb-1">Nomor tiket laporan Anda:</p>
          <p className="text-xl font-black font-mono mb-4" style={{ color: "var(--primary)" }}>{submitted.nomor}</p>
          <p className="text-xs opacity-50 max-w-md mx-auto mb-6">
            Simpan nomor tiket ini untuk memantau status laporan Anda. Petugas desa akan menindaklanjuti laporan Anda sesegera mungkin.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => { setTab("list"); setSubmitted(null); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold"
              style={{ background: "var(--primary)", color: "#fff" }}>
              <Eye size={14} /> Lihat Daftar Laporan
            </button>
            <button onClick={prefillForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold"
              style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>
              <Send size={14} /> Buat Laporan Lagi
            </button>
          </div>
        </div>
      )}

      {/* ─── LIST TAB ─── */}
      {tab === "list" && (
        <>
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Cari laporan..."
                className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none"
                style={{ background: "var(--surface)", borderColor: searchQ ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }} />
              {searchQ && (
                <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={12} style={{ color: "var(--foreground)", opacity: 0.4 }} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {(["", "Dikirim", "Ditindaklanjuti", "Selesai"] as (StatusLaporan | "")[]).map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className="text-[11px] font-bold px-3 py-2 rounded transition-colors"
                  style={{
                    background: filterStatus === s ? "var(--primary)" : "var(--surface)",
                    color: filterStatus === s ? "#fff" : "var(--foreground)",
                    border: "1px solid var(--border)",
                  }}>
                  {s || "Semua"}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="govt-card p-12 text-center">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold opacity-50 mb-3">
                {searchQ || filterStatus ? "Tidak ditemukan laporan sesuai filter." : "Belum ada laporan / aduan."}
              </p>
              <button onClick={prefillForm}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded"
                style={{ background: "var(--primary)", color: "#fff" }}>
                <Send size={14} /> Buat Laporan Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((lap) => {
                const st = STATUS_STYLE[lap.status];
                const isExpanded = expandedId === lap.id;

                return (
                  <div key={lap.id} className="govt-card overflow-hidden">
                    <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpandedId(isExpanded ? null : lap.id)}>
                      <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: `${st.color}15`, color: st.color }}>
                        <st.icon size={18} className={lap.status === "Ditindaklanjuti" ? "animate-spin" : ""} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                          {KATEGORI_LAPORAN_OPTIONS.find((k) => k.value === lap.kategori)?.label || lap.kategori}
                        </p>
                        <p className="text-[11px] opacity-50 mt-0.5 truncate">
                          {lap.nomor_tiket} · {lap.nama_pelapor} · {new Date(lap.tanggal_laporan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <StatusBadge label={lap.status} variant={st.variant} />
                      <ChevronDown size={16} className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--foreground)", opacity: 0.3 }} />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
                        {/* Timeline */}
                        <div className="mt-4">
                          <Timeline steps={getTimelineSteps(lap.status)} variant="horizontal" />
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                          <DetailRow icon={Hash} label="Nomor Tiket" value={lap.nomor_tiket} />
                          <DetailRow icon={User} label="Pelapor" value={lap.nama_pelapor} />
                          <DetailRow icon={Phone} label="Kontak" value={lap.kontak_pelapor} />
                          <DetailRow icon={MapPin} label="Alamat" value={lap.alamat_pelapor} />
                          <DetailRow icon={MapPin} label="Lokasi Kejadian" value={lap.lokasi_kejadian} />
                          <DetailRow icon={Calendar} label="Tanggal Laporan" value={new Date(lap.tanggal_laporan).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                        </div>

                        <div className="p-3 rounded" style={{ background: "var(--surface-hover)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Deskripsi</p>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>{lap.deskripsi}</p>
                        </div>

                        {lap.catatan_admin && (
                          <div className="p-3 rounded flex items-start gap-2" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
                            <MessageSquare size={14} className="shrink-0 mt-0.5" style={{ color: "#2563eb" }} />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#1e40af" }}>Catatan Petugas</p>
                              <p className="text-xs" style={{ color: "#1e40af" }}>{lap.catatan_admin}</p>
                            </div>
                          </div>
                        )}

                        {lap.lampiran.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Lampiran</p>
                            <div className="flex flex-wrap gap-2">
                              {lap.lampiran.map((f, i) => (
                                <span key={i} className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1"
                                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                                  <FileText size={10} /> {f}
                                </span>
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
        </>
      )}

      {/* Mobile FAB */}
      {tab === "list" && (
        <button onClick={prefillForm}
          className="sm:hidden fixed bottom-20 right-4 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "#dc2626", color: "#fff" }}>
          <Send size={20} />
        </button>
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

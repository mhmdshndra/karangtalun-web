"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Home, ChevronRight, ArrowLeft, Search, Send, AlertCircle,
  Clock, Loader2, CheckCircle, XCircle, ChevronDown, User, Phone,
  Hash, Calendar, MessageSquare, FileText, X, Eye, Download,
  Info, BookOpen,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { StatusBadge } from "@/components/ui";
import Timeline from "@/components/ui/Timeline";
import FileUpload from "@/components/ui/FileUpload";
import { post } from "@/core/api/client";
import type { PermohonanInformasi, StatusPermohonan } from "@/core/types";

const STATUS_STYLE: Record<StatusPermohonan, { variant: "success" | "warning" | "info" | "danger"; color: string; icon: typeof Clock }> = {
  Dikirim: { variant: "warning", color: "#d97706", icon: Clock },
  Diproses: { variant: "info", color: "#2563eb", icon: Loader2 },
  Dijawab: { variant: "success", color: "#16a34a", icon: CheckCircle },
  Ditolak: { variant: "danger", color: "#dc2626", icon: XCircle },
};

function getTimelineSteps(status: StatusPermohonan) {
  const isDitolak = status === "Ditolak";
  const steps = [
    { label: "Permohonan Dikirim", status: "Dikirim" as const },
    { label: "Sedang Diproses", status: "Diproses" as const },
    { label: "Informasi Dijawab", status: "Dijawab" as const },
  ];
  const currentIdx = isDitolak ? 1 : steps.findIndex((s) => s.status === status);
  return steps.map((s, i) => ({
    label: isDitolak && i === 1 ? "Ditolak" : s.label,
    status: isDitolak && i === 1
      ? ("rejected" as const)
      : !isDitolak && i <= currentIdx
        ? ("done" as const)
        : ("pending" as const),
  }));
}

interface FormData {
  nama: string;
  alamat: string;
  kontak: string;
  tujuan: string;
  informasi: string;
}

const INITIAL_FORM: FormData = { nama: "", alamat: "", kontak: "", tujuan: "", informasi: "" };

export default function PermohonanInformasiPage() {
  const { user } = useAuth();
  const { getPermohonanForUser, refreshPermohonan, refreshNotifikasi } = useServiceData();
  const permohonanList = getPermohonanForUser(user?.role || "warga", user?.id, user?.nik);
  const [tab, setTab] = useState<"list" | "form">("list");
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [files, setFiles] = useState<string[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ nomor: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusPermohonan | "">("");
  const [searchQ, setSearchQ] = useState("");

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
    if (!form.nama.trim()) e.nama = "Nama wajib diisi";
    if (!form.alamat.trim()) e.alamat = "Alamat wajib diisi";
    if (!form.kontak.trim()) e.kontak = "Kontak wajib diisi";
    else if (!/^0\d{9,12}$/.test(form.kontak.replace(/[\s-]/g, ""))) e.kontak = "Format nomor HP tidak valid";
    if (!form.tujuan.trim()) e.tujuan = "Tujuan permohonan wajib diisi";
    if (!form.informasi.trim()) e.informasi = "Informasi yang diminta wajib diisi";
    else if (form.informasi.trim().length < 10) e.informasi = "Minimal 10 karakter";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      let res: { success: boolean; data: PermohonanInformasi; message: string };

      if (fileObjects.length > 0) {
        const fd = new FormData();
        fd.append("nama_pemohon", form.nama);
        fd.append("alamat_pemohon", form.alamat);
        fd.append("kontak_pemohon", form.kontak);
        fd.append("tujuan_permohonan", form.tujuan);
        fd.append("informasi_diminta", form.informasi);
        fileObjects.forEach(f => fd.append("lampiran[]", f));

        const { upload: apiUpload } = await import("@/core/api/client");
        res = await apiUpload<typeof res>("/warga/permohonan", fd);
      } else {
        res = await post<typeof res>("/warga/permohonan", {
          nama_pemohon: form.nama,
          alamat_pemohon: form.alamat,
          kontak_pemohon: form.kontak,
          tujuan_permohonan: form.tujuan,
          informasi_diminta: form.informasi,
        });
      }

      if (res.success && res.data) {
        refreshPermohonan();
        refreshNotifikasi();
        setSubmitted({ nomor: res.data.nomor_permohonan || "-" });
      } else {
        alert(res.message || "Gagal mengirim permohonan.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadFile = (filename: string) => {
    // Open file URL from backend storage
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:8000";
    window.open(`${apiBase}/storage/${filename}`, "_blank");
  };

  const filtered = useMemo(() => {
    let result = permohonanList;
    if (filterStatus) result = result.filter((p) => p.status === filterStatus);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter(
        (p) => p.nomor_permohonan.toLowerCase().includes(q) || p.informasi_diminta.toLowerCase().includes(q) ||
          p.nama_pemohon.toLowerCase().includes(q) || p.tujuan_permohonan.toLowerCase().includes(q)
      );
    }
    return result;
  }, [permohonanList, filterStatus, searchQ]);

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
        <span className="font-bold" style={{ color: "var(--primary)" }}>Permohonan Informasi PPID</span>
      </nav>

      <Link href="/warga/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold mb-4 transition-colors" style={{ color: "var(--primary)" }}>
        <ArrowLeft size={14} /> Kembali ke Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            Permohonan Informasi
          </h1>
          <p className="text-sm opacity-60 mt-1">PPID — Pejabat Pengelola Informasi & Dokumentasi</p>
        </div>
        {tab === "list" ? (
          <button onClick={prefillForm}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <Send size={14} /> Buat Permohonan
          </button>
        ) : (
          <button onClick={() => { setTab("list"); setSubmitted(null); }}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold"
            style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
            <BookOpen size={14} /> Lihat Daftar
          </button>
        )}
      </div>

      {/* Mobile Tab Toggle */}
      <div className="sm:hidden flex gap-2 mb-4">
        <button onClick={() => { setTab("list"); setSubmitted(null); }}
          className="flex-1 text-xs font-bold py-2.5 rounded"
          style={{ background: tab === "list" ? "var(--primary)" : "var(--surface)", color: tab === "list" ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>
          Daftar
        </button>
        <button onClick={prefillForm}
          className="flex-1 text-xs font-bold py-2.5 rounded"
          style={{ background: tab === "form" ? "var(--primary)" : "var(--surface)", color: tab === "form" ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>
          Buat Permohonan
        </button>
      </div>

      {/* Info Banner */}
      {tab === "form" && !submitted && (
        <div className="govt-card p-4 mb-4 flex items-start gap-3" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
          <Info size={16} className="shrink-0 mt-0.5" style={{ color: "#2563eb" }} />
          <div>
            <p className="text-xs font-bold" style={{ color: "#1e40af" }}>Keterbukaan Informasi Publik</p>
            <p className="text-[11px] mt-0.5" style={{ color: "#1e40af", opacity: 0.8 }}>
              Berdasarkan UU No. 14 Tahun 2008, setiap warga berhak memperoleh informasi publik. PPID Desa akan merespons permohonan Anda dalam waktu 10 hari kerja.
            </p>
          </div>
        </div>
      )}

      {/* ─── FORM ─── */}
      {tab === "form" && !submitted && (
        <div className="govt-card p-5 lg:p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Formulir Permohonan Informasi</h2>
              <p className="text-[11px] opacity-50">Isi data di bawah ini dengan lengkap</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nama Pemohon" field="nama" placeholder="Nama lengkap" />
            <Field label="Kontak (No. HP)" field="kontak" placeholder="081234567890" type="tel" />
          </div>
          <Field label="Alamat Pemohon" field="alamat" placeholder="Alamat lengkap" />
          <Field label="Tujuan Permohonan" field="tujuan" placeholder="Jelaskan tujuan Anda meminta informasi ini" rows={3} />
          <Field label="Informasi yang Diminta" field="informasi" placeholder="Deskripsikan informasi yang Anda butuhkan secara spesifik (min. 10 karakter)" rows={4} />

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider opacity-60 block mb-2">Lampiran Pendukung (Opsional)</label>
            <FileUpload
              files={files}
              onUpload={(f) => setFiles([...files, f])}
              onFileSelect={(file) => setFileObjects(prev => [...prev, file])}
              onRemove={(f) => {
                const idx = files.indexOf(f);
                setFiles(files.filter((x) => x !== f));
                if (idx >= 0) setFileObjects(prev => prev.filter((_, i) => i !== idx));
              }}
              label="Surat pengantar, proposal, atau dokumen pendukung"
            />
          </div>

          <div className="pt-4 border-t flex items-center justify-end gap-3" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => { setTab("list"); setSubmitted(null); }}
              className="px-4 py-2.5 rounded text-xs font-bold"
              style={{ color: "var(--foreground)", background: "var(--surface-hover)" }}>
              Batal
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded text-xs font-bold transition-all"
              style={{ background: submitting ? "var(--border)" : "var(--primary)", color: "#fff", cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Mengirim...</> : <><Send size={14} /> Kirim Permohonan</>}
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
          <h2 className="text-lg font-black mb-2" style={{ color: "var(--foreground)" }}>Permohonan Berhasil Dikirim!</h2>
          <p className="text-sm opacity-60 mb-1">Nomor permohonan Anda:</p>
          <p className="text-xl font-black font-mono mb-4" style={{ color: "var(--primary)" }}>{submitted.nomor}</p>
          <p className="text-xs opacity-50 max-w-md mx-auto mb-6">
            PPID Desa akan memproses permohonan Anda dalam waktu maksimal 10 hari kerja. Pantau status di daftar permohonan.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => { setTab("list"); setSubmitted(null); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold"
              style={{ background: "var(--primary)", color: "#fff" }}>
              <Eye size={14} /> Lihat Daftar
            </button>
            <button onClick={prefillForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold"
              style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>
              <Send size={14} /> Buat Lagi
            </button>
          </div>
        </div>
      )}

      {/* ─── LIST ─── */}
      {tab === "list" && (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
              <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Cari permohonan..."
                className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none"
                style={{ background: "var(--surface)", borderColor: searchQ ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }} />
              {searchQ && (
                <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={12} style={{ color: "var(--foreground)", opacity: 0.4 }} />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["", "Dikirim", "Diproses", "Dijawab", "Ditolak"] as (StatusPermohonan | "")[]).map((s) => (
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
              <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold opacity-50 mb-3">
                {searchQ || filterStatus ? "Tidak ditemukan permohonan sesuai filter." : "Belum ada permohonan informasi."}
              </p>
              <button onClick={prefillForm}
                className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded"
                style={{ background: "var(--primary)", color: "#fff" }}>
                <Send size={14} /> Buat Permohonan Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((prm) => {
                const st = STATUS_STYLE[prm.status];
                const isExpanded = expandedId === prm.id;

                return (
                  <div key={prm.id} className="govt-card overflow-hidden">
                    <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={() => setExpandedId(isExpanded ? null : prm.id)}>
                      <div className="w-10 h-10 rounded flex items-center justify-center shrink-0" style={{ background: `${st.color}15`, color: st.color }}>
                        <st.icon size={18} className={prm.status === "Diproses" ? "animate-spin" : ""} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{prm.informasi_diminta}</p>
                        <p className="text-[11px] opacity-50 mt-0.5">
                          {prm.nomor_permohonan} · {prm.nama_pemohon} · {new Date(prm.tanggal_permohonan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <StatusBadge label={prm.status} variant={st.variant} />
                      <ChevronDown size={16} className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--foreground)", opacity: 0.3 }} />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
                        <div className="mt-4">
                          <Timeline steps={getTimelineSteps(prm.status)} variant="horizontal" />
                        </div>

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
                          <div className="p-3 rounded flex items-start gap-2"
                            style={{
                              background: prm.status === "Ditolak" ? "#fee2e2" : "#dbeafe",
                              border: `1px solid ${prm.status === "Ditolak" ? "#fca5a5" : "#93c5fd"}`,
                            }}>
                            <MessageSquare size={14} className="shrink-0 mt-0.5" style={{ color: prm.status === "Ditolak" ? "#dc2626" : "#2563eb" }} />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                                style={{ color: prm.status === "Ditolak" ? "#991b1b" : "#1e40af" }}>
                                Catatan PPID
                              </p>
                              <p className="text-xs" style={{ color: prm.status === "Ditolak" ? "#991b1b" : "#1e40af" }}>{prm.catatan_admin}</p>
                            </div>
                          </div>
                        )}

                        {prm.lampiran.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Lampiran Pemohon</p>
                            <div className="flex flex-wrap gap-2">
                              {prm.lampiran.map((f, i) => (
                                <span key={i} className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1"
                                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                                  <FileText size={10} /> {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* File Balasan */}
                        {prm.file_balasan && prm.file_balasan.length > 0 && (
                          <div className="p-4 rounded" style={{ background: "#f0fdf4", border: "1px solid #86efac" }}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#166534" }}>
                              File Balasan dari PPID
                            </p>
                            <div className="space-y-2">
                              {prm.file_balasan.map((f, i) => (
                                <button key={i} onClick={() => handleDownloadFile(f)}
                                  className="w-full flex items-center gap-3 p-2.5 rounded text-left transition-colors"
                                  style={{ background: "#dcfce7", color: "#166534" }}>
                                  <Download size={14} />
                                  <span className="text-xs font-bold flex-1">{f}</span>
                                  <span className="text-[10px] opacity-50">Unduh</span>
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
        </>
      )}

      {/* Mobile FAB */}
      {tab === "list" && (
        <button onClick={prefillForm}
          className="sm:hidden fixed bottom-20 right-4 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "var(--primary)", color: "#fff" }}>
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

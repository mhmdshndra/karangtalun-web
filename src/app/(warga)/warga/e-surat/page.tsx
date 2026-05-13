"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  FileText, User, ChevronDown, CheckCircle, AlertCircle,
  Send, ArrowLeft, Info, Loader2, ShieldCheck,
  Home, ChevronRight, RotateCcw, Eye, Shield, X,
  Printer, Download, Edit3, Clock,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { post } from "@/core/api/client";
import { StatusBadge } from "@/components/ui";
import FileUpload from "@/components/ui/FileUpload";
import {
  JENIS_SURAT_OPTIONS,
} from "@/core/constants/appConstants";
import { hitungUmur, formatTanggal } from "@/core/utils/helpers";
import type { JenisSurat, PengajuanSurat } from "@/core/types";

type Step = "pilih_anggota" | "isi_form" | "preview" | "sukses";

export default function ESuratPage() {
  const { user, kk: kkData } = useAuth();
  const { refreshSurat, refreshNotifikasi } = useServiceData();
  const [step, setStep] = useState<Step>("pilih_anggota");

  const [selectedNik, setSelectedNik] = useState("");
  const [jenisSurat, setJenisSurat] = useState<JenisSurat | "">("");
  const [keperluan, setKeperluan] = useState("");
  const [lampiran, setLampiran] = useState<string[]>([]);
  const [lampiranFiles, setLampiranFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ tiket: string; label: string; nama: string; pengaju: string; id: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [searchAnggota, setSearchAnggota] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const kk = kkData;
  const allAnggota = kk?.anggota ?? [];
  const selectedAnggota = kk?.anggota.find((a) => a.nik === selectedNik);
  const selectedJenis = JENIS_SURAT_OPTIONS.find((j) => j.value === jenisSurat);

  const filteredAnggota = useMemo(() => {
    if (!searchAnggota.trim()) return allAnggota;
    const q = searchAnggota.toLowerCase();
    return allAnggota.filter(
      (a) => a.nama_lengkap.toLowerCase().includes(q) || a.status_hubungan.toLowerCase().includes(q)
    );
  }, [allAnggota, searchAnggota]);

  if (!user || !kk) return null;

  const handleSelectAnggota = (nik: string) => {
    setSelectedNik(nik);
    setStep("isi_form");
    setErrors({});
    setDropdownOpen(false);
    setSearchAnggota("");
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!selectedNik) e.anggota = "Pilih anggota KK terlebih dahulu.";
    if (!jenisSurat) e.jenisSurat = "Pilih jenis surat terlebih dahulu.";
    if (!keperluan.trim()) e.keperluan = "Keperluan wajib diisi.";
    else if (keperluan.trim().length < 10) e.keperluan = "Keperluan minimal 10 karakter.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePreview = () => {
    if (validate()) setStep("preview");
  };

  const handleSubmit = async () => {
    if (!selectedAnggota || !selectedJenis) return;
    setSubmitting(true);

    try {
      let res: { success: boolean; data: PengajuanSurat; message: string };

      if (lampiranFiles.length > 0) {
        // Use FormData for file upload
        const fd = new FormData();
        fd.append("jenis_surat", jenisSurat as string);
        fd.append("pemohon_nik", selectedAnggota.nik);
        fd.append("keperluan", keperluan.trim());
        lampiranFiles.forEach(f => fd.append("berkas[]", f));

        const { upload: apiUpload } = await import("@/core/api/client");
        res = await apiUpload<{ success: boolean; data: PengajuanSurat; message: string }>("/warga/surat", fd);
      } else {
        res = await post<{ success: boolean; data: PengajuanSurat; message: string }>("/warga/surat", {
          jenis_surat: jenisSurat as JenisSurat,
          pemohon_nik: selectedAnggota.nik,
          keperluan: keperluan.trim(),
        });
      }

      if (res.success && res.data) {
        // Use backend-returned data (includes server-generated ID and nomor_tiket)
        refreshSurat();
        refreshNotifikasi();

        setResult({
          tiket: res.data.nomor_tiket || "-",
          label: selectedJenis.label,
          nama: selectedAnggota.nama_lengkap,
          pengaju: user.nama_lengkap,
          id: res.data.id,
        });
        setStep("sukses");
      } else {
        alert(res.message || "Gagal mengirim pengajuan surat.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim pengajuan.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep("pilih_anggota");
    setSelectedNik("");
    setJenisSurat("");
    setKeperluan("");
    setLampiran([]);
    setResult(null);
    setErrors({});
    setSearchAnggota("");
    setDropdownOpen(false);
  };

  const handlePrintPreview = () => {
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w || !selectedAnggota || !selectedJenis) return;
    const isMinor = hitungUmur(selectedAnggota.tanggal_lahir) < 17;
    w.document.write(`<!DOCTYPE html><html><head><title>Preview - ${selectedJenis.label}</title>
<style>
body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:20px;color:#1a3a6e}
.header{text-align:center;border-bottom:3px double #1a3a6e;padding-bottom:15px;margin-bottom:25px}
.header h1{font-size:16px;margin:5px 0;text-transform:uppercase;letter-spacing:2px}
.header p{font-size:11px;color:#666;margin:2px 0}
.kop{font-size:18px;font-weight:bold;letter-spacing:3px}
.content{font-size:13px;line-height:1.8}
.field{display:flex;margin:6px 0}
.field-label{width:180px;font-weight:bold;flex-shrink:0}
.field-sep{width:20px;text-align:center}
.footer{margin-top:40px;text-align:right;font-size:12px}
.stamp{margin-top:60px;font-size:11px;color:#999;text-align:center}
.minor-note{background:#fef3c7;border:1px solid #fde68a;border-radius:4px;padding:8px 12px;font-size:11px;color:#92400e;margin:10px 0}
@media print{body{margin:20px}}
</style></head><body>
<div class="header">
<p class="kop">PEMERINTAH KABUPATEN SRAGEN</p>
<p style="font-size:12px">KECAMATAN TANON</p>
<h1>DESA KARANGTALUN</h1>
<p>Jl. Raya Tanon-Masaran Km. 2, Karangtalun, Tanon, Sragen 57277</p>
</div>
<div class="content">
<h2 style="text-align:center;font-size:15px;text-decoration:underline;letter-spacing:1px;margin-bottom:20px">${selectedJenis.label.toUpperCase()}</h2>
<p style="text-align:center;font-size:12px;color:#888;margin-top:-15px;margin-bottom:20px">Nomor: ......./......./KT/......./2025</p>
<p>Yang bertanda tangan di bawah ini, Kepala Desa Karangtalun, Kecamatan Tanon, Kabupaten Sragen, menerangkan bahwa:</p>
<div style="margin:15px 0 15px 20px">
<div class="field"><span class="field-label">Nama</span><span class="field-sep">:</span><span>${selectedAnggota.nama_lengkap}</span></div>
<div class="field"><span class="field-label">NIK</span><span class="field-sep">:</span><span>${selectedAnggota.nik}</span></div>
<div class="field"><span class="field-label">Tempat/Tgl Lahir</span><span class="field-sep">:</span><span>${selectedAnggota.tempat_lahir}, ${new Date(selectedAnggota.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
<div class="field"><span class="field-label">Jenis Kelamin</span><span class="field-sep">:</span><span>${selectedAnggota.jenis_kelamin}</span></div>
<div class="field"><span class="field-label">Agama</span><span class="field-sep">:</span><span>${selectedAnggota.agama}</span></div>
<div class="field"><span class="field-label">Pekerjaan</span><span class="field-sep">:</span><span>${selectedAnggota.pekerjaan}</span></div>
<div class="field"><span class="field-label">Alamat</span><span class="field-sep">:</span><span>${kk.alamat} ${kk.rt_rw}, Desa ${kk.kelurahan}, Kec. ${kk.kecamatan}</span></div>
</div>
${isMinor ? `<div class="minor-note">\u26A0 Pemohon di bawah umur (${hitungUmur(selectedAnggota.tanggal_lahir)} tahun). Surat diajukan oleh: <strong>${user.nama_lengkap}</strong> (NIK: ${user.nik}).</div>` : ""}
<p><strong>Keperluan:</strong> ${keperluan}</p>
<p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
</div>
<div class="footer">
<p>Karangtalun, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
<p style="margin-top:5px">Kepala Desa Karangtalun</p>
<p style="margin-top:50px;font-weight:bold;text-decoration:underline">Budi Santoso, S.IP.</p>
<p style="font-size:11px;color:#888">NIP. 19751012 200501 1 004</p>
</div>
<div class="stamp">\u2014 PREVIEW DOKUMEN — SISTEM E-SURAT DESA KARANGTALUN \u2014</div>
</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  const handleDownloadPreview = () => {
    if (!selectedAnggota || !selectedJenis) return;
    // This is a preview only — real surat document will be generated by backend
    alert("Dokumen surat akan tersedia untuk diunduh setelah pengajuan diproses dan disetujui oleh petugas desa.");
  };

  const stepItems = [
    { key: "pilih_anggota", label: "Pilih Pemohon", num: 1 },
    { key: "isi_form", label: "Isi Formulir", num: 2 },
    { key: "preview", label: "Preview", num: 3 },
    { key: "sukses", label: "Selesai", num: 4 },
  ];
  const stepIndex = stepItems.findIndex((s) => s.key === step);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] mb-5" style={{ color: "var(--foreground)" }}>
        <Link href="/warga/dashboard" className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <Home size={11} /> Dashboard
        </Link>
        <ChevronRight size={10} className="opacity-30" />
        <span className={step === "preview" || step === "sukses" ? "opacity-50" : "font-bold"} style={{ color: "var(--primary)" }}>
          Ajukan Surat
        </span>
        {step === "preview" && (
          <><ChevronRight size={10} className="opacity-30" /><span className="font-bold" style={{ color: "var(--primary)" }}>Preview</span></>
        )}
        {step === "sukses" && (
          <><ChevronRight size={10} className="opacity-30" /><span className="font-bold" style={{ color: "var(--primary)" }}>Selesai</span></>
        )}
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
            E-Surat
          </h1>
          <p className="text-sm opacity-60 mt-1">Pengajuan surat keterangan secara digital</p>
        </div>
        {(step === "isi_form" || step === "preview") && (
          <button onClick={handleReset} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded text-xs font-bold" style={{ color: "#dc2626", background: "#fee2e2" }}>
            <RotateCcw size={13} /> Reset Form
          </button>
        )}
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-0 mb-6 w-full">
        {stepItems.map((s, i) => {
          const isCurrent = step === s.key;
          const isDone = i < stepIndex;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                  style={{
                    background: isDone ? "var(--primary)" : isCurrent ? "var(--accent)" : "var(--surface-hover)",
                    color: isDone || isCurrent ? "#fff" : "var(--foreground)",
                    border: `2px solid ${isDone ? "var(--primary)" : isCurrent ? "var(--accent)" : "var(--border)"}`,
                  }}>
                  {isDone ? <CheckCircle size={14} /> : s.num}
                </div>
                <span className="text-[9px] font-bold mt-1 text-center hidden sm:block"
                  style={{ color: isCurrent ? "var(--primary)" : "var(--foreground)", opacity: isCurrent || isDone ? 1 : 0.4 }}>
                  {s.label}
                </span>
              </div>
              {i < stepItems.length - 1 && (
                <div className="flex-1 h-0.5 mx-1" style={{ background: isDone ? "var(--primary)" : "var(--border)" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ════════ STEP 1: PILIH ANGGOTA ════════ */}
      {step === "pilih_anggota" && (
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--border)", background: "var(--primary)", color: "var(--primary-foreground)" }}>
            <h2 className="text-sm font-bold">Surat Dibuat Untuk Siapa?</h2>
            <p className="text-[11px] opacity-70 mt-0.5">No. KK: {kk.no_kk} — Pilih anggota keluarga</p>
          </div>
          <div className="p-5">
            <div className="p-4 rounded mb-4 text-xs" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} style={{ color: "#2563eb" }} />
                <span className="font-bold" style={{ color: "#2563eb" }}>Pengaju Surat</span>
              </div>
              <p>Surat diajukan oleh: <strong>{user.nama_lengkap}</strong> (NIK: {user.nik}). Anda dapat mengajukan surat untuk <strong>semua anggota dalam KK ini</strong>, termasuk anak di bawah 17 tahun.</p>
            </div>

            <div className="p-4 rounded mb-4 text-xs" style={{ background: "var(--accent-light)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} style={{ color: "var(--accent)" }} />
                <span className="font-bold" style={{ color: "var(--accent)" }}>Informasi Kartu Keluarga</span>
              </div>
              <p>Kepala Keluarga: <strong>{kk.kepala_keluarga}</strong></p>
              <p>Alamat: {kk.alamat} {kk.rt_rw}, {kk.kelurahan}, {kk.kecamatan}, {kk.kabupaten}</p>
            </div>

            {/* Dropdown selector */}
            <p className="text-xs font-bold mb-2">Pilih Anggota KK <span className="text-red-500">*</span></p>
            <div className="relative mb-4" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full text-left px-4 py-3 rounded border flex items-center justify-between transition-colors"
                style={{ background: "var(--surface)", borderColor: dropdownOpen ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }}>
                <span className={`text-sm ${selectedNik ? "font-bold" : "opacity-50"}`}>
                  {selectedAnggota ? `${selectedAnggota.nama_lengkap} — ${selectedAnggota.status_hubungan}` : "-- Pilih Anggota Keluarga --"}
                </span>
                <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} style={{ opacity: 0.4 }} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg border shadow-lg overflow-hidden"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                      <input type="text" value={searchAnggota} onChange={(e) => setSearchAnggota(e.target.value)}
                        placeholder="Cari nama anggota..."
                        className="w-full pl-9 pr-3 py-2 rounded border text-xs outline-none"
                        style={{ background: "var(--surface-hover)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        autoFocus />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredAnggota.length === 0 ? (
                      <p className="p-4 text-xs text-center opacity-50">Tidak ditemukan.</p>
                    ) : filteredAnggota.map((a) => {
                      const umur = hitungUmur(a.tanggal_lahir);
                      const isMinor = umur < 17;
                      return (
                        <button key={a.nik} onClick={() => handleSelectAnggota(a.nik)}
                          className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors hover:bg-surface-hover border-b last:border-b-0"
                          style={{ borderColor: "var(--border)", opacity: isMinor ? 0.7 : 1, filter: isMinor ? "grayscale(30%)" : "none" }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: "var(--primary)", color: "#fff" }}>{a.nama_lengkap.charAt(0)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                              {a.nama_lengkap}
                              {isMinor && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                                style={{ background: "#fef3c7", color: "#92400e" }}><Shield size={8} /> minor</span>}
                            </p>
                            <p className="text-[11px] opacity-50">{a.status_hubungan} · {a.jenis_kelamin} · {umur} thn · {a.pekerjaan}</p>
                          </div>
                          <div className="text-[10px] font-bold px-2 py-1 rounded shrink-0"
                            style={{ background: isMinor ? "#fef3c7" : "#dcfce7", color: isMinor ? "#92400e" : "#166534" }}>{umur} thn</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Card list */}
            <p className="text-[10px] uppercase font-bold tracking-wider opacity-40 mb-2">Atau pilih dari daftar:</p>
            <div className="space-y-2">
              {allAnggota.map((a) => {
                const umur = hitungUmur(a.tanggal_lahir);
                const isMinor = umur < 17;
                return (
                  <button key={a.nik} onClick={() => handleSelectAnggota(a.nik)}
                    className="w-full text-left p-4 rounded border transition-all flex items-center gap-4"
                    style={{ borderColor: "var(--border)", background: "var(--surface)", opacity: isMinor ? 0.7 : 1, filter: isMinor ? "grayscale(30%)" : "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{a.nama_lengkap.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                        {a.nama_lengkap}
                        {isMinor && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-0.5"
                          style={{ background: "#fef3c7", color: "#92400e" }}><Shield size={8} /> di bawah 17 tahun</span>}
                      </p>
                      <p className="text-[11px] opacity-50">{a.status_hubungan} · {a.jenis_kelamin} · {umur} tahun · {a.pekerjaan}</p>
                    </div>
                    <div className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: isMinor ? "#fef3c7" : "#dcfce7", color: isMinor ? "#92400e" : "#166534" }}>{umur} thn</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════ STEP 2: ISI FORM ════════ */}
      {step === "isi_form" && selectedAnggota && (
        <div className="space-y-4">
          <button onClick={() => setStep("pilih_anggota")} className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--primary)" }}>
            <ArrowLeft size={14} /> Ganti Pemohon
          </button>

          {selectedAnggota.nik !== user.nik && (
            <div className="p-4 rounded text-xs" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={14} style={{ color: "#2563eb" }} />
                <span className="font-bold" style={{ color: "#2563eb" }}>
                  {hitungUmur(selectedAnggota.tanggal_lahir) < 17 ? "Pemohon di bawah umur — diwakili oleh:" : "Surat diajukan oleh wakil:"}
                </span>
              </div>
              <p>Pengaju: <strong>{user.nama_lengkap}</strong> (NIK: {user.nik}) → Dibuat untuk: <strong>{selectedAnggota.nama_lengkap}</strong> ({selectedAnggota.status_hubungan}, {hitungUmur(selectedAnggota.tanggal_lahir)} thn)</p>
            </div>
          )}

          {/* Pemohon Data */}
          <div className="govt-card overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider">Data Pemohon (Read-only)</h3>
              <div className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#dbeafe", color: "#1e40af" }}>Dari KK</div>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Nama Lengkap", value: selectedAnggota.nama_lengkap },
                { label: "NIK", value: selectedAnggota.nik },
                { label: "Tempat, Tgl Lahir", value: `${selectedAnggota.tempat_lahir}, ${formatTanggal(selectedAnggota.tanggal_lahir)}` },
                { label: "Usia", value: `${hitungUmur(selectedAnggota.tanggal_lahir)} tahun` },
                { label: "Jenis Kelamin", value: selectedAnggota.jenis_kelamin },
                { label: "Agama", value: selectedAnggota.agama },
                { label: "Pekerjaan", value: selectedAnggota.pekerjaan },
                { label: "Status Hubungan", value: selectedAnggota.status_hubungan },
                { label: "Status Perkawinan", value: selectedAnggota.status_perkawinan },
                { label: "Alamat", value: `${kk.alamat} ${kk.rt_rw}, ${kk.kelurahan}, ${kk.kecamatan}` },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">{f.label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formulir */}
          <div className="govt-card overflow-hidden">
            <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider">Formulir Pengajuan</h3>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold mb-1.5">Jenis Surat <span className="text-red-500">*</span></label>
                <select value={jenisSurat}
                  onChange={(e) => { setJenisSurat(e.target.value as JenisSurat); setErrors((p) => ({ ...p, jenisSurat: "" })); }}
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none transition-colors"
                  style={{ background: "var(--surface)", borderColor: errors.jenisSurat ? "#dc2626" : "var(--border)", color: "var(--foreground)" }}>
                  <option value="">-- Pilih Jenis Surat --</option>
                  {JENIS_SURAT_OPTIONS.map((j) => <option key={j.value} value={j.value}>{j.label}</option>)}
                </select>
                {errors.jenisSurat && <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: "#dc2626" }}><AlertCircle size={11} /> {errors.jenisSurat}</p>}
              </div>

              {selectedJenis && (
                <div className="p-4 rounded text-xs space-y-2" style={{ background: "var(--accent-light)", border: "1px solid var(--border)" }}>
                  <p className="font-bold" style={{ color: "var(--accent)" }}>{selectedJenis.label}</p>
                  <p className="opacity-70">{selectedJenis.deskripsi}</p>
                  <p>Estimasi: <strong>{selectedJenis.estimasi}</strong></p>
                  <div>
                    <p className="font-bold mb-1">Persyaratan:</p>
                    <ul className="list-disc list-inside space-y-0.5 opacity-70">
                      {selectedJenis.persyaratan.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1.5">Keperluan / Keterangan <span className="text-red-500">*</span></label>
                <textarea value={keperluan}
                  onChange={(e) => { setKeperluan(e.target.value); setErrors((p) => ({ ...p, keperluan: "" })); }}
                  placeholder="Jelaskan keperluan pengajuan surat ini (min. 10 karakter)..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none resize-none transition-colors"
                  style={{ background: "var(--surface)", borderColor: errors.keperluan ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />
                <div className="flex items-center justify-between mt-1">
                  {errors.keperluan ? <p className="text-[11px] flex items-center gap-1" style={{ color: "#dc2626" }}><AlertCircle size={11} /> {errors.keperluan}</p> : <span />}
                  <span className="text-[10px] opacity-30">{keperluan.length} karakter</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">Berkas Lampiran (Opsional)</label>
                <FileUpload
                  files={lampiran}
                  onUpload={(f) => setLampiran([...lampiran, f])}
                  onFileSelect={(file) => setLampiranFiles(prev => [...prev, file])}
                  onRemove={(f) => {
                    const idx = lampiran.indexOf(f);
                    setLampiran(lampiran.filter((x) => x !== f));
                    if (idx >= 0) setLampiranFiles(prev => prev.filter((_, i) => i !== idx));
                  }}
                  onPreview={(f) => setPreviewFile(f)}
                  label="Klik atau seret file — PDF, JPG, PNG (maks 5MB per file)"
                />
                <div className="mt-2 flex items-start gap-2 text-[10px] opacity-40">
                  <Info size={10} className="shrink-0 mt-0.5" />
                  <span>Format: PDF, JPG, PNG. Maks 5MB per file.</span>
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <button onClick={handleReset} className="flex items-center gap-2 text-xs font-bold sm:hidden" style={{ color: "#dc2626" }}>
                  <RotateCcw size={13} /> Reset
                </button>
                <div className="flex items-center gap-3 ml-auto">
                  <button onClick={() => setStep("pilih_anggota")} className="px-4 py-2.5 rounded text-xs font-bold"
                    style={{ color: "var(--foreground)", background: "var(--surface-hover)" }}>Kembali</button>
                  <button onClick={handlePreview} className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                    <Eye size={14} /> Preview & Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ STEP 3: PREVIEW ════════ */}
      {step === "preview" && selectedAnggota && selectedJenis && (
        <div className="space-y-4">
          <button onClick={() => setStep("isi_form")} className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--primary)" }}>
            <ArrowLeft size={14} /> Kembali Edit
          </button>

          <div className="govt-card overflow-hidden">
            {/* Preview header */}
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--accent-light)" }}>
              <div className="flex items-center gap-2">
                <Eye size={14} style={{ color: "var(--accent)" }} />
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>Preview Pengajuan Surat</h3>
              </div>
              <StatusBadge label="Draft" variant="warning" size="sm" />
            </div>

            {/* KOP */}
            <div className="px-5 pt-6 pb-4 text-center border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-[10px] uppercase tracking-[3px] opacity-50">Pemerintah Kabupaten Sragen · Kecamatan Tanon</p>
              <h2 className="text-base font-black uppercase tracking-wider mt-1" style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}>Desa Karangtalun</h2>
              <p className="text-[10px] opacity-40 mt-0.5">Jl. Raya Tanon-Masaran Km. 2, Karangtalun, Tanon, Sragen 57277</p>
              <div className="w-full h-0.5 mt-3" style={{ background: "var(--primary)" }} />
              <div className="w-full h-px mt-0.5" style={{ background: "var(--primary)", opacity: 0.3 }} />
            </div>

            {/* Letter body */}
            <div className="p-5 lg:p-6">
              <h3 className="text-center text-sm font-bold underline underline-offset-4 uppercase tracking-wider mb-1">{selectedJenis.label}</h3>
              <p className="text-center text-[10px] opacity-40 mb-6">Nomor: ......./......./KT/......./2025</p>

              <div className="space-y-2 text-sm mb-5">
                {[
                  { label: "Nama", value: selectedAnggota.nama_lengkap },
                  { label: "NIK", value: selectedAnggota.nik },
                  { label: "Tempat/Tgl Lahir", value: `${selectedAnggota.tempat_lahir}, ${formatTanggal(selectedAnggota.tanggal_lahir)}` },
                  { label: "Jenis Kelamin", value: selectedAnggota.jenis_kelamin },
                  { label: "Pekerjaan", value: selectedAnggota.pekerjaan },
                  { label: "Alamat", value: `${kk.alamat} ${kk.rt_rw}, Desa ${kk.kelurahan}, Kec. ${kk.kecamatan}` },
                ].map((f) => (
                  <div key={f.label} className="flex gap-2">
                    <span className="w-36 shrink-0 font-bold opacity-60">{f.label}</span>
                    <span className="opacity-40">:</span>
                    <span>{f.value}</span>
                  </div>
                ))}
              </div>

              {selectedAnggota.nik !== user.nik && (
                <div className="p-3 rounded flex items-center gap-2 mb-4" style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
                  <Shield size={14} style={{ color: "#92400e" }} />
                  <p className="text-xs" style={{ color: "#78350f" }}>
                    <strong>Diajukan oleh:</strong> {user.nama_lengkap} (NIK: {user.nik})
                    {hitungUmur(selectedAnggota.tanggal_lahir) < 17 && " — pemohon di bawah umur"}
                  </p>
                </div>
              )}

              <div className="p-3 rounded mb-4" style={{ background: "var(--surface-hover)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Keperluan</p>
                <p className="text-sm">{keperluan}</p>
              </div>

              <div className="p-3 rounded mb-4" style={{ background: "var(--surface-hover)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Tanggal Pengajuan</p>
                <p className="text-sm">{formatTanggal(new Date().toISOString().split("T")[0])}</p>
              </div>

              {lampiran.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">Berkas Lampiran ({lampiran.length} file)</p>
                  <div className="flex flex-wrap gap-2">
                    {lampiran.map((f, i) => (
                      <span key={i} className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1"
                        style={{ background: "var(--accent-light)", color: "var(--accent)" }}><FileText size={10} /> {f}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded flex items-center gap-2" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <Clock size={14} style={{ color: "#2563eb" }} />
                <p className="text-xs" style={{ color: "#1e40af" }}>Estimasi proses: <strong>{selectedJenis.estimasi}</strong></p>
              </div>
            </div>

            {/* Actions bar */}
            <div className="px-5 py-4 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintPreview} className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold"
                  style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                  <Printer size={12} /> Print Preview
                </button>
                <button onClick={handleDownloadPreview} className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold"
                  style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                  <Download size={12} /> Download Draft
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep("isi_form")} className="flex items-center gap-1.5 px-4 py-2.5 rounded text-xs font-bold"
                  style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                  <Edit3 size={12} /> Edit
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded text-xs font-bold transition-all"
                  style={{ background: submitting ? "var(--border)" : "var(--primary)", color: "#fff", cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Mengirim...</> : <><Send size={14} /> Kirim Pengajuan</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════ STEP 4: SUKSES ════════ */}
      {step === "sukses" && result && (
        <div className="govt-card overflow-hidden text-center">
          <div className="p-8 lg:p-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#dcfce7" }}>
              <CheckCircle size={32} style={{ color: "#16a34a" }} />
            </div>
            <h2 className="text-xl font-black mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Pengajuan Berhasil!</h2>
            <p className="text-sm opacity-60 mb-6">Pengajuan surat Anda telah diterima dan akan segera diproses oleh petugas desa.</p>

            <div className="inline-block p-5 rounded mb-6" style={{ background: "var(--accent-light)", border: "1px solid var(--border)" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Nomor Tiket</p>
              <p className="text-2xl font-black font-mono" style={{ color: "var(--primary)" }}>{result.tiket}</p>
              <p className="text-xs mt-2 opacity-70">{result.label} — a.n. {result.nama}</p>
              {result.pengaju !== result.nama && <p className="text-[11px] mt-1 opacity-50">Diajukan oleh: {result.pengaju}</p>}
            </div>

            <p className="text-xs opacity-50 mb-6">Simpan nomor tiket ini untuk memantau status pengajuan Anda di halaman Riwayat Pengajuan.</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/warga/riwayat/${result.id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                <Eye size={16} /> Lihat Detail
              </Link>
              <Link href="/warga/riwayat"
                className="flex items-center gap-2 px-5 py-2.5 rounded border text-sm font-bold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <FileText size={16} /> Riwayat Pengajuan
              </Link>
              <button onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded border text-sm font-bold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                <Send size={16} /> Ajukan Surat Lain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <>
          <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setPreviewFile(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg rounded-lg shadow-2xl overflow-hidden"
            style={{ background: "var(--surface)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-sm font-bold truncate">{previewFile}</h3>
              <button onClick={() => setPreviewFile(null)}><X size={18} style={{ color: "var(--foreground)", opacity: 0.4 }} /></button>
            </div>
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-lg mx-auto mb-4 flex items-center justify-center" style={{ background: "var(--surface-hover)" }}>
                <FileText size={32} className="opacity-30" />
              </div>
              <p className="text-xs font-bold mb-1">Preview Surat</p>
              <p className="text-[11px] opacity-40">Pada implementasi nyata, file akan ditampilkan di viewer.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

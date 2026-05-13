"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock, Banknote, CheckCircle, ListOrdered, FileText,
  MapPin, AlertCircle, Download, LogIn, ArrowRight, Shield,
} from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { FormField } from "@/components/ui";
import { useAuth } from "@/core/context/AuthContext";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { publicPost } from "@/core/api/client";
import { validateNIK, validatePhone, validateEmail, validateText, validateTextarea, validateSelect, validateFile } from "@/core/utils/validation";
import TurnstileWidget, { useTurnstileToken, requireTurnstileToken } from "@/components/security/TurnstileWidget";
import { useSubmitGuard } from "@/core/utils/useSubmitGuard";
import type { LayananPublik, KategoriLaporan } from "@/core/types";

interface LayananFormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "textarea" | "select" | "file";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
  accept?: string;
}

interface LayananDetailPageProps {
  layanan: LayananPublik;
  formFields: LayananFormField[];
  formTitle?: string;
  formDescription?: string;
  hasGps?: boolean;
  /** True for 4 surat desa: form lives in /warga/e-surat, not inline */
  isSuratDesa?: boolean;
}

interface FormState {
  [key: string]: string | File | null;
}

export default function LayananDetailPage({
  layanan,
  formFields,
  formTitle = "Formulir Pengajuan",
  formDescription,
  hasGps = false,
  isSuratDesa = false,
}: LayananDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { refreshLaporan, refreshNotifikasi } = useServiceData();
  const [formData, setFormData] = useState<FormState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { token: cfToken, setToken: setCfToken, reset: resetCf, resetRef: cfResetRef } = useTurnstileToken();
  const { canSubmit } = useSubmitGuard();
  const [submitted, setSubmitted] = useState(false);
  const [nomorTicket, setNomorTicket] = useState("");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [gpsCoords, setGpsCoords] = useState("");

  const handleChange = (name: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    formFields.forEach((f) => {
      const val = formData[f.name];

      // ── File fields: use validateFile() ──
      if (f.type === "file") {
        const file = val instanceof File ? val : null;
        const maxSize = f.helpText?.match(/(\d+)\s*MB/i);
        const err = validateFile(file, f.label, {
          required: !!f.required,
          maxSizeMB: maxSize ? parseInt(maxSize[1]) : 5,
        });
        if (err) { newErrors[f.name] = err; }
        return;
      }

      const strVal = typeof val === "string" ? val.trim() : "";

      // Required check (for non-specific field types handled below)
      if (f.required && (!val || strVal === "")) {
        // Don't add generic "wajib diisi" if specific validator will handle it
        const isSpecific = f.name.includes("nik") || f.type === "tel" || f.name === "no_hp" || f.name.includes("telepon") || f.type === "select";
        if (!isSpecific) {
          newErrors[f.name] = `${f.label} wajib diisi.`;
          return;
        }
      }

      // NIK fields
      if (f.name === "nik" || f.name.includes("nik")) {
        const err = validateNIK(strVal);
        if (err) { newErrors[f.name] = err; return; }
      }

      // Phone fields
      if (f.type === "tel" || f.name === "no_hp" || f.name.includes("telepon")) {
        const err = validatePhone(strVal);
        if (err) { newErrors[f.name] = err; return; }
      }

      // Email fields
      if (f.type === "email") {
        const err = f.required
          ? (strVal ? validateEmail(strVal) : `${f.label} wajib diisi.`)
          : validateEmail(strVal);
        if (err) { newErrors[f.name] = err; return; }
      }

      // Select fields
      if (f.type === "select" && f.required) {
        const err = validateSelect(strVal, f.label);
        if (err) { newErrors[f.name] = err; return; }
      }

      // Skip further checks if empty and not required
      if (!strVal) return;

      // Textarea: minimum length for description fields
      if (f.type === "textarea") {
        const isDescField = ["deskripsi", "kronologi", "deskripsi_kerusakan", "alamat", "lokasi_kerusakan", "lokasi_kejadian"].some(
          (key) => f.name.includes(key)
        );
        if (isDescField) {
          const err = validateTextarea(strVal, f.label, 10);
          if (err) { newErrors[f.name] = err; return; }
        }
      }

      // Name fields: minimum 3 chars
      if (f.name.includes("nama") && f.type === "text") {
        const err = validateText(strVal, f.label, 3);
        if (err) { newErrors[f.name] = err; return; }
      }
    });
    return newErrors;
  };

  const handleGps = () => {
    if (!navigator.geolocation) { setGpsStatus("error"); return; }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
        setGpsCoords(coords);
        setFormData((prev) => ({ ...prev, lokasi_gps: coords }));
        setGpsStatus("done");
      },
      () => setGpsStatus("error")
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const cfErr = requireTurnstileToken(cfToken);
    if (cfErr) {
      setErrors({ _turnstile: cfErr });
      return;
    }
    // Token included in payload — backend will verify cf_turnstile_token
    setLoading(true);

    try {
      const kategoriMap: Record<string, KategoriLaporan> = {
        "lapor-infrastruktur": "infrastruktur",
        "lapor-kamtibmas": "kamtibmas",
        "lapor-umum": "umum",
      };
      const kategori = kategoriMap[layanan.id] || "umum";
      const namaP = (formData.nama_pelapor as string) || "Anonim";
      const alamatP = (formData.alamat_pelapor as string) || (formData.lokasi_kerusakan as string) || "-";
      const kontakP = (formData.no_hp as string) || "-";
      const deskripsiP = (formData.deskripsi as string) || (formData.deskripsi_kerusakan as string) || "-";
      const lokasiP = (formData.lokasi as string) || (formData.lokasi_kerusakan as string) || gpsCoords || "-";

      // Collect any File objects from formData
      const fileEntries = Object.values(formData).filter((v): v is File => v instanceof File);

      let res: { success: boolean; data: { nomor_tiket: string }; message: string };

      if (fileEntries.length > 0) {
        const fd = new FormData();
        fd.append("kategori", kategori);
        fd.append("nama_pelapor", namaP);
        fd.append("alamat_pelapor", alamatP);
        fd.append("kontak_pelapor", kontakP);
        fd.append("deskripsi", deskripsiP);
        fd.append("lokasi_kejadian", lokasiP);
        fd.append("cf_turnstile_token", cfToken);
        if (gpsCoords) fd.append("lokasi_gps", gpsCoords);
        fileEntries.forEach(f => fd.append("lampiran[]", f));

        const { publicUpload } = await import("@/core/api/client");
        res = await publicUpload<typeof res>("/laporan", fd);
      } else {
        res = await publicPost<typeof res>("/laporan", {
          kategori,
          nama_pelapor: namaP,
          alamat_pelapor: alamatP,
          kontak_pelapor: kontakP,
          deskripsi: deskripsiP,
          lokasi_kejadian: lokasiP,
          cf_turnstile_token: cfToken,
        });
      }

      if (res.success && res.data) {
        refreshLaporan();
        refreshNotifikasi();
        setNomorTicket(res.data.nomor_tiket || "-");
        setSubmitted(true);
      } else {
        alert(res.message || "Gagal mengirim laporan.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
      resetCf();
    } finally {
      setLoading(false);
    }
  };

  /* ─── Sukses Screen (laporan/aduan only) ─── */
  if (submitted && !isSuratDesa) {
    return (
      <>
        <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Layanan & Aduan", href: "/layanan" }, { label: layanan.nama }]} />
        <section style={{ padding: "4rem 1rem", background: "var(--background)" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", color: "#16a34a" }}>
              <CheckCircle size={40} />
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem" }}>
              Permohonan Terkirim
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
              Permohonan <strong>{layanan.nama}</strong> Anda telah berhasil dikirim dan sedang dalam proses verifikasi oleh perangkat desa.
            </p>
            <div className="govt-card" style={{ padding: "1.5rem", marginBottom: "2rem", textAlign: "left" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Nomor Tiket Pengajuan</p>
              <p style={{ fontFamily: "monospace", fontSize: "1.25rem", fontWeight: 700, color: "#1a3a6e", letterSpacing: "0.05em", marginBottom: "1rem" }}>{nomorTicket}</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Simpan nomor tiket ini untuk memantau status permohonan Anda. Estimasi: <strong>{layanan.estimasiWaktu}</strong>.
              </p>
            </div>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => {
                const text = `Nomor Tiket: ${nomorTicket}\nLayanan: ${layanan.nama}\nEstimasi: ${layanan.estimasiWaktu}`;
                navigator.clipboard?.writeText(text);
                const btn = document.activeElement as HTMLButtonElement;
                if (btn) { const orig = btn.textContent; btn.textContent = "✓ Tersalin!"; setTimeout(() => { btn.textContent = orig; }, 2000); }
              }} style={{ padding: "0.75rem 1.5rem", borderRadius: 8, border: "1.5px solid #1a3a6e", background: "transparent", color: "#1a3a6e", fontWeight: 600, cursor: "pointer" }}>
                Salin Nomor Tiket
              </button>
              <Link href="/layanan">
                <button style={{ padding: "0.75rem 1.5rem", borderRadius: 8, border: "none", background: "#1a3a6e", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  Kembali ke Layanan
                </button>
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ─── CTA for Surat Desa (instead of inline form) — ROLE-AWARE ─── */
  const getSuratCTAConfig = () => {
    if (!user) {
      return {
        href: "/login",
        label: "Masuk untuk Mengajukan",
        icon: <LogIn size={18} />,
        bg: "#b8860b",
        description: `Pengajuan ${layanan.nama} dilakukan melalui portal warga. Anda perlu masuk dengan akun warga untuk mengakses formulir pengajuan e-surat.`,
        footnote: "Belum punya akun? Daftar terlebih dahulu.",
        title: "Ajukan Surat Secara Online",
      };
    }
    if (user.role === "warga") {
      return {
        href: "/warga/e-surat",
        label: "Ajukan Surat",
        icon: <ArrowRight size={18} />,
        bg: "#1a3a6e",
        description: `Pengajuan ${layanan.nama} dilakukan melalui portal warga. Klik tombol di bawah untuk mengisi formulir e-surat Anda.`,
        footnote: "Anda akan diarahkan ke halaman E-Surat.",
        title: "Ajukan Surat Secara Online",
      };
    }
    if (user.role === "admin_desa") {
      return {
        href: "/admin/pengajuan-surat",
        label: "Kelola Pengajuan Surat",
        icon: <ArrowRight size={18} />,
        bg: "#dc2626",
        description: `Anda masuk sebagai Admin Desa. Untuk mengelola pengajuan ${layanan.nama}, silakan akses halaman Pengajuan Surat di dashboard admin.`,
        footnote: "Anda akan diarahkan ke dashboard Admin Desa.",
        title: "Kelola Surat — Admin Desa",
      };
    }
    // staf_layanan
    return {
      href: "/staf/pengajuan-surat",
      label: "Kelola Pengajuan Surat",
      icon: <ArrowRight size={18} />,
      bg: "#2563eb",
      description: `Anda masuk sebagai Staf Layanan. Untuk memproses pengajuan ${layanan.nama}, silakan akses halaman Pengajuan Surat di dashboard staf.`,
      footnote: "Anda akan diarahkan ke dashboard Staf Layanan.",
      title: "Kelola Surat — Staf Layanan",
    };
  };

  const renderSuratCTA = () => {
    const cta = getSuratCTAConfig();
    return (
      <div className="govt-card" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: "#1a3a6e" }}>
          <FileText size={28} />
        </div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
          {cta.title}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: 400, margin: "0 auto 1.5rem" }}>
          {cta.description}
        </p>
        {user && (user.role === "admin_desa" || user.role === "staf_layanan") && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.35rem 0.85rem", borderRadius: 4, marginBottom: "1rem",
            fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
            background: user.role === "admin_desa" ? "#fef2f2" : "#eff6ff",
            color: user.role === "admin_desa" ? "#dc2626" : "#2563eb",
          }}>
            <Shield size={12} />
            Masuk sebagai {user.role === "admin_desa" ? "Admin Desa" : "Staf Layanan"}
          </div>
        )}
        <Link href={cta.href}>
          <button style={{ padding: "0.875rem 2rem", borderRadius: 8, border: "none", background: cta.bg, color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            {cta.icon} {cta.label}
          </button>
        </Link>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "1rem", opacity: 0.6 }}>
          {cta.footnote}
        </p>
      </div>
    );
  };

  /* ─── Inline Form for Laporan/Aduan ─── */
  const renderForm = () => (
    <div className="govt-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>{formTitle}</h2>
      {formDescription && <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{formDescription}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {formFields.map((field) => (
          <FormField
            key={field.name} name={field.name} label={field.label} type={field.type}
            placeholder={field.placeholder}
            options={field.options?.map((o) => ({ value: o, label: o }))}
            required={field.required} hint={field.helpText}
            value={field.type !== "file" ? (typeof formData[field.name] === "string" ? (formData[field.name] as string) : "") : undefined}
            onChange={field.type !== "file" ? (e) => handleChange(field.name, e.target.value) : undefined}
            onFileSelect={field.type === "file" ? (file) => handleChange(field.name, file) : undefined}
            selectedFile={field.type === "file" ? (formData[field.name] instanceof File ? (formData[field.name] as File) : null) : undefined}
            accept={field.accept || (field.type === "file" ? ".pdf,.jpg,.jpeg,.png" : undefined)}
            error={!!errors[field.name]} errorMessage={errors[field.name]}
          />
        ))}
        {hasGps && (
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.4rem" }}>Lokasi (GPS)</label>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input type="text" readOnly value={gpsCoords} placeholder="Klik tombol untuk ambil koordinat GPS"
                style={{ flex: 1, padding: "0.625rem 0.875rem", border: "1.5px solid var(--border)", borderRadius: 6, background: "var(--surface)", color: "var(--text-primary)", fontSize: "0.875rem" }} />
              <button onClick={handleGps} disabled={gpsStatus === "loading"}
                style={{ padding: "0.625rem 1rem", borderRadius: 6, border: "none", background: "#1a3a6e", color: "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap" }}>
                <MapPin size={14} />{gpsStatus === "loading" ? "Mencari..." : "Ambil GPS"}
              </button>
            </div>
            {gpsStatus === "error" && <p style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "0.25rem" }}>Gagal mendapatkan lokasi.</p>}
            {gpsStatus === "done" && <p style={{ fontSize: "0.8rem", color: "#16a34a", marginTop: "0.25rem" }}>✓ Koordinat berhasil diambil.</p>}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", padding: "0.875rem 1rem", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
        <AlertCircle size={16} style={{ color: "#b8860b", flexShrink: 0 }} />
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Data yang Anda kirimkan hanya digunakan untuk keperluan administrasi desa dan dijaga kerahasiaannya.
        </p>
      </div>
      <TurnstileWidget onToken={setCfToken} resetRef={cfResetRef} />
      {errors._turnstile && (
        <p style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "0.25rem" }}>{errors._turnstile}</p>
      )}
      <button onClick={handleSubmit} disabled={loading}
        style={{ marginTop: "1.5rem", width: "100%", padding: "0.875rem", borderRadius: 8, border: "none", background: loading ? "#9ca3af" : "#1a3a6e", color: "#fff", fontWeight: 700, fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
        {loading ? "Mengirim Permohonan..." : "Kirim Permohonan"}
      </button>
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Beranda", href: "/" }, { label: "Layanan & Aduan", href: "/layanan" }, { label: layanan.nama }]} />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a3a6e 0%, #0f2347 100%)", padding: "2.5rem 1rem", color: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#b8860b", fontWeight: 600, marginBottom: "0.5rem" }}>Layanan Publik</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(1.25rem, 3vw, 2rem)", fontWeight: 700, marginBottom: "0.5rem" }}>{layanan.nama}</h1>
          <p style={{ opacity: 0.85, maxWidth: 600, lineHeight: 1.6 }}>{layanan.deskripsi}</p>
          <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
              <Clock size={16} style={{ color: "#b8860b" }} />
              <span>Estimasi: <strong>{layanan.estimasiWaktu}</strong></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
              <Banknote size={16} style={{ color: "#b8860b" }} />
              <span>Biaya: <strong>{layanan.biaya}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section style={{ padding: "3rem 1rem", background: "var(--background)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr min(380px, 100%)", gap: "2rem", alignItems: "start" }}>
          {/* Left: Form or CTA */}
          <div>
            {isSuratDesa ? renderSuratCTA() : renderForm()}
          </div>

          {/* Right: Info sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Persyaratan */}
            <div className="govt-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                <FileText size={16} style={{ color: "#1a3a6e" }} /> Persyaratan
              </h3>
              <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
                {layanan.persyaratan.map((p, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.5rem" }}>{p}</li>
                ))}
              </ol>
              <button onClick={() => {
                const text = `PERSYARATAN ${layanan.nama.toUpperCase()}\n\n${layanan.persyaratan.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;
                const blob = new Blob([text], { type: "text/plain" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                a.download = `persyaratan-${layanan.id}.txt`; a.click();
              }} style={{ marginTop: "1rem", width: "100%", padding: "0.6rem", borderRadius: 6, border: "1.5px solid #1a3a6e", background: "transparent", color: "#1a3a6e", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <Download size={14} /> Unduh Daftar Persyaratan
              </button>
            </div>

            {/* Prosedur */}
            <div className="govt-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                <ListOrdered size={16} style={{ color: "#1a3a6e" }} /> Prosedur
              </h3>
              <ol style={{ paddingLeft: "1.25rem", margin: 0 }}>
                {layanan.prosedur.map((p, i) => (
                  <li key={i} style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "0.5rem" }}>{p}</li>
                ))}
              </ol>
            </div>

            {/* Back link */}
            <Link href="/layanan" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#1a3a6e", fontSize: "0.875rem", fontWeight: 600, padding: "0.75rem", borderRadius: 8, border: "1.5px solid var(--border)", justifyContent: "center" }}>
                ← Kembali ke Daftar Layanan
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

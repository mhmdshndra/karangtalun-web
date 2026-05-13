"use client";

import { useState } from "react";
import { MessageSquareText, CheckCircle } from "lucide-react";
import Link from "next/link";
import PpidPageLayout from "@/components/ppid/PpidPageLayout";
import { FormField } from "@/components/ui/index";
import { useServiceData } from "@/core/context/ServiceDataContext";
import { useAuth } from "@/core/context/AuthContext";
import { publicPost } from "@/core/api/client";
import {
  validateNIK,
  validatePhone,
  validateEmail,
  validateText,
  validateTextarea,
  validateSelect,
  validateFile,
} from "@/core/utils/validation";
import TurnstileWidget, { useTurnstileToken, requireTurnstileToken } from "@/components/security/TurnstileWidget";
import { useSubmitGuard } from "@/core/utils/useSubmitGuard";

function FormPermohonan() {
  const { refreshPermohonan, refreshNotifikasi } = useServiceData();
  const { user } = useAuth();
  const [form, setForm] = useState({
    nama: "", nik: "", alamat: "", telepon: "", email: "",
    jenis_informasi: "", alasan: "",
  });
  const [fileLampiran, setFileLampiran] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nomorPrm, setNomorPrm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { token: cfToken, setToken: setCfToken, reset: resetCf, resetRef: cfResetRef } = useTurnstileToken();
  const { canSubmit } = useSubmitGuard();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const errNama = validateText(form.nama, "Nama lengkap", 3);
    if (errNama) newErrors.nama = errNama;

    const errNik = validateNIK(form.nik);
    if (errNik) newErrors.nik = errNik;

    const errAlamat = validateTextarea(form.alamat, "Alamat lengkap", 10);
    if (errAlamat) newErrors.alamat = errAlamat;

    const errTelepon = validatePhone(form.telepon);
    if (errTelepon) newErrors.telepon = errTelepon;

    const errEmail = validateEmail(form.email);
    if (errEmail) newErrors.email = errEmail;

    const errJenis = validateSelect(form.jenis_informasi, "Jenis informasi");
    if (errJenis) newErrors.jenis_informasi = errJenis;

    const errAlasan = validateTextarea(form.alasan, "Alasan permohonan", 20);
    if (errAlasan) newErrors.alasan = errAlasan;

    // Optional file validation (if a file is selected, validate it)
    const errFile = validateFile(fileLampiran, "Dokumen pendukung", { required: false, maxSizeMB: 5 });
    if (errFile) newErrors.file_lampiran = errFile;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    if (!validate()) return;
    const cfErr = requireTurnstileToken(cfToken);
    if (cfErr) {
      setErrors((p) => ({ ...p, _turnstile: cfErr }));
      return;
    }
    setLoading(true);

    try {
      let res: { success: boolean; data: { nomor_permohonan: string }; message: string };

      if (fileLampiran) {
        const fd = new FormData();
        fd.append("nama_pemohon", form.nama);
        fd.append("alamat_pemohon", form.alamat);
        fd.append("kontak_pemohon", form.telepon);
        fd.append("tujuan_permohonan", form.alasan);
        fd.append("informasi_diminta", form.jenis_informasi);
        fd.append("cf_turnstile_token", cfToken);
        fd.append("lampiran[]", fileLampiran);

        const { publicUpload } = await import("@/core/api/client");
        res = await publicUpload<typeof res>("/ppid/permohonan", fd);
      } else {
        res = await publicPost<typeof res>("/ppid/permohonan", {
          nama_pemohon: form.nama,
          alamat_pemohon: form.alamat,
          kontak_pemohon: form.telepon,
          tujuan_permohonan: form.alasan,
          informasi_diminta: form.jenis_informasi,
          cf_turnstile_token: cfToken,
        });
      }

      if (res.success && res.data) {
        refreshPermohonan();
        refreshNotifikasi();
        setNomorPrm(res.data.nomor_permohonan || "-");
        setSubmitted(true);
      } else {
        alert(res.message || "Gagal mengirim permohonan.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
      resetCf();
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "#dcfce7" }}
        >
          <CheckCircle size={28} style={{ color: "#166534" }} />
        </div>
        <h3 className="text-xl font-black mb-2" style={{ color: "var(--foreground)" }}>
          Permohonan Terkirim!
        </h3>
        <p className="text-sm opacity-60 mb-6" style={{ color: "var(--foreground)" }}>
          Permohonan Anda telah diterima. PPID akan merespons dalam 10 hari kerja.
        </p>
        <div
          className="inline-block p-4 rounded-sm text-left mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-bold mb-2" style={{ color: "var(--foreground)" }}>Nomor Permohonan:</p>
          <p className="font-mono font-black text-lg" style={{ color: "var(--primary, #1a3a6e)" }}>
            {nomorPrm}
          </p>
        </div>
        <br />
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          <button
            onClick={() => {
              const text = `Nomor Permohonan: ${nomorPrm}\nLayanan: Permohonan Informasi PPID\nStatus: Dikirim`;
              navigator.clipboard?.writeText(text);
            }}
            className="px-6 py-3 text-sm font-bold rounded-sm border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            Salin Nomor
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setNomorPrm("");
              setFileLampiran(null);
              setForm({ nama: "", nik: "", alamat: "", telepon: "", email: "", jenis_informasi: "", alasan: "" });
            }}
            className="px-6 py-3 text-sm font-bold rounded-sm"
            style={{ background: "var(--primary, #1a3a6e)", color: "white" }}
          >
            Buat Permohonan Baru
          </button>
          <Link
            href="/ppid"
            className="px-6 py-3 text-sm font-bold rounded-sm border"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
              textDecoration: "none",
            }}
          >
            Kembali ke PPID
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Nama Lengkap" name="nama" value={form.nama} onChange={handleChange} required error={!!errors.nama} errorMessage={errors.nama} placeholder="Masukkan nama lengkap" />
        <FormField label="NIK" name="nik" value={form.nik} onChange={handleChange} required error={!!errors.nik} errorMessage={errors.nik} placeholder="16 digit NIK" hint="Nomor Induk Kependudukan sesuai KTP" />
      </div>
      <FormField label="Alamat Lengkap" name="alamat" type="textarea" value={form.alamat} onChange={handleChange} required error={!!errors.alamat} errorMessage={errors.alamat} rows={2} placeholder="Masukkan alamat lengkap sesuai KTP" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Nomor Telepon" name="telepon" type="tel" value={form.telepon} onChange={handleChange} required error={!!errors.telepon} errorMessage={errors.telepon} placeholder="08xxxxxxxxxx" hint="Format: 08xxxxxxxxxx" />
        <FormField label="Email (Opsional)" name="email" type="email" value={form.email} onChange={handleChange} error={!!errors.email} errorMessage={errors.email} placeholder="email@contoh.com" />
      </div>
      <FormField
        label="Jenis Informasi yang Dimohon"
        name="jenis_informasi"
        type="select"
        value={form.jenis_informasi}
        onChange={handleChange}
        required
        error={!!errors.jenis_informasi}
        errorMessage={errors.jenis_informasi}
        options={[
          { value: "berkala", label: "Informasi Berkala" },
          { value: "serta_merta", label: "Informasi Serta Merta" },
          { value: "setiap_saat", label: "Informasi Setiap Saat" },
          { value: "lainnya", label: "Lainnya" },
        ]}
      />
      <FormField label="Alasan / Tujuan Permohonan" name="alasan" type="textarea" value={form.alasan} onChange={handleChange} required error={!!errors.alasan} errorMessage={errors.alasan} rows={4} placeholder="Jelaskan alasan dan tujuan Anda memohon informasi ini..." hint="Minimal 20 karakter" />

      <FormField
        label="Dokumen Pendukung (Opsional)"
        name="file_lampiran"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onFileSelect={(file) => {
          setFileLampiran(file);
          if (errors.file_lampiran) setErrors((p) => ({ ...p, file_lampiran: "" }));
        }}
        selectedFile={fileLampiran}
        error={!!errors.file_lampiran}
        errorMessage={errors.file_lampiran}
        hint="Lampirkan surat pengantar, proposal, atau dokumen pendukung. Format: PDF/JPG/PNG. Maks. 5MB"
      />

      <div
        className="p-4 rounded-sm text-xs leading-relaxed"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)", opacity: 0.8 }}
      >
        Dengan mengajukan permohonan ini, Anda menyatakan bahwa data yang diisi adalah benar dan Anda memahami ketentuan UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik.
      </div>

      <TurnstileWidget onToken={setCfToken} resetRef={cfResetRef} />
      {errors._turnstile && (
        <p className="text-xs mt-1" style={{ color: "#dc2626" }}>{errors._turnstile}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 font-bold text-sm rounded-sm transition-all"
        style={{
          background: loading ? "#9ca3af" : "var(--primary, #1a3a6e)",
          color: "white",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Mengirim Permohonan..." : "Kirim Permohonan Informasi"}
      </button>
    </div>
  );
}

export default function PermohonanPage() {
  return (
    <PpidPageLayout
      title="Ajukan Permohonan Informasi"
      subtitle="Formulir permohonan akses informasi publik kepada PPID Desa Karangtalun sesuai UU No. 14 Tahun 2008."
      breadcrumbItems={[
        { label: "Beranda", href: "/" },
        { label: "PPID", href: "/ppid" },
        { label: "Permohonan Informasi" },
      ]}
    >
      <div
        className="p-6 md:p-8 rounded-sm"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="text-center mb-8">
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "rgba(26,58,110,0.1)", color: "#1a3a6e",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 0.75rem",
            }}
          >
            <MessageSquareText size={22} />
          </div>
          <h3
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--text-primary, var(--foreground))",
              marginBottom: "0.4rem",
            }}
          >
            Formulir Permohonan Informasi
          </h3>
          <p className="text-xs opacity-60" style={{ color: "var(--foreground)" }}>
            Isi formulir di bawah ini dengan data yang benar dan lengkap.
          </p>
        </div>
        <FormPermohonan />
      </div>

      {/* Informasi Tambahan */}
      <div
        className="mt-6 p-5 rounded-sm"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
      >
        <h4
          className="text-xs font-bold mb-3 uppercase tracking-wider"
          style={{ color: "var(--primary, #1a3a6e)" }}
        >
          Informasi Penting
        </h4>
        <ul className="space-y-2">
          {[
            "PPID wajib merespons permohonan dalam waktu 10 hari kerja sejak diterimanya permohonan.",
            "Perpanjangan waktu paling lama 7 hari kerja dapat dilakukan dengan pemberitahuan tertulis.",
            "Jika permohonan ditolak, pemohon berhak mengajukan keberatan kepada atasan PPID.",
            "Seluruh data pemohon dijaga kerahasiaannya sesuai peraturan perundang-undangan.",
          ].map((item, i) => (
            <li
              key={i}
              className="text-[11px] leading-relaxed opacity-65 flex items-start gap-2"
              style={{ color: "var(--foreground)" }}
            >
              <span className="mt-0.5 shrink-0" style={{ color: "var(--primary, #1a3a6e)" }}>•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </PpidPageLayout>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, UserCheck, Shield, Info, CheckCircle, ArrowLeft, Smartphone,
  CreditCard, UserCircle, Lock, AlertCircle,
} from "lucide-react";
import { publicPost } from "@/core/api/client";
import TurnstileWidget, { useTurnstileToken, requireTurnstileToken } from "@/components/security/TurnstileWidget";
import { useSubmitGuard } from "@/core/utils/useSubmitGuard";

type AktivasiStep = "form" | "success";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<AktivasiStep>("form");
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telepon, setTelepon] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successName, setSuccessName] = useState("");
  const { token: cfToken, setToken: setCfToken, reset: resetCf, resetRef: cfResetRef } = useTurnstileToken();
  const { canSubmit } = useSubmitGuard();

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.875rem",
    border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 6,
    background: "rgba(255,255,255,0.07)", color: "#fff",
    fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.7rem", fontWeight: 600,
    color: "rgba(255,255,255,0.6)", marginBottom: "0.3rem",
    letterSpacing: "0.04em", textTransform: "uppercase",
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setError("");

    // Validations
    if (!nik || nik.length !== 16) {
      setError("NIK harus 16 digit sesuai KTP.");
      return;
    }
    if (!namaLengkap.trim()) {
      setError("Nama lengkap wajib diisi sesuai KTP.");
      return;
    }
    if (!telepon || !/^08[0-9]{8,12}$/.test(telepon)) {
      setError("Nomor HP tidak valid. Gunakan format 08xxxxxxxxxx.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Kata sandi dan konfirmasi tidak cocok.");
      return;
    }
    const cfErr = requireTurnstileToken(cfToken);
    if (cfErr) { setError(cfErr); return; }

    setLoading(true);

    let result: { success: boolean; message: string };
    try {
      const res = await publicPost<{ success: boolean; message: string }>("/auth/register", {
        nik,
        nama_lengkap: namaLengkap,
        password,
        password_confirmation: password,
        telepon,
        cf_turnstile_token: cfToken,
      });
      result = { success: res.success, message: res.message ?? "Aktivasi berhasil." };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      result = { success: false, message };
    }

    setLoading(false);

    if (result.success) {
      setSuccessName(namaLengkap);
      setStep("success");
    } else {
      setError(result.message);
      resetCf();
    }
  };

  const cardStyle: React.CSSProperties = {
    width: "100%", maxWidth: 420,
    background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
    padding: "1.5rem 1.75rem",
  };

  // Success screen
  if (step === "success") {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: "2rem 1.75rem" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(22,163,74,0.2)", border: "2px solid #16a34a",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem", color: "#4ade80",
        }}>
          <CheckCircle size={28} />
        </div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>
          Aktivasi Berhasil!
        </h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
          Selamat datang, <strong style={{ color: "#fff" }}>{successName}</strong>!
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Akun Anda telah aktif. Silakan masuk menggunakan NIK dan kata sandi yang baru saja Anda buat.
        </p>

        <div style={{
          display: "flex", alignItems: "flex-start", gap: "0.5rem",
          padding: "0.75rem 1rem", borderRadius: 8,
          background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
          textAlign: "left", marginBottom: "1.5rem",
        }}>
          <Info size={14} style={{ color: "#4ade80", flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", lineHeight: 1.5, margin: 0 }}>
            Nomor HP yang Anda daftarkan akan digunakan untuk <strong style={{ color: "#4ade80" }}>verifikasi lupa sandi</strong>. Pastikan nomor tersebut aktif.
          </p>
        </div>

        <button onClick={() => router.push("/login")} style={{
          padding: "0.75rem", borderRadius: 6, border: "none",
          background: "#b8860b", color: "#fff", fontWeight: 700,
          fontSize: "0.9rem", cursor: "pointer", width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
        }}>
          Masuk ke Portal
        </button>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(184,134,11,0.15)", border: "2px solid rgba(184,134,11,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 0.875rem",
        }}>
          <UserCheck size={22} style={{ color: "#b8860b" }} />
        </div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
          Aktivasi Akun Warga
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
          Aktivasi akun yang telah disiapkan Admin Desa
        </p>
      </div>

      {/* Info Box */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: "0.5rem",
        padding: "0.75rem 0.875rem", borderRadius: 8,
        background: "rgba(184,134,11,0.06)", border: "1px solid rgba(184,134,11,0.15)",
        marginBottom: "1.25rem",
      }}>
        <Info size={14} style={{ color: "#b8860b", flexShrink: 0, marginTop: 2 }} />
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", lineHeight: 1.5, margin: 0 }}>
          Akun Anda harus sudah didaftarkan oleh Admin Desa melalui Database Warga. Jika NIK belum terdaftar, hubungi kantor desa terlebih dahulu.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "0.5rem",
          background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)",
          borderRadius: 6, padding: "0.625rem 0.875rem", marginBottom: "1rem",
        }}>
          <AlertCircle size={14} style={{ color: "#fca5a5", flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: "#fca5a5", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleActivate} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {/* NIK */}
        <div>
          <label style={labelStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <CreditCard size={11} /> NIK (16 Digit)
            </span>
          </label>
          <input
            type="text" value={nik}
            onChange={(e) => setNik(e.target.value.replace(/\D/g, "").slice(0, 16))}
            placeholder="Masukkan 16 digit NIK sesuai KTP"
            maxLength={16}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#b8860b")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
          />
          {nik && nik.length < 16 && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem", marginTop: "0.2rem" }}>
              {nik.length}/16 digit
            </p>
          )}
        </div>

        {/* Nama Lengkap */}
        <div>
          <label style={labelStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <UserCircle size={11} /> Nama Lengkap (Sesuai KTP)
            </span>
          </label>
          <input
            type="text" value={namaLengkap}
            onChange={(e) => setNamaLengkap(e.target.value)}
            placeholder="Masukkan nama lengkap sesuai KTP"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#b8860b")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
          />
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", marginTop: "0.2rem" }}>
            Harus sama persis dengan data yang didaftarkan admin
          </p>
        </div>

        {/* No HP */}
        <div>
          <label style={labelStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <Smartphone size={11} /> Nomor HP Aktif
            </span>
          </label>
          <input
            type="tel" value={telepon}
            onChange={(e) => setTelepon(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))}
            placeholder="08xxxxxxxxxx"
            maxLength={14}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#b8860b")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
          />
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", marginTop: "0.2rem" }}>
            Digunakan untuk verifikasi jika lupa sandi
          </p>
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <Lock size={11} /> Buat Kata Sandi
            </span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              style={{ ...inputStyle, paddingRight: "2.5rem" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#b8860b")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{
              position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0,
            }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label style={labelStyle}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <Lock size={11} /> Ulangi Kata Sandi
            </span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang kata sandi"
              style={{ ...inputStyle, paddingRight: "2.5rem" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#b8860b")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
              position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0,
            }}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && confirmPassword && password !== confirmPassword && (
            <p style={{ color: "#fca5a5", fontSize: "0.68rem", marginTop: "0.2rem" }}>Kata sandi tidak cocok</p>
          )}
        </div>

        <TurnstileWidget onToken={setCfToken} resetRef={cfResetRef} />

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          padding: "0.75rem", borderRadius: 6, border: "none",
          background: loading ? "rgba(184,134,11,0.5)" : "#b8860b",
          color: "#fff", fontWeight: 700, fontSize: "0.9rem",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
          marginTop: "0.25rem",
        }}>
          <UserCheck size={16} />
          {loading ? "Memverifikasi..." : "Aktivasi Akun"}
        </button>
      </form>

      {/* Security badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", marginTop: "1rem" }}>
        <Shield size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem" }}>
          Data diverifikasi terhadap Database Warga Desa
        </span>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "1rem", paddingTop: "0.875rem", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>
          Sudah punya akun aktif?{" "}
          <Link href="/login" style={{ color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

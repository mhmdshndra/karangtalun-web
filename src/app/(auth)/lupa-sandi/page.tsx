"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Key, MessageSquare, Shield, Smartphone, Users } from "lucide-react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { publicPost } from "@/core/api/client";
import TurnstileWidget, { useTurnstileToken, requireTurnstileToken } from "@/components/security/TurnstileWidget";
import { useSubmitGuard } from "@/core/utils/useSubmitGuard";

type ForgotStep = "identify" | "verify_hp" | "otp_channel" | "otp_input" | "new_password" | "success";
type UserType = "warga" | "petugas";

export default function LupaSandiPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("warga");
  const [step, setStep] = useState<ForgotStep>("identify");
  const [identifier, setIdentifier] = useState("");
  const [noHp, setNoHp] = useState("");
  const [otpChannel, setOtpChannel] = useState<"whatsapp" | "sms">("whatsapp");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maskedHp, setMaskedHp] = useState("");
  const [resetToken, setResetToken] = useState("");
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

  const handleIdentify = async () => {
    if (!canSubmit()) return;
    if (!identifier) { setError(userType === "warga" ? "NIK wajib diisi." : "ID Petugas wajib diisi."); return; }
    if (userType === "warga" && identifier.length !== 16) { setError("NIK harus 16 digit."); return; }
    const cfErr = requireTurnstileToken(cfToken);
    if (cfErr) { setError(cfErr); return; }
    setError("");
    setLoading(true);

    try {
      const res = await publicPost<{
        success: boolean; message: string;
        data?: { nik: string; nama: string; telepon_masked: string; debug_otp?: string };
      }>("/auth/lupa-sandi/identify", {
        identifier,
        cf_turnstile_token: cfToken,
      });

      if (!res.success) {
        setLoading(false);
        setError(res.message ?? "Identifier tidak ditemukan.");
        return;
      }

      setMaskedHp(res.data?.telepon_masked || "");
      if (res.data?.debug_otp) setDebugOtp(res.data.debug_otp);
      setLoading(false);
      // Skip verify_hp and otp_channel — go straight to OTP input (backend already sent OTP)
      setStep("otp_input");
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleVerifyHp = async () => {
    // Skipped — backend sends OTP in identify step
    setStep("otp_input");
  };

  const handleSendOtp = async () => {
    setError("");
    setLoading(true);
    setLoading(false);
    setStep("otp_input");
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { setError("Kode OTP wajib diisi (min. 4 digit)."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await publicPost<{
        success: boolean; message: string;
        data?: { reset_token: string };
      }>("/auth/lupa-sandi/verify-otp", {
        identifier,
        otp,
      });
      if (!res.success) {
        setLoading(false);
        setError(res.message ?? "Kode OTP tidak valid.");
        return;
      }
      setResetToken(res.data?.reset_token || "");
      setLoading(false);
      setStep("new_password");
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError("Kata sandi baru minimal 6 karakter."); return; }
    if (newPassword !== confirmPassword) { setError("Kata sandi baru dan konfirmasi tidak cocok."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await publicPost<{ success: boolean; message: string }>("/auth/lupa-sandi/reset", {
        identifier,
        reset_token: resetToken,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.message ?? "Gagal mereset password.");
        return;
      }
      setStep("success");
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const stepLabels = ["Identitas", "No HP", "Kirim OTP", "Verifikasi", "Sandi Baru"];
  const stepMap: Record<ForgotStep, number> = { identify: 0, verify_hp: 1, otp_channel: 2, otp_input: 3, new_password: 4, success: 5 };
  const currentStepIdx = stepMap[step];

  const cardStyle: React.CSSProperties = { width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "1.5rem 1.75rem" };
  const btnPrimary: React.CSSProperties = { padding: "0.75rem", borderRadius: 6, border: "none", background: loading ? "rgba(184,134,11,0.5)" : "#b8860b", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer", width: "100%" };
  const btnSecondary: React.CSSProperties = { padding: "0.75rem", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" };

  if (step === "success") {
    return (
      <div style={{ ...cardStyle, textAlign: "center", padding: "2rem 1.75rem" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(22,163,74,0.2)", border: "2px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", color: "#4ade80" }}>
          <CheckCircle size={28} />
        </div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>Sandi Berhasil Diubah</h2>
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
          Silakan masuk dengan kata sandi baru Anda.
        </p>
        <button onClick={() => router.push("/login")} style={{ ...btnPrimary }}>
          Masuk ke Portal
        </button>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.125rem", textAlign: "center" }}>
        Lupa Kata Sandi
      </h2>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", textAlign: "center", marginBottom: "1.25rem" }}>
        Reset kata sandi menggunakan No HP terdaftar
      </p>

      {/* Step progress */}
      <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1.25rem" }}>
        {stepLabels.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 2, background: i <= currentStepIdx ? "#b8860b" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
        ))}
      </div>

      {error && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "0.5rem",
          background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)",
          borderRadius: 6, padding: "0.625rem 0.875rem", marginBottom: "0.875rem",
        }}>
          <AlertCircle size={14} style={{ color: "#fca5a5", flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: "#fca5a5", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Step 1: Identify */}
      {step === "identify" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {([
              { key: "warga" as UserType, label: "Warga", icon: Users },
              { key: "petugas" as UserType, label: "Petugas", icon: Shield },
            ]).map((t) => (
              <button key={t.key} onClick={() => { setUserType(t.key); setIdentifier(""); setError(""); }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: 6, border: `1.5px solid ${userType === t.key ? "#b8860b" : "rgba(255,255,255,0.1)"}`, background: userType === t.key ? "rgba(184,134,11,0.12)" : "rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                <t.icon size={14} style={{ color: userType === t.key ? "#b8860b" : "rgba(255,255,255,0.4)" }} />
                <span style={{ color: userType === t.key ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 600 }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div>
            <label style={labelStyle}>{userType === "warga" ? "NIK (16 digit)" : "ID Petugas"}</label>
            <input type="text" value={identifier}
              onChange={(e) => setIdentifier(userType === "warga" ? e.target.value.replace(/\D/g, "").slice(0, 16) : e.target.value)}
              placeholder={userType === "warga" ? "Masukkan 16 digit NIK" : "Masukkan ID petugas"}
              style={inputStyle} />
          </div>
          <TurnstileWidget onToken={setCfToken} resetRef={cfResetRef} />
          <button onClick={handleIdentify} disabled={loading} style={btnPrimary}>
            {loading ? "Memverifikasi..." : "Lanjut →"}
          </button>
        </div>
      )}

      {/* Step 2: Verify HP */}
      {step === "verify_hp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "0.5rem 0.75rem" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>{userType === "warga" ? "NIK" : "ID Petugas"}</p>
            <p style={{ color: "#fff", fontSize: "0.875rem", fontWeight: 600 }}>{identifier}</p>
          </div>
          <div>
            <label style={labelStyle}>Nomor HP Terdaftar Saat Aktivasi</label>
            <input type="tel" value={noHp} onChange={(e) => setNoHp(e.target.value.replace(/[^0-9]/g, "").slice(0, 14))}
              placeholder="08xxxxxxxxxx" style={inputStyle} />
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.68rem", marginTop: "0.2rem" }}>
              Petunjuk: nomor HP terdaftar Anda adalah <strong style={{ color: "rgba(255,255,255,0.6)" }}>{maskedHp}</strong>
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setStep("identify"); setError(""); }} style={{ ...btnSecondary, flex: 1 }}>← Kembali</button>
            <button onClick={handleVerifyHp} style={{ ...btnPrimary, flex: 2 }}>Lanjut →</button>
          </div>
        </div>
      )}

      {/* Step 3: Choose OTP channel */}
      {step === "otp_channel" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", textAlign: "center" }}>
            OTP ke <strong style={{ color: "#fff" }}>{noHp.slice(0, 4)}****{noHp.slice(-3)}</strong>
          </p>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            {([
              { key: "whatsapp" as const, label: "WhatsApp", icon: MessageSquare },
              { key: "sms" as const, label: "SMS", icon: Smartphone },
            ]).map((ch) => (
              <button key={ch.key} onClick={() => setOtpChannel(ch.key)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.75rem", borderRadius: 6, border: `1.5px solid ${otpChannel === ch.key ? "#b8860b" : "rgba(255,255,255,0.1)"}`, background: otpChannel === ch.key ? "rgba(184,134,11,0.12)" : "rgba(255,255,255,0.03)", cursor: "pointer" }}>
                <ch.icon size={16} style={{ color: otpChannel === ch.key ? "#b8860b" : "rgba(255,255,255,0.4)" }} />
                <span style={{ color: otpChannel === ch.key ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "0.85rem", fontWeight: 600 }}>{ch.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setStep("verify_hp"); setError(""); }} style={{ ...btnSecondary, flex: 1 }}>← Kembali</button>
            <button onClick={handleSendOtp} disabled={loading} style={{ ...btnPrimary, flex: 2 }}>
              {loading ? "Mengirim..." : "Kirim OTP"}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: OTP input */}
      {step === "otp_input" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(184,134,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
              <Key size={18} style={{ color: "#b8860b" }} />
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
              Kode OTP dikirim ke {otpChannel === "whatsapp" ? "WhatsApp" : "SMS"} terdaftar.
            </p>
            {process.env.NODE_ENV !== "production" && debugOtp && (
              <p style={{ color: "rgba(255,200,0,0.6)", fontSize: "0.7rem", marginTop: "0.25rem" }}>
                [DEV] OTP: {debugOtp}
              </p>
            )}
          </div>
          <div>
            <label style={labelStyle}>Kode OTP</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••" maxLength={6}
              style={{ ...inputStyle, textAlign: "center", letterSpacing: "0.4rem", fontSize: "1.1rem", fontWeight: 700 }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setStep("otp_channel"); setError(""); setOtp(""); }} style={{ ...btnSecondary, flex: 1 }}>← Kembali</button>
            <button onClick={handleVerifyOtp} disabled={loading} style={{ ...btnPrimary, flex: 2 }}>
              {loading ? "Memverifikasi..." : "Verifikasi"}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: New password */}
      {step === "new_password" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <p style={{ color: "#4ade80", fontSize: "0.8rem", fontWeight: 600, textAlign: "center" }}>OTP terverifikasi</p>
          <div>
            <label style={labelStyle}>Kata Sandi Baru</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 karakter"
                style={{ ...inputStyle, paddingRight: "2.25rem" }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0 }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Ulangi Sandi Baru</label>
            <input type="password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ketik ulang"
              style={inputStyle} />
          </div>
          <button onClick={handleResetPassword} disabled={loading} style={btnPrimary}>
            {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
          </button>
        </div>
      )}

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "1.25rem", paddingTop: "0.875rem", textAlign: "center" }}>
        <Link href="/login" style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", textDecoration: "none" }}>
          ← Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}

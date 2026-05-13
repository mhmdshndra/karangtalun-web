"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, ShieldCheck, Headphones, UserCircle, Users, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/context/AuthContext";
import type { UserRole } from "@/core/types";
import TurnstileWidget, { useTurnstileToken, requireTurnstileToken, TURNSTILE_REQUIRED } from "@/components/security/TurnstileWidget";
import { useSubmitGuard } from "@/core/utils/useSubmitGuard";

type LoginTab = "warga" | "petugas";

const ROLE_REDIRECT: Record<UserRole, string> = {
  warga: "/warga/dashboard",
  admin_desa: "/admin/dashboard",
  staf_layanan: "/staf/dashboard",
  public: "/",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState<LoginTab>("warga");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { token: cfToken, setToken: setCfToken, reset: resetCf, resetRef: cfResetRef } = useTurnstileToken();
  const { canSubmit } = useSubmitGuard();

  const handleSwitchTab = (t: LoginTab) => {
    setTab(t); setIdentifier(""); setPassword(""); setError("");
  };

  const doRedirect = (role?: UserRole) => {
    router.push(ROLE_REDIRECT[role || "warga"] || "/warga/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    if (!identifier || !password) { setError(`${tab === "warga" ? "NIK" : "ID Petugas"} dan kata sandi wajib diisi.`); return; }
    if (tab === "warga" && identifier.length < 16) { setError("NIK harus 16 digit."); return; }
    if (tab === "petugas" && identifier.length < 3) { setError("ID Petugas tidak valid."); return; }
    if (password.length < 6) { setError("Kata sandi minimal 6 karakter."); return; }
    const cfErr = requireTurnstileToken(cfToken);
    if (cfErr) { setError(cfErr); return; }
    setError(""); setLoading(true);
    const result = await login(identifier, password, tab, cfToken);
    setLoading(false);
    if (result.success) { doRedirect(result.role); } else { setError(result.message); resetCf(); }
  };

  const handleDemoLogin = async (loginId: string, loginType: "warga" | "petugas") => {
    // Demo login blocked in production — must go through Turnstile-protected form
    if (TURNSTILE_REQUIRED) return;
    setLoadingDemo(loginId); setError("");
    const result = await login(loginId, "demo123", loginType);
    setLoadingDemo(null);
    if (result.success) { doRedirect(result.role); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.625rem 0.875rem",
    border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 6,
    background: "rgba(255,255,255,0.07)", color: "#fff",
    fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
  };

  // Demo accounts — hardcoded dev-only credentials (seeder data)
  const demoAccounts = {
    warga: { nik: "3314052501900003", label: "Warga", sublabel: "NIK: 331405..." },
    admin: { id: "ADM-001", label: "Admin Desa", sublabel: "ID: ADM-001" },
    staf: { id: "STF-001", label: "Staf Layanan", sublabel: "ID: STF-001" },
  };

  return (
    <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "1.5rem 1.75rem" }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "1.25rem", textAlign: "center" }}>
        Masuk ke Portal
      </h2>

      {/* Tab Switch */}
      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1rem" }}>
        {([
          { key: "warga" as LoginTab, label: "Warga", icon: Users },
          { key: "petugas" as LoginTab, label: "Petugas", icon: Shield },
        ]).map((t) => (
          <button key={t.key} onClick={() => handleSwitchTab(t.key)} style={{
            flex: 1, padding: "0.5rem", borderRadius: 6,
            border: `1.5px solid ${tab === t.key ? "#b8860b" : "rgba(255,255,255,0.1)"}`,
            background: tab === t.key ? "rgba(184,134,11,0.12)" : "rgba(255,255,255,0.03)",
            cursor: "pointer", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
          }}>
            <t.icon size={14} style={{ color: tab === t.key ? "#b8860b" : "rgba(255,255,255,0.4)" }} />
            <span style={{ color: tab === t.key ? "#fff" : "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Demo Accounts - only visible in development */}
      {!TURNSTILE_REQUIRED && (
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: "0.375rem" }}>
          Akun Demo
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          {tab === "warga" ? (
            <DemoBtn loginId={demoAccounts.warga.nik} label={demoAccounts.warga.label}
              sublabel={demoAccounts.warga.sublabel}
              color="#b8860b" icon={UserCircle} loading={loadingDemo} disabled={!!loadingDemo || loading}
              onClick={() => handleDemoLogin(demoAccounts.warga.nik, "warga")} />
          ) : (
            <>
              <DemoBtn loginId={demoAccounts.admin.id} label={demoAccounts.admin.label}
                sublabel={demoAccounts.admin.sublabel}
                color="#dc2626" icon={ShieldCheck} loading={loadingDemo} disabled={!!loadingDemo || loading}
                onClick={() => handleDemoLogin(demoAccounts.admin.id, "petugas")} />
              <DemoBtn loginId={demoAccounts.staf.id} label={demoAccounts.staf.label}
                sublabel={demoAccounts.staf.sublabel}
                color="#2563eb" icon={Headphones} loading={loadingDemo} disabled={!!loadingDemo || loading}
                onClick={() => handleDemoLogin(demoAccounts.staf.id, "petugas")} />
            </>
          )}
        </div>
      </div>
      )}

      {/* Separator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>atau</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>

      {error && (
        <div style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.35)", borderRadius: 6, padding: "0.5rem 0.75rem", color: "#fca5a5", fontSize: "0.8rem", marginBottom: "0.875rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: "0.3rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {tab === "warga" ? "NIK (16 digit)" : "ID Petugas"}
          </label>
          <input type="text" value={identifier}
            onChange={(e) => setIdentifier(tab === "warga" ? e.target.value.replace(/\D/g, "").slice(0, 16) : e.target.value.toUpperCase())}
            placeholder={tab === "warga" ? "Masukkan 16 digit NIK Anda" : "Contoh: ADM-001 atau STF-001"}
            maxLength={tab === "warga" ? 16 : 20}
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#b8860b")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.3rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Kata Sandi
            </label>
            <Link href="/lupa-sandi" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textDecoration: "none" }}>
              Lupa?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan kata sandi"
              style={{ ...inputStyle, paddingRight: "2.5rem" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#b8860b")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 0 }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <TurnstileWidget onToken={setCfToken} resetRef={cfResetRef} />

        <button type="submit" disabled={loading || !!loadingDemo}
          style={{ padding: "0.75rem", borderRadius: 6, border: "none", background: loading ? "rgba(184,134,11,0.5)" : "#b8860b", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <LogIn size={16} />{loading ? "Memverifikasi..." : "Masuk"}
        </button>
      </form>

      <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
        {tab === "warga" ? (
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem" }}>
            Belum aktivasi akun?{" "}
            <Link href="/register" style={{ color: "#b8860b", fontWeight: 600, textDecoration: "none" }}>Aktivasi di sini</Link>
          </p>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>
            Akun petugas dikelola oleh admin desa.
          </p>
        )}
      </div>
    </div>
  );
}

function DemoBtn({ loginId, label, sublabel, color, icon: Icon, loading, disabled, onClick }: {
  loginId: string; label: string; sublabel: string; color: string;
  icon: typeof UserCircle; loading: string | null; disabled: boolean; onClick: () => void;
}) {
  const isThis = loading === loginId;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", border: `1px solid ${isThis ? color : "rgba(255,255,255,0.08)"}`, borderRadius: 6, background: isThis ? `${color}18` : "rgba(255,255,255,0.03)", cursor: disabled ? "not-allowed" : "pointer", width: "100%", textAlign: "left" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={13} /></div>
      <div style={{ flex: 1 }}>
        <p style={{ color: "#fff", fontSize: "0.78rem", fontWeight: 600 }}>{isThis ? "Memverifikasi..." : label}</p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.68rem" }}>{sublabel}</p>
      </div>
    </button>
  );
}

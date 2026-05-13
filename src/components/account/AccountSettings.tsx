"use client";

import { useState, useRef } from "react";
import {
  User, Mail, Phone, MapPin, Camera, Save, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Shield, CreditCard, X,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { put, upload } from "@/core/api/client";
import type { UserRole, AppUser } from "@/core/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin_desa: "Admin Desa",
  staf_layanan: "Staf Layanan",
  warga: "Warga",
  public: "Publik",
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin_desa: "#dc2626",
  staf_layanan: "#2563eb",
  warga: "#b8860b",
  public: "#6b7280",
};

interface Toast {
  type: "success" | "error";
  message: string;
}

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profil" | "sandi">("profil");
  const [toast, setToast] = useState<Toast | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    nama_lengkap: user?.nama_lengkap || "",
    email: user?.email || "",
    telepon: user?.telepon || "",
    alamat: user?.alamat || "",
  });
  const [fotoPreview, setFotoPreview] = useState<string | undefined>(user?.foto);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new_password: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new_pass: false, confirm: false });
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role];

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "Ukuran foto maksimal 2 MB.");
      return;
    }
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFoto = () => {
    setFotoPreview(undefined);
    setFotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);

    try {
      // Upload foto first if changed
      if (fotoFile) {
        const fd = new FormData();
        fd.append("foto", fotoFile);
        try {
          const fotoRes = await upload<{ success: boolean; data?: AppUser; message?: string }>("/profile/foto", fd);
          if (fotoRes.success && fotoRes.data) {
            updateUser(fotoRes.data);
            setFotoFile(null);
          }
        } catch {
          showToast("error", "Gagal mengunggah foto.");
        }
      }

      // Update profile data
      const res = await put<{ success: boolean; message: string; data?: AppUser }>("/profile", {
        nama_lengkap: profileForm.nama_lengkap.trim() || user.nama_lengkap,
        email: profileForm.email.trim(),
        telepon: profileForm.telepon.trim(),
        alamat: profileForm.alamat.trim(),
      });

      if (res.success && res.data) {
        updateUser(res.data);
        showToast("success", res.message || "Profil berhasil diperbarui.");
      } else {
        showToast("error", res.message || "Gagal memperbarui profil.");
      }
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal memperbarui profil.");
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current) {
      showToast("error", "Masukkan kata sandi lama.");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      showToast("error", "Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm) {
      showToast("error", "Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await put<{ success: boolean; message: string }>("/password", {
        current_password: passwordForm.current,
        password: passwordForm.new_password,
        password_confirmation: passwordForm.confirm,
      });

      if (res.success) {
        showToast("success", res.message || "Kata sandi berhasil diubah.");
        setPasswordForm({ current: "", new_password: "", confirm: "" });
      } else {
        showToast("error", res.message || "Gagal mengubah kata sandi.");
      }
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal mengubah kata sandi.");
    }
    setSavingPassword(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "10px 12px",
    fontSize: 13,
    color: "var(--foreground)",
    outline: "none",
  };

  const UserAvatar = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center font-bold ${className}`}
      style={{
        width: size,
        height: size,
        background: fotoPreview ? "transparent" : roleColor,
        color: "#fff",
        fontSize: size * 0.38,
      }}
    >
      {fotoPreview ? (
        <img src={fotoPreview} alt="Foto profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        user.nama_lengkap.charAt(0).toUpperCase()
      )}
    </div>
  );

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white animate-in"
          style={{ background: toast.type === "success" ? "#16a34a" : "#dc2626" }}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1
          className="text-xl lg:text-2xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Pengaturan Akun
        </h1>
        <p className="text-sm opacity-60 mt-1">Kelola profil, foto, dan kata sandi Anda</p>
      </div>

      {/* Profile Card Header */}
      <div className="govt-card overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-4" style={{ background: roleColor, color: "#fff" }}>
          <UserAvatar size={56} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate">{user.nama_lengkap}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.25)" }}>
                {ROLE_LABELS[user.role]}
              </span>
              <span className="text-[11px] opacity-80">NIK: {user.nik}</span>
              {user.id_petugas && <span className="text-[11px] opacity-80">· ID: {user.id_petugas}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        {[
          { key: "profil" as const, label: "Atur Profil", icon: User },
          { key: "sandi" as const, label: "Ubah Kata Sandi", icon: Lock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold transition-all"
            style={{
              background: activeTab === key ? roleColor : "var(--surface)",
              color: activeTab === key ? "#fff" : "var(--foreground)",
              border: `1px solid ${activeTab === key ? roleColor : "var(--border)"}`,
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab: Profil */}
      {activeTab === "profil" && (
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <User size={15} style={{ color: roleColor }} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Atur Profil</h3>
          </div>
          <div className="p-5 space-y-5">
            {/* Foto Profil */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-3">
                <Camera size={10} /> Foto Profil
              </label>
              <div className="flex items-center gap-4">
                <UserAvatar size={72} />
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFotoChange}
                    className="hidden"
                    id="foto-upload"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded border text-xs font-bold transition-colors"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <Camera size={12} /> Unggah Foto
                  </button>
                  {fotoPreview && (
                    <button
                      onClick={handleRemoveFoto}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{ color: "#dc2626" }}
                    >
                      <X size={12} /> Hapus Foto
                    </button>
                  )}
                  <p className="text-[10px] opacity-40">JPG, PNG, WEBP. Maks 2 MB.</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5">
                  <User size={10} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={profileForm.nama_lengkap}
                  onChange={(e) => setProfileForm({ ...profileForm, nama_lengkap: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5">
                  <Mail size={10} /> Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  style={inputStyle}
                  placeholder="alamat@email.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5">
                  <Phone size={10} /> Telepon
                </label>
                <input
                  type="tel"
                  value={profileForm.telepon}
                  onChange={(e) => setProfileForm({ ...profileForm, telepon: e.target.value })}
                  style={inputStyle}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5">
                  <MapPin size={10} /> Alamat
                </label>
                <input
                  type="text"
                  value={profileForm.alamat}
                  onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Read-only fields */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5">
                  <CreditCard size={10} /> NIK
                </label>
                <input type="text" value={user.nik} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5">
                  <Shield size={10} /> Role
                </label>
                <input type="text" value={ROLE_LABELS[user.role]} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
              </div>
            </div>

            {/* Save */}
            <div className="pt-3 border-t flex justify-end" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                style={{ background: roleColor, color: "#fff" }}
              >
                <Save size={14} /> {savingProfile ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Kata Sandi */}
      {activeTab === "sandi" && (
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-2" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <Lock size={15} style={{ color: roleColor }} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Ubah Kata Sandi</h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 block">Kata Sandi Lama</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  style={inputStyle}
                  placeholder="Masukkan kata sandi lama"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--foreground)", opacity: 0.4 }}
                >
                  {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 block">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showPasswords.new_pass ? "text" : "password"}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  style={inputStyle}
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new_pass: !showPasswords.new_pass })}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--foreground)", opacity: 0.4 }}
                >
                  {showPasswords.new_pass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 block">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  style={inputStyle}
                  placeholder="Ketik ulang kata sandi baru"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--foreground)", opacity: 0.4 }}
                >
                  {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {passwordForm.new_password && (
              <div className="text-[11px]" style={{ color: passwordForm.new_password.length >= 6 ? "#16a34a" : "#dc2626" }}>
                {passwordForm.new_password.length >= 6
                  ? "✓ Panjang kata sandi memenuhi syarat"
                  : `✗ Minimal 6 karakter (saat ini: ${passwordForm.new_password.length})`}
              </div>
            )}

            {/* Save */}
            <div className="pt-3 border-t flex justify-end" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold transition-all disabled:opacity-50"
                style={{ background: roleColor, color: "#fff" }}
              >
                <Lock size={14} /> {savingPassword ? "Menyimpan..." : "Ubah Kata Sandi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

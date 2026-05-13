"use client";

import { useState } from "react";
import {
  User, Mail, Phone, MapPin, CreditCard, Edit3, Save, X,
  Users, Calendar, Briefcase, Heart, GraduationCap, Shield,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { hitungUmur } from "@/core/utils/helpers";
import type { UserRole } from "@/core/types";

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

export default function ProfilPage() {
  const { user, kk } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: user?.email || "",
    telepon: user?.telepon || "",
    alamat: user?.alamat || "",
  });
  const [saved, setSaved] = useState(false);

  if (!user || !kk) return null;


  const handleSave = () => {
    // Simulate save
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 2,
    padding: "8px 12px",
    fontSize: 13,
    color: "var(--foreground)",
    outline: "none",
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-xl lg:text-2xl font-black uppercase tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}
        >
          Profil & Kartu Keluarga
        </h1>
        <p className="text-sm opacity-60 mt-1">Data diri dan informasi kartu keluarga Anda</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div
          className="p-3 rounded flex items-center gap-2 text-xs font-bold"
          style={{ background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" }}
        >
          <Save size={14} /> Data berhasil diperbarui.
        </div>
      )}

      {/* Profile Card */}
      <div className="govt-card overflow-hidden">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden"
              style={{ background: user.foto ? "transparent" : "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              {user.foto ? (
                <img src={user.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user.nama_lengkap.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-base font-bold">{user.nama_lengkap}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ background: ROLE_COLORS[user.role], color: "#fff" }}
                >
                  {ROLE_LABELS[user.role]}
                </span>
                <span className="text-[11px] opacity-70">NIK: {user.nik}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded border transition-colors"
            style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
          >
            {isEditing ? <X size={16} /> : <Edit3 size={16} />}
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Read-only fields */}
            <ProfileField icon={CreditCard} label="NIK" value={user.nik} />
            <ProfileField icon={CreditCard} label="No. Kartu Keluarga" value={user.no_kk} />

            {/* Editable fields */}
            {isEditing ? (
              <>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">
                    <Mail size={11} /> Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    style={inputStyle}
                    placeholder="alamat@email.com"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">
                    <Phone size={11} /> Telepon
                  </label>
                  <input
                    type="tel"
                    value={editData.telepon}
                    onChange={(e) => setEditData({ ...editData, telepon: e.target.value })}
                    style={inputStyle}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">
                    <MapPin size={11} /> Alamat
                  </label>
                  <input
                    type="text"
                    value={editData.alamat}
                    onChange={(e) => setEditData({ ...editData, alamat: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </>
            ) : (
              <>
                <ProfileField icon={Mail} label="Email" value={user.email || "—"} />
                <ProfileField icon={Phone} label="Telepon" value={user.telepon || "—"} />
                <div className="sm:col-span-2">
                  <ProfileField icon={MapPin} label="Alamat" value={user.alamat || "—"} />
                </div>
              </>
            )}
          </div>

          {isEditing && (
            <div className="mt-5 pt-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded border text-xs font-bold transition-colors hover:border-primary"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Save size={14} /> Simpan Perubahan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kartu Keluarga */}
      <div className="govt-card overflow-hidden">
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: "var(--primary)" }} />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
              Anggota Kartu Keluarga
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
            {kk.anggota.length} Anggota
          </span>
        </div>

        {/* KK Info */}
        <div className="px-5 py-3 border-b text-xs" style={{ borderColor: "var(--border)", background: "var(--surface-hover)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="opacity-50">No. KK:</span>{" "}
              <strong>{kk.no_kk}</strong>
            </div>
            <div>
              <span className="opacity-50">Kepala Keluarga:</span>{" "}
              <strong>{kk.kepala_keluarga}</strong>
            </div>
            <div>
              <span className="opacity-50">Alamat:</span>{" "}
              <strong>{kk.alamat} {kk.rt_rw}</strong>
            </div>
          </div>
        </div>

        {/* Anggota Table / Cards */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: "var(--surface-hover)" }}>
                {["No", "Nama Lengkap", "NIK", "L/P", "Usia", "Hubungan", "Pekerjaan", "Pendidikan"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wider opacity-50 text-[10px]" style={{ borderBottom: "1px solid var(--border)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kk.anggota.map((a, i) => (
                <tr key={a.nik} className="transition-colors hover:bg-surface-hover" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="px-4 py-3 font-bold opacity-40">{i + 1}</td>
                  <td className="px-4 py-3 font-bold">{a.nama_lengkap}</td>
                  <td className="px-4 py-3 font-mono text-[11px] opacity-70">{a.nik}</td>
                  <td className="px-4 py-3">{a.jenis_kelamin === "Laki-laki" ? "L" : "P"}</td>
                  <td className="px-4 py-3">{hitungUmur(a.tanggal_lahir)} thn</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: a.status_hubungan === "Kepala Keluarga" ? "var(--primary)" : "var(--accent-light)",
                        color: a.status_hubungan === "Kepala Keluarga" ? "#fff" : "var(--accent)",
                      }}
                    >
                      {a.status_hubungan}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.pekerjaan}</td>
                  <td className="px-4 py-3 opacity-70">{a.pendidikan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-3 space-y-2">
          {kk.anggota.map((a, i) => (
            <div
              key={a.nik}
              className="p-4 rounded border"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: a.status_hubungan === "Kepala Keluarga" ? "var(--primary)" : "var(--accent-light)",
                    color: a.status_hubungan === "Kepala Keluarga" ? "#fff" : "var(--accent)",
                  }}
                >
                  {a.nama_lengkap.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{a.nama_lengkap}</p>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: a.status_hubungan === "Kepala Keluarga" ? "var(--primary)" : "var(--accent-light)",
                      color: a.status_hubungan === "Kepala Keluarga" ? "#fff" : "var(--accent)",
                    }}
                  >
                    {a.status_hubungan}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 opacity-60">
                  <CreditCard size={10} /> {a.nik}
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                  <Calendar size={10} /> {hitungUmur(a.tanggal_lahir)} tahun ({a.jenis_kelamin === "Laki-laki" ? "L" : "P"})
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                  <Briefcase size={10} /> {a.pekerjaan}
                </div>
                <div className="flex items-center gap-1.5 opacity-60">
                  <GraduationCap size={10} /> {a.pendidikan}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">
        <Icon size={11} /> {label}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{value}</p>
    </div>
  );
}

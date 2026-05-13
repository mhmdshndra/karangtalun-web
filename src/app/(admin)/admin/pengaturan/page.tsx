"use client";

import { useState, useEffect } from "react";
import {
  Building2, MapPin, Phone, Mail, Globe, Calendar, User, Shield,
  Sun, Moon, Save, CheckCircle, AlertCircle, Loader2,
} from "lucide-react";
import { useAuth } from "@/core/context/AuthContext";
import { useCms } from "@/core/cms/useCmsStore";
import type { CmsIdentitasDesa } from "@/core/cms/cmsTypes";

export default function AdminPengaturanPage() {
  const { user } = useAuth();
  const { cms, updateIdentitasDesa } = useCms();
  const [form, setForm] = useState<CmsIdentitasDesa>(cms.identitasDesa);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Sync form when CMS loads
  useEffect(() => {
    if (cms.identitasDesa.namaDesa) setForm(cms.identitasDesa);
  }, [cms.identitasDesa]);

  const u = (key: keyof CmsIdentitasDesa, val: unknown) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      updateIdentitasDesa(form);
      setToast({ type: "success", msg: "Pengaturan berhasil disimpan." });
    } catch {
      setToast({ type: "error", msg: "Gagal menyimpan pengaturan." });
    }
    setSaving(false);
    setTimeout(() => setToast(null), 3000);
  };

  const inputStyle = "w-full px-3 py-2 rounded border text-xs outline-none";
  const inputCss: React.CSSProperties = { background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white"
          style={{ background: toast.type === "success" ? "#16a34a" : "#dc2626" }}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Pengaturan Situs</h1>
          <p className="text-sm opacity-50 mt-1">Konfigurasi informasi portal desa</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold transition-all disabled:opacity-50"
          style={{ background: "#dc2626", color: "#fff" }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="space-y-5">
        {/* Informasi Desa */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <Building2 size={16} style={{ color: "#dc2626" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Informasi Desa</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Building2 size={10} /> Nama Desa</label>
                <input type="text" value={form.namaDesa} onChange={(e) => u("namaDesa", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Shield size={10} /> Kode Desa</label>
                <input type="text" value={form.kodeDesa} onChange={(e) => u("kodeDesa", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><MapPin size={10} /> Kecamatan</label>
                <input type="text" value={form.kecamatan} onChange={(e) => u("kecamatan", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><MapPin size={10} /> Kabupaten</label>
                <input type="text" value={form.kabupaten} onChange={(e) => u("kabupaten", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><MapPin size={10} /> Provinsi</label>
                <input type="text" value={form.provinsi} onChange={(e) => u("provinsi", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Mail size={10} /> Kode Pos</label>
                <input type="text" value={form.kodePos} onChange={(e) => u("kodePos", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><MapPin size={10} /> Alamat Lengkap</label>
                <input type="text" value={form.alamat} onChange={(e) => u("alamat", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
            </div>
          </div>
        </div>

        {/* Kontak & Media */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <Phone size={16} style={{ color: "#dc2626" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Kontak & Media</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Mail size={10} /> Email</label>
                <input type="email" value={form.email} onChange={(e) => u("email", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Phone size={10} /> Telepon</label>
                <input type="tel" value={form.telepon} onChange={(e) => u("telepon", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Globe size={10} /> Google Maps URL</label>
                <input type="text" value={form.mapsUrl} onChange={(e) => u("mapsUrl", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
            </div>
          </div>
        </div>

        {/* Pemerintahan */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <User size={16} style={{ color: "#dc2626" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Pemerintahan</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><User size={10} /> Kepala Desa</label>
                <input type="text" value={form.namaKades} onChange={(e) => u("namaKades", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Shield size={10} /> Jabatan</label>
                <input type="text" value={form.jabatanKades} onChange={(e) => u("jabatanKades", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Calendar size={10} /> Tahun Anggaran</label>
                <input type="text" value={form.tahunAnggaran} onChange={(e) => u("tahunAnggaran", e.target.value)} className={inputStyle} style={inputCss} />
              </div>
            </div>
          </div>
        </div>

        {/* Koordinat */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <MapPin size={16} style={{ color: "#dc2626" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Koordinat</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><MapPin size={10} /> Latitude</label>
                <input type="number" step="any" value={form.koordinat.lat} onChange={(e) => u("koordinat", { ...form.koordinat, lat: parseFloat(e.target.value) || 0 })} className={inputStyle} style={inputCss} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><MapPin size={10} /> Longitude</label>
                <input type="number" step="any" value={form.koordinat.lng} onChange={(e) => u("koordinat", { ...form.koordinat, lng: parseFloat(e.target.value) || 0 })} className={inputStyle} style={inputCss} />
              </div>
            </div>
          </div>
        </div>

        {/* Tema */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <Sun size={16} style={{ color: "#dc2626" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Tampilan</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold" style={{ color: "var(--foreground)" }}>Mode Gelap</p>
                <p className="text-[11px] opacity-50 mt-0.5">Pengaturan tema gelap dikelola dari toggle aksesibilitas di floating button</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: "var(--surface-hover)" }}>
                <Sun size={14} style={{ color: "var(--foreground)", opacity: 0.5 }} />
                <span className="text-[11px] opacity-50">/</span>
                <Moon size={14} style={{ color: "var(--foreground)", opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="govt-card overflow-hidden">
          <div className="px-5 py-3 flex items-center gap-3" style={{ background: "var(--surface-hover)", borderBottom: "1px solid var(--border)" }}>
            <Shield size={16} style={{ color: "#dc2626" }} />
            <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Administrator Aktif</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold overflow-hidden" style={{ background: user?.foto ? "transparent" : "#dc2626" }}>
                {user?.foto ? (
                  <img src={user.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  user?.nama_lengkap?.charAt(0) || "A"
                )}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{user?.nama_lengkap || "Admin"}</p>
                <p className="text-[11px] opacity-50">{user?.id_petugas || "-"} · {user?.email || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

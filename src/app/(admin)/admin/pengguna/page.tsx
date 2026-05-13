"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users, Search, X, Shield, UserCheck, User, Mail, Phone, MapPin, Hash,
  ChevronDown, RefreshCw, Database, ArrowRight, Info, CheckCircle,
  Clock, XCircle, Plus, Save, Lock, Eye, EyeOff, Edit3, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui";
import { get, post, put } from "@/core/api/client";
import { hitungUmur as calcAge } from "@/core/utils/helpers";
import type { AppUser, UserRole, AnggotaKK, StatusAktivasi } from "@/core/types";

const ROLE_CONFIG: Record<UserRole, { label: string; variant: "danger" | "info" | "warning" | "success"; color: string; icon: typeof Shield }> = {
  admin_desa: { label: "Admin Desa", variant: "danger", color: "#dc2626", icon: Shield },
  staf_layanan: { label: "Staf Layanan", variant: "info", color: "#2563eb", icon: UserCheck },
  warga: { label: "Warga", variant: "warning", color: "#b8860b", icon: User },
  public: { label: "Publik", variant: "success", color: "#6b7280", icon: User },
};

const STATUS_CFG: Record<StatusAktivasi, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  aktif: { label: "Aktif", color: "#16a34a", bg: "rgba(22,163,74,0.1)", icon: CheckCircle },
  belum_aktivasi: { label: "Belum Aktivasi", color: "#b8860b", bg: "rgba(184,134,11,0.1)", icon: Clock },
  nonaktif: { label: "Nonaktif", color: "#dc2626", bg: "rgba(220,38,38,0.1)", icon: XCircle },
};


const iS: React.CSSProperties = { width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, padding: "9px 12px", fontSize: 13, color: "var(--foreground)", outline: "none" };
const EMPTY = { nama_lengkap: "", nik: "", no_kk: "", role: "warga" as UserRole, password: "", id_petugas: "", email: "", telepon: "", alamat: "" };

export default function AdminPenggunaPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [expId, setExpId] = useState<string | null>(null);
  const [fR, setFR] = useState<UserRole | "">("");
  const [fS, setFS] = useState<StatusAktivasi | "">("");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<{ m: string; ok: boolean } | null>(null);
  const [showCF, setShowCF] = useState(false);
  const [cf, setCf] = useState({ ...EMPTY });
  const [sCPw, setSCPw] = useState(false);
  const [eId, setEId] = useState<string | null>(null);
  const [se, setSe] = useState({ password: "", id_petugas: "", email: "", telepon: "" });
  const [sSPw, setSSPw] = useState(false);

  useEffect(() => {
    get<{ success: boolean; data?: AppUser[] }>("/admin/users").then(res => {
      if (res.success && res.data) setUsers(res.data);
    }).catch(() => {});
  }, []);
  const flash = (m: string, ok = true) => { setToast({ m, ok }); setTimeout(() => setToast(null), 3500); };
  const reloadUsers = () => get<{ success: boolean; data?: AppUser[] }>("/admin/users").then(res => { if (res.success && res.data) setUsers(res.data); }).catch(() => {});

  const unsynced = useMemo(() => {
    // Unsynced warga fetched via separate endpoint; for now return empty
    // (sync is handled server-side via /admin/sync-warga)
    return [] as (AnggotaKK & { no_kk: string; addr: string; rtrw: string })[];
  }, [users]);

  const doSync = async (w: (typeof unsynced)[0]) => {
    try {
      const res = await post<{ success: boolean; message: string }>("/admin/users/manual", {
        nik: w.nik, nama_lengkap: w.nama_lengkap, no_kk: w.no_kk, role: "warga",
        password: "demo123", alamat: w.addr + " " + w.rtrw + ", Desa Karangtalun", rt_rw: w.rtrw,
      });
      reloadUsers(); flash(res.message || "Akun " + w.nama_lengkap + " disinkronkan");
    } catch (err: unknown) { flash(err instanceof Error ? err.message : "Gagal sinkronisasi.", false); }
  };

  const doCreate = async () => {
    if (!cf.nama_lengkap.trim()) return flash("Nama wajib diisi.", false);
    if (cf.nik.trim().length < 10) return flash("NIK minimal 10 karakter.", false);
    if (cf.role === "warga" && !cf.no_kk.trim()) return flash("No. KK wajib untuk role Warga.", false);
    if (cf.password.length < 6) return flash("Sandi minimal 6 karakter.", false);
    if ((cf.role === "admin_desa" || cf.role === "staf_layanan") && !cf.id_petugas.trim()) return flash("ID Petugas wajib untuk Admin/Staf.", false);
    try {
      const payload: Record<string, unknown> = {
        nama_lengkap: cf.nama_lengkap.trim(), nik: cf.nik.trim(), role: cf.role,
        password: cf.password,
      };
      if (cf.no_kk.trim()) payload.no_kk = cf.no_kk.trim();
      if (cf.id_petugas.trim()) payload.id_petugas = cf.id_petugas.trim();
      if (cf.email.trim()) payload.email = cf.email.trim();
      if (cf.telepon.trim()) payload.telepon = cf.telepon.trim();
      if (cf.alamat.trim()) payload.alamat = cf.alamat.trim();
      const res = await post<{ success: boolean; message: string }>("/admin/users/manual", payload);
      reloadUsers(); setCf({ ...EMPTY }); setShowCF(false); flash(res.message || "Akun berhasil dibuat.");
    } catch (err: unknown) { flash(err instanceof Error ? err.message : "Gagal membuat akun.", false); }
  };

  const startEdit = (u: AppUser) => { setEId(u.id); setSe({ password: "", id_petugas: u.id_petugas || "", email: u.email || "", telepon: u.telepon || "" }); setSSPw(false); };

  const saveStaff = async () => {
    if (!eId) return;
    try {
      const res = await put<{ success: boolean; message: string }>(`/admin/users/${eId}/staff-account`, {
        password: se.password || undefined, id_petugas: se.id_petugas, email: se.email, telepon: se.telepon,
      });
      reloadUsers(); setEId(null); flash(res.message || "Data berhasil diperbarui.");
    } catch (err: unknown) { flash(err instanceof Error ? err.message : "Gagal memperbarui.", false); }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "aktif" ? "nonaktif" : "aktif";
    try {
      const res = await put<{ success: boolean; message: string }>(`/admin/users/${userId}/status`, { status_aktivasi: newStatus });
      reloadUsers();
      flash(res.message || `Status berhasil diubah ke ${newStatus}.`);
    } catch (err: unknown) { flash(err instanceof Error ? err.message : "Gagal mengubah status.", false); }
  };

  const list = useMemo(() => {
    let r = users;
    if (fR) r = r.filter(u => u.role === fR);
    if (fS) r = r.filter(u => u.status_aktivasi === fS);
    if (q.trim()) { const s = q.toLowerCase(); r = r.filter(u => u.nama_lengkap.toLowerCase().includes(s) || u.nik.includes(s) || u.email?.toLowerCase().includes(s) || u.id_petugas?.toLowerCase().includes(s)); }
    return r;
  }, [users, fR, fS, q]);

  const cn = { all: users.length, adm: users.filter(u => u.role === "admin_desa").length, stf: users.filter(u => u.role === "staf_layanan").length, wrg: users.filter(u => u.role === "warga").length, act: users.filter(u => u.status_aktivasi === "aktif").length, pnd: users.filter(u => u.status_aktivasi === "belum_aktivasi").length };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {toast && <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white" style={{ background: toast.ok ? "#16a34a" : "#dc2626" }}>{toast.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {toast.m}</div>}

      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>Kelola Pengguna</h1><p className="text-sm opacity-50 mt-1">Daftar, buat akun manual, kelola staf</p></div>
        <button onClick={() => setShowCF(!showCF)} className="flex items-center gap-2 px-4 py-2.5 rounded text-xs font-bold" style={{ background: showCF ? "var(--surface)" : "#dc2626", color: showCF ? "var(--foreground)" : "#fff", border: "1px solid var(--border)" }}>{showCF ? <X size={14} /> : <Plus size={14} />} {showCF ? "Tutup" : "Buat Akun Manual"}</button>
      </div>

      {showCF && <CreateForm cf={cf} setCf={setCf} showPw={sCPw} setShowPw={setSCPw} onCreate={doCreate} />}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        {[{ l: "Total", v: cn.all, c: "var(--foreground)" }, { l: "Admin", v: cn.adm, c: "#dc2626" }, { l: "Staf", v: cn.stf, c: "#2563eb" }, { l: "Warga", v: cn.wrg, c: "#b8860b" }, { l: "Aktif", v: cn.act, c: "#16a34a" }, { l: "Belum", v: cn.pnd, c: "#f59e0b" }].map(s => (
          <div key={s.l} className="govt-card p-3 text-center"><p className="text-xl font-black" style={{ color: s.c }}>{s.v}</p><p className="text-[10px] opacity-50 font-bold">{s.l}</p></div>
        ))}
      </div>

      <Link href="/admin/database-warga" className="govt-card p-4 mb-5 flex items-center gap-3 hover:shadow-md transition-shadow" style={{ display: "flex", textDecoration: "none" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(184,134,11,0.1)" }}><Database size={18} style={{ color: "#b8860b" }} /></div>
        <div className="flex-1 min-w-0"><p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Database Warga</p><p className="text-[11px] opacity-50 mt-0.5">Kelola data warga dan KK</p></div>
        <ArrowRight size={16} style={{ color: "var(--foreground)", opacity: 0.3 }} />
      </Link>

      {unsynced.length > 0 && <SyncSection items={unsynced} onSync={doSync} />}

      <Filters q={q} setQ={setQ} fR={fR} setFR={setFR} fS={fS} setFS={setFS} />

      {list.length === 0 ? (
        <div className="govt-card p-12 text-center"><Users size={40} className="mx-auto mb-3 opacity-20" /><p className="text-sm font-bold opacity-50">{q || fR || fS ? "Tidak ditemukan." : "Belum ada pengguna."}</p></div>
      ) : (
        <div className="space-y-3">
          {list.map(usr => <UserCard key={usr.id} usr={usr} isExp={expId === usr.id} toggle={() => { setExpId(expId === usr.id ? null : usr.id); if (eId === usr.id) setEId(null); }} isEditing={eId === usr.id} startEdit={() => startEdit(usr)} se={se} setSe={setSe} showSPw={sSPw} setShowSPw={setSSPw} onSave={saveStaff} onCancel={() => setEId(null)} onToggleStatus={() => toggleUserStatus(usr.id, usr.status_aktivasi || "aktif")} />)}
        </div>
      )}

      <div className="mt-6 p-4 rounded flex items-start gap-3" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
        <Info size={16} className="shrink-0 mt-0.5" style={{ color: "#b8860b" }} />
        <div><p className="text-[11px] opacity-60 leading-relaxed"><strong>Alur:</strong> (1) Daftarkan warga di <Link href="/admin/database-warga" className="font-bold underline" style={{ color: "#b8860b" }}>Database Warga</Link>. (2) Sinkronkan. (3) Warga aktivasi via Register. Atau <strong>Buat Akun Manual</strong>.</p></div>
      </div>
    </div>
  );
}

function CreateForm({ cf, setCf, showPw, setShowPw, onCreate }: { cf: typeof EMPTY; setCf: (v: typeof EMPTY) => void; showPw: boolean; setShowPw: (v: boolean) => void; onCreate: () => void }) {
  return (
    <div className="govt-card mb-5 overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: "rgba(220,38,38,0.06)", borderBottom: "1px solid var(--border)" }}><Plus size={14} style={{ color: "#dc2626" }} /><span className="text-xs font-bold" style={{ color: "#dc2626" }}>Buat Akun Manual</span></div>
      <div className="p-5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><User size={10} /> Nama *</label><input type="text" value={cf.nama_lengkap} onChange={e => setCf({ ...cf, nama_lengkap: e.target.value })} style={iS} placeholder="Nama sesuai KTP" /></div>
        <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Hash size={10} /> NIK *</label><input type="text" value={cf.nik} onChange={e => setCf({ ...cf, nik: e.target.value })} style={iS} maxLength={16} /></div>
        <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Hash size={10} /> No. KK {cf.role === "warga" ? "*" : ""}</label><input type="text" value={cf.no_kk} onChange={e => setCf({ ...cf, no_kk: e.target.value })} style={iS} maxLength={16} placeholder={cf.role === "warga" ? "Wajib untuk Warga" : "Opsional"} /></div>
        <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Shield size={10} /> Role *</label><select value={cf.role} onChange={e => setCf({ ...cf, role: e.target.value as UserRole })} style={{ ...iS, cursor: "pointer" }}><option value="warga">Warga</option><option value="staf_layanan">Staf Layanan</option><option value="admin_desa">Admin Desa</option></select></div>
        <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Lock size={10} /> Sandi *</label><div className="relative"><input type={showPw ? "text" : "password"} value={cf.password} onChange={e => setCf({ ...cf, password: e.target.value })} style={iS} placeholder="Min 6" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.4 }}>{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>
        {(cf.role === "admin_desa" || cf.role === "staf_layanan") && <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Shield size={10} /> ID Petugas *</label><input type="text" value={cf.id_petugas} onChange={e => setCf({ ...cf, id_petugas: e.target.value })} style={iS} /></div>}
        <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Mail size={10} /> Email</label><input type="email" value={cf.email} onChange={e => setCf({ ...cf, email: e.target.value })} style={iS} /></div>
        <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Phone size={10} /> Telepon</label><input type="tel" value={cf.telepon} onChange={e => setCf({ ...cf, telepon: e.target.value })} style={iS} /></div>
        <div className="sm:col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><MapPin size={10} /> Alamat</label><input type="text" value={cf.alamat} onChange={e => setCf({ ...cf, alamat: e.target.value })} style={iS} /></div>
      </div><div className="mt-5 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}><p className="text-[10px] opacity-40">* wajib · Akun langsung aktif</p><button onClick={onCreate} className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold" style={{ background: "#dc2626", color: "#fff" }}><Save size={14} /> Buat Akun</button></div></div>
    </div>
  );
}

function SyncSection({ items, onSync }: { items: (AnggotaKK & { no_kk: string; addr: string; rtrw: string })[]; onSync: (w: (typeof items)[0]) => void }) {
  return (
    <div className="govt-card mb-5 overflow-hidden">
      <div className="px-5 py-3 flex items-center gap-2" style={{ background: "rgba(184,134,11,0.06)", borderBottom: "1px solid var(--border)" }}><RefreshCw size={14} style={{ color: "#b8860b" }} /><span className="text-xs font-bold" style={{ color: "#b8860b" }}>Belum Punya Akun ({items.length})</span></div>
      <div className="p-3 space-y-2">{items.map(w => (
        <div key={w.nik} className="flex items-center gap-3 px-3 py-2.5 rounded" style={{ background: "var(--surface-hover)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs" style={{ background: "#b8860b" }}>{w.nama_lengkap.charAt(0)}</div>
          <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{w.nama_lengkap}</p><p className="text-[10px] opacity-50 truncate">{w.nik} · {calcAge(w.tanggal_lahir)} thn</p></div>
          <button onClick={() => onSync(w)} className="text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1" style={{ background: "#b8860b", color: "#fff" }}><RefreshCw size={10} /> Sinkron</button>
        </div>
      ))}</div>
    </div>
  );
}

function Filters({ q, setQ, fR, setFR, fS, setFS }: { q: string; setQ: (v: string) => void; fR: UserRole | ""; setFR: (v: UserRole | "") => void; fS: StatusAktivasi | ""; setFS: (v: StatusAktivasi | "") => void }) {
  return (<>
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" /><input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="Cari pengguna..." className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none" style={{ background: "var(--surface)", borderColor: q ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />{q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "var(--foreground)", opacity: 0.4 }} /></button>}</div>
      <div className="flex gap-2 flex-wrap">{(["", "admin_desa", "staf_layanan", "warga"] as (UserRole | "")[]).map(r => <button key={r} onClick={() => setFR(r)} className="text-[11px] font-bold px-3 py-2 rounded" style={{ background: fR === r ? "#dc2626" : "var(--surface)", color: fR === r ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>{r === "" ? "Semua" : ROLE_CONFIG[r]?.label}</button>)}</div>
    </div>
    <div className="flex gap-2 mb-4 flex-wrap"><span className="text-[10px] font-bold uppercase tracking-wider opacity-40 py-2">Status:</span>{(["", "aktif", "belum_aktivasi", "nonaktif"] as (StatusAktivasi | "")[]).map(s => { const c = s ? STATUS_CFG[s] : null; return <button key={s} onClick={() => setFS(s)} className="text-[11px] font-bold px-3 py-1.5 rounded" style={{ background: fS === s ? (c?.color || "#6b7280") : "var(--surface)", color: fS === s ? "#fff" : "var(--foreground)", border: "1px solid var(--border)" }}>{s === "" ? "Semua" : c?.label}</button>; })}</div>
  </>);
}

function UserCard({ usr, isExp, toggle, isEditing, startEdit, se, setSe, showSPw, setShowSPw, onSave, onCancel, onToggleStatus }: { usr: AppUser; isExp: boolean; toggle: () => void; isEditing: boolean; startEdit: () => void; se: { password: string; id_petugas: string; email: string; telepon: string }; setSe: (v: typeof se) => void; showSPw: boolean; setShowSPw: (v: boolean) => void; onSave: () => void; onCancel: () => void; onToggleStatus: () => void }) {
  const rc = ROLE_CONFIG[usr.role]; const sc = STATUS_CFG[usr.status_aktivasi || "aktif"];
  const RI = rc.icon; const SI = sc.icon; const isSt = usr.role === "staf_layanan" || usr.role === "admin_desa";
  return (
    <div className="govt-card overflow-hidden">
      <button className="w-full text-left px-5 py-4 flex items-center gap-4" onClick={toggle}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm overflow-hidden" style={{ background: usr.foto ? "transparent" : rc.color }}>{usr.foto ? <img src={usr.foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : usr.nama_lengkap.charAt(0)}</div>
        <div className="flex-1 min-w-0"><p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{usr.nama_lengkap}</p><p className="text-[11px] opacity-50 mt-0.5 truncate">{usr.id_petugas ? usr.id_petugas + " · " : ""}{usr.nik}</p></div>
        <div className="flex items-center gap-2 shrink-0"><span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1" style={{ background: sc.bg, color: sc.color }}><SI size={10} /> {sc.label}</span><StatusBadge label={rc.label} variant={rc.variant} /></div>
        <ChevronDown size={16} className={"transition-transform shrink-0 " + (isExp ? "rotate-180" : "")} style={{ color: "var(--foreground)", opacity: 0.3 }} />
      </button>
      {isExp && (
        <div className="px-5 pb-5 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
            <DR icon={Hash} label="NIK" value={usr.nik} />{usr.id_petugas && <DR icon={Shield} label="ID Petugas" value={usr.id_petugas} />}<DR icon={RI} label="Role" value={rc.label} /><DR icon={Mail} label="Email" value={usr.email || "-"} /><DR icon={Phone} label="Telepon" value={usr.telepon || "-"} /><DR icon={MapPin} label="Alamat" value={usr.alamat || "-"} />
          </div>
          <div className="mt-4 p-3 rounded flex items-start gap-2" style={{ background: sc.bg, border: "1px solid " + sc.color + "25" }}>
            <SI size={14} className="shrink-0 mt-0.5" style={{ color: sc.color }} /><div><p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-0.5" style={{ color: sc.color }}>Status</p><p className="text-xs font-medium" style={{ color: sc.color }}>{usr.status_aktivasi === "aktif" ? "Aktif" + (usr.tanggal_aktivasi ? " — " + usr.tanggal_aktivasi : "") : usr.status_aktivasi === "belum_aktivasi" ? "Belum Aktivasi" : "Nonaktif"}</p></div>
          </div>
          {!isEditing && <div className="mt-4 pt-3 border-t flex items-center gap-2 flex-wrap" style={{ borderColor: "var(--border)" }}>
            {isSt && <button onClick={e => { e.stopPropagation(); startEdit(); }} className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold" style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)" }}><Edit3 size={12} /> Kelola Akun</button>}
            <button onClick={e => { e.stopPropagation(); onToggleStatus(); }} className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold" style={{ background: usr.status_aktivasi === "aktif" ? "rgba(220,38,38,0.1)" : "rgba(22,163,74,0.1)", color: usr.status_aktivasi === "aktif" ? "#dc2626" : "#16a34a", border: `1px solid ${usr.status_aktivasi === "aktif" ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)"}` }}>{usr.status_aktivasi === "aktif" ? <XCircle size={12} /> : <CheckCircle size={12} />} {usr.status_aktivasi === "aktif" ? "Nonaktifkan" : "Aktifkan"}</button>
          </div>}
          {isEditing && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 mb-4"><Edit3 size={14} style={{ color: "#2563eb" }} /><span className="text-xs font-bold" style={{ color: "#2563eb" }}>Edit: {usr.nama_lengkap}</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Shield size={10} /> ID Petugas</label><input type="text" value={se.id_petugas} onChange={e => setSe({ ...se, id_petugas: e.target.value })} style={iS} /></div>
                <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Lock size={10} /> Sandi Baru</label><div className="relative"><input type={showSPw ? "text" : "password"} value={se.password} onChange={e => setSe({ ...se, password: e.target.value })} style={iS} placeholder="Kosongkan jika tidak diubah" /><button type="button" onClick={() => setShowSPw(!showSPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--foreground)", opacity: 0.4 }}>{showSPw ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>
                <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Mail size={10} /> Email</label><input type="email" value={se.email} onChange={e => setSe({ ...se, email: e.target.value })} style={iS} /></div>
                <div><label className="text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1 mb-1.5"><Phone size={10} /> Telepon</label><input type="tel" value={se.telepon} onChange={e => setSe({ ...se, telepon: e.target.value })} style={iS} /></div>
              </div>
              <div className="mt-4 flex justify-end gap-2"><button onClick={onCancel} className="px-4 py-2 rounded border text-xs font-bold" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Batal</button><button onClick={onSave} className="flex items-center gap-2 px-4 py-2 rounded text-xs font-bold" style={{ background: "#2563eb", color: "#fff" }}><Save size={12} /> Simpan</button></div>
            </div>
          )}
          {usr.role === "warga" && <div className="mt-3 p-3 rounded flex items-start gap-2" style={{ background: "rgba(184,134,11,0.05)", border: "1px solid rgba(184,134,11,0.15)" }}><Database size={14} className="shrink-0 mt-0.5" style={{ color: "#b8860b" }} /><div><p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#b8860b" }}>Sumber Data</p><p className="text-[11px] opacity-60">Database Warga</p></div></div>}
        </div>
      )}
    </div>
  );
}

function DR({ icon: I, label, value }: { icon: typeof User; label: string; value: string }) {
  return <div className="flex items-start gap-2"><I size={13} className="shrink-0 mt-0.5 opacity-40" style={{ color: "var(--foreground)" }} /><div><p className="text-[10px] font-bold uppercase tracking-wider opacity-40">{label}</p><p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{value}</p></div></div>;
}

"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Users, Search, X, ChevronDown, ChevronRight, Plus, Upload, Download,
  Edit3, Save, UserPlus, Hash, MapPin, Calendar, Briefcase, Heart,
  Shield, User, CheckCircle, AlertCircle, FileSpreadsheet, Trash2,
  RefreshCw, Info, Home, Copy,
} from "lucide-react";
import { StatusBadge } from "@/components/ui";
import { hitungUmur, formatTanggal } from "@/core/utils/helpers";
import { get, post, put, del } from "@/core/api/client";
import type {
  KartuKeluarga, AnggotaKK, JenisKelamin, Agama, StatusHubungan,
  StatusPerkawinan, Pendidikan,
} from "@/core/types";

// ─── CONSTANTS ───────────────────────────────────────────────

const AGAMA_LIST: Agama[] = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const JK_LIST: JenisKelamin[] = ["Laki-laki", "Perempuan"];
const STATUS_HUBUNGAN_LIST: StatusHubungan[] = ["Kepala Keluarga", "Istri", "Anak", "Orang Tua", "Lainnya"];
const STATUS_KAWIN_LIST: StatusPerkawinan[] = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];
const PENDIDIKAN_LIST: Pendidikan[] = ["Tidak/Belum Sekolah", "SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "D1", "D2", "D3", "S1", "S2", "S3"];

const EXCEL_TEMPLATE_COLUMNS = [
  "no_kk", "nik", "nama_lengkap", "jenis_kelamin", "tempat_lahir",
  "tanggal_lahir (YYYY-MM-DD)", "agama", "pendidikan", "pekerjaan",
  "status_perkawinan", "status_hubungan", "kewarganegaraan",
  "alamat_kk", "rt_rw", "kelurahan", "kecamatan", "kabupaten", "provinsi",
];

// ─── TYPES ───────────────────────────────────────────────────

type ModalType = "tambah_warga" | "edit_warga" | "import_excel" | "tambah_kk" | "edit_kk" | "hapus_kk" | null;

interface WargaFlat extends AnggotaKK {
  no_kk: string;
  alamat_kk: string;
  rt_rw_kk: string;
  kelurahan: string;
  kecamatan: string;
}

// ─── MAIN PAGE ───────────────────────────────────────────────

export default function DatabaseWargaPage() {
  const [kkList, setKkList] = useState<KartuKeluarga[]>([]);
  const [expandedKK, setExpandedKK] = useState<string | null>(null);
  const [expandedWarga, setExpandedWarga] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterRT, setFilterRT] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [editKK, setEditKK] = useState<string>("");
  const [editWarga, setEditWarga] = useState<AnggotaKK | null>(null);
  const [formData, setFormData] = useState<Partial<AnggotaKK & { no_kk: string }>>({});
  const [newKKData, setNewKKData] = useState({ no_kk: "", kepala_keluarga: "", alamat: "", rt_rw: "", kelurahan: "Karangtalun", kecamatan: "Tanon", kabupaten: "Sragen", provinsi: "Jawa Tengah" });
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [syncVersion, setSyncVersion] = useState(0);
  const [syncedNiks, setSyncedNiks] = useState<Set<string>>(new Set());
  const [editKKData, setEditKKData] = useState({ no_kk: "", kepala_keluarga: "", alamat: "", rt_rw: "", kelurahan: "", kecamatan: "", kabupaten: "", provinsi: "" });
  const [deleteKKTarget, setDeleteKKTarget] = useState<KartuKeluarga | null>(null);

  // Fetch KK list from backend
  const reloadKK = useCallback(() => {
    get<{ success: boolean; data?: KartuKeluarga[] }>("/admin/kk").then(res => {
      if (res.success && res.data) setKkList(res.data);
    }).catch(() => {});
  }, []);

  // Fetch synced NIKs (users that already have accounts)
  const reloadSynced = useCallback(() => {
    get<{ success: boolean; data?: { nik: string }[] }>("/admin/users").then(res => {
      if (res.success && res.data) setSyncedNiks(new Set(res.data.map((u: { nik: string }) => u.nik)));
    }).catch(() => {});
  }, []);

  useEffect(() => { reloadKK(); reloadSynced(); }, []);
  const isNikSynced = useCallback((nik: string) => syncedNiks.has(nik), [syncedNiks]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [viewMode, setViewMode] = useState<"kk" | "list">("kk");

  // ─── Derived Data ──────────────────────────────────────────

  const allWarga = useMemo((): WargaFlat[] =>
    kkList.flatMap((kk) =>
      kk.anggota.map((a) => ({
        ...a, no_kk: kk.no_kk, alamat_kk: kk.alamat, rt_rw_kk: kk.rt_rw,
        kelurahan: kk.kelurahan, kecamatan: kk.kecamatan,
      }))
    ), [kkList]);

  const totalWarga = allWarga.length;
  const totalKK = kkList.length;
  const totalEligible = allWarga.filter((w) => hitungUmur(w.tanggal_lahir) >= 17).length;
  const totalSynced = syncedNiks.size;

  const rtList = useMemo(() => {
    const rts = new Set(kkList.map((kk) => kk.rt_rw));
    return Array.from(rts).sort();
  }, [kkList]);

  const filteredKK = useMemo(() => {
    let result = kkList;
    if (filterRT) result = result.filter((kk) => kk.rt_rw === filterRT);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter((kk) =>
        kk.no_kk.includes(q) || kk.kepala_keluarga.toLowerCase().includes(q) ||
        kk.anggota.some((a) => a.nama_lengkap.toLowerCase().includes(q) || a.nik.includes(q))
      );
    }
    return result;
  }, [kkList, filterRT, searchQ]);

  const filteredWargaList = useMemo(() => {
    let result = allWarga;
    if (filterRT) result = result.filter((w) => w.rt_rw_kk === filterRT);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      result = result.filter((w) =>
        w.nama_lengkap.toLowerCase().includes(q) || w.nik.includes(q) || w.no_kk.includes(q)
      );
    }
    return result;
  }, [allWarga, filterRT, searchQ]);

  // ─── Toast ─────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ─── Form Helpers ──────────────────────────────────────────

  const resetForm = () => {
    setFormData({});
    setEditWarga(null);
    setEditKK("");
    setErrors({});
  };

  const validateWarga = (data: Partial<AnggotaKK>): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!data.nik || data.nik.length !== 16) e.nik = "NIK harus 16 digit";
    if (!data.nama_lengkap?.trim()) e.nama_lengkap = "Nama wajib diisi";
    if (!data.tempat_lahir?.trim()) e.tempat_lahir = "Tempat lahir wajib diisi";
    if (!data.tanggal_lahir) e.tanggal_lahir = "Tanggal lahir wajib diisi";
    if (!data.jenis_kelamin) e.jenis_kelamin = "Pilih jenis kelamin";
    if (!data.agama) e.agama = "Pilih agama";
    if (!data.pekerjaan?.trim()) e.pekerjaan = "Pekerjaan wajib diisi";
    if (!data.status_hubungan) e.status_hubungan = "Pilih status hubungan";
    if (!data.status_perkawinan) e.status_perkawinan = "Pilih status perkawinan";
    // Check duplicate NIK
    if (data.nik && !editWarga) {
      const exists = allWarga.some((w) => w.nik === data.nik);
      if (exists) e.nik = "NIK sudah terdaftar";
    }
    return e;
  };

  // ─── CRUD Operations ──────────────────────────────────────

  const handleAddWarga = async () => {
    const errs = validateWarga(formData);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const targetKK = formData.no_kk || editKK;
    if (!targetKK) { setErrors({ no_kk: "Pilih KK tujuan" }); return; }

    const newAnggota: AnggotaKK = {
      nik: formData.nik!,
      nama_lengkap: formData.nama_lengkap!.trim(),
      jenis_kelamin: formData.jenis_kelamin!,
      tempat_lahir: formData.tempat_lahir!.trim(),
      tanggal_lahir: formData.tanggal_lahir!,
      agama: formData.agama!,
      pendidikan: formData.pendidikan || "Tidak/Belum Sekolah",
      pekerjaan: formData.pekerjaan!.trim(),
      status_perkawinan: formData.status_perkawinan!,
      status_hubungan: formData.status_hubungan!,
      kewarganegaraan: formData.kewarganegaraan || "WNI",
    };

    try {
      await post(`/admin/kk/${targetKK}/anggota`, newAnggota);
      reloadKK();

      // Auto-sync if age >= 17
      const umur = hitungUmur(newAnggota.tanggal_lahir);
      if (umur >= 17) {
        post("/admin/users/sync", { nik: newAnggota.nik }).then(() => reloadSynced()).catch(() => {});
      }

      showToast(`Warga ${newAnggota.nama_lengkap} berhasil ditambahkan${umur >= 17 ? " & otomatis disinkronkan sebagai akun pengguna" : ""}`);
      resetForm();
      setModal(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal menambahkan warga", "error");
    }
  };

  const handleEditWarga = async () => {
    const errs = validateWarga(formData);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await put(`/admin/kk/${editKK}/anggota/${editWarga?.nik}`, {
        nama_lengkap: formData.nama_lengkap!.trim(),
        jenis_kelamin: formData.jenis_kelamin!,
        tempat_lahir: formData.tempat_lahir!.trim(),
        tanggal_lahir: formData.tanggal_lahir!,
        agama: formData.agama!,
        pendidikan: formData.pendidikan || editWarga?.pendidikan,
        pekerjaan: formData.pekerjaan!.trim(),
        status_perkawinan: formData.status_perkawinan!,
        status_hubungan: formData.status_hubungan!,
        kewarganegaraan: formData.kewarganegaraan || editWarga?.kewarganegaraan,
      });
      reloadKK();
      showToast(`Data ${formData.nama_lengkap} berhasil diperbarui`);
      resetForm();
      setModal(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal memperbarui data warga", "error");
    }
  };

  const handleDeleteWarga = async (nik: string, noKK: string) => {
    if (!confirm("Hapus warga ini dari database?")) return;
    try {
      await del(`/admin/kk/${noKK}/anggota/${nik}`);
      reloadKK();
      showToast("Warga berhasil dihapus");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal menghapus warga", "error");
    }
  };

  const handleAddKK = async () => {
    if (!newKKData.no_kk || newKKData.no_kk.length !== 16) {
      setErrors({ no_kk: "No. KK harus 16 digit" }); return;
    }
    if (kkList.some((kk) => kk.no_kk === newKKData.no_kk)) {
      setErrors({ no_kk: "No. KK sudah terdaftar" }); return;
    }
    if (!newKKData.alamat.trim() || !newKKData.rt_rw.trim()) {
      setErrors({ alamat: "Alamat dan RT/RW wajib diisi" }); return;
    }
    if (!newKKData.kepala_keluarga.trim()) {
      setErrors({ kepala_keluarga: "Nama kepala keluarga wajib diisi" }); return;
    }

    try {
      await post("/admin/kk", newKKData);
      reloadKK();
      showToast("Kartu Keluarga baru berhasil ditambahkan");
      setNewKKData({ no_kk: "", kepala_keluarga: "", alamat: "", rt_rw: "", kelurahan: "Karangtalun", kecamatan: "Tanon", kabupaten: "Sragen", provinsi: "Jawa Tengah" });
      setErrors({});
      setModal(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal menambahkan KK", "error");
    }
  };

  // ─── Import Excel (CSV/TSV simulation) ────────────────────

  const handleImport = async () => {
    if (!importText.trim()) { showToast("Paste data terlebih dahulu", "error"); return; }
    const lines = importText.trim().split("\n").filter((l) => l.trim());
    if (lines.length < 2) { showToast("Minimal 1 baris data + header", "error"); return; }

    const imported: { success: number; failed: number; errors: string[] } = { success: 0, failed: 0, errors: [] };
    const importedNiks = new Set<string>(); // Track NIKs within this batch
    const newAnggotaByKK = new Map<string, { kk: Partial<KartuKeluarga>; anggota: AnggotaKK[] }>();
    const newSyncNiks: { nik: string; nama: string; no_kk: string; alamat: string; rt_rw: string }[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split("\t").map((c) => c.trim());
      if (cols.length < 12) { imported.failed++; imported.errors.push(`Baris ${i + 1}: kolom kurang dari 12`); continue; }

      const [no_kk, nik, nama, jk, tmpt, tgl, agama, pend, kerja, kawin, hub, wn, alamat, rtrw] = cols;

      if (!nik || nik.length !== 16) { imported.failed++; imported.errors.push(`Baris ${i + 1}: NIK tidak valid`); continue; }
      if (!no_kk || no_kk.length !== 16) { imported.failed++; imported.errors.push(`Baris ${i + 1}: No KK tidak valid`); continue; }
      if (allWarga.some((w) => w.nik === nik) || importedNiks.has(nik)) { imported.failed++; imported.errors.push(`Baris ${i + 1}: NIK ${nik} sudah terdaftar`); continue; }

      importedNiks.add(nik);

      const anggota: AnggotaKK = {
        nik,
        nama_lengkap: nama || "-",
        jenis_kelamin: (jk as JenisKelamin) || "Laki-laki",
        tempat_lahir: tmpt || "-",
        tanggal_lahir: tgl || "2000-01-01",
        agama: (agama as Agama) || "Islam",
        pendidikan: (pend as Pendidikan) || "Tidak/Belum Sekolah",
        pekerjaan: kerja || "-",
        status_perkawinan: (kawin as StatusPerkawinan) || "Belum Kawin",
        status_hubungan: (hub as StatusHubungan) || "Anak",
        kewarganegaraan: wn || "WNI",
      };

      // Collect by KK
      if (!newAnggotaByKK.has(no_kk)) {
        newAnggotaByKK.set(no_kk, {
          kk: { no_kk, alamat: alamat || "-", rt_rw: rtrw || "-", kelurahan: "Karangtalun", kecamatan: "Tanon", kabupaten: "Sragen", provinsi: "Jawa Tengah" },
          anggota: [],
        });
      }
      const entry = newAnggotaByKK.get(no_kk)!;
      entry.anggota.push(anggota);
      if (hub === "Kepala Keluarga") entry.kk.kepala_keluarga = nama;

      // Auto-sync
      if (hitungUmur(tgl || "2000-01-01") >= 17) {
        newSyncNiks.push({ nik, nama: nama || "-", no_kk, alamat: alamat || "-", rt_rw: rtrw || "-" });
      }
      imported.success++;
    }

    // Batch update via backend API
    if (imported.success > 0) {
      // Create/update KK and anggota via API
      for (const [noKK, { kk, anggota: members }] of Array.from(newAnggotaByKK.entries())) {
        const existingKK = kkList.find((k) => k.no_kk === noKK);
        if (!existingKK) {
          // Create new KK first — kepala_keluarga from parsed data or first anggota
          const kepalaName = kk.kepala_keluarga || members.find(m => m.status_hubungan === "Kepala Keluarga")?.nama_lengkap || members[0]?.nama_lengkap || "-";
          await post("/admin/kk", {
            no_kk: noKK, kepala_keluarga: kepalaName,
            alamat: kk.alamat || "-", rt_rw: kk.rt_rw || "-",
            kelurahan: kk.kelurahan || "Karangtalun", kecamatan: kk.kecamatan || "Tanon",
            kabupaten: kk.kabupaten || "Sragen", provinsi: kk.provinsi || "Jawa Tengah",
          }).catch(() => {});
        }
        // Add anggota
        for (const m of members) {
          await post(`/admin/kk/${noKK}/anggota`, m).catch(() => {});
        }
      }
      // Sync eligible warga to user accounts via API
      for (const s of newSyncNiks) {
        post("/admin/users/sync", { nik: s.nik }).catch(() => {});
      }
      reloadKK();
      reloadSynced();
      setSyncVersion((v) => v + 1);
    }

    setImportResult(imported);
    if (imported.success > 0) showToast(`${imported.success} warga berhasil diimpor`);
  };

  const handleDownloadTemplate = () => {
    const header = EXCEL_TEMPLATE_COLUMNS.join("\t");
    const sample = "3314070101080099\t3314071234560001\tContoh Nama\tLaki-laki\tSragen\t1990-01-15\tIslam\tSMA/Sederajat\tPetani\tKawin\tKepala Keluarga\tWNI\tDukuh Krajan\tRT 01/RW 01\tKarangtalun\tTanon\tSragen\tJawa Tengah";
    const blob = new Blob([`${header}\n${sample}`], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "template_import_warga.tsv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Sync to User ─────────────────────────────────────────

  const handleSyncWarga = async (nik: string, nama: string, noKK: string, alamat?: string, rtRw?: string) => {
    if (isNikSynced(nik)) return;
    try {
      await post("/admin/users/sync", { nik });
      reloadSynced();
      setSyncVersion((v) => v + 1);
      showToast(`${nama} disinkronkan sebagai akun warga (status: Belum Aktivasi)`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal sinkronisasi", "error");
    }
  };

  const openEditModal = (warga: AnggotaKK, noKK: string) => {
    setEditWarga(warga);
    setEditKK(noKK);
    setFormData({ ...warga, no_kk: noKK });
    setErrors({});
    setModal("edit_warga");
  };

  const openAddModal = (noKK?: string) => {
    resetForm();
    if (noKK) {
      setEditKK(noKK);
      setFormData({ no_kk: noKK, kewarganegaraan: "WNI", pendidikan: "Tidak/Belum Sekolah" });
    } else {
      setFormData({ kewarganegaraan: "WNI", pendidikan: "Tidak/Belum Sekolah" });
    }
    setModal("tambah_warga");
  };

  // ─── RENDER ────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-bold animate-pulse"
          style={{ background: toast.type === "success" ? "#dcfce7" : "#fee2e2", color: toast.type === "success" ? "#166534" : "#991b1b", border: `1px solid ${toast.type === "success" ? "#86efac" : "#fca5a5"}` }}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-black" style={{ fontFamily: "var(--font-display)", color: "var(--foreground)" }}>
          Database Warga
        </h1>
        <p className="text-sm opacity-50 mt-1">Kelola data kependudukan warga Desa Karangtalun</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { label: "Total Warga", value: totalWarga, color: "var(--foreground)", icon: Users },
          { label: "Kartu Keluarga", value: totalKK, color: "#2563eb", icon: Home },
          { label: "Usia ≥ 17 (Eligible)", value: totalEligible, color: "#b8860b", icon: UserPlus },
          { label: "Akun Tersinkron", value: totalSynced, color: "#16a34a", icon: RefreshCw },
        ].map((st) => (
          <div key={st.label} className="govt-card p-3 text-center">
            <st.icon size={16} className="mx-auto mb-1" style={{ color: st.color, opacity: 0.6 }} />
            <p className="text-xl font-black" style={{ color: st.color }}>{st.value}</p>
            <p className="text-[10px] opacity-50 font-bold">{st.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Cari nama, NIK, atau No. KK..."
            className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none"
            style={{ background: "var(--surface)", borderColor: searchQ ? "#dc2626" : "var(--border)", color: "var(--foreground)" }} />
          {searchQ && <button onClick={() => setSearchQ("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ color: "var(--foreground)", opacity: 0.4 }} /></button>}
        </div>
        <select value={filterRT} onChange={(e) => setFilterRT(e.target.value)}
          className="px-3 py-2.5 rounded border text-xs outline-none"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          <option value="">Semua RT/RW</option>
          {rtList.map((rt) => <option key={rt} value={rt}>{rt}</option>)}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => openAddModal()} className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold"
          style={{ background: "#dc2626", color: "#fff" }}>
          <UserPlus size={13} /> Tambah Warga
        </button>
        <button onClick={() => { setNewKKData({ no_kk: "", kepala_keluarga: "", alamat: "", rt_rw: "", kelurahan: "Karangtalun", kecamatan: "Tanon", kabupaten: "Sragen", provinsi: "Jawa Tengah" }); setErrors({}); setModal("tambah_kk"); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold"
          style={{ background: "#2563eb", color: "#fff" }}>
          <Plus size={13} /> Tambah KK
        </button>
        <button onClick={() => { setImportText(""); setImportResult(null); setModal("import_excel"); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold"
          style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          <Upload size={13} /> Import Excel
        </button>
        <button onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold"
          style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
          <Download size={13} /> Template Import
        </button>
        {/* View toggle */}
        <div className="ml-auto flex rounded overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setViewMode("kk")} className="px-3 py-2 text-[11px] font-bold"
            style={{ background: viewMode === "kk" ? "#dc2626" : "var(--surface)", color: viewMode === "kk" ? "#fff" : "var(--foreground)" }}>
            Per KK
          </button>
          <button onClick={() => setViewMode("list")} className="px-3 py-2 text-[11px] font-bold"
            style={{ background: viewMode === "list" ? "#dc2626" : "var(--surface)", color: viewMode === "list" ? "#fff" : "var(--foreground)" }}>
            Daftar
          </button>
        </div>
      </div>

      {/* ════════ VIEW: PER KK ════════ */}
      {viewMode === "kk" && (
        <div className="space-y-3">
          {filteredKK.length === 0 ? (
            <div className="govt-card p-12 text-center">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold opacity-50">Tidak ada data KK ditemukan.</p>
            </div>
          ) : filteredKK.map((kk) => {
            const isExpanded = expandedKK === kk.no_kk;
            return (
              <div key={kk.no_kk} className="govt-card overflow-hidden">
                {/* KK Header */}
                <button className="w-full text-left px-5 py-4 flex items-center gap-4"
                  onClick={() => setExpandedKK(isExpanded ? null : kk.no_kk)}>
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0 font-bold text-sm"
                    style={{ background: "#2563eb", color: "#fff" }}>
                    <Home size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                      {kk.kepala_keluarga}
                      <span className="text-[10px] font-normal opacity-40 ml-2">KK: {kk.no_kk}</span>
                    </p>
                    <p className="text-[11px] opacity-50 mt-0.5">
                      {kk.alamat} {kk.rt_rw} · {kk.anggota.length} anggota
                    </p>
                  </div>
                  <StatusBadge label={`${kk.anggota.length} org`} variant="info" />
                  <ChevronDown size={16} className={`transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} style={{ color: "var(--foreground)", opacity: 0.3 }} />
                </button>

                {/* KK Detail */}
                {isExpanded && (
                  <div className="border-t" style={{ borderColor: "var(--border)" }}>
                    {/* KK info bar */}
                    <div className="px-5 py-3 flex flex-wrap items-center gap-3 text-[11px]" style={{ background: "var(--surface-hover)" }}>
                      <span className="flex items-center gap-1 opacity-60"><Hash size={10} /> {kk.no_kk}</span>
                      <span className="flex items-center gap-1 opacity-60"><MapPin size={10} /> {kk.alamat} {kk.rt_rw}, {kk.kelurahan}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <button onClick={() => { setEditKKData({ no_kk: kk.no_kk, kepala_keluarga: kk.kepala_keluarga, alamat: kk.alamat, rt_rw: kk.rt_rw, kelurahan: kk.kelurahan || "", kecamatan: kk.kecamatan || "", kabupaten: kk.kabupaten || "", provinsi: kk.provinsi || "" }); setErrors({}); setModal("edit_kk"); }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold"
                          style={{ background: "#2563eb", color: "#fff" }}>
                          <Edit3 size={10} /> Edit KK
                        </button>
                        <button onClick={() => { setDeleteKKTarget(kk); setModal("hapus_kk"); }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold"
                          style={{ background: "var(--surface)", color: "#dc2626", border: "1px solid #dc2626" }}>
                          <Trash2 size={10} /> Hapus KK
                        </button>
                        <button onClick={() => openAddModal(kk.no_kk)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold"
                          style={{ background: "#dc2626", color: "#fff" }}>
                          <UserPlus size={10} /> Tambah Anggota
                        </button>
                      </div>
                    </div>

                    {/* Members */}
                    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                      {kk.anggota.map((anggota) => {
                        const umur = hitungUmur(anggota.tanggal_lahir);
                        const isSynced = isNikSynced(anggota.nik);
                        const syncedUser = null as { status_aktivasi?: string } | null;
                        const isEligible = umur >= 17;
                        const isExpWarga = expandedWarga === anggota.nik;

                        return (
                          <div key={anggota.nik} className="border-t" style={{ borderColor: "var(--border)" }}>
                            <button className="w-full text-left px-5 py-3 flex items-center gap-3"
                              onClick={() => setExpandedWarga(isExpWarga ? null : anggota.nik)}>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                style={{ background: anggota.jenis_kelamin === "Laki-laki" ? "#dbeafe" : "#fce7f3", color: anggota.jenis_kelamin === "Laki-laki" ? "#1e40af" : "#9d174d" }}>
                                {anggota.nama_lengkap.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                                  {anggota.nama_lengkap}
                                  {!isEligible && <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: "#fef3c7", color: "#92400e" }}>minor</span>}
                                  {isSynced && syncedUser?.status_aktivasi === "aktif" && <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: "#dcfce7", color: "#166534" }}>akun aktif</span>}
                                  {isSynced && syncedUser?.status_aktivasi === "belum_aktivasi" && <span className="text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: "#fef3c7", color: "#92400e" }}>belum aktivasi</span>}
                                </p>
                                <p className="text-[10px] opacity-50">{anggota.status_hubungan} · {anggota.jenis_kelamin} · {umur} thn · {anggota.pekerjaan}</p>
                              </div>
                              <ChevronRight size={14} className={`transition-transform shrink-0 ${isExpWarga ? "rotate-90" : ""}`} style={{ opacity: 0.3 }} />
                            </button>

                            {isExpWarga && (
                              <div className="px-5 pb-4 pt-1">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 p-4 rounded" style={{ background: "var(--surface-hover)" }}>
                                  <DetailItem label="NIK" value={anggota.nik} />
                                  <DetailItem label="Nama Lengkap" value={anggota.nama_lengkap} />
                                  <DetailItem label="Tempat, Tgl Lahir" value={`${anggota.tempat_lahir}, ${formatTanggal(anggota.tanggal_lahir)}`} />
                                  <DetailItem label="Usia" value={`${umur} tahun`} />
                                  <DetailItem label="Jenis Kelamin" value={anggota.jenis_kelamin} />
                                  <DetailItem label="Agama" value={anggota.agama} />
                                  <DetailItem label="Pendidikan" value={anggota.pendidikan} />
                                  <DetailItem label="Pekerjaan" value={anggota.pekerjaan} />
                                  <DetailItem label="Status Hubungan" value={anggota.status_hubungan} />
                                  <DetailItem label="Status Perkawinan" value={anggota.status_perkawinan} />
                                  <DetailItem label="Kewarganegaraan" value={anggota.kewarganegaraan} />
                                  <DetailItem label="Alamat (RT/RW)" value={`${kk.alamat} ${kk.rt_rw}`} />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <button onClick={() => openEditModal(anggota, kk.no_kk)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-bold"
                                    style={{ background: "#dbeafe", color: "#1e40af" }}>
                                    <Edit3 size={10} /> Edit Data
                                  </button>
                                  {isEligible && !isSynced && (
                                    <button onClick={() => handleSyncWarga(anggota.nik, anggota.nama_lengkap, kk.no_kk, kk.alamat, kk.rt_rw)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-bold"
                                      style={{ background: "#dcfce7", color: "#166534" }}>
                                      <RefreshCw size={10} /> Sinkron Akun
                                    </button>
                                  )}
                                  {isSynced && (
                                    <span className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-bold"
                                      style={{ background: syncedUser?.status_aktivasi === "aktif" ? "#f0fdf4" : "#fefce8", color: syncedUser?.status_aktivasi === "aktif" ? "#166534" : "#854d0e" }}>
                                      <CheckCircle size={10} /> {syncedUser?.status_aktivasi === "aktif" ? "Akun Aktif" : "Menunggu Aktivasi"}
                                    </span>
                                  )}
                                  <button onClick={() => handleDeleteWarga(anggota.nik, kk.no_kk)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-bold"
                                    style={{ background: "#fee2e2", color: "#991b1b" }}>
                                    <Trash2 size={10} /> Hapus
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════ VIEW: FLAT LIST ════════ */}
      {viewMode === "list" && (
        <div className="govt-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "var(--surface-hover)" }}>
                  {["Nama", "NIK", "No. KK", "L/P", "Usia", "Pekerjaan", "Status Hub.", "RT/RW", "Akun", "Aksi"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-bold text-[10px] uppercase tracking-wider opacity-50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {filteredWargaList.length === 0 ? (
                  <tr><td colSpan={10} className="px-3 py-8 text-center opacity-50">Tidak ada data.</td></tr>
                ) : filteredWargaList.map((w) => {
                  const umur = hitungUmur(w.tanggal_lahir);
                  const isSynced = isNikSynced(w.nik);
                  const syncedUser = null as { status_aktivasi?: string } | null;
                  const isEligible = umur >= 17;
                  return (
                    <tr key={w.nik} className="transition-colors" style={{ background: "var(--surface)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; }}>
                      <td className="px-3 py-2.5 font-bold">{w.nama_lengkap}</td>
                      <td className="px-3 py-2.5 font-mono text-[10px] opacity-60">{w.nik}</td>
                      <td className="px-3 py-2.5 font-mono text-[10px] opacity-60">{w.no_kk}</td>
                      <td className="px-3 py-2.5">{w.jenis_kelamin === "Laki-laki" ? "L" : "P"}</td>
                      <td className="px-3 py-2.5">{umur} thn</td>
                      <td className="px-3 py-2.5 opacity-70">{w.pekerjaan}</td>
                      <td className="px-3 py-2.5 opacity-70">{w.status_hubungan}</td>
                      <td className="px-3 py-2.5 opacity-70">{w.rt_rw_kk}</td>
                      <td className="px-3 py-2.5">
                        {isSynced && syncedUser?.status_aktivasi === "aktif" ? <StatusBadge label="Aktif" variant="success" size="sm" /> :
                          isSynced && syncedUser?.status_aktivasi === "belum_aktivasi" ? <StatusBadge label="Belum Aktivasi" variant="warning" size="sm" /> :
                          isEligible ? <StatusBadge label="Eligible" variant="info" size="sm" /> :
                            <StatusBadge label="Minor" variant="default" size="sm" />}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => {
                            const kk = kkList.find((k) => k.no_kk === w.no_kk);
                            const orig = kk?.anggota.find((a) => a.nik === w.nik);
                            if (orig && kk) openEditModal(orig, kk.no_kk);
                          }} className="p-1 rounded" style={{ color: "#2563eb" }} title="Edit"><Edit3 size={12} /></button>
                          {isEligible && !isSynced && (
                            <button onClick={() => handleSyncWarga(w.nik, w.nama_lengkap, w.no_kk, w.alamat_kk, w.rt_rw_kk)}
                              className="p-1 rounded" style={{ color: "#16a34a" }} title="Sinkron"><RefreshCw size={12} /></button>
                          )}
                          <button onClick={() => handleDeleteWarga(w.nik, w.no_kk)}
                            className="p-1 rounded" style={{ color: "#dc2626" }} title="Hapus"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 rounded flex items-start gap-2" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
        <Info size={14} className="shrink-0 mt-0.5 opacity-40" />
        <div className="text-[11px] opacity-50 leading-relaxed">
          <strong>Catatan:</strong> Warga berusia ≥ 17 tahun otomatis di-sinkronkan menjadi akun pengguna. Registrasi publik tidak aktif — akun hanya dibuat oleh admin melalui database warga ini. Data warga yang tersinkron bisa digunakan untuk mengajukan surat (E-Surat).
        </div>
      </div>

      {/* ════════ MODAL: TAMBAH/EDIT WARGA ════════ */}
      {(modal === "tambah_warga" || modal === "edit_warga") && (
        <ModalOverlay onClose={() => { resetForm(); setModal(null); }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "#dc2626", color: "#fff" }}>
            <h3 className="text-sm font-bold">{modal === "edit_warga" ? "Edit Data Warga" : "Tambah Warga Baru"}</h3>
            <button onClick={() => { resetForm(); setModal(null); }}><X size={16} color="white" /></button>
          </div>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* KK selector */}
            {modal === "tambah_warga" && (
              <div>
                <label className="block text-xs font-bold mb-1.5">Kartu Keluarga Tujuan <span className="text-red-500">*</span></label>
                <select value={formData.no_kk || editKK}
                  onChange={(e) => { setEditKK(e.target.value); setFormData((p) => ({ ...p, no_kk: e.target.value })); }}
                  className="w-full px-3 py-2.5 rounded border text-sm outline-none"
                  style={{ background: "var(--surface)", borderColor: errors.no_kk ? "#dc2626" : "var(--border)", color: "var(--foreground)" }}>
                  <option value="">-- Pilih KK --</option>
                  {kkList.map((kk) => <option key={kk.no_kk} value={kk.no_kk}>{kk.no_kk} — {kk.kepala_keluarga} ({kk.rt_rw})</option>)}
                </select>
                {errors.no_kk && <p className="text-[11px] text-red-600 mt-1">{errors.no_kk}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="NIK (16 Digit)" value={formData.nik || ""} onChange={(v) => setFormData((p) => ({ ...p, nik: v.replace(/\D/g, "").slice(0, 16) }))} error={errors.nik} disabled={modal === "edit_warga"} required />
              <FormInput label="Nama Lengkap" value={formData.nama_lengkap || ""} onChange={(v) => setFormData((p) => ({ ...p, nama_lengkap: v }))} error={errors.nama_lengkap} required />
              <FormInput label="Tempat Lahir" value={formData.tempat_lahir || ""} onChange={(v) => setFormData((p) => ({ ...p, tempat_lahir: v }))} error={errors.tempat_lahir} required />
              <FormInput label="Tanggal Lahir" value={formData.tanggal_lahir || ""} onChange={(v) => setFormData((p) => ({ ...p, tanggal_lahir: v }))} error={errors.tanggal_lahir} type="date" required />
              <FormSelect label="Jenis Kelamin" value={formData.jenis_kelamin || ""} options={JK_LIST} onChange={(v) => setFormData((p) => ({ ...p, jenis_kelamin: v as JenisKelamin }))} error={errors.jenis_kelamin} required />
              <FormSelect label="Agama" value={formData.agama || ""} options={AGAMA_LIST} onChange={(v) => setFormData((p) => ({ ...p, agama: v as Agama }))} error={errors.agama} required />
              <FormSelect label="Pendidikan" value={formData.pendidikan || ""} options={PENDIDIKAN_LIST} onChange={(v) => setFormData((p) => ({ ...p, pendidikan: v as Pendidikan }))} />
              <FormInput label="Pekerjaan" value={formData.pekerjaan || ""} onChange={(v) => setFormData((p) => ({ ...p, pekerjaan: v }))} error={errors.pekerjaan} required />
              <FormSelect label="Status Hubungan" value={formData.status_hubungan || ""} options={STATUS_HUBUNGAN_LIST} onChange={(v) => setFormData((p) => ({ ...p, status_hubungan: v as StatusHubungan }))} error={errors.status_hubungan} required />
              <FormSelect label="Status Perkawinan" value={formData.status_perkawinan || ""} options={STATUS_KAWIN_LIST} onChange={(v) => setFormData((p) => ({ ...p, status_perkawinan: v as StatusPerkawinan }))} error={errors.status_perkawinan} required />
            </div>

            {formData.tanggal_lahir && (
              <div className="p-3 rounded text-xs flex items-center gap-2" style={{ background: hitungUmur(formData.tanggal_lahir) >= 17 ? "#dcfce7" : "#fef3c7", border: `1px solid ${hitungUmur(formData.tanggal_lahir) >= 17 ? "#86efac" : "#fde68a"}` }}>
                <Info size={12} />
                Usia: <strong>{hitungUmur(formData.tanggal_lahir)} tahun</strong>
                {hitungUmur(formData.tanggal_lahir) >= 17
                  ? " — otomatis disinkronkan menjadi akun pengguna"
                  : " — di bawah 17, tidak akan dibuatkan akun"}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => { resetForm(); setModal(null); }} className="px-4 py-2.5 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Batal</button>
              <button onClick={modal === "edit_warga" ? handleEditWarga : handleAddWarga}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold"
                style={{ background: "#dc2626", color: "#fff" }}>
                <Save size={13} /> {modal === "edit_warga" ? "Simpan Perubahan" : "Tambah Warga"}
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ════════ MODAL: TAMBAH KK ════════ */}
      {modal === "tambah_kk" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "#2563eb", color: "#fff" }}>
            <h3 className="text-sm font-bold">Tambah Kartu Keluarga Baru</h3>
            <button onClick={() => setModal(null)}><X size={16} color="white" /></button>
          </div>
          <div className="p-5 space-y-4">
            <FormInput label="Nomor KK (16 Digit)" value={newKKData.no_kk} onChange={(v) => setNewKKData((p) => ({ ...p, no_kk: v.replace(/\D/g, "").slice(0, 16) }))} error={errors.no_kk} required />
            <FormInput label="Nama Kepala Keluarga" value={newKKData.kepala_keluarga} onChange={(v) => setNewKKData((p) => ({ ...p, kepala_keluarga: v }))} error={errors.kepala_keluarga} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Alamat (Dukuh)" value={newKKData.alamat} onChange={(v) => setNewKKData((p) => ({ ...p, alamat: v }))} error={errors.alamat} required />
              <FormInput label="RT/RW" value={newKKData.rt_rw} onChange={(v) => setNewKKData((p) => ({ ...p, rt_rw: v }))} placeholder="RT 01/RW 01" required />
              <FormInput label="Kelurahan" value={newKKData.kelurahan} onChange={(v) => setNewKKData((p) => ({ ...p, kelurahan: v }))} />
              <FormInput label="Kecamatan" value={newKKData.kecamatan} onChange={(v) => setNewKKData((p) => ({ ...p, kecamatan: v }))} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Batal</button>
              <button onClick={handleAddKK} className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold"
                style={{ background: "#2563eb", color: "#fff" }}>
                <Save size={13} /> Simpan KK
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ════════ MODAL: EDIT KK ════════ */}
      {modal === "edit_kk" && (
        <ModalOverlay onClose={() => setModal(null)}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "#2563eb", color: "#fff" }}>
            <h3 className="text-sm font-bold">Edit Kartu Keluarga</h3>
            <button onClick={() => setModal(null)}><X size={16} color="white" /></button>
          </div>
          <div className="p-5 space-y-4">
            <FormInput label="Nomor KK" value={editKKData.no_kk} onChange={() => {}} disabled />
            <FormInput label="Nama Kepala Keluarga" value={editKKData.kepala_keluarga} onChange={(v) => setEditKKData((p) => ({ ...p, kepala_keluarga: v }))} error={errors.kepala_keluarga} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Alamat (Dukuh)" value={editKKData.alamat} onChange={(v) => setEditKKData((p) => ({ ...p, alamat: v }))} error={errors.alamat} required />
              <FormInput label="RT/RW" value={editKKData.rt_rw} onChange={(v) => setEditKKData((p) => ({ ...p, rt_rw: v }))} required />
              <FormInput label="Kelurahan" value={editKKData.kelurahan} onChange={(v) => setEditKKData((p) => ({ ...p, kelurahan: v }))} />
              <FormInput label="Kecamatan" value={editKKData.kecamatan} onChange={(v) => setEditKKData((p) => ({ ...p, kecamatan: v }))} />
              <FormInput label="Kabupaten" value={editKKData.kabupaten} onChange={(v) => setEditKKData((p) => ({ ...p, kabupaten: v }))} />
              <FormInput label="Provinsi" value={editKKData.provinsi} onChange={(v) => setEditKKData((p) => ({ ...p, provinsi: v }))} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Batal</button>
              <button onClick={async () => {
                const e: Record<string, string> = {};
                if (!editKKData.kepala_keluarga.trim()) e.kepala_keluarga = "Wajib diisi";
                if (!editKKData.alamat.trim()) e.alamat = "Wajib diisi";
                if (Object.keys(e).length > 0) { setErrors(e); return; }
                try {
                  await put(`/admin/kk/${editKKData.no_kk}`, {
                    kepala_keluarga: editKKData.kepala_keluarga,
                    alamat: editKKData.alamat,
                    rt_rw: editKKData.rt_rw,
                    kelurahan: editKKData.kelurahan,
                    kecamatan: editKKData.kecamatan,
                    kabupaten: editKKData.kabupaten,
                    provinsi: editKKData.provinsi,
                  });
                  showToast("Data KK berhasil diperbarui.");
                  setModal(null);
                  reloadKK();
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Gagal memperbarui KK.", "error");
                }
              }} className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold"
                style={{ background: "#2563eb", color: "#fff" }}>
                <Save size={13} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ════════ MODAL: HAPUS KK ════════ */}
      {modal === "hapus_kk" && deleteKKTarget && (
        <ModalOverlay onClose={() => { setModal(null); setDeleteKKTarget(null); }}>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "#dc2626", color: "#fff" }}>
            <h3 className="text-sm font-bold">Hapus Kartu Keluarga</h3>
            <button onClick={() => { setModal(null); setDeleteKKTarget(null); }}><X size={16} color="white" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 rounded text-xs" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
              <p className="font-bold mb-2" style={{ color: "#991b1b" }}>Peringatan!</p>
              <p className="opacity-70 mb-2">Anda akan menghapus KK <strong>{deleteKKTarget.no_kk}</strong> atas nama <strong>{deleteKKTarget.kepala_keluarga}</strong>.</p>
              <p className="opacity-70 mb-2">Tindakan ini akan menghapus <strong>seluruh {deleteKKTarget.anggota.length} anggota KK</strong> dari database kependudukan secara permanen.</p>
              <p className="font-bold" style={{ color: "#991b1b" }}>Aksi ini tidak dapat dibatalkan.</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => { setModal(null); setDeleteKKTarget(null); }} className="px-4 py-2.5 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Batal</button>
              <button onClick={async () => {
                try {
                  await del(`/admin/kk/${deleteKKTarget.no_kk}`);
                  showToast(`KK ${deleteKKTarget.no_kk} berhasil dihapus.`);
                  setModal(null);
                  setDeleteKKTarget(null);
                  setExpandedKK(null);
                  reloadKK();
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "Gagal menghapus KK.", "error");
                }
              }} className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold"
                style={{ background: "#dc2626", color: "#fff" }}>
                <Trash2 size={13} /> Ya, Hapus KK
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ════════ MODAL: IMPORT ════════ */}
      {modal === "import_excel" && (
        <ModalOverlay onClose={() => setModal(null)} wide>
          <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "#b8860b", color: "#fff" }}>
            <h3 className="text-sm font-bold flex items-center gap-2"><FileSpreadsheet size={16} /> Import Data Warga</h3>
            <button onClick={() => setModal(null)}><X size={16} color="white" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 rounded text-xs" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <p className="font-bold mb-2" style={{ color: "#1e40af" }}>Petunjuk Import:</p>
              <p className="opacity-70 mb-2">1. Download template TSV → buka di Excel → isi data → copy semua baris (termasuk header) → paste di bawah.</p>
              <p className="opacity-70 mb-2">2. Atau copy langsung dari Excel (tab-separated). Pastikan urutan kolom sesuai template.</p>
              <p className="opacity-70">3. Warga dengan usia ≥17 tahun akan otomatis disinkronkan menjadi akun pengguna.</p>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">Kolom Wajib (tab-separated)</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {EXCEL_TEMPLATE_COLUMNS.map((c) => (
                  <span key={c} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>{c}</span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">Paste Data (Tab-separated / dari Excel)</label>
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)}
                rows={8} placeholder="Paste data dari Excel di sini (termasuk header)..."
                className="w-full px-3 py-2.5 rounded border text-xs font-mono outline-none resize-none"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-bold"
                style={{ background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                <Download size={12} /> Download Template .tsv
              </button>
            </div>

            {importResult && (
              <div className="p-4 rounded text-xs space-y-2" style={{ background: importResult.success > 0 ? "#dcfce7" : "#fee2e2", border: `1px solid ${importResult.success > 0 ? "#86efac" : "#fca5a5"}` }}>
                <p className="font-bold">Hasil Import: {importResult.success} berhasil, {importResult.failed} gagal</p>
                {importResult.errors.length > 0 && (
                  <div className="space-y-0.5">
                    {importResult.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-red-700 opacity-70">· {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={() => setModal(null)} className="px-4 py-2.5 rounded text-xs font-bold"
                style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>Tutup</button>
              <button onClick={handleImport} className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold"
                style={{ background: "#b8860b", color: "#fff" }}>
                <Upload size={13} /> Proses Import
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-0.5">{label}</p>
      <p className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{value}</p>
    </div>
  );
}

function ModalOverlay({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <>
      <div className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] ${wide ? "max-w-2xl" : "max-w-lg"} rounded-lg shadow-2xl overflow-hidden`}
        style={{ background: "var(--surface)" }}>
        {children}
      </div>
    </>
  );
}

function FormInput({ label, value, onChange, error, type = "text", placeholder, required, disabled }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; placeholder?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2.5 rounded border text-sm outline-none"
        style={{ background: disabled ? "var(--surface-hover)" : "var(--surface)", borderColor: error ? "#dc2626" : "var(--border)", color: "var(--foreground)", opacity: disabled ? 0.6 : 1 }} />
      {error && <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
    </div>
  );
}

function FormSelect({ label, value, options, onChange, error, required }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; error?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--foreground)" }}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded border text-sm outline-none"
        style={{ background: "var(--surface)", borderColor: error ? "#dc2626" : "var(--border)", color: "var(--foreground)" }}>
        <option value="">-- Pilih --</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
    </div>
  );
}

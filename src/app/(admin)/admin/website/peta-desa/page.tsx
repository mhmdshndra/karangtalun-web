"use client";
import { useState } from "react";
import { MapPin, Edit, Trash2, Search, X } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, TextArea, SelectInput, Toggle, SaveButton } from "@/components/admin/CmsComponents";
import { StatusBadge } from "@/components/ui";
import type { CmsPetaDesa } from "@/core/cms/cmsTypes";

const emptyPeta: Omit<CmsPetaDesa, "id"> = { nama: "", kategori: "Pemerintahan", lat: -7.65, lng: 110.18, deskripsi: "", alamat: "", aktif: true, warna: "#dc2626" };
const KATEGORI_PETA = [
  { value: "Pemerintahan", label: "Pemerintahan" },
  { value: "Pendidikan", label: "Pendidikan" },
  { value: "Kesehatan", label: "Kesehatan" },
  { value: "Ibadah", label: "Ibadah" },
  { value: "Ekonomi", label: "Ekonomi" },
  { value: "Wisata", label: "Wisata" },
  { value: "Infrastruktur", label: "Infrastruktur" },
  { value: "Lainnya", label: "Lainnya" },
];
const WARNA_OPTIONS = [
  { value: "#dc2626", label: "Merah" }, { value: "#2563eb", label: "Biru" },
  { value: "#16a34a", label: "Hijau" }, { value: "#ca8a04", label: "Kuning" },
  { value: "#9333ea", label: "Ungu" }, { value: "#ea580c", label: "Oranye" },
  { value: "#0d9488", label: "Teal" }, { value: "#64748b", label: "Abu-abu" },
];

export default function PetaDesaCmsPage() {
  const { cms, addPetaDesa, updatePetaDesa, deletePetaDesa } = useCms();
  const [editing, setEditing] = useState<CmsPetaDesa | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsPetaDesa | null>(null);
  const [search, setSearch] = useState("");

  const filtered = cms.petaDesa.filter((p) => !search || p.nama.toLowerCase().includes(search.toLowerCase()) || p.kategori.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => { try {
    if (!editing) return;
    if (isNew) await addPetaDesa(editing); else await updatePetaDesa(editing.id, editing);
    setEditing(null); setIsNew(false); } catch(e) { alert(e instanceof Error ? e.message : "Gagal menyimpan."); }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsPetaDesa, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Lokasi" : "Edit Lokasi"} subtitle="Kelola titik lokasi peta desa">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}><X size={14} /> Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Lokasi" span2><TextInput value={e.nama} onChange={(v) => u("nama", v)} placeholder="Nama lokasi" /></FormField>
            <FormField label="Kategori"><SelectInput value={e.kategori} onChange={(v) => u("kategori", v)} options={KATEGORI_PETA} /></FormField>
            <FormField label="Warna Marker"><SelectInput value={e.warna} onChange={(v) => u("warna", v)} options={WARNA_OPTIONS} /></FormField>
            <FormField label="Latitude"><TextInput value={String(e.lat)} onChange={(v) => u("lat", parseFloat(v) || 0)} type="number" /></FormField>
            <FormField label="Longitude"><TextInput value={String(e.lng)} onChange={(v) => u("lng", parseFloat(v) || 0)} type="number" /></FormField>
            <FormField label="Alamat" span2><TextInput value={e.alamat} onChange={(v) => u("alamat", v)} placeholder="Alamat lokasi" /></FormField>
          </div>
          <FormField label="Deskripsi" span2><TextArea value={e.deskripsi} onChange={(v) => u("deskripsi", v)} placeholder="Deskripsi lokasi..." rows={3} /></FormField>
          <div className="flex items-center gap-4">
            <Toggle value={e.aktif} onChange={(v) => u("aktif", v)} />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ background: e.warna }} />
              <span className="text-xs opacity-50">Preview warna</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Peta Desa" subtitle="Kelola titik lokasi pada peta desa">
        <AddButton label="Tambah Lokasi" onClick={() => { setEditing({ ...emptyPeta, id: "" } as CmsPetaDesa); setIsNew(true); }} />
      </CmsPageHeader>
      <div className="govt-card overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "var(--border)" }}>
          <Search size={14} style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari lokasi..."
            className="flex-1 bg-transparent text-xs outline-none" style={{ color: "var(--foreground)" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} style={{ opacity: 0.4 }} /></button>}
        </div>
        {filtered.length === 0 ? (
          <CmsEmptyState title="Belum ada titik lokasi" description="Tambahkan lokasi pada peta desa" />
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: p.warna }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{p.nama}</p>
                  <p className="text-xs opacity-50">{p.kategori} · {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</p>
                </div>
                <StatusBadge label={p.aktif ? "Aktif" : "Nonaktif"} variant={p.aktif ? "success" : "warning"} />
                <div className="flex gap-1.5">
                  <button onClick={() => setEditing(p)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Edit size={14} /></button>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deletePetaDesa(deleteTarget.id); setDeleteTarget(null); }} itemName={deleteTarget?.nama || ""} />
    </div>
  );
}

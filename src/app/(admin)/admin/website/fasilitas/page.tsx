"use client";
import { useState } from "react";
import { Edit, Trash2, Plus, MapPin } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, TextArea, Toggle, SaveButton, ImageUploadPreview } from "@/components/admin/CmsComponents";
import type { CmsFasilitas, CmsTitikLokasi } from "@/core/cms/cmsTypes";

function generateTlId(): string {
  return `tl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

const emptyFasilitas: Omit<CmsFasilitas, "id"> = { nama: "", deskripsi: "", gambar: "", label: "", urutan: 1, aktif: true, titikLokasi: [] };
const emptyTitik: Omit<CmsTitikLokasi, "id"> = { nama: "", label: "", lat: 0, lng: 0, routeLink: "", urutan: 1 };

export default function FasilitasCmsPage() {
  const { cms, addFasilitas, updateFasilitas, deleteFasilitas } = useCms();
  const [editing, setEditing] = useState<CmsFasilitas | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsFasilitas | null>(null);

  const handleSave = async () => {
    if (!editing) return;
    try {
      if (isNew) await addFasilitas(editing); else await updateFasilitas(editing.id, editing);
      setEditing(null); setIsNew(false);
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal menyimpan."); }
  };

  // Titik lokasi helpers
  const addTitik = () => {
    if (!editing) return;
    setEditing({ ...editing, titikLokasi: [...editing.titikLokasi, { ...emptyTitik, id: generateTlId(), urutan: editing.titikLokasi.length + 1 }] });
  };
  const updateTitik = (idx: number, key: keyof CmsTitikLokasi, val: any) => {
    if (!editing) return;
    const arr = [...editing.titikLokasi];
    arr[idx] = { ...arr[idx], [key]: val };
    setEditing({ ...editing, titikLokasi: arr });
  };
  const removeTitik = (idx: number) => {
    if (!editing) return;
    setEditing({ ...editing, titikLokasi: editing.titikLokasi.filter((_, i) => i !== idx) });
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsFasilitas, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Fasilitas" : "Edit Fasilitas"} subtitle="Kelola fasilitas & infrastruktur desa">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2.5 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="space-y-5">
          <div className="govt-card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nama Fasilitas"><TextInput value={e.nama} onChange={(v) => u("nama", v)} placeholder="Contoh: Balai Desa" /></FormField>
              <FormField label="Label Ringkas"><TextInput value={e.label} onChange={(v) => u("label", v)} placeholder="Contoh: 1 unit, ±12 km" /></FormField>
              <FormField label="Urutan"><TextInput value={String(e.urutan)} onChange={(v) => u("urutan", parseInt(v) || 0)} type="number" /></FormField>
              <FormField label="Status"><Toggle value={e.aktif} onChange={(v) => u("aktif", v)} /></FormField>
            </div>
            <FormField label="Deskripsi" span2><TextArea value={e.deskripsi} onChange={(v) => u("deskripsi", v)} rows={2} placeholder="Keterangan singkat fasilitas" /></FormField>
            <ImageUploadPreview label="Gambar Cover" value={e.gambar} onChange={(v) => u("gambar", v)} fileField="gambar" />
          </div>

          {/* Titik Lokasi */}
          <div className="govt-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: "#dc2626" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Titik Lokasi ({e.titikLokasi.length})</h3>
              </div>
              <button onClick={addTitik} className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "#dc2626" }}>
                <Plus size={14} /> Tambah Titik
              </button>
            </div>
            {e.titikLokasi.length === 0 ? (
              <p className="text-xs opacity-50 text-center py-6">Belum ada titik lokasi. Klik &quot;Tambah Titik&quot; untuk menambahkan.</p>
            ) : (
              <div className="space-y-3">
                {e.titikLokasi.map((tl, idx) => (
                  <div key={tl.id} className="p-3 rounded" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold opacity-40">Titik #{idx + 1}</span>
                      <button onClick={() => removeTitik(idx)} className="p-1 rounded" style={{ color: "#dc2626" }}><Trash2 size={12} /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Nama Titik"><TextInput value={tl.nama} onChange={(v) => updateTitik(idx, "nama", v)} placeholder="Contoh: SDN 1 Karangtalun" /></FormField>
                      <FormField label="Label/Alamat"><TextInput value={tl.label} onChange={(v) => updateTitik(idx, "label", v)} placeholder="Contoh: Dusun I" /></FormField>
                      <FormField label="Latitude"><TextInput value={String(tl.lat)} onChange={(v) => updateTitik(idx, "lat", parseFloat(v) || 0)} type="number" /></FormField>
                      <FormField label="Longitude"><TextInput value={String(tl.lng)} onChange={(v) => updateTitik(idx, "lng", parseFloat(v) || 0)} type="number" /></FormField>
                      <FormField label="Link Peta/Route" span2><TextInput value={tl.routeLink} onChange={(v) => updateTitik(idx, "routeLink", v)} placeholder="https://maps.google.com/..." /></FormField>
                      <FormField label="Urutan"><TextInput value={String(tl.urutan)} onChange={(v) => updateTitik(idx, "urutan", parseInt(v) || 0)} type="number" /></FormField>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...cms.fasilitas].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Kelola Fasilitas & Infrastruktur" subtitle={`${cms.fasilitas.length} fasilitas`}>
        <AddButton label="Tambah Fasilitas" onClick={() => { setEditing({ id: "", ...emptyFasilitas } as CmsFasilitas); setIsNew(true); }} />
      </CmsPageHeader>
      {sorted.length === 0 ? <CmsEmptyState title="Belum ada fasilitas" description="Tambahkan data fasilitas dan infrastruktur desa." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((f) => (
            <div key={f.id} className="govt-card overflow-hidden group">
              <div className="h-28 relative" style={{ background: "var(--surface-hover)" }}>
                {f.gambar && <img src={f.gambar} alt={f.nama} className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(f); setIsNew(false); }} className="p-1.5 rounded" style={{ background: "#2563eb", color: "#fff" }}><Edit size={12} /></button>
                  <button onClick={() => setDeleteTarget(f)} className="p-1.5 rounded" style={{ background: "#dc2626", color: "#fff" }}><Trash2 size={12} /></button>
                </div>
                {!f.aktif && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded">Nonaktif</span></div>}
                <span className="absolute bottom-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.9)", color: "var(--primary)" }}>{f.label}</span>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{f.nama}</p>
                <p className="text-[10px] opacity-50 line-clamp-1 mt-0.5">{f.deskripsi}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin size={10} style={{ color: "var(--primary)", opacity: 0.6 }} />
                  <span className="text-[10px] opacity-40">{f.titikLokasi.length} titik lokasi</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteFasilitas(deleteTarget.id)} itemName={deleteTarget?.nama || ""} />
    </div>
  );
}

"use client";
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, TextArea, Toggle, SaveButton, ImageUploadPreview } from "@/components/admin/CmsComponents";
import type { CmsPotensiDesa } from "@/core/cms/cmsTypes";

const emptyPotensi: Omit<CmsPotensiDesa, "id"> = { judul: "", deskripsi: "", gambar: "", urutan: 1, aktif: true };

export default function PotensiDesaCmsPage() {
  const { cms, addPotensiDesa, updatePotensiDesa, deletePotensiDesa } = useCms();
  const [editing, setEditing] = useState<CmsPotensiDesa | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsPotensiDesa | null>(null);

  const handleSave = async () => { try {
    if (!editing) return;
    if (isNew) await addPotensiDesa(editing); else await updatePotensiDesa(editing.id, editing);
    setEditing(null); setIsNew(false); } catch(e) { alert(e instanceof Error ? e.message : "Gagal menyimpan."); }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsPotensiDesa, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Potensi" : "Edit Potensi"} subtitle="Kelola potensi desa">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2.5 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Judul"><TextInput value={e.judul} onChange={(v) => u("judul", v)} placeholder="Contoh: Pertanian" /></FormField>
            <FormField label="Urutan"><TextInput value={String(e.urutan)} onChange={(v) => u("urutan", parseInt(v) || 0)} type="number" /></FormField>
            <FormField label="Status"><Toggle value={e.aktif} onChange={(v) => u("aktif", v)} /></FormField>
          </div>
          <FormField label="Deskripsi" span2><TextArea value={e.deskripsi} onChange={(v) => u("deskripsi", v)} rows={3} placeholder="Deskripsi singkat potensi desa" /></FormField>
          <ImageUploadPreview label="Gambar Card" value={e.gambar} onChange={(v) => u("gambar", v)} fileField="gambar" />
        </div>
      </div>
    );
  }

  const sorted = [...cms.potensiDesa].sort((a, b) => a.urutan - b.urutan);

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Kelola Potensi Desa" subtitle={`${cms.potensiDesa.length} potensi`}>
        <AddButton label="Tambah Potensi" onClick={() => { setEditing({ id: "", ...emptyPotensi } as CmsPotensiDesa); setIsNew(true); }} />
      </CmsPageHeader>
      {sorted.length === 0 ? <CmsEmptyState title="Belum ada potensi desa" description="Tambahkan potensi desa untuk ditampilkan di website." /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((p) => (
            <div key={p.id} className="govt-card overflow-hidden group">
              <div className="h-32 relative" style={{ background: "var(--surface-hover)" }}>
                {p.gambar && <img src={p.gambar} alt={p.judul} className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(p); setIsNew(false); }} className="p-1.5 rounded" style={{ background: "#2563eb", color: "#fff" }}><Edit size={12} /></button>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded" style={{ background: "#dc2626", color: "#fff" }}><Trash2 size={12} /></button>
                </div>
                {!p.aktif && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded">Nonaktif</span></div>}
              </div>
              <div className="p-3">
                <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{p.judul}</p>
                <p className="text-[10px] opacity-50 line-clamp-2 mt-1">{p.deskripsi}</p>
                <p className="text-[10px] opacity-30 mt-1">Urutan: {p.urutan}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deletePotensiDesa(deleteTarget.id)} itemName={deleteTarget?.judul || ""} />
    </div>
  );
}

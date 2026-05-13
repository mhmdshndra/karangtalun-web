"use client";
import { useState } from "react";
import { Image as ImageIcon, Edit, Trash2, Search, X } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, Toggle, SaveButton, ImageUploadPreview } from "@/components/admin/CmsComponents";
import type { CmsGaleri } from "@/core/cms/cmsTypes";

const emptyGaleri: Omit<CmsGaleri, "id"> = { judul: "", url: "", kategori: "Kegiatan", tanggal: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }), deskripsi: "", urutan: 1, aktif: true };

export default function GaleriCmsPage() {
  const { cms, addGaleri, updateGaleri, deleteGaleri } = useCms();
  const [editing, setEditing] = useState<CmsGaleri | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsGaleri | null>(null);

  const handleSave = async () => {
    try {
    if (!editing) return;
    if (isNew) await addGaleri(editing); else await updateGaleri(editing.id, editing);
      setEditing(null); setIsNew(false);
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal menyimpan galeri."); return; }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsGaleri, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Foto" : "Edit Foto"} subtitle="Kelola foto galeri">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2.5 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Judul"><TextInput value={e.judul} onChange={(v) => u("judul", v)} /></FormField>
            <FormField label="Kategori"><TextInput value={e.kategori} onChange={(v) => u("kategori", v)} /></FormField>
            <FormField label="Tanggal"><TextInput value={e.tanggal} onChange={(v) => u("tanggal", v)} /></FormField>
            <FormField label="Urutan"><TextInput value={String(e.urutan)} onChange={(v) => u("urutan", parseInt(v) || 0)} type="number" /></FormField>
            <FormField label="Status"><Toggle value={e.aktif} onChange={(v) => u("aktif", v)} /></FormField>
            <FormField label="Deskripsi Singkat" span2><TextInput value={e.deskripsi || ""} onChange={(v) => u("deskripsi", v)} placeholder="Deskripsi singkat (opsional)" /></FormField>
          </div>
          <ImageUploadPreview label="Foto" value={e.url} onChange={(v) => u("url", v)} fileField="foto" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Kelola Galeri" subtitle={`${cms.galeri.length} foto`}>
        <AddButton label="Tambah Foto" onClick={() => { setEditing({ id: "", ...emptyGaleri } as CmsGaleri); setIsNew(true); }} />
      </CmsPageHeader>
      {cms.galeri.length === 0 ? <CmsEmptyState title="Belum ada foto galeri" description="Upload foto galeri desa Anda." /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cms.galeri.sort((a, b) => a.urutan - b.urutan).map((g) => (
            <div key={g.id} className="govt-card overflow-hidden group">
              <div className="h-32 bg-gray-200 relative">{g.url && <img src={g.url} alt={g.judul} className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(g); setIsNew(false); }} className="p-1.5 rounded" style={{ background: "#2563eb", color: "#fff" }}><Edit size={12} /></button>
                  <button onClick={() => setDeleteTarget(g)} className="p-1.5 rounded" style={{ background: "#dc2626", color: "#fff" }}><Trash2 size={12} /></button>
                </div>
                {!g.aktif && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded">Nonaktif</span></div>}
              </div>
              <div className="p-3"><p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{g.judul}</p><p className="text-[10px] opacity-50">{g.kategori} · {g.tanggal}</p></div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteGaleri(deleteTarget.id)} itemName={deleteTarget?.judul || ""} />
    </div>
  );
}

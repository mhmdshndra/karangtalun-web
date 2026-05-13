"use client";
import { useState } from "react";
import { ShoppingBag, Edit, Trash2, Search, X, Star, ThumbsUp } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, TextArea, Toggle, SaveButton, ImageUploadPreview } from "@/components/admin/CmsComponents";
import { StatusBadge } from "@/components/ui";
import type { CmsUmkm } from "@/core/cms/cmsTypes";

const emptyUmkm: Omit<CmsUmkm, "id"> = { nama: "", slug: "", kategori: "Sembako & Camilan", namaPenjual: "", rtRw: "", whatsapp: "", harga: 0, foto: "", deskripsi: "", likes: 0, aktif: true, unggulan: false };

export default function UmkmCmsPage() {
  const { cms, addUmkm, updateUmkm, deleteUmkm } = useCms();
  const [editing, setEditing] = useState<CmsUmkm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsUmkm | null>(null);
  const [search, setSearch] = useState("");

  const filtered = cms.umkm.filter((u) => !search || u.nama.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!editing) return;
    const slug = editing.slug || editing.nama.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    try {
      if (isNew) await addUmkm({ ...editing, slug }); else await updateUmkm(editing.id, { ...editing, slug });
      setEditing(null); setIsNew(false);
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal menyimpan."); }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsUmkm, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Produk UMKM" : "Edit Produk"} subtitle="Kelola produk UMKM desa">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2.5 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Produk" span2><TextInput value={e.nama} onChange={(v) => u("nama", v)} /></FormField>
            <FormField label="Slug"><TextInput value={e.slug} onChange={(v) => u("slug", v)} placeholder="auto-generated" /></FormField>
            <FormField label="Kategori"><TextInput value={e.kategori} onChange={(v) => u("kategori", v)} /></FormField>
            <FormField label="Nama Penjual"><TextInput value={e.namaPenjual} onChange={(v) => u("namaPenjual", v)} /></FormField>
            <FormField label="RT/RW"><TextInput value={e.rtRw} onChange={(v) => u("rtRw", v)} /></FormField>
            <FormField label="No WhatsApp"><TextInput value={e.whatsapp} onChange={(v) => u("whatsapp", v)} placeholder="628xxx" /></FormField>
            <FormField label="Harga (Rp)"><TextInput value={String(e.harga)} onChange={(v) => u("harga", parseInt(v) || 0)} type="number" /></FormField>
            <FormField label="Like Awal"><TextInput value={String(e.likes)} onChange={(v) => u("likes", parseInt(v) || 0)} type="number" /></FormField>
            <FormField label="Status"><Toggle value={e.aktif} onChange={(v) => u("aktif", v)} labelOn="Tampil" labelOff="Sembunyi" /></FormField>
            <FormField label="Unggulan"><Toggle value={e.unggulan} onChange={(v) => u("unggulan", v)} labelOn="Ya" labelOff="Tidak" /></FormField>
          </div>
          <ImageUploadPreview label="Foto Produk" value={e.foto} onChange={(v) => u("foto", v)} fileField="foto" />
          <FormField label="Deskripsi" span2><TextArea value={e.deskripsi} onChange={(v) => u("deskripsi", v)} rows={4} /></FormField>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Kelola UMKM" subtitle={`${cms.umkm.length} produk`}>
        <AddButton label="Tambah Produk" onClick={() => { setEditing({ id: "", ...emptyUmkm } as CmsUmkm); setIsNew(true); }} />
      </CmsPageHeader>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
      </div>
      {filtered.length === 0 ? <CmsEmptyState title="Belum ada produk UMKM" description="Tambahkan produk UMKM desa." /> : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="govt-card px-5 py-3 flex items-center gap-4">
              {p.foto && <div className="w-12 h-12 rounded overflow-hidden shrink-0"><img src={p.foto} alt="" className="w-full h-full object-cover" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{p.nama}</p>
                <p className="text-[11px] opacity-50">{p.kategori} · {p.namaPenjual} · Rp {p.harga.toLocaleString("id")} · <ThumbsUp size={10} className="inline" /> {p.likes}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.unggulan && <Star size={12} style={{ color: "#d97706" }} />}
                <StatusBadge label={p.aktif ? "Tampil" : "Sembunyi"} variant={p.aktif ? "success" : "warning"} />
                <button onClick={() => { setEditing(p); setIsNew(false); }} className="p-1.5 rounded" style={{ color: "#2563eb" }}><Edit size={14} /></button>
                <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteUmkm(deleteTarget.id)} itemName={deleteTarget?.nama || ""} />
    </div>
  );
}

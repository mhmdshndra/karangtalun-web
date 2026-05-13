"use client";
import { useState } from "react";
import { Newspaper, Edit, Trash2, Eye, Star, Search, X } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, TextArea, SelectInput, Toggle, SaveButton, ImageUploadPreview } from "@/components/admin/CmsComponents";
import { StatusBadge } from "@/components/ui";
import type { CmsBerita } from "@/core/cms/cmsTypes";

const emptyBerita: Omit<CmsBerita, "id"> = { judul: "", slug: "", kategori: "Pengumuman", penulis: "Admin Utama", tanggal: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }), waktu: "08:00 WIB", views: 0, status: "Draft", tipe: "Artikel", thumbnail: "", konten: "", isFeatured: false, linkVideo: "" };

export default function BeritaCmsPage() {
  const { cms, addBerita, updateBerita, deleteBerita } = useCms();
  const [editing, setEditing] = useState<CmsBerita | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsBerita | null>(null);
  const [search, setSearch] = useState("");

  const filtered = cms.berita.filter((b) => !search || b.judul.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!editing) return;
    const slug = editing.slug || editing.judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const data = { ...editing, slug };
    try {
      if (isNew) { await addBerita(data); } else { await updateBerita(editing.id, data); }
      setEditing(null); setIsNew(false);
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal menyimpan berita."); }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsBerita, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Berita" : "Edit Berita"} subtitle={isNew ? "Buat artikel baru" : `Mengedit: ${e.judul}`}>
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="px-4 py-2.5 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Judul" span2><TextInput value={e.judul} onChange={(v) => u("judul", v)} placeholder="Judul berita" /></FormField>
            <FormField label="Slug"><TextInput value={e.slug} onChange={(v) => u("slug", v)} placeholder="auto-generated" /></FormField>
            <FormField label="Kategori"><SelectInput value={e.kategori} onChange={(v) => u("kategori", v)} options={["Pengumuman","Pembangunan","Pemberdayaan","Pembinaan","Pemerintahan"].map((k) => ({ value: k, label: k }))} /></FormField>
            <FormField label="Penulis"><TextInput value={e.penulis} onChange={(v) => u("penulis", v)} /></FormField>
            <FormField label="Tanggal"><TextInput value={e.tanggal} onChange={(v) => u("tanggal", v)} /></FormField>
            <FormField label="Waktu"><TextInput value={e.waktu} onChange={(v) => u("waktu", v)} /></FormField>
            <FormField label="Tipe"><SelectInput value={e.tipe} onChange={(v) => u("tipe", v)} options={[{ value: "Artikel", label: "Artikel" }, { value: "Video", label: "Video" }]} /></FormField>
            {e.tipe === "Video" && <FormField label="Link Video"><TextInput value={e.linkVideo || ""} onChange={(v) => u("linkVideo", v)} placeholder="https://youtube.com/..." /></FormField>}
            <FormField label="Status"><SelectInput value={e.status} onChange={(v) => u("status", v)} options={[{ value: "Draft", label: "Draft" }, { value: "Terbit", label: "Terbit" }, { value: "Diarsipkan", label: "Arsip" }]} /></FormField>
            <FormField label="Featured"><Toggle value={e.isFeatured} onChange={(v) => u("isFeatured", v)} labelOn="Ya" labelOff="Tidak" /></FormField>
          </div>
          <ImageUploadPreview label="Thumbnail" value={e.thumbnail} onChange={(v) => u("thumbnail", v)} fileField="thumbnail" />
          <FormField label="Konten" span2><TextArea value={e.konten} onChange={(v) => u("konten", v)} rows={8} placeholder="Isi berita..." /></FormField>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Kelola Berita" subtitle={`${cms.berita.length} artikel`}>
        <AddButton label="Tambah Berita" onClick={() => { setEditing({ id: "", ...emptyBerita } as CmsBerita); setIsNew(true); }} />
      </CmsPageHeader>
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari berita..." className="w-full pl-9 pr-4 py-2.5 rounded border text-xs outline-none" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} style={{ opacity: 0.4 }} /></button>}
      </div>
      {filtered.length === 0 ? <CmsEmptyState title="Belum ada berita" description="Klik tombol Tambah Berita untuk membuat artikel baru." /> : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <div key={b.id} className="govt-card px-5 py-3 flex items-center gap-4">
              {b.thumbnail && <div className="w-14 h-10 rounded overflow-hidden shrink-0"><img src={b.thumbnail} alt="" className="w-full h-full object-cover" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{b.judul}</p>
                <p className="text-[11px] opacity-50 truncate">{b.kategori} · {b.penulis} · {b.tanggal}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {b.isFeatured && <Star size={12} style={{ color: "#d97706" }} />}
                <StatusBadge label={b.status} variant={b.status === "Terbit" ? "success" : b.status === "Draft" ? "warning" : "info"} />
                <button onClick={() => { setEditing(b); setIsNew(false); }} className="p-1.5 rounded" style={{ color: "#2563eb" }}><Edit size={14} /></button>
                <button onClick={() => setDeleteTarget(b)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteBerita(deleteTarget.id)} itemName={deleteTarget?.judul || ""} />
    </div>
  );
}

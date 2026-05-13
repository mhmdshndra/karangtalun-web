"use client";
import { useState } from "react";
import { Users, Edit, Trash2, Search, X, GripVertical } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, TextArea, SelectInput, Toggle, SaveButton, ImageUploadPreview } from "@/components/admin/CmsComponents";
import { StatusBadge } from "@/components/ui";
import type { CmsAparatur } from "@/core/cms/cmsTypes";

const emptyAparatur: Omit<CmsAparatur, "id"> = { nama: "", jabatan: "", foto: "", kategoriJabatan: "Pemerintah Desa", urutan: 0, aktif: true };
const KATEGORI_OPTIONS = [
  { value: "Pemerintah Desa", label: "Pemerintah Desa" },
  { value: "BPD", label: "BPD" },
  { value: "LPMD", label: "LPMD" },
  { value: "PKK", label: "PKK" },
  { value: "Karang Taruna", label: "Karang Taruna" },
  { value: "RT/RW", label: "RT/RW" },
  { value: "Lainnya", label: "Lainnya" },
];

export default function AparaturCmsPage() {
  const { cms, addAparatur, updateAparatur, deleteAparatur } = useCms();
  const [editing, setEditing] = useState<CmsAparatur | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsAparatur | null>(null);
  const [search, setSearch] = useState("");

  const filtered = cms.aparatur
    .filter((a) => !search || a.nama.toLowerCase().includes(search.toLowerCase()) || a.jabatan.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.urutan - b.urutan);

  const handleSave = async () => { try {
    if (!editing) return;
    if (isNew) await addAparatur(editing); else await updateAparatur(editing.id, editing);
    setEditing(null); setIsNew(false); } catch(e) { alert(e instanceof Error ? e.message : "Gagal menyimpan."); }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsAparatur, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Aparatur" : "Edit Aparatur"} subtitle="Kelola data aparatur desa">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}><X size={14} /> Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-5">
          <ImageUploadPreview value={e.foto} onChange={(v) => u("foto", v)} label="Foto Aparatur" fileField="foto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Lengkap"><TextInput value={e.nama} onChange={(v) => u("nama", v)} placeholder="Nama aparatur" /></FormField>
            <FormField label="Jabatan"><TextInput value={e.jabatan} onChange={(v) => u("jabatan", v)} placeholder="Jabatan" /></FormField>
            <FormField label="Kategori Jabatan"><SelectInput value={e.kategoriJabatan} onChange={(v) => u("kategoriJabatan", v)} options={KATEGORI_OPTIONS} /></FormField>
            <FormField label="Urutan Tampil"><TextInput value={String(e.urutan)} onChange={(v) => u("urutan", parseInt(v) || 0)} type="number" /></FormField>
          </div>
          <Toggle value={e.aktif} onChange={(v) => u("aktif", v)} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Aparatur Desa" subtitle="Kelola data aparatur dan struktur organisasi">
        <AddButton label="Tambah Aparatur" onClick={() => { setEditing({ ...emptyAparatur, id: "" } as CmsAparatur); setIsNew(true); }} />
      </CmsPageHeader>
      <div className="govt-card overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "var(--border)" }}>
          <Search size={14} style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari aparatur..."
            className="flex-1 bg-transparent text-xs outline-none" style={{ color: "var(--foreground)" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} style={{ opacity: 0.4 }} /></button>}
        </div>
        {filtered.length === 0 ? (
          <CmsEmptyState title="Belum ada aparatur" description="Tambahkan data aparatur desa" />
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <GripVertical size={14} style={{ opacity: 0.2 }} />
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border" style={{ borderColor: "var(--border)" }}>
                  {a.foto ? <img src={a.foto} alt={a.nama} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--surface-hover)", color: "var(--foreground)" }}>{a.nama.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{a.nama}</p>
                  <p className="text-xs opacity-50">{a.jabatan} · {a.kategoriJabatan}</p>
                </div>
                <span className="text-[10px] font-mono opacity-30">#{a.urutan}</span>
                <StatusBadge label={a.aktif ? "Aktif" : "Nonaktif"} variant={a.aktif ? "success" : "warning"} />
                <div className="flex gap-1.5">
                  <button onClick={() => setEditing(a)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Edit size={14} /></button>
                  <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteAparatur(deleteTarget.id); setDeleteTarget(null); }} itemName={deleteTarget?.nama || ""} />
    </div>
  );
}

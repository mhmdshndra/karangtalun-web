"use client";
import { useState } from "react";
import { FileText, Edit, Trash2, Search, X, ExternalLink } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, SelectInput, Toggle, SaveButton } from "@/components/admin/CmsComponents";
import { StatusBadge } from "@/components/ui";
import type { CmsPpidDokumen } from "@/core/cms/cmsTypes";

const emptyDok: Omit<CmsPpidDokumen, "id"> = { judul: "", kategori: "Informasi Berkala", tanggal: new Date().toISOString().split("T")[0], fileUrl: "", aktif: true, urutan: 0 };
const KATEGORI_PPID = [
  { value: "Informasi Berkala", label: "Informasi Berkala" },
  { value: "Informasi Serta Merta", label: "Informasi Serta Merta" },
  { value: "Informasi Setiap Saat", label: "Informasi Setiap Saat" },
  { value: "Informasi Dikecualikan", label: "Informasi Dikecualikan" },
  { value: "Regulasi", label: "Regulasi" },
  { value: "Anggaran", label: "Anggaran" },
  { value: "Lainnya", label: "Lainnya" },
];

export default function PpidDokumenCmsPage() {
  const { cms, addPpidDokumen, updatePpidDokumen, deletePpidDokumen } = useCms();
  const [editing, setEditing] = useState<CmsPpidDokumen | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsPpidDokumen | null>(null);
  const [search, setSearch] = useState("");

  const filtered = cms.ppidDokumen
    .filter((d) => !search || d.judul.toLowerCase().includes(search.toLowerCase()) || d.kategori.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.urutan - b.urutan);

  const handleSave = async () => { try {
    if (!editing) return;
    if (isNew) await addPpidDokumen(editing); else await updatePpidDokumen(editing.id, editing);
    setEditing(null); setIsNew(false); } catch(e) { alert(e instanceof Error ? e.message : "Gagal menyimpan."); }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsPpidDokumen, val: any) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Dokumen" : "Edit Dokumen"} subtitle="Kelola dokumen informasi publik">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}><X size={14} /> Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Judul Dokumen" span2><TextInput value={e.judul} onChange={(v) => u("judul", v)} placeholder="Judul dokumen" /></FormField>
            <FormField label="Kategori"><SelectInput value={e.kategori} onChange={(v) => u("kategori", v)} options={KATEGORI_PPID} /></FormField>
            <FormField label="Tanggal"><TextInput value={e.tanggal} onChange={(v) => u("tanggal", v)} type="date" /></FormField>
            <FormField label="URL File Dokumen" span2><TextInput value={e.fileUrl} onChange={(v) => u("fileUrl", v)} placeholder="https://... atau path file" /></FormField>
            <FormField label="Urutan Tampil"><TextInput value={String(e.urutan)} onChange={(v) => u("urutan", parseInt(v) || 0)} type="number" /></FormField>
          </div>
          <Toggle value={e.aktif} onChange={(v) => u("aktif", v)} labelOn="Tampil" labelOff="Sembunyi" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="PPID Dokumen" subtitle="Kelola dokumen informasi publik desa">
        <AddButton label="Tambah Dokumen" onClick={() => { setEditing({ ...emptyDok, id: "" } as CmsPpidDokumen); setIsNew(true); }} />
      </CmsPageHeader>
      <div className="govt-card overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "var(--border)" }}>
          <Search size={14} style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari dokumen..."
            className="flex-1 bg-transparent text-xs outline-none" style={{ color: "var(--foreground)" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} style={{ opacity: 0.4 }} /></button>}
        </div>
        {filtered.length === 0 ? (
          <CmsEmptyState title="Belum ada dokumen PPID" description="Tambahkan dokumen informasi publik" />
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((d) => (
              <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(220,38,38,0.1)" }}>
                  <FileText size={16} style={{ color: "#dc2626" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{d.judul}</p>
                  <p className="text-xs opacity-50">{d.kategori} · {d.tanggal}</p>
                </div>
                {d.fileUrl && (
                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded opacity-40 hover:opacity-100"><ExternalLink size={14} /></a>
                )}
                <span className="text-[10px] font-mono opacity-30">#{d.urutan}</span>
                <StatusBadge label={d.aktif ? "Aktif" : "Nonaktif"} variant={d.aktif ? "success" : "warning"} />
                <div className="flex gap-1.5">
                  <button onClick={() => setEditing(d)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Edit size={14} /></button>
                  <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deletePpidDokumen(deleteTarget.id); setDeleteTarget(null); }} itemName={deleteTarget?.judul || ""} />
    </div>
  );
}

"use client";
import { useState } from "react";
import { Briefcase, Edit, Trash2, Search, X, Plus } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, AddButton, CmsEmptyState, ConfirmDeleteModal, FormField, TextInput, TextArea, SelectInput, Toggle, SaveButton } from "@/components/admin/CmsComponents";
import { StatusBadge } from "@/components/ui";
import type { CmsLayananPublik } from "@/core/cms/cmsTypes";

const emptyLayanan: Omit<CmsLayananPublik, "id"> = {
  nama: "", deskripsi: "", kategori: "kependudukan", estimasiWaktu: "", biaya: "Gratis",
  persyaratan: [], prosedur: [], aktif: true, butuhLogin: true, instruksi: "",
  routeSlug: "", tipeLayanan: "surat",
};

const KATEGORI_LAYANAN = [
  { value: "kependudukan", label: "Kependudukan" },
  { value: "sosial", label: "Sosial" },
  { value: "ekonomi", label: "Ekonomi" },
  { value: "keamanan", label: "Keamanan" },
  { value: "infrastruktur", label: "Infrastruktur" },
  { value: "umum", label: "Umum" },
];

const TIPE_LAYANAN = [
  { value: "surat", label: "Surat (Permohonan Warga)" },
  { value: "laporan", label: "Laporan / Aduan (Publik)" },
];

const ROUTE_SLUG_OPTIONS = [
  { value: "suket-domisili", label: "suket-domisili (Surat Domisili)" },
  { value: "sktm", label: "sktm (SKTM)" },
  { value: "pengantar-skck", label: "pengantar-skck (Pengantar SKCK)" },
  { value: "suket-usaha", label: "suket-usaha (Surat Usaha)" },
  { value: "lapor-infrastruktur", label: "lapor-infrastruktur (Laporan Infrastruktur)" },
  { value: "lapor-kamtibmas", label: "lapor-kamtibmas (Laporan Kamtibmas)" },
  { value: "lapor-umum", label: "lapor-umum (Laporan Umum)" },
];

function ArrayEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [val, setVal] = useState("");
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-bold opacity-30 w-5 shrink-0">{i + 1}.</span>
          <input value={item} onChange={(e) => { const arr = [...items]; arr[i] = e.target.value; onChange(arr); }}
            className="flex-1 px-3 py-2 rounded border text-xs outline-none"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={12} /></button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded border text-xs outline-none"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { onChange([...items, val.trim()]); setVal(""); } }} />
        <button onClick={() => { if (val.trim()) { onChange([...items, val.trim()]); setVal(""); } }}
          className="p-1.5 rounded" style={{ background: "#dc2626", color: "#fff" }}><Plus size={14} /></button>
      </div>
    </div>
  );
}

export default function LayananPublikCmsPage() {
  const { cms, addLayanan, updateLayanan, deleteLayanan } = useCms();
  const [editing, setEditing] = useState<CmsLayananPublik | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsLayananPublik | null>(null);
  const [search, setSearch] = useState("");

  const filtered = cms.layananPublik.filter((l) => !search || l.nama.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => { try {
    if (!editing) return;
    if (isNew) await addLayanan(editing); else await updateLayanan(editing.id, editing);
    setEditing(null); setIsNew(false); } catch(e) { alert(e instanceof Error ? e.message : "Gagal menyimpan."); }
  };

  if (editing) {
    const e = editing;
    const u = (key: keyof CmsLayananPublik, val: unknown) => setEditing((p) => p ? { ...p, [key]: val } : p);
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto">
        <CmsPageHeader title={isNew ? "Tambah Layanan" : "Edit Layanan"} subtitle="Kelola informasi layanan publik">
          <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex items-center gap-2 px-3 py-2 rounded text-xs font-bold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}><X size={14} /> Batal</button>
          <SaveButton onClick={handleSave} saving={false} />
        </CmsPageHeader>
        <div className="govt-card p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Layanan" span2><TextInput value={e.nama} onChange={(v) => u("nama", v)} placeholder="Nama layanan" /></FormField>
            <FormField label="Tipe Layanan"><SelectInput value={e.tipeLayanan || "surat"} onChange={(v) => u("tipeLayanan", v)} options={TIPE_LAYANAN} /></FormField>
            <FormField label="Kategori"><SelectInput value={e.kategori} onChange={(v) => u("kategori", v)} options={KATEGORI_LAYANAN} /></FormField>
            <FormField label="Route Slug (Halaman Detail)"><SelectInput value={e.routeSlug || ""} onChange={(v) => u("routeSlug", v)} options={[{ value: "", label: "-- Pilih --" }, ...ROUTE_SLUG_OPTIONS]} /></FormField>
            <FormField label="Estimasi Waktu"><TextInput value={e.estimasiWaktu} onChange={(v) => u("estimasiWaktu", v)} placeholder="Contoh: 3 hari kerja" /></FormField>
            <FormField label="Biaya"><TextInput value={e.biaya} onChange={(v) => u("biaya", v)} placeholder="Gratis / Rp ..." /></FormField>
          </div>
          <FormField label="Deskripsi" span2><TextArea value={e.deskripsi} onChange={(v) => u("deskripsi", v)} placeholder="Deskripsi layanan..." rows={3} /></FormField>
          <FormField label="Persyaratan" span2>
            <ArrayEditor items={e.persyaratan} onChange={(v) => u("persyaratan", v)} placeholder="Tambah persyaratan..." />
          </FormField>
          <FormField label="Prosedur" span2>
            <ArrayEditor items={e.prosedur} onChange={(v) => u("prosedur", v)} placeholder="Tambah langkah prosedur..." />
          </FormField>
          <FormField label="Instruksi Tambahan" span2><TextArea value={e.instruksi} onChange={(v) => u("instruksi", v)} placeholder="Instruksi tambahan untuk warga..." rows={3} /></FormField>
          <div className="flex items-center gap-6">
            <Toggle value={e.aktif} onChange={(v) => u("aktif", v)} />
            <Toggle value={e.butuhLogin} onChange={(v) => u("butuhLogin", v)} labelOn="Butuh Login Warga" labelOff="Publik (Tanpa Login)" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <CmsPageHeader title="Layanan Publik" subtitle="Kelola daftar layanan publik desa (surat & laporan)">
        <AddButton label="Tambah Layanan" onClick={() => { setEditing({ ...emptyLayanan, id: "" } as CmsLayananPublik); setIsNew(true); }} />
      </CmsPageHeader>
      <div className="govt-card overflow-hidden">
        <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "var(--border)" }}>
          <Search size={14} style={{ color: "var(--foreground)", opacity: 0.4 }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari layanan..."
            className="flex-1 bg-transparent text-xs outline-none" style={{ color: "var(--foreground)" }} />
          {search && <button onClick={() => setSearch("")}><X size={14} style={{ opacity: 0.4 }} /></button>}
        </div>
        {filtered.length === 0 ? (
          <CmsEmptyState title="Belum ada layanan" description="Tambahkan layanan publik desa" />
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((l) => (
              <div key={l.id} className="flex items-center gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: (l.tipeLayanan || "surat") === "laporan" ? "rgba(8,145,178,0.1)" : "rgba(220,38,38,0.1)" }}>
                  <Briefcase size={16} style={{ color: (l.tipeLayanan || "surat") === "laporan" ? "#0891b2" : "#dc2626" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{l.nama}</p>
                  <p className="text-xs opacity-50">{l.kategori} · {l.biaya} · {l.estimasiWaktu || "-"} · /{l.routeSlug || "?"}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                    background: (l.tipeLayanan || "surat") === "laporan" ? "rgba(8,145,178,0.1)" : "rgba(220,38,38,0.1)",
                    color: (l.tipeLayanan || "surat") === "laporan" ? "#0891b2" : "#dc2626",
                  }}>
                    {(l.tipeLayanan || "surat") === "laporan" ? "Laporan" : "Surat"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: l.butuhLogin ? "rgba(220,38,38,0.1)" : "var(--surface-hover)", color: l.butuhLogin ? "#dc2626" : "var(--foreground)" }}>{l.butuhLogin ? "Login" : "Publik"}</span>
                  <StatusBadge label={l.aktif ? "Aktif" : "Nonaktif"} variant={l.aktif ? "success" : "warning"} />
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setEditing(l)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Edit size={14} /></button>
                  <button onClick={() => setDeleteTarget(l)} className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteLayanan(deleteTarget.id); setDeleteTarget(null); }} itemName={deleteTarget?.nama || ""} />
    </div>
  );
}

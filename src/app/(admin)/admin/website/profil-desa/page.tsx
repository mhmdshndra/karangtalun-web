"use client";
import { useState } from "react";
import { BookOpen, Plus, X, Trash2 } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, SaveButton, FormField, TextInput, TextArea, SectionCard, ImageUploadPreview } from "@/components/admin/CmsComponents";
import type { CmsProfilDesa } from "@/core/cms/cmsTypes";

export default function ProfilDesaCmsPage() {
  const { cms, updateProfilDesa } = useCms();
  const [form, setForm] = useState<CmsProfilDesa>({ ...cms.profilDesa });
  const [newMisi, setNewMisi] = useState("");

  const u = (key: keyof CmsProfilDesa, val: any) => setForm((p) => ({ ...p, [key]: val }));
  const handleSave = async () => { try { await updateProfilDesa(form); } catch(e) { alert(e instanceof Error ? e.message : "Gagal menyimpan profil desa."); } };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <CmsPageHeader title="Profil Desa" subtitle="Kelola informasi profil dan sejarah desa">
        <SaveButton onClick={handleSave} saving={false} />
      </CmsPageHeader>

      <div className="space-y-5">
        <SectionCard title="Sejarah Desa" icon={<BookOpen size={16} style={{ color: "#dc2626" }} />}>
          <FormField label="Sejarah" span2>
            <TextArea value={form.sejarah} onChange={(v) => u("sejarah", v)} placeholder="Sejarah singkat desa..." rows={6} />
          </FormField>
        </SectionCard>

        <SectionCard title="Visi & Misi">
          <div className="space-y-4">
            <FormField label="Visi">
              <TextArea value={form.visi} onChange={(v) => u("visi", v)} placeholder="Visi desa..." rows={3} />
            </FormField>
            <FormField label="Misi">
              <div className="space-y-2">
                {form.misi.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs font-bold opacity-30 w-5 shrink-0">{i + 1}.</span>
                    <input value={m} onChange={(e) => {
                      const arr = [...form.misi]; arr[i] = e.target.value; u("misi", arr);
                    }} className="flex-1 px-3 py-2 rounded border text-xs outline-none"
                      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                    <button onClick={() => { const arr = form.misi.filter((_, j) => j !== i); u("misi", arr); }}
                      className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={12} /></button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input value={newMisi} onChange={(e) => setNewMisi(e.target.value)} placeholder="Tambah misi baru..."
                    className="flex-1 px-3 py-2 rounded border text-xs outline-none"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    onKeyDown={(e) => { if (e.key === "Enter" && newMisi.trim()) { u("misi", [...form.misi, newMisi.trim()]); setNewMisi(""); } }} />
                  <button onClick={() => { if (newMisi.trim()) { u("misi", [...form.misi, newMisi.trim()]); setNewMisi(""); } }}
                    className="p-1.5 rounded" style={{ background: "#dc2626", color: "#fff" }}><Plus size={14} /></button>
                </div>
              </div>
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Sambutan Kepala Desa">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploadPreview label="Foto Kepala Desa" value={form.fotoKades} onChange={(v) => u("fotoKades", v)} fileField="foto_kades" />
          </div>
          <div className="mt-4">
            <FormField label="Teks Sambutan" span2>
              <TextArea value={form.sambutan} onChange={(v) => u("sambutan", v)} placeholder="Sambutan dari kepala desa..." rows={6} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Potensi Desa">
          <FormField label="Potensi Desa" span2>
            <TextArea value={form.potensi} onChange={(v) => u("potensi", v)} placeholder="Deskripsi potensi desa..." rows={5} />
          </FormField>
        </SectionCard>

        <SectionCard title="Struktur Pemerintahan">
          <FormField label="Deskripsi Struktur" span2>
            <TextArea value={form.strukturPemerintahan} onChange={(v) => u("strukturPemerintahan", v)} placeholder="Deskripsi struktur pemerintahan desa..." rows={5} />
          </FormField>
        </SectionCard>

        <SectionCard title="Fasilitas & Infrastruktur">
          <FormField label="Fasilitas Desa" span2>
            <TextArea value={form.fasilitas} onChange={(v) => u("fasilitas", v)} placeholder="Fasilitas dan infrastruktur desa..." rows={5} />
          </FormField>
        </SectionCard>
      </div>
    </div>
  );
}

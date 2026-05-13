"use client";
import { useState } from "react";
import { Layout, Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, SaveButton, FormField, TextInput, TextArea, SectionCard } from "@/components/admin/CmsComponents";
import type { CmsHeaderFooter } from "@/core/cms/cmsTypes";

export default function HeaderFooterCmsPage() {
  const { cms, updateHeaderFooter } = useCms();
  const [form, setForm] = useState<CmsHeaderFooter>({
    ...cms.headerFooter,
    menuNavigasi: [...cms.headerFooter.menuNavigasi.map((m) => ({ ...m }))],
    linkSosmed: [...cms.headerFooter.linkSosmed.map((l) => ({ ...l }))],
  });

  const u = (key: keyof CmsHeaderFooter, val: any) => setForm((p) => ({ ...p, [key]: val }));
  const handleSave = () => updateHeaderFooter(form);

  const moveMenu = (i: number, dir: -1 | 1) => {
    const arr = [...form.menuNavigasi];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    arr.forEach((m, idx) => (m.urutan = idx));
    u("menuNavigasi", arr);
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <CmsPageHeader title="Header & Footer" subtitle="Kelola menu navigasi, footer, dan kontak">
        <SaveButton onClick={handleSave} saving={false} />
      </CmsPageHeader>

      <div className="space-y-5">
        <SectionCard title="Menu Navigasi" icon={<Layout size={16} style={{ color: "#dc2626" }} />}>
          <div className="space-y-2">
            {form.menuNavigasi
              .sort((a, b) => a.urutan - b.urutan)
              .map((m, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <GripVertical size={14} style={{ opacity: 0.2 }} />
                  <input value={m.label} onChange={(e) => {
                    const arr = [...form.menuNavigasi]; arr[i] = { ...arr[i], label: e.target.value }; u("menuNavigasi", arr);
                  }} placeholder="Label menu" className="flex-1 px-2 py-1 rounded text-xs outline-none bg-transparent"
                    style={{ color: "var(--foreground)" }} />
                  <input value={m.href} onChange={(e) => {
                    const arr = [...form.menuNavigasi]; arr[i] = { ...arr[i], href: e.target.value }; u("menuNavigasi", arr);
                  }} placeholder="/path" className="w-32 px-2 py-1 rounded text-xs outline-none bg-transparent font-mono"
                    style={{ color: "var(--foreground)" }} />
                  <button onClick={() => moveMenu(i, -1)} className="p-1 rounded opacity-40 hover:opacity-100" disabled={i === 0}><ArrowUp size={12} /></button>
                  <button onClick={() => moveMenu(i, 1)} className="p-1 rounded opacity-40 hover:opacity-100" disabled={i === form.menuNavigasi.length - 1}><ArrowDown size={12} /></button>
                  <button onClick={() => u("menuNavigasi", form.menuNavigasi.filter((_, j) => j !== i))}
                    className="p-1 rounded" style={{ color: "#dc2626" }}><Trash2 size={12} /></button>
                </div>
              ))}
            <button onClick={() => u("menuNavigasi", [...form.menuNavigasi, { label: "", href: "/", urutan: form.menuNavigasi.length }])}
              className="flex items-center gap-2 text-xs font-bold mt-2" style={{ color: "#dc2626" }}>
              <Plus size={14} /> Tambah Menu
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Footer">
          <div className="space-y-4">
            <FormField label="Teks Footer" span2>
              <TextArea value={form.teksFooter} onChange={(v) => u("teksFooter", v)} placeholder="Teks footer website..." rows={3} />
            </FormField>
            <FormField label="Kontak Footer" span2>
              <TextArea value={form.kontakFooter} onChange={(v) => u("kontakFooter", v)} placeholder="Informasi kontak di footer..." rows={2} />
            </FormField>
            <FormField label="Jam Pelayanan" span2>
              <TextInput value={form.jamPelayanan} onChange={(v) => u("jamPelayanan", v)} placeholder="Contoh: Senin-Jumat, 08:00-15:00 WIB" />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Link Sosial Media">
          <div className="space-y-2">
            {form.linkSosmed.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={s.platform} onChange={(e) => {
                  const arr = [...form.linkSosmed]; arr[i] = { ...arr[i], platform: e.target.value }; u("linkSosmed", arr);
                }} placeholder="Platform (misal: Facebook)" className="w-32 px-3 py-2 rounded border text-xs outline-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                <input value={s.url} onChange={(e) => {
                  const arr = [...form.linkSosmed]; arr[i] = { ...arr[i], url: e.target.value }; u("linkSosmed", arr);
                }} placeholder="https://..." className="flex-1 px-3 py-2 rounded border text-xs outline-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                <button onClick={() => u("linkSosmed", form.linkSosmed.filter((_, j) => j !== i))}
                  className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => u("linkSosmed", [...form.linkSosmed, { platform: "", url: "" }])}
              className="flex items-center gap-2 text-xs font-bold" style={{ color: "#dc2626" }}>
              <Plus size={14} /> Tambah Sosial Media
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Tombol WhatsApp">
          <FormField label="Nomor WhatsApp Utama">
            <TextInput value={form.tombolWa} onChange={(v) => u("tombolWa", v)} placeholder="Contoh: 6281234567890" />
          </FormField>
        </SectionCard>
      </div>
    </div>
  );
}

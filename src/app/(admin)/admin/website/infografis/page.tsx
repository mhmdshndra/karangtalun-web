"use client";
import { useState } from "react";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, SaveButton, FormField, TextInput, SectionCard } from "@/components/admin/CmsComponents";
import type { CmsInfografis } from "@/core/cms/cmsTypes";

export default function InfografisCmsPage() {
  const { cms, updateInfografis } = useCms();
  const [form, setForm] = useState<CmsInfografis>({ ...cms.infografis, dataBansos: [...cms.infografis.dataBansos.map(d => ({ ...d }))], sdgsCapaian: [...cms.infografis.sdgsCapaian.map(d => ({ ...d }))] });

  const u = (key: keyof CmsInfografis, val: any) => setForm((p) => ({ ...p, [key]: val }));
  const handleSave = () => updateInfografis(form);

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <CmsPageHeader title="Infografis & Data Desa" subtitle="Kelola data statistik dan infografis desa">
        <SaveButton onClick={handleSave} saving={false} />
      </CmsPageHeader>

      <div className="space-y-5">
        <SectionCard title="Data Kependudukan" icon={<BarChart3 size={16} style={{ color: "#dc2626" }} />}>
          <div className="p-3 rounded text-xs" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)", color: "var(--foreground)" }}>
            <p className="font-bold mb-1" style={{ color: "#2563eb" }}>Data otomatis dari Database Warga</p>
            <p style={{ color: "var(--text-muted)" }}>Statistik kependudukan (total penduduk, KK, laki-laki, perempuan, pendidikan, pekerjaan, usia) diambil langsung dari database warga. Untuk memperbarui data ini, kelola di menu <strong>Database Warga</strong>.</p>
          </div>
        </SectionCard>

        <SectionCard title="APBDes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="APBDes Total (Rp)"><TextInput value={String(form.apbdesTotal)} onChange={(v) => u("apbdesTotal", parseInt(v) || 0)} type="number" /></FormField>
            <FormField label="APBDes Realisasi (Rp)"><TextInput value={String(form.apbdesRealisasi)} onChange={(v) => u("apbdesRealisasi", parseInt(v) || 0)} type="number" /></FormField>
          </div>
        </SectionCard>

        <SectionCard title="IDM (Indeks Desa Membangun)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Skor IDM"><TextInput value={String(form.idmSkor)} onChange={(v) => u("idmSkor", parseFloat(v) || 0)} type="number" /></FormField>
            <FormField label="Status IDM"><TextInput value={form.idmStatus} onChange={(v) => u("idmStatus", v)} placeholder="Contoh: Desa Mandiri" /></FormField>
          </div>
        </SectionCard>

        <SectionCard title="Data Stunting">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Total Balita"><TextInput value={String(form.stuntingTotal)} onChange={(v) => u("stuntingTotal", parseInt(v) || 0)} type="number" /></FormField>
            <FormField label="Kasus Stunting"><TextInput value={String(form.stuntingKasus)} onChange={(v) => u("stuntingKasus", parseInt(v) || 0)} type="number" /></FormField>
          </div>
        </SectionCard>

        <SectionCard title="Data Bansos">
          <div className="space-y-3">
            {form.dataBansos.map((b, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <input value={b.program} onChange={(e) => {
                  const arr = [...form.dataBansos]; arr[i] = { ...arr[i], program: e.target.value }; u("dataBansos", arr);
                }} placeholder="Program" className="flex-1 min-w-[120px] px-3 py-2 rounded border text-xs outline-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                <input value={String(b.penerima)} onChange={(e) => {
                  const arr = [...form.dataBansos]; arr[i] = { ...arr[i], penerima: parseInt(e.target.value) || 0 }; u("dataBansos", arr);
                }} placeholder="Penerima" type="number" className="w-24 px-3 py-2 rounded border text-xs outline-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                <input value={b.anggaran} onChange={(e) => {
                  const arr = [...form.dataBansos]; arr[i] = { ...arr[i], anggaran: e.target.value }; u("dataBansos", arr);
                }} placeholder="Anggaran" className="w-32 px-3 py-2 rounded border text-xs outline-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                <button onClick={() => u("dataBansos", form.dataBansos.filter((_, j) => j !== i))}
                  className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => u("dataBansos", [...form.dataBansos, { program: "", penerima: 0, anggaran: "" }])}
              className="flex items-center gap-2 text-xs font-bold" style={{ color: "#dc2626" }}>
              <Plus size={14} /> Tambah Program Bansos
            </button>
          </div>
        </SectionCard>

        <SectionCard title="SDGs Desa">
          <div className="space-y-3">
            {form.sdgsCapaian.map((s, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold opacity-30 w-6 shrink-0">#{s.no}</span>
                <input value={s.title} onChange={(e) => {
                  const arr = [...form.sdgsCapaian]; arr[i] = { ...arr[i], title: e.target.value }; u("sdgsCapaian", arr);
                }} placeholder="Judul SDG" className="flex-1 min-w-[150px] px-3 py-2 rounded border text-xs outline-none"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                <div className="flex items-center gap-1">
                  <input value={String(s.persen)} onChange={(e) => {
                    const arr = [...form.sdgsCapaian]; arr[i] = { ...arr[i], persen: parseFloat(e.target.value) || 0 }; u("sdgsCapaian", arr);
                  }} type="number" className="w-16 px-3 py-2 rounded border text-xs outline-none"
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <span className="text-xs opacity-50">%</span>
                </div>
                <button onClick={() => u("sdgsCapaian", form.sdgsCapaian.filter((_, j) => j !== i))}
                  className="p-1.5 rounded" style={{ color: "#dc2626" }}><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => u("sdgsCapaian", [...form.sdgsCapaian, { no: form.sdgsCapaian.length + 1, title: "", persen: 0 }])}
              className="flex items-center gap-2 text-xs font-bold" style={{ color: "#dc2626" }}>
              <Plus size={14} /> Tambah Capaian SDGs
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

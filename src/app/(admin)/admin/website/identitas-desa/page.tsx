"use client";
import { useState, useEffect } from "react";
import { Building2, MapPin, Phone, Globe, User } from "lucide-react";
import { useCms } from "@/core/cms/useCmsStore";
import { CmsPageHeader, SaveButton, FormField, TextInput, SectionCard } from "@/components/admin/CmsComponents";
import type { CmsIdentitasDesa } from "@/core/cms/cmsTypes";

export default function IdentitasDesaPage() {
  const { cms, updateIdentitasDesa } = useCms();
  const [form, setForm] = useState<CmsIdentitasDesa>(cms.identitasDesa);
  useEffect(() => { setForm(cms.identitasDesa); }, [cms.identitasDesa]);
  const u = (key: keyof CmsIdentitasDesa, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const uSosmed = (key: string, val: string) => setForm((p) => ({ ...p, sosialMedia: { ...p.sosialMedia, [key]: val } }));
  const uKoord = (key: "lat" | "lng", val: string) => setForm((p) => ({ ...p, koordinat: { ...p.koordinat, [key]: parseFloat(val) || 0 } }));

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <CmsPageHeader title="Identitas Desa" subtitle="Atur informasi dasar desa">
        <SaveButton onClick={() => updateIdentitasDesa(form)} saving={false} />
      </CmsPageHeader>
      <div className="space-y-5">
        <SectionCard title="Informasi Desa" icon={<Building2 size={16} style={{ color: "#dc2626" }} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Desa"><TextInput value={form.namaDesa} onChange={(v) => u("namaDesa", v)} /></FormField>
            <FormField label="Kode Desa"><TextInput value={form.kodeDesa} onChange={(v) => u("kodeDesa", v)} /></FormField>
            <FormField label="Kecamatan"><TextInput value={form.kecamatan} onChange={(v) => u("kecamatan", v)} /></FormField>
            <FormField label="Kabupaten"><TextInput value={form.kabupaten} onChange={(v) => u("kabupaten", v)} /></FormField>
            <FormField label="Provinsi"><TextInput value={form.provinsi} onChange={(v) => u("provinsi", v)} /></FormField>
            <FormField label="Kode Pos"><TextInput value={form.kodePos} onChange={(v) => u("kodePos", v)} /></FormField>
            <FormField label="Alamat Lengkap" span2><TextInput value={form.alamat} onChange={(v) => u("alamat", v)} /></FormField>
          </div>
        </SectionCard>
        <SectionCard title="Kontak" icon={<Phone size={16} style={{ color: "#dc2626" }} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email"><TextInput value={form.email} onChange={(v) => u("email", v)} /></FormField>
            <FormField label="Telepon"><TextInput value={form.telepon} onChange={(v) => u("telepon", v)} /></FormField>
            <FormField label="Link Google Maps" span2><TextInput value={form.mapsUrl} onChange={(v) => u("mapsUrl", v)} /></FormField>
          </div>
        </SectionCard>
        <SectionCard title="Pemerintahan" icon={<User size={16} style={{ color: "#dc2626" }} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Kepala Desa"><TextInput value={form.namaKades} onChange={(v) => u("namaKades", v)} /></FormField>
            <FormField label="Jabatan"><TextInput value={form.jabatanKades} onChange={(v) => u("jabatanKades", v)} /></FormField>
            <FormField label="Tahun Anggaran"><TextInput value={form.tahunAnggaran} onChange={(v) => u("tahunAnggaran", v)} /></FormField>
          </div>
        </SectionCard>
        <SectionCard title="Koordinat" icon={<MapPin size={16} style={{ color: "#dc2626" }} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Latitude"><TextInput value={String(form.koordinat.lat)} onChange={(v) => uKoord("lat", v)} /></FormField>
            <FormField label="Longitude"><TextInput value={String(form.koordinat.lng)} onChange={(v) => uKoord("lng", v)} /></FormField>
          </div>
        </SectionCard>
        <SectionCard title="Sosial Media" icon={<Globe size={16} style={{ color: "#dc2626" }} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Facebook"><TextInput value={form.sosialMedia.facebook || ""} onChange={(v) => uSosmed("facebook", v)} placeholder="https://facebook.com/..." /></FormField>
            <FormField label="Instagram"><TextInput value={form.sosialMedia.instagram || ""} onChange={(v) => uSosmed("instagram", v)} placeholder="https://instagram.com/..." /></FormField>
            <FormField label="Twitter / X"><TextInput value={form.sosialMedia.twitter || ""} onChange={(v) => uSosmed("twitter", v)} /></FormField>
            <FormField label="YouTube"><TextInput value={form.sosialMedia.youtube || ""} onChange={(v) => uSosmed("youtube", v)} /></FormField>
            <FormField label="TikTok"><TextInput value={form.sosialMedia.tiktok || ""} onChange={(v) => uSosmed("tiktok", v)} /></FormField>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

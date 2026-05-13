"use client";

import Link from "next/link";
import {
  FileArchive, Zap, Clock, Scale, MessageSquareText,
  ArrowRight, ShieldCheck,
} from "lucide-react";
import PpidPageLayout from "@/components/ppid/PpidPageLayout";
import { useCms } from "@/core/cms/useCmsStore";

import type { PpidDocument } from "@/core/types";

export default function PpidPage() {
  const { cms } = useCms();

  // CMS ppid documents (aktif)
  const cmsDocs = cms.ppidDokumen.filter((d) => d.aktif);

  // Build document list for counting
  const allDocs: PpidDocument[] = cmsDocs.map((d, i) => ({
        id: i + 1,
        title: d.judul,
        category: d.kategori,
        date: d.tanggal,
        downloads: 0,
        fileUrl: d.fileUrl || "#",
      }));

  const KATEGORI_CARDS = [
    {
      href: "/ppid/informasi-berkala",
      icon: FileArchive,
      label: "Informasi Berkala",
      desc: "Laporan keuangan, rencana kerja, dan laporan pertanggungjawaban yang diumumkan secara rutin.",
      color: "#1e40af",
      count: allDocs.filter((d) => d.category === "Informasi Berkala").length,
    },
    {
      href: "/ppid/informasi-serta-merta",
      icon: Zap,
      label: "Informasi Serta Merta",
      desc: "Informasi mendesak yang menyangkut keselamatan dan kepentingan masyarakat umum.",
      color: "#dc2626",
      count: allDocs.filter((d) => d.category === "Informasi Serta Merta").length,
    },
    {
      href: "/ppid/informasi-setiap-saat",
      icon: Clock,
      label: "Informasi Setiap Saat",
      desc: "Profil desa, data kependudukan, dan informasi yang dapat diakses kapan pun.",
      color: "#92400e",
      count: allDocs.filter((d) => d.category === "Informasi Setiap Saat").length,
    },
  ];

  return (
    <PpidPageLayout
      title="Pejabat Pengelola Informasi & Dokumentasi"
      subtitle="PPID Desa Karangtalun bertanggung jawab atas pelayanan informasi publik sesuai UU No. 14 Tahun 2008."
      breadcrumbItems={[
        { label: "Beranda", href: "/" },
        { label: "PPID & Keterbukaan Informasi" },
      ]}
    >
      {/* Pengantar */}
      <div
        className="p-4 rounded-sm flex items-start gap-3 mb-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <ShieldCheck size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            PPID Desa Karangtalun dibentuk berdasarkan SK Kepala Desa sebagai pelaksana
            pelayanan informasi publik di tingkat desa.
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold" style={{ color: "var(--text-subtle)" }}>
            <span>{allDocs.length} dokumen</span>
            <span>·</span>
            <span>4 kategori</span>
            <span>·</span>
            <span>24 pemohon</span>
          </div>
        </div>
      </div>

      {/* Kategori Informasi */}
      <h2
        className="text-xs font-bold mb-3 uppercase tracking-wider"
        style={{ color: "var(--text-subtle)" }}
      >
        Kategori Informasi
      </h2>
      <div className="flex flex-col gap-2 mb-5">
        {KATEGORI_CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group transition-all"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${c.color}0c`, color: c.color, flexShrink: 0,
              }}
            >
              <c.icon size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{c.label}</h3>
                <span className="text-[9px] font-bold px-1.5 py-px rounded-sm" style={{ background: `${c.color}0c`, color: c.color }}>{c.count}</span>
              </div>
              <p className="text-[11px] line-clamp-1" style={{ color: "var(--text-muted)" }}>{c.desc}</p>
            </div>
            <ArrowRight size={14} className="opacity-15 group-hover:opacity-60 transition-opacity shrink-0" style={{ color: "var(--foreground)" }} />
          </Link>
        ))}
      </div>

      {/* Akses Cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Link
          href="/ppid/dasar-hukum"
          className="group transition-all flex items-center gap-3"
          style={{ textDecoration: "none", padding: "0.75rem 1rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 2 }}
        >
          <Scale size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <div className="flex-1">
            <h3 className="text-[11px] font-bold" style={{ color: "var(--foreground)" }}>Dasar Hukum</h3>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Regulasi PPID</p>
          </div>
          <ArrowRight size={12} className="opacity-15 group-hover:opacity-60 transition-opacity" style={{ color: "var(--foreground)" }} />
        </Link>

        <Link
          href="/ppid/permohonan"
          className="group transition-all flex items-center gap-3 rounded-sm"
          style={{ textDecoration: "none", padding: "0.75rem 1rem", background: "var(--primary)", color: "#fff" }}
        >
          <MessageSquareText size={16} style={{ flexShrink: 0 }} />
          <div className="flex-1">
            <h3 className="text-[11px] font-bold">Ajukan Permohonan</h3>
            <p className="text-[10px] opacity-60">Formulir akses informasi</p>
          </div>
          <ArrowRight size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>
    </PpidPageLayout>
  );
}

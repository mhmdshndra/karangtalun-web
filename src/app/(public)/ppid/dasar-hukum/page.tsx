"use client";

import PpidPageLayout from "@/components/ppid/PpidPageLayout";
import DokumenList from "@/components/ppid/DokumenList";
import { Scale } from "lucide-react";

export default function DasarHukumPage() {
  return (
    <PpidPageLayout
      title="Dasar Hukum & Peraturan"
      subtitle="Landasan hukum dan peraturan terkait pengelolaan informasi publik di Desa Karangtalun."
      breadcrumbItems={[
        { label: "Beranda", href: "/" },
        { label: "PPID", href: "/ppid" },
        { label: "Dasar Hukum" },
      ]}
    >
      {/* Penjelasan */}
      <div
        className="p-5 rounded-sm mb-6 flex items-start gap-4"
        style={{
          background: "rgba(26,58,110,0.06)",
          border: "1px solid rgba(26,58,110,0.15)",
        }}
      >
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
          style={{ background: "rgba(26,58,110,0.12)", color: "#1a3a6e" }}
        >
          <Scale size={20} />
        </div>
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: "#1a3a6e" }}>
            Landasan Hukum PPID
          </p>
          <p
            className="text-xs leading-relaxed opacity-70"
            style={{ color: "var(--foreground)" }}
          >
            PPID Desa Karangtalun melaksanakan tugas berdasarkan beberapa regulasi utama,
            termasuk Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik,
            Peraturan Pemerintah, Peraturan Komisi Informasi, serta peraturan daerah dan
            keputusan kepala desa yang berlaku.
          </p>
        </div>
      </div>

      {/* Ringkasan Regulasi */}
      <div className="mb-6">
        <h3
          className="text-sm font-bold mb-3"
          style={{ fontFamily: "Georgia, serif", color: "var(--foreground)" }}
        >
          Ringkasan Regulasi Utama
        </h3>
        <div className="flex flex-col gap-3">
          {[
            {
              title: "UU No. 14 Tahun 2008",
              desc: "Undang-Undang tentang Keterbukaan Informasi Publik — mengatur hak setiap orang untuk memperoleh informasi publik.",
            },
            {
              title: "PP No. 61 Tahun 2010",
              desc: "Peraturan Pemerintah tentang Pelaksanaan UU KIP — mengatur teknis pelaksanaan keterbukaan informasi.",
            },
            {
              title: "Perki No. 1 Tahun 2010",
              desc: "Standar Layanan Informasi Publik — mengatur prosedur dan standar pelayanan informasi oleh badan publik.",
            },
          ].map((r) => (
            <div
              key={r.title}
              className="p-4 rounded-sm"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p
                className="text-xs font-bold mb-1"
                style={{ color: "var(--primary, #1a3a6e)" }}
              >
                {r.title}
              </p>
              <p
                className="text-[11px] leading-relaxed opacity-65"
                style={{ color: "var(--foreground)" }}
              >
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Document List */}
      <h3
        className="text-sm font-bold mb-4"
        style={{ fontFamily: "Georgia, serif", color: "var(--foreground)" }}
      >
        Dokumen Dasar Hukum
      </h3>
      <DokumenList category="Dasar Hukum" />
    </PpidPageLayout>
  );
}

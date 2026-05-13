"use client";

import PpidPageLayout from "@/components/ppid/PpidPageLayout";
import DokumenList from "@/components/ppid/DokumenList";
import { FileArchive } from "lucide-react";

export default function InformasiBerkalaPage() {
  return (
    <PpidPageLayout
      title="Informasi Berkala"
      subtitle="Informasi yang wajib disediakan dan diumumkan secara rutin oleh PPID Desa Karangtalun."
      breadcrumbItems={[
        { label: "Beranda", href: "/" },
        { label: "PPID", href: "/ppid" },
        { label: "Informasi Berkala" },
      ]}
    >
      {/* Penjelasan */}
      <div
        className="p-5 rounded-sm mb-6 flex items-start gap-4"
        style={{
          background: "rgba(30,64,175,0.06)",
          border: "1px solid rgba(30,64,175,0.15)",
        }}
      >
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
          style={{ background: "rgba(30,64,175,0.12)", color: "#1e40af" }}
        >
          <FileArchive size={20} />
        </div>
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: "#1e40af" }}>
            Tentang Informasi Berkala
          </p>
          <p
            className="text-xs leading-relaxed opacity-70"
            style={{ color: "var(--foreground)" }}
          >
            Berdasarkan UU No. 14 Tahun 2008 Pasal 9, informasi berkala adalah informasi yang
            wajib disediakan dan diumumkan secara rutin, termasuk laporan keuangan,
            rencana strategis, laporan pertanggungjawaban, dan informasi lain yang
            diatur dalam peraturan perundang-undangan.
          </p>
        </div>
      </div>

      <DokumenList category="Informasi Berkala" />
    </PpidPageLayout>
  );
}

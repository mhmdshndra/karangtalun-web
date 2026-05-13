"use client";

import PpidPageLayout from "@/components/ppid/PpidPageLayout";
import DokumenList from "@/components/ppid/DokumenList";
import { Clock } from "lucide-react";

export default function InformasiSetiapSaatPage() {
  return (
    <PpidPageLayout
      title="Informasi Setiap Saat"
      subtitle="Informasi yang tersedia setiap saat dan dapat diakses publik kapan pun dibutuhkan."
      breadcrumbItems={[
        { label: "Beranda", href: "/" },
        { label: "PPID", href: "/ppid" },
        { label: "Informasi Setiap Saat" },
      ]}
    >
      {/* Penjelasan */}
      <div
        className="p-5 rounded-sm mb-6 flex items-start gap-4"
        style={{
          background: "rgba(146,64,14,0.06)",
          border: "1px solid rgba(146,64,14,0.15)",
        }}
      >
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
          style={{ background: "rgba(146,64,14,0.12)", color: "#92400e" }}
        >
          <Clock size={20} />
        </div>
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: "#92400e" }}>
            Tentang Informasi Setiap Saat
          </p>
          <p
            className="text-xs leading-relaxed opacity-70"
            style={{ color: "var(--foreground)" }}
          >
            Berdasarkan UU No. 14 Tahun 2008 Pasal 11, informasi setiap saat mencakup
            seluruh informasi yang berada di bawah penguasaan badan publik dan dapat
            diakses oleh masyarakat kapan saja, termasuk profil desa, data kependudukan,
            daftar informasi publik, dan struktur organisasi.
          </p>
        </div>
      </div>

      <DokumenList category="Informasi Setiap Saat" />
    </PpidPageLayout>
  );
}

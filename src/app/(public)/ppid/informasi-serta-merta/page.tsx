"use client";

import PpidPageLayout from "@/components/ppid/PpidPageLayout";
import DokumenList from "@/components/ppid/DokumenList";
import { Zap } from "lucide-react";

export default function InformasiSertaMertaPage() {
  return (
    <PpidPageLayout
      title="Informasi Serta Merta"
      subtitle="Informasi yang wajib disampaikan segera kepada publik karena bersifat mendesak."
      breadcrumbItems={[
        { label: "Beranda", href: "/" },
        { label: "PPID", href: "/ppid" },
        { label: "Informasi Serta Merta" },
      ]}
    >
      {/* Penjelasan */}
      <div
        className="p-5 rounded-sm mb-6 flex items-start gap-4"
        style={{
          background: "rgba(220,38,38,0.06)",
          border: "1px solid rgba(220,38,38,0.15)",
        }}
      >
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
          style={{ background: "rgba(220,38,38,0.12)", color: "#dc2626" }}
        >
          <Zap size={20} />
        </div>
        <div>
          <p className="text-xs font-bold mb-1" style={{ color: "#dc2626" }}>
            Tentang Informasi Serta Merta
          </p>
          <p
            className="text-xs leading-relaxed opacity-70"
            style={{ color: "var(--foreground)" }}
          >
            Berdasarkan UU No. 14 Tahun 2008 Pasal 10, informasi serta merta adalah
            informasi yang dapat mengancam hajat hidup orang banyak dan ketertiban umum.
            Informasi ini wajib disampaikan secara serta merta tanpa penundaan, seperti
            peringatan bencana, wabah penyakit, dan situasi darurat lainnya.
          </p>
        </div>
      </div>

      <DokumenList category="Informasi Serta Merta" />
    </PpidPageLayout>
  );
}

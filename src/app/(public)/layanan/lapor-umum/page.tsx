import LayananDetailPage from "@/components/layanan/LayananDetailPage";


export default function LaporUmumPage() {
  const layanan = {
    id: "lapor-umum",
    nama: "Laporan Umum",
    deskripsi: "Laporkan permasalahan lingkungan, sosial, dan hal lainnya.",
    icon: "file-text",
    estimasiWaktu: "3–7 hari kerja",
    biaya: "Gratis",
    kategori: "laporan",
    persyaratan: [],
    prosedur: [],
  };

  return (
    <LayananDetailPage
      layanan={layanan}
      formTitle="Formulir Laporan / Aduan Umum"
      formDescription="Sampaikan keluhan, saran, atau laporan umum terkait pelayanan desa, lingkungan, sosial, atau permasalahan lainnya."
      hasGps={false}
      formFields={[
        { name: "nama_pelapor", label: "Nama Pelapor", type: "text", placeholder: "Nama lengkap Anda", required: true },
        { name: "alamat_pelapor", label: "Alamat Pelapor", type: "textarea", placeholder: "Alamat lengkap", required: true },
        { name: "no_hp", label: "Nomor HP/WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", required: true },
        { name: "jenis_laporan", label: "Jenis Laporan", type: "select", required: true, options: ["Keluhan Pelayanan", "Lingkungan Hidup", "Sosial Kemasyarakatan", "Kebersihan & Sampah", "Saran / Masukan", "Lainnya"] },
        { name: "deskripsi", label: "Deskripsi Laporan", type: "textarea", placeholder: "Jelaskan secara detail permasalahan atau saran Anda", required: true },
        { name: "lokasi", label: "Lokasi Terkait (jika ada)", type: "text", placeholder: "Contoh: RT 02/RW 01, Dukuh Krajan" },
        { name: "file_lampiran", label: "Upload Lampiran (Opsional)", type: "file", helpText: "Format: JPG/PNG/PDF. Maks. 5MB" },
      ]}
    />
  );
}

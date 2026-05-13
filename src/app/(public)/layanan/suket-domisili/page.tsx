import LayananDetailPage from "@/components/layanan/LayananDetailPage";


export default function SuketDomisiliPage() {
  const layanan = {
    id: "suket-domisili",
    nama: "Surat Keterangan Domisili",
    deskripsi: "Surat keterangan tempat tinggal yang dikeluarkan oleh pemerintah desa.",
    icon: "file-text",
    estimasiWaktu: "1–2 hari kerja",
    biaya: "Gratis",
    kategori: "surat",
    persyaratan: [],
    prosedur: [],
  };

  return (
    <LayananDetailPage
      isSuratDesa={true}
      layanan={layanan}
      formTitle="Formulir Permohonan Surat Domisili"
      formDescription="Isi data berikut dengan lengkap dan benar. Permohonan yang tidak lengkap tidak akan diproses."
      formFields={[
        { name: "nik", label: "NIK", type: "text", placeholder: "16 digit NIK", required: true },
        { name: "nama_lengkap", label: "Nama Lengkap", type: "text", placeholder: "Sesuai KTP", required: true },
        { name: "tempat_lahir", label: "Tempat Lahir", type: "text", placeholder: "Kota tempat lahir", required: true },
        { name: "tanggal_lahir", label: "Tanggal Lahir", type: "text", placeholder: "DD/MM/YYYY", required: true },
        { name: "alamat", label: "Alamat Lengkap", type: "textarea", placeholder: "Alamat sesuai KTP", required: true },
        { name: "rt_rw", label: "RT/RW", type: "text", placeholder: "Contoh: 002/003", required: true },
        { name: "keperluan", label: "Keperluan", type: "select", required: true, options: ["Pembuatan Rekening Bank", "Keperluan Pendidikan", "Keperluan Kerja", "Pembuatan NPWP", "Lainnya"] },
        { name: "keterangan_lain", label: "Keterangan Tambahan", type: "textarea", placeholder: "Keterangan tambahan jika ada" },
        { name: "file_ktp", label: "Upload Fotokopi KTP", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "file_kk", label: "Upload Fotokopi KK", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "no_hp", label: "Nomor HP/WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", required: true },
      ]}
    />
  );
}

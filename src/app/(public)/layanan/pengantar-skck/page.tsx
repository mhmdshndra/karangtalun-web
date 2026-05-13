import LayananDetailPage from "@/components/layanan/LayananDetailPage";


export default function PengantarSKCKPage() {
  const layanan = {
    id: "pengantar-skck",
    nama: "Surat Pengantar SKCK",
    deskripsi: "Surat pengantar untuk pembuatan SKCK di kepolisian.",
    icon: "file-text",
    estimasiWaktu: "1 hari kerja",
    biaya: "Gratis",
    kategori: "surat",
    persyaratan: [],
    prosedur: [],
  };

  return (
    <LayananDetailPage
      isSuratDesa={true}
      layanan={layanan}
      formTitle="Formulir Permohonan Surat Pengantar SKCK"
      formDescription="Setelah surat pengantar diterbitkan, bawa ke Polsek setempat untuk proses SKCK lebih lanjut."
      formFields={[
        { name: "nik", label: "NIK", type: "text", placeholder: "16 digit NIK", required: true },
        { name: "nama_lengkap", label: "Nama Lengkap", type: "text", placeholder: "Sesuai KTP", required: true },
        { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true },
        { name: "tanggal_lahir", label: "Tanggal Lahir", type: "text", placeholder: "DD/MM/YYYY", required: true },
        { name: "agama", label: "Agama", type: "select", required: true, options: ["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Budha", "Konghucu"] },
        { name: "status_perkawinan", label: "Status Perkawinan", type: "select", required: true, options: ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"] },
        { name: "pekerjaan", label: "Pekerjaan", type: "text", placeholder: "Pekerjaan saat ini", required: true },
        { name: "alamat", label: "Alamat Lengkap", type: "textarea", required: true },
        { name: "keperluan", label: "Keperluan SKCK", type: "select", required: true, options: ["Melamar Pekerjaan", "Melanjutkan Studi", "Pembuatan Visa/Paspor", "Keperluan Administrasi Lainnya"] },
        { name: "file_ktp", label: "Upload Fotokopi KTP", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "file_kk", label: "Upload Fotokopi KK", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "file_akta", label: "Upload Fotokopi Akta Lahir / Ijazah", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "no_hp", label: "Nomor HP/WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", required: true },
      ]}
    />
  );
}

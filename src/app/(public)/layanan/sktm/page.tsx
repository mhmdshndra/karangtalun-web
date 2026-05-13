import LayananDetailPage from "@/components/layanan/LayananDetailPage";


export default function SKTMPage() {
  const layanan = {
    id: "sktm",
    nama: "Surat Keterangan Tidak Mampu (SKTM)",
    deskripsi: "Surat keterangan untuk warga yang tergolong keluarga kurang mampu.",
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
      formTitle="Formulir Permohonan SKTM"
      formDescription="Surat ini diterbitkan untuk keperluan beasiswa, pengobatan, atau bantuan sosial. Isi data dengan jujur dan benar."
      formFields={[
        { name: "nik", label: "NIK", type: "text", placeholder: "16 digit NIK", required: true },
        { name: "nama_lengkap", label: "Nama Lengkap", type: "text", placeholder: "Sesuai KTP", required: true },
        { name: "tempat_lahir", label: "Tempat Lahir", type: "text", required: true },
        { name: "tanggal_lahir", label: "Tanggal Lahir", type: "text", placeholder: "DD/MM/YYYY", required: true },
        { name: "alamat", label: "Alamat Lengkap", type: "textarea", required: true },
        { name: "pekerjaan", label: "Pekerjaan", type: "text", placeholder: "Pekerjaan kepala keluarga", required: true },
        { name: "penghasilan", label: "Penghasilan per Bulan", type: "select", required: true, options: ["Di bawah Rp 500.000", "Rp 500.000 – Rp 1.000.000", "Rp 1.000.000 – Rp 2.000.000", "Di atas Rp 2.000.000"] },
        { name: "jumlah_tanggungan", label: "Jumlah Tanggungan Keluarga", type: "number", placeholder: "Jumlah anggota keluarga yang ditanggung", required: true },
        { name: "keperluan", label: "Keperluan SKTM", type: "select", required: true, options: ["Beasiswa Pendidikan", "Keringanan Biaya Rumah Sakit", "Bantuan Sosial", "Daftar PKH/BPNT", "Lainnya"] },
        { name: "file_ktp", label: "Upload Fotokopi KTP", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "file_kk", label: "Upload Fotokopi KK", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "no_hp", label: "Nomor HP/WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", required: true },
      ]}
    />
  );
}

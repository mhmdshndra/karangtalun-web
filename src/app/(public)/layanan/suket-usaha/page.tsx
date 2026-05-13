import LayananDetailPage from "@/components/layanan/LayananDetailPage";


export default function SuketUsahaPage() {
  const layanan = {
    id: "suket-usaha",
    nama: "Surat Keterangan Usaha",
    deskripsi: "Surat keterangan yang menerangkan bahwa warga memiliki usaha.",
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
      formTitle="Formulir Permohonan Surat Keterangan Usaha"
      formDescription="Surat ini dapat digunakan untuk keperluan permodalan, izin usaha mikro, atau keperluan administrasi lainnya."
      formFields={[
        { name: "nik", label: "NIK Pemilik Usaha", type: "text", placeholder: "16 digit NIK", required: true },
        { name: "nama_pemilik", label: "Nama Pemilik Usaha", type: "text", placeholder: "Sesuai KTP", required: true },
        { name: "nama_usaha", label: "Nama Usaha", type: "text", placeholder: "Nama usaha / toko", required: true },
        { name: "jenis_usaha", label: "Jenis Usaha", type: "select", required: true, options: ["Perdagangan", "Kuliner / Makanan & Minuman", "Jasa", "Pertanian / Perkebunan", "Peternakan", "Kerajinan / Industri Rumah Tangga", "Lainnya"] },
        { name: "alamat_usaha", label: "Alamat Usaha", type: "textarea", placeholder: "Alamat lengkap tempat usaha", required: true },
        { name: "modal_usaha", label: "Modal Usaha", type: "select", required: true, options: ["Di bawah Rp 1.000.000", "Rp 1.000.000 – Rp 5.000.000", "Rp 5.000.000 – Rp 25.000.000", "Di atas Rp 25.000.000"] },
        { name: "lama_usaha", label: "Lama Usaha Berjalan", type: "text", placeholder: "Contoh: 2 tahun", required: true },
        { name: "keperluan", label: "Keperluan Surat Keterangan Usaha", type: "select", required: true, options: ["Permohonan Kredit / KUR", "Izin Usaha Mikro Kecil (IUMK)", "Pendaftaran BPUM", "Administrasi Lainnya"] },
        { name: "deskripsi_usaha", label: "Deskripsi Usaha", type: "textarea", placeholder: "Jelaskan singkat kegiatan usaha Anda", required: true },
        { name: "file_ktp", label: "Upload Fotokopi KTP", type: "file", required: true, helpText: "Format: JPG/PNG/PDF. Maks. 2MB" },
        { name: "file_foto_usaha", label: "Upload Foto Usaha", type: "file", required: true, helpText: "Min. 1 foto lokasi usaha. Format: JPG/PNG. Maks. 5MB" },
        { name: "no_hp", label: "Nomor HP/WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", required: true },
      ]}
    />
  );
}

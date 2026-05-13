import LayananDetailPage from "@/components/layanan/LayananDetailPage";


export default function LaporInfrastrukturPage() {
  const layanan = {
    id: "lapor-infrastruktur",
    nama: "Laporan Kerusakan Infrastruktur",
    deskripsi: "Laporkan kerusakan jalan, jembatan, irigasi, atau bangunan desa.",
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
      formTitle="Formulir Laporan Kerusakan Infrastruktur"
      formDescription="Laporkan kerusakan jalan, jembatan, saluran air, lampu jalan, atau fasilitas umum desa lainnya."
      hasGps={true}
      formFields={[
        { name: "nama_pelapor", label: "Nama Pelapor", type: "text", placeholder: "Nama lengkap Anda", required: true },
        { name: "nik", label: "NIK Pelapor", type: "text", placeholder: "16 digit NIK", required: true },
        { name: "no_hp", label: "Nomor HP/WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", required: true },
        { name: "jenis_infrastruktur", label: "Jenis Infrastruktur yang Rusak", type: "select", required: true, options: ["Jalan Desa", "Jembatan", "Saluran Irigasi / Drainase", "Lampu Jalan", "Balai Desa / Gedung Fasilitas", "Tempat Pembuangan Sampah", "Lainnya"] },
        { name: "lokasi_kerusakan", label: "Lokasi Kerusakan (Alamat)", type: "textarea", placeholder: "Deskripsikan lokasi secara spesifik (RT/RW, nama jalan, patokan)", required: true },
        { name: "tingkat_kerusakan", label: "Tingkat Kerusakan", type: "select", required: true, options: ["Ringan (Perlu Perbaikan Kecil)", "Sedang (Mengganggu Aktivitas)", "Berat (Berbahaya / Tidak Bisa Digunakan)"] },
        { name: "deskripsi_kerusakan", label: "Deskripsi Kerusakan", type: "textarea", placeholder: "Jelaskan detail kerusakan yang terjadi", required: true },
        { name: "file_foto", label: "Upload Foto Kerusakan", type: "file", required: true, helpText: "Min. 1 foto, maks. 3 foto. Format: JPG/PNG. Maks. 10MB" },
        { name: "sudah_dilaporkan", label: "Apakah sudah dilaporkan sebelumnya?", type: "select", options: ["Belum pernah dilaporkan", "Sudah dilaporkan sebelumnya tapi belum ditangani"] },
      ]}
    />
  );
}

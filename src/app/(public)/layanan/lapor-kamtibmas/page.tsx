import LayananDetailPage from "@/components/layanan/LayananDetailPage";


export default function LaporKamtibmasPage() {
  const layanan = {
    id: "lapor-kamtibmas",
    nama: "Laporan Keamanan & Ketertiban",
    deskripsi: "Laporkan gangguan keamanan, ketertiban, atau kejadian mencurigakan.",
    icon: "file-text",
    estimasiWaktu: "1–3 hari kerja",
    biaya: "Gratis",
    kategori: "laporan",
    persyaratan: [],
    prosedur: [],
  };

  return (
    <LayananDetailPage
      layanan={layanan}
      formTitle="Formulir Laporan Gangguan Kamtibmas"
      formDescription="Laporan Anda akan segera diteruskan ke Babinsa dan Bhabinkamtibmas untuk ditindaklanjuti dalam 1×24 jam."
      hasGps={true}
      formFields={[
        { name: "nama_pelapor", label: "Nama Pelapor", type: "text", placeholder: "Nama lengkap Anda", required: true },
        { name: "nik", label: "NIK Pelapor", type: "text", placeholder: "16 digit NIK", required: true },
        { name: "no_hp", label: "Nomor HP/WhatsApp", type: "tel", placeholder: "08xxxxxxxxxx", required: true },
        { name: "jenis_gangguan", label: "Jenis Gangguan", type: "select", required: true, options: ["Pencurian / Perampokan", "Perkelahian / Keributan", "Penipuan / Penggelapan", "Peredaran Narkoba", "Vandalisme / Perusakan", "Kecelakaan Lalu Lintas", "Kejadian Luar Biasa (KLB)", "Lainnya"] },
        { name: "tanggal_kejadian", label: "Tanggal & Waktu Kejadian", type: "text", placeholder: "Contoh: 25 Januari 2025, pukul 22.00 WIB", required: true },
        { name: "lokasi_kejadian", label: "Lokasi Kejadian", type: "textarea", placeholder: "Deskripsikan lokasi secara jelas", required: true },
        { name: "kronologi", label: "Kronologi Kejadian", type: "textarea", placeholder: "Ceritakan kronologi kejadian secara lengkap dan runtut", required: true },
        { name: "korban", label: "Apakah ada korban?", type: "select", required: true, options: ["Tidak ada korban", "Ada korban luka ringan", "Ada korban luka berat", "Ada korban jiwa"] },
        { name: "pelaku_diketahui", label: "Apakah pelaku diketahui?", type: "select", options: ["Tidak diketahui", "Diketahui identitasnya", "Diketahui sebagian (ciri-ciri)"] },
        { name: "file_bukti", label: "Upload Foto/Bukti Pendukung", type: "file", helpText: "Opsional. Format: JPG/PNG. Maks. 10MB" },
        { name: "identitas_dirahasiakan", label: "Kerahasiaan Identitas Pelapor", type: "select", options: ["Identitas boleh disebutkan", "Mohon identitas pelapor dirahasiakan"] },
      ]}
    />
  );
}

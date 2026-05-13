# Aset Visual — Portal Desa Karangtalun

Letakkan file gambar di folder `public/assets/` sesuai struktur berikut.
Semua path sudah dikonfigurasi di `src/core/constants/assets.ts`.

## Struktur Folder

```
public/assets/
├── logos/
│   ├── logo-desa.png          ← Logo resmi desa (transparan, min 200x200)
│   └── logo-desa-white.png    ← Versi putih untuk dark background
├── icons/
│   ├── ic-penduduk.svg        ← Ikon statistik penduduk
│   ├── ic-kk.svg              ← Ikon kepala keluarga
│   ├── ic-apbdes.svg          ← Ikon APBDes
│   └── ic-idm.svg             ← Ikon IDM
├── backgrounds/
│   ├── hero-desa.jpg          ← Foto utama hero banner (min 1920x1080)
│   ├── auth-bg.jpg            ← Background halaman login/register
│   ├── desa-1.jpg             ← Foto desa untuk section background
│   ├── desa-2.jpg             ← Foto desa untuk section background
│   └── desa-3.jpg             ← Foto desa untuk section background
├── auth/
│   └── emblem-desa.png        ← Emblem/lambang untuk halaman auth
├── officials/
│   └── kades.jpg              ← Foto Kepala Desa (min 200x200, square)
├── facilities/
│   ├── placeholder.jpg        ← Placeholder jika foto belum tersedia
│   ├── balai-desa.jpg         ← Foto Balai Desa
│   ├── puskesmas.jpg          ← Foto Puskesmas Pembantu
│   ├── sekolah.jpg            ← Foto Sekolah Dasar
│   ├── masjid.jpg             ← Foto Masjid/Mushola
│   ├── pasar.jpg              ← Foto Pasar Desa
│   └── jalan.jpg              ← Foto Jalan Desa
├── gallery/
│   ├── galeri-1.jpg           ← Foto kegiatan desa
│   ├── galeri-2.jpg
│   ├── galeri-3.jpg
│   ├── galeri-4.jpg
│   ├── galeri-5.jpg
│   └── galeri-6.jpg
├── news/
│   ├── berita-1.jpg           ← Thumbnail berita
│   ├── berita-2.jpg
│   ├── berita-3.jpg
│   ├── berita-4.jpg
│   ├── berita-5.jpg
│   └── berita-6.jpg
└── products/
    ├── placeholder.jpg        ← Placeholder produk UMKM
    ├── kripik-1.jpg           ← Foto produk UMKM (per produk)
    ├── rajut-1.jpg
    └── ...
```

## Catatan

- Semua komponen sudah memiliki fallback jika file belum tersedia
- Logo menampilkan inisial "KT" jika file PNG tidak ditemukan
- Aparatur menampilkan inisial nama jika foto belum ada
- Infrastruktur menampilkan ikon placeholder jika foto belum ada
- Ganti file tanpa mengubah kode — cukup letakkan file dengan nama yang sama

## Rekomendasi Format

| Jenis      | Format  | Ukuran Min  | Rasio    |
|------------|---------|-------------|----------|
| Logo       | PNG     | 200×200     | 1:1      |
| Ikon       | SVG     | -           | 1:1      |
| Background | JPG     | 1920×1080   | 16:9     |
| Foto Desa  | JPG     | 800×600     | 4:3      |
| Thumbnail  | JPG     | 800×500     | 16:10    |
| Produk     | JPG     | 800×800     | 1:1      |
| Aparatur   | JPG     | 200×200     | 1:1      |

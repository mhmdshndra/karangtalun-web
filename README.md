# Desa Karangtalun — Backend API

Portal layanan desa berbasis Laravel 12 + Sanctum API, dengan frontend Next.js.

## Prasyarat

- PHP ≥ 8.2 + ext-pdo_mysql
- Composer
- MySQL 8 / MariaDB 10.6+
- Node.js ≥ 18 (untuk frontend)

## Instalasi Backend

```bash
cd backend/
cp .env.example .env
composer install
php artisan key:generate

# Sesuaikan DB_* di .env, lalu:
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve          # → http://localhost:8000
```

## Instalasi Frontend

```bash
cd frontend/
cp .env.example .env.local
# Pastikan NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
npm install
npm run dev                # → http://localhost:3000
```

## Akun Demo (dari seeder)

| Role          | Login Type | Identifier                  | Password |
|---------------|------------|-----------------------------|----------|
| Warga         | NIK        | `3314072505850001`          | demo123  |
| Admin Desa    | ID Petugas | `ADM-001`                   | demo123  |
| Staf Layanan  | ID Petugas | `STF-001`                   | demo123  |

> **Warga** login dengan NIK, **Petugas** login dengan ID Petugas.

## Fitur Utama

- **Autentikasi** — Login, register (aktivasi), lupa sandi (OTP via SMS/WA/log)
- **E-Surat** — Pengajuan surat dengan validasi anggota KK
- **Laporan Aduan** — Publik & warga, dengan lampiran
- **Permohonan PPID** — Publik & warga, dengan file balasan admin
- **CMS** — 14 section (identitas desa, berita, UMKM, aparatur, dll.)
- **Notifikasi** — Real-time per-role, per-user
- **Turnstile** — Proteksi form publik (bisa dimatikan via `TURNSTILE_ENABLED=false`)

## Konfigurasi OTP

```env
OTP_CHANNEL=log          # log | whatsapp | sms
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_DEBUG=true           # Tampilkan OTP di response (hanya local/testing)
```

## Smoke Test

```bash
bash tests/smoke_test.sh
```

## Struktur API

- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Aktivasi akun warga
- `POST /api/auth/lupa-sandi/identify` — Step 1: kirim OTP
- `POST /api/auth/lupa-sandi/verify-otp` — Step 2: verifikasi OTP
- `POST /api/auth/lupa-sandi/reset` — Step 3: reset password
- `GET  /api/auth/me` — User saat ini
- `GET  /api/warga/kk` — Data KK warga
- `POST /api/warga/surat` — Ajukan surat
- `POST /api/warga/laporan` — Kirim laporan (auth)
- `POST /api/laporan` — Kirim laporan (publik + Turnstile)
- `POST /api/ppid/permohonan` — Kirim permohonan (publik + Turnstile)
- `GET  /api/cms/*` — CMS public read
- `PUT  /api/admin/cms/*` — CMS admin write
- `POST /api/cms/umkm/{id}/like` — Like produk UMKM
- `POST /api/cms/berita/{slug}/view` — Tambah view berita

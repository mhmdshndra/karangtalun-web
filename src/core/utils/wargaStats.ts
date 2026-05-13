/**
 * Hitung statistik kependudukan.
 * Menggunakan data CMS infografis (jumlahPenduduk, jumlahKK)
 * dan menghitung dari backend /statistik/kependudukan jika tersedia.
 *
 * Untuk SSR/static pages, ini masih menggunakan perhitungan sinkron
 * dari data CMS yang sudah di-fetch oleh useCmsStore.
 */

export interface StatistikKependudukan {
  totalPenduduk: number;
  totalKK: number;
  lakiLaki: number;
  perempuan: number;
  pendidikan: { label: string; value: number }[];
  pekerjaan: { label: string; value: number }[];
  kelompokUsia: { label: string; value: number; color: string }[];
}

const DEFAULT_STATS: StatistikKependudukan = {
  totalPenduduk: 0,
  totalKK: 0,
  lakiLaki: 0,
  perempuan: 0,
  pendidikan: [],
  pekerjaan: [],
  kelompokUsia: [
    { label: "0-14 tahun", value: 0, color: "#4a7fc1" },
    { label: "15-64 tahun", value: 0, color: "#1a3a6e" },
    { label: "65+ tahun", value: 0, color: "#b8860b" },
  ],
};

/**
 * Synchronous version — returns cached/default stats.
 * Used by pages that need data synchronously on first render.
 */
let _cachedStats: StatistikKependudukan = DEFAULT_STATS;

export function hitungStatistikKependudukan(): StatistikKependudukan {
  return _cachedStats;
}

/**
 * Fetch fresh stats from backend (call once at app startup).
 */
export async function fetchStatistikKependudukan(): Promise<StatistikKependudukan> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
    const res = await fetch(`${API_BASE}/statistik/kependudukan`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return DEFAULT_STATS;
    const json = await res.json();
    if (!json.success || !json.data) return DEFAULT_STATS;

    const d = json.data;
    const stats: StatistikKependudukan = {
      totalPenduduk: d.total_penduduk ?? DEFAULT_STATS.totalPenduduk,
      totalKK: d.total_kk ?? DEFAULT_STATS.totalKK,
      lakiLaki: d.gender?.["Laki-laki"] ?? DEFAULT_STATS.lakiLaki,
      perempuan: d.gender?.["Perempuan"] ?? DEFAULT_STATS.perempuan,
      pendidikan: d.pendidikan
        ? Object.entries(d.pendidikan).map(([label, value]) => ({ label, value: value as number }))
        : DEFAULT_STATS.pendidikan,
      pekerjaan: d.pekerjaan
        ? Object.entries(d.pekerjaan)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 6)
            .map(([label, value]) => ({ label, value: value as number }))
        : DEFAULT_STATS.pekerjaan,
      kelompokUsia: d.kelompok_usia
        ? [
            { label: "0-14 tahun", value: (d.kelompok_usia["0-5"] ?? 0) + (d.kelompok_usia["6-12"] ?? 0) + (d.kelompok_usia["13-17"] ?? 0), color: "#4a7fc1" },
            { label: "15-64 tahun", value: (d.kelompok_usia["18-25"] ?? 0) + (d.kelompok_usia["26-35"] ?? 0) + (d.kelompok_usia["36-45"] ?? 0) + (d.kelompok_usia["46-55"] ?? 0) + (d.kelompok_usia["56-65"] ?? 0), color: "#1a3a6e" },
            { label: "65+ tahun", value: d.kelompok_usia["65+"] ?? 0, color: "#b8860b" },
          ]
        : DEFAULT_STATS.kelompokUsia,
    };
    _cachedStats = stats;
    return stats;
  } catch {
    return DEFAULT_STATS;
  }
}

import type { Metadata } from "next";
import "@/styles/globals.css";
import AppProviders from "@/core/providers/AppProviders";

export const metadata: Metadata = {
  title: "Desa Karangtalun — Portal Digital Desa",
  description: "Portal resmi Pemerintah Desa Karangtalun, Kecamatan Tanon, Kabupaten Sragen, Jawa Tengah.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import AuthBackground from "@/components/auth/AuthBackground";
import AuthTopbar from "@/components/auth/AuthTopbar";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Masuk – Portal Desa Karangtalun",
  description: "Login ke Portal Warga Desa Karangtalun",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* CMS-aware background */}
      <AuthBackground />

      {/* Topbar — consistent with public AppHeader */}
      <AuthTopbar />

      {/* Main content */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem 1rem",
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0.75rem 1rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem" }}>
          © {new Date().getFullYear()} Pemerintah Desa Karangtalun
        </p>
      </footer>
    </div>
  );
}

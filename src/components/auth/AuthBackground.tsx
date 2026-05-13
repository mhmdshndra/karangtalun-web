"use client";

const BG_IMAGE = "/assets/backgrounds/auth-bg.jpg";

export default function AuthBackground() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Background photo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(10,18,38,0.72) 0%, rgba(22,47,90,0.65) 40%, rgba(26,58,110,0.6) 70%, rgba(10,18,38,0.72) 100%)",
          backdropFilter: "blur(1px)",
        }}
      />
      {/* Subtle dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

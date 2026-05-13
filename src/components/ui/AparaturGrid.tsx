"use client";

import { useState } from "react";
import Image from "next/image";
import type { AparaturDesa } from "@/core/types";
import type { CmsAparatur } from "@/core/cms/cmsTypes";

type AparaturItem = AparaturDesa | CmsAparatur;

// ─── SINGLE APARATUR CARD ────────────────────────────────────
function AparaturCard({
  aparatur,
  tier = "staff",
}: {
  aparatur: AparaturItem;
  tier?: "leader" | "head" | "staff";
}) {
  const [imgError, setImgError] = useState(false);

  const sizes = {
    leader: { photo: 88, nameSize: "0.8rem", jabatanSize: "0.7rem" },
    head: { photo: 72, nameSize: "0.75rem", jabatanSize: "0.65rem" },
    staff: { photo: 64, nameSize: "0.72rem", jabatanSize: "0.62rem" },
  };
  const s = sizes[tier];
  const initials = aparatur.nama
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "1rem 0.5rem",
      }}
    >
      {/* Photo / Avatar */}
      <div
        style={{
          width: s.photo,
          height: s.photo,
          borderRadius: "50%",
          overflow: "hidden",
          border: tier === "leader" ? "2.5px solid var(--primary)" : "1.5px solid var(--border)",
          background: "var(--surface-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "0.625rem",
          flexShrink: 0,
        }}
      >
        {aparatur.foto && !imgError ? (
          <Image
            src={aparatur.foto}
            alt={aparatur.nama}
            width={s.photo}
            height={s.photo}
            className="object-cover"
            style={{ width: "100%", height: "100%" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            style={{
              fontSize: s.photo * 0.3,
              fontWeight: 700,
              color: "var(--primary)",
              opacity: 0.6,
              letterSpacing: "0.02em",
            }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Name */}
      <p
        style={{
          fontSize: s.nameSize,
          fontWeight: 700,
          color: "var(--foreground)",
          lineHeight: 1.3,
          marginBottom: "0.125rem",
          maxWidth: 140,
        }}
      >
        {aparatur.nama}
      </p>

      {/* Jabatan badge */}
      <span
        style={{
          fontSize: s.jabatanSize,
          color: tier === "leader" ? "var(--primary)" : "var(--text-muted)",
          fontWeight: tier === "leader" ? 600 : 500,
          lineHeight: 1.3,
        }}
      >
        {aparatur.jabatan}
      </span>
    </div>
  );
}

// ─── APARATUR GRID — tier-based layout ───────────────────────
interface AparaturGridProps {
  pimpinan: AparaturItem[];
  perangkat: AparaturItem[];
  kadus: AparaturItem[];
}

export default function AparaturGrid({ pimpinan, perangkat, kadus }: AparaturGridProps) {
  return (
    <div>
      {/* Tier 1: Pimpinan */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {pimpinan.map((a) => (
          <AparaturCard key={a.id} aparatur={a} tier="leader" />
        ))}
      </div>

      {/* Tier 2: Kasi/Perangkat */}
      {perangkat.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "0.25rem",
            marginBottom: "1.5rem",
            paddingBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {perangkat.map((a) => (
            <AparaturCard key={a.id} aparatur={a} tier="head" />
          ))}
        </div>
      )}

      {/* Tier 3: Kadus */}
      {kadus.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "0.25rem",
          }}
        >
          {kadus.map((a) => (
            <AparaturCard key={a.id} aparatur={a} tier="staff" />
          ))}
        </div>
      )}
    </div>
  );
}

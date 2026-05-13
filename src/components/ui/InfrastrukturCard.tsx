"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, MapPin, Navigation } from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────
export interface FasilitasUnit {
  nama: string;
  lokasi?: string;
}

export interface FasilitasItem {
  nama: string;
  keterangan: string;
  jumlah: string;
  /** Photo URL — admin can replace with local path */
  foto?: string;
  /** List of individual units with optional location */
  units?: FasilitasUnit[];
}

// ─── CARD COMPONENT ──────────────────────────────────────────
export default function InfrastrukturCard({ item }: { item: FasilitasItem }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const hasUnits = item.units && item.units.length > 0;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--primary)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Photo half-cover with gradient */}
      <div style={{ position: "relative", height: 120, overflow: "hidden" }}>
        {item.foto && !imgError ? (
          <Image
            src={item.foto}
            alt={item.nama}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, var(--primary) 0%, #0f2447 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={28} style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50%",
            background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
          }}
        />
        {/* Jumlah badge on photo */}
        <span
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            fontSize: "0.625rem",
            fontWeight: 700,
            padding: "0.2rem 0.5rem",
            borderRadius: 2,
            background: "rgba(255,255,255,0.9)",
            color: "var(--primary)",
            letterSpacing: "0.02em",
          }}
        >
          {item.jumlah}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: "0.875rem 1rem" }}>
        <h4
          style={{
            fontSize: "0.825rem",
            fontWeight: 700,
            color: "var(--foreground)",
            marginBottom: "0.25rem",
            lineHeight: 1.3,
          }}
        >
          {item.nama}
        </h4>
        <p
          style={{
            fontSize: "0.7rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
            marginBottom: hasUnits ? "0.625rem" : 0,
          }}
        >
          {item.keterangan}
        </p>

        {/* Expand button */}
        {hasUnits && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.675rem",
                fontWeight: 600,
                color: "var(--primary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {expanded ? "Tutup" : `Lihat ${item.units!.length} lokasi`}
              <ChevronDown
                size={12}
                style={{
                  transition: "transform 0.2s",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Expanded unit list */}
            {expanded && (
              <div
                style={{
                  marginTop: "0.5rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                }}
              >
                {item.units!.map((unit, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.375rem 0.5rem",
                      borderRadius: 2,
                      background: "var(--surface-hover)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <MapPin size={11} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 500,
                          color: "var(--foreground)",
                        }}
                      >
                        {unit.nama}
                      </span>
                    </div>
                    {unit.lokasi && (
                      <a
                        href={unit.lokasi}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.2rem",
                          fontSize: "0.6rem",
                          fontWeight: 600,
                          color: "var(--primary)",
                          textDecoration: "none",
                          padding: "0.15rem 0.4rem",
                          borderRadius: 2,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          flexShrink: 0,
                        }}
                      >
                        <Navigation size={9} />
                        Rute
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

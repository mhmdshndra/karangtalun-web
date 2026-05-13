"use client";

import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

export interface TimelineStep {
  label: string;
  desc?: string;
  status: "done" | "active" | "rejected" | "pending";
  date?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  variant?: "vertical" | "horizontal";
}

export default function Timeline({ steps, variant = "vertical" }: TimelineProps) {
  if (variant === "horizontal") {
    return (
      <div className="flex items-center gap-0 w-full my-4">
        {steps.map((s, i) => {
          const color = s.status === "rejected" ? "#dc2626"
            : s.status === "done" ? "#16a34a"
            : s.status === "active" ? "#2563eb"
            : "var(--border)";
          const filled = s.status === "done" || s.status === "rejected" || s.status === "active";

          return (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: filled ? color : "var(--surface)",
                    color: filled ? "#fff" : "var(--foreground)",
                    border: `2px solid ${color}`,
                  }}
                >
                  {s.status === "rejected" ? <XCircle size={13} />
                    : s.status === "done" ? <CheckCircle size={13} />
                    : s.status === "active" ? <Loader2 size={13} className="animate-spin" />
                    : i + 1}
                </div>
                <p
                  className="text-[9px] font-bold mt-1 text-center leading-tight max-w-[70px]"
                  style={{ color: filled ? color : "var(--foreground)", opacity: filled ? 1 : 0.4 }}
                >
                  {s.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1"
                  style={{ background: (s.status === "done") ? "#16a34a" : "var(--border)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical
  return (
    <div className="space-y-0">
      {steps.map((s, i) => {
        const color = s.status === "rejected" ? "#dc2626"
          : s.status === "done" ? "#16a34a"
          : s.status === "active" ? "#2563eb"
          : "var(--border)";
        const filled = s.status === "done" || s.status === "rejected" || s.status === "active";

        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{
                  background: filled ? color : "var(--surface)",
                  color: filled ? "#fff" : "var(--foreground)",
                  border: `2px solid ${color}`,
                }}
              >
                {s.status === "rejected" ? <XCircle size={14} />
                  : s.status === "done" ? <CheckCircle size={14} />
                  : s.status === "active" ? <Loader2 size={14} className="animate-spin" />
                  : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-0.5 flex-1 min-h-[40px]"
                  style={{ background: s.status === "done" ? "#16a34a" : "var(--border)" }}
                />
              )}
            </div>
            <div className="pb-6 pt-1">
              <p className="text-sm font-bold" style={{ color: filled ? color : "var(--foreground)", opacity: filled ? 1 : 0.4 }}>
                {s.label}
              </p>
              {s.desc && (
                <p className="text-xs mt-0.5" style={{ opacity: filled ? 0.6 : 0.3 }}>{s.desc}</p>
              )}
              {s.date && (
                <p className="text-[10px] mt-0.5 opacity-30">{s.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

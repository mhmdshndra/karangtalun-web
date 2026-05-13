"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  // Filter out any "Beranda" items since the component always renders a built-in Home link
  const filteredItems = items.filter(
    (item) => !(item.label === "Beranda" && (item.href === "/" || !item.href))
  );

  return (
    <div
      className={`breadcrumb-bar pt-[4.5rem] pb-3 ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 flex-wrap">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 text-xs font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                <Home size={12} />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
            </li>
            {filteredItems.map((item, i) => (
              <li key={i} className="flex items-center gap-1">
                <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                {item.href && i < filteredItems.length - 1 ? (
                  <Link
                    href={item.href}
                    className="text-xs font-medium transition-colors"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-xs font-bold truncate max-w-[200px]"
                    style={{ color: "white" }}
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "@/core/context/AuthContext";
import { CmsProvider } from "@/core/cms/useCmsStore";
import { ServiceDataProvider } from "@/core/context/ServiceDataContext";

/**
 * Global providers — wraps the entire app so both admin and public pages
 * can access CMS data via useCms() and shared service data via useServiceData().
 */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CmsProvider>
        <ServiceDataProvider>
          {children}
        </ServiceDataProvider>
      </CmsProvider>
    </AuthProvider>
  );
}

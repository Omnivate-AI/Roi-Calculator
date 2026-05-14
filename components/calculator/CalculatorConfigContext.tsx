"use client";

import { createContext, useContext, type ReactNode } from "react";
import { FALLBACK_CONFIG, type CalculatorConfig } from "@/lib/config-types";

const CalculatorConfigContext = createContext<CalculatorConfig>(FALLBACK_CONFIG);

/**
 * Provides the calculator config to all client components below. The
 * value comes from the server component which fetches Supabase, so
 * every render starts with a fresh (cached) config.
 */
export function CalculatorConfigProvider({
  value,
  children,
}: {
  value: CalculatorConfig;
  children: ReactNode;
}) {
  return (
    <CalculatorConfigContext.Provider value={value}>
      {children}
    </CalculatorConfigContext.Provider>
  );
}

export function useCalculatorConfig(): CalculatorConfig {
  return useContext(CalculatorConfigContext);
}

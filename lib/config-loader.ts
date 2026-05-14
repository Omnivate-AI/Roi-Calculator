import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";
import { FALLBACK_CONFIG, type CalculatorConfig } from "./config-types";

/**
 * Read the calculator config from Supabase. Result is cached for 60
 * seconds via Next's data cache, so the admin page sees changes within
 * a minute of saving. Falls back to FALLBACK_CONFIG if anything fails.
 */
export const getCalculatorConfig = unstable_cache(
  async (): Promise<CalculatorConfig> => {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .schema("roi_calc")
        .from("config")
        .select("payload")
        .eq("id", 1)
        .single();

      if (error || !data?.payload) {
        if (error) {
          // eslint-disable-next-line no-console
          console.warn("[config-loader] Supabase read error, using fallback:", error.message);
        }
        return FALLBACK_CONFIG;
      }

      return { ...FALLBACK_CONFIG, ...(data.payload as Partial<CalculatorConfig>) };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[config-loader] Supabase unreachable, using fallback:", err);
      return FALLBACK_CONFIG;
    }
  },
  ["calculator-config"],
  { revalidate: 60, tags: ["calculator-config"] }
);

export { FALLBACK_CONFIG, type CalculatorConfig };

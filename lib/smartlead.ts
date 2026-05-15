const SMARTLEAD_BASE = "https://server.smartlead.ai/api/v1";

interface PushLeadInput {
  email: string;
  firstName: string;
  lastName?: string;
  companyName?: string;
  customFields?: Record<string, string>;
}

interface SmartleadResponse {
  ok: boolean;
  added_count?: number;
  skipped_count?: number;
  message?: string;
}

/**
 * Add one lead to the configured Smartlead campaign. Scope-locked: the
 * campaign id is read from SMARTLEAD_CAMPAIGN_ID at call time, never
 * accepted from a caller. There is no code path here that lists,
 * iterates, modifies, or deletes campaigns. The only Smartlead surface
 * this module touches is "add a lead to one specific campaign."
 *
 * Throws on configuration error or non-200 response. Callers should
 * catch and record the failure to the lead row rather than failing the
 * user's download.
 */
export async function pushLeadToCampaign(input: PushLeadInput): Promise<void> {
  const apiKey = process.env.SMARTLEAD_API_KEY;
  const campaignId = process.env.SMARTLEAD_CAMPAIGN_ID;

  if (!apiKey || !campaignId) {
    throw new Error(
      "Smartlead is not configured (SMARTLEAD_API_KEY or SMARTLEAD_CAMPAIGN_ID missing)"
    );
  }

  // The campaign id should always be a numeric string; we coerce + validate
  // so a typo can't redirect leads to a wrong campaign.
  const numericId = Number(campaignId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(`Smartlead campaign id is not a positive integer: ${campaignId}`);
  }

  const body = {
    lead_list: [
      {
        email: input.email,
        first_name: input.firstName,
        last_name: input.lastName ?? "",
        company_name: input.companyName ?? "",
        custom_fields: input.customFields ?? {},
      },
    ],
    settings: {
      ignore_global_block_list: false,
      ignore_unsubscribe_list: false,
      ignore_community_bounce_list: false,
      ignore_duplicate_leads_in_other_campaign: false,
    },
  };

  const url = `${SMARTLEAD_BASE}/campaigns/${numericId}/leads?api_key=${encodeURIComponent(
    apiKey
  )}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Smartlead lead-add failed (${response.status}): ${text.slice(0, 300)}`
    );
  }

  const data = (await response.json().catch(() => ({}))) as SmartleadResponse;
  if (data.ok === false) {
    throw new Error(
      `Smartlead lead-add rejected: ${data.message ?? "no message"}`
    );
  }
}

/**
 * Split a full name into first/last. Best-effort: anything after the
 * first space goes to last_name. Empty input yields empty strings.
 */
export function splitName(full: string): { first: string; last: string } {
  const trimmed = full.trim();
  if (!trimmed) return { first: "", last: "" };
  const idx = trimmed.indexOf(" ");
  if (idx === -1) return { first: trimmed, last: "" };
  return { first: trimmed.slice(0, idx), last: trimmed.slice(idx + 1).trim() };
}

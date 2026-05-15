import { NextResponse } from "next/server";
import { calculateRoi } from "@/lib/calculations";
import { buildRoiPdf } from "@/lib/pdf";
import {
  checkRateLimit,
  extractIp,
  hashIp,
} from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CalculatorInputs, SequenceSteps } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Payload {
  email: string;
  name: string;
  companyName?: string;
  inputs: CalculatorInputs;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOCKED_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "trashmail.com",
]);

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const validation = validatePayload(body);
  if (!validation.ok) return jsonError(400, validation.error);

  const ip = extractIp(req);
  const ipHash = hashIp(ip);
  const rate = checkRateLimit(ipHash);
  if (!rate.allowed) {
    return jsonError(
      429,
      "You have hit the hourly download cap. Try again later.",
      {
        "Retry-After": Math.ceil((rate.resetAt - Date.now()) / 1000).toString(),
        "X-RateLimit-Remaining": "0",
      }
    );
  }

  const outputs = calculateRoi(validation.value.inputs);

  const supabase = createAdminClient();
  const { error: insertError } = await supabase
    .schema("roi_calc")
    .from("leads")
    .insert({
      email: validation.value.email.toLowerCase().trim(),
      name: validation.value.name.trim(),
      company_name: validation.value.companyName?.trim() || null,
      inputs: validation.value.inputs,
      outputs,
      ip_hash: ipHash,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
    });

  if (insertError) {
    console.error("[send-pdf] Failed to persist lead", insertError);
    return jsonError(500, "Could not save your submission. Please try again.");
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await buildRoiPdf({
      visitor: {
        name: validation.value.name,
        companyName: validation.value.companyName,
      },
      inputs: validation.value.inputs,
      outputs,
    });
  } catch (err) {
    console.error("[send-pdf] Failed to render PDF", err);
    return jsonError(500, "Could not generate the PDF. Please try again.");
  }

  const filename = buildFilename(validation.value);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
      "X-RateLimit-Remaining": rate.remaining.toString(),
      "Cache-Control": "no-store",
    },
  });
}

interface ValidationOk {
  ok: true;
  value: Payload;
}
interface ValidationErr {
  ok: false;
  error: string;
}
function validatePayload(body: Payload): ValidationOk | ValidationErr {
  if (!body || typeof body !== "object") return { ok: false, error: "Missing body" };

  const email = String(body.email ?? "").trim();
  if (!email) return { ok: false, error: "Email is required" };
  if (email.length > 254) return { ok: false, error: "Email is too long" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Email is not valid" };
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return { ok: false, error: "Please use a work email" };
  }

  const name = String(body.name ?? "").trim();
  if (!name) return { ok: false, error: "Name is required" };
  if (name.length > 120) return { ok: false, error: "Name is too long" };

  const companyName = body.companyName ? String(body.companyName).trim() : undefined;
  if (companyName && companyName.length > 120) {
    return { ok: false, error: "Company name is too long" };
  }

  const inputs = body.inputs;
  if (!inputs || typeof inputs !== "object") {
    return { ok: false, error: "Missing inputs" };
  }

  const inputCheck = validateInputs(inputs);
  if (!inputCheck.ok) return inputCheck;

  return { ok: true, value: { email, name, companyName, inputs: inputCheck.value } };
}

function validateInputs(
  raw: unknown
): { ok: true; value: CalculatorInputs } | ValidationErr {
  const input = raw as Record<string, unknown>;
  const sequenceStepsRaw = Number(input.sequenceSteps);
  const allowedSteps: SequenceSteps[] = [1, 2, 3];
  const sequenceSteps = (
    allowedSteps.includes(sequenceStepsRaw as SequenceSteps) ? sequenceStepsRaw : 2
  ) as SequenceSteps;

  const leadsReached = clamp(Number(input.leadsReached), 0, 30_000);
  const openRate = clamp(Number(input.openRate), 0, 100);
  const replyRate = clamp(Number(input.replyRate), 0, 100);
  const positiveReplyRate = clamp(Number(input.positiveReplyRate), 0, 100);
  const meetingBookedRate = clamp(Number(input.meetingBookedRate), 0, 100);
  const closeRate = clamp(Number(input.closeRate), 0, 100);
  const dealValue = clamp(Number(input.dealValue), 0, 10_000_000);

  if (
    [
      leadsReached,
      openRate,
      replyRate,
      positiveReplyRate,
      meetingBookedRate,
      closeRate,
      dealValue,
    ].some((v) => !Number.isFinite(v))
  ) {
    return { ok: false, error: "One of the inputs is not a valid number" };
  }

  return {
    ok: true,
    value: {
      sequenceSteps,
      leadsReached,
      openRate,
      replyRate,
      positiveReplyRate,
      meetingBookedRate,
      closeRate,
      dealValue,
    },
  };
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function buildFilename(p: Payload): string {
  const slug = (p.companyName || p.name || "omnivate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "omnivate";
  const date = new Date().toISOString().slice(0, 10);
  return `omnivate-roi-${slug}-${date}.pdf`;
}

function jsonError(
  status: number,
  message: string,
  extraHeaders: Record<string, string> = {}
) {
  return NextResponse.json(
    { error: message },
    { status, headers: extraHeaders }
  );
}

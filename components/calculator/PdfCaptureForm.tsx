"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CalculatorInputs } from "@/lib/types";

interface PdfCaptureFormProps {
  inputs: CalculatorInputs;
}

type Status = "idle" | "loading" | "success" | "error";

/**
 * Captures the visitor's email + name + company, posts the current
 * calculator inputs to /api/send-pdf, and triggers an inline download
 * of the resulting branded PDF. Lead row is persisted server side so
 * we keep the contact even when the download happens client side.
 */
export function PdfCaptureForm({ inputs }: PdfCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, companyName, inputs }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorMessage(data?.error ?? "Something went wrong. Try again.");
        setStatus("error");
        return;
      }

      const blob = await response.blob();
      const filename = parseFilename(response.headers.get("content-disposition"));
      triggerDownload(blob, filename);
      setStatus("success");
    } catch {
      setErrorMessage("Network error. Refresh and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-success/30 bg-card p-6 text-center">
        <p
          className="text-xs font-medium uppercase tracking-[0.2em]"
          style={{ color: "hsl(var(--success))" }}
        >
          Downloaded
        </p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">
          Your ROI projection is on its way to your downloads folder.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Want to talk through the assumptions? Reply to{" "}
          <a
            className="font-medium text-brand-primary underline-offset-4 hover:underline"
            href="mailto:hello@omnivate.ai"
          >
            hello@omnivate.ai
          </a>{" "}
          and we will get you on a call.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Take this with you
        </p>
        <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
          Want this projection in a polished PDF?
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Drop your details and we will generate a branded one pager you can
          download right here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="email"
          required
          placeholder="you@company.com"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="text"
          required
          placeholder="Your name"
          aria-label="Name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Input
        type="text"
        placeholder="Company name (optional, used to personalise the PDF)"
        aria-label="Company name"
        autoComplete="organization"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-12 w-full text-base font-medium text-primary-foreground transition-shadow hover:shadow-[0_0_40px_hsl(var(--brand-primary)/0.5)]"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
        }}
      >
        {status === "loading" ? "Building your PDF..." : "Download my PDF"}
      </Button>

      {status === "error" && errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </form>
  );
}

function parseFilename(header: string | null): string {
  if (!header) return "omnivate-roi.pdf";
  const match = /filename="([^"]+)"/.exec(header);
  return match?.[1] ?? "omnivate-roi.pdf";
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

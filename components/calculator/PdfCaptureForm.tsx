"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PdfCaptureFormProps {
  /**
   * Callback when the visitor submits. In Stage 4.3 this captures the input
   * locally; M5 wires up the actual Smartlead delivery.
   */
  onSubmit?: (data: { email: string; name: string; companyName: string }) => Promise<void>;
}

/**
 * Email + name + company name capture form. Posts to the API route in M5.
 */
export function PdfCaptureForm({ onSubmit }: PdfCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    try {
      if (onSubmit) {
        await onSubmit({ email, name, companyName });
      } else {
        // Stage 4.2 placeholder: just log and pretend success after a moment.
        await new Promise((resolve) => setTimeout(resolve, 600));
        // eslint-disable-next-line no-console
        console.log("[PdfCaptureForm] would submit", { email, name, companyName });
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-success/30 bg-card p-6 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "hsl(var(--success))" }}>
          Sent
        </p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">
          Your ROI projection is on its way.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Check your inbox. The PDF should land within a couple of minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Take this with you
        </p>
        <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
          Want this projection in a polished PDF?
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Drop your email and we will send the PDF to your inbox.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          type="email"
          required
          placeholder="you@company.com"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="text"
          required
          placeholder="Your name"
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Input
        type="text"
        placeholder="Company name (optional, used to personalise the PDF)"
        aria-label="Company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-12 text-base font-medium text-primary-foreground transition-shadow hover:shadow-[0_0_40px_hsl(var(--brand-primary)/0.5)]"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
        }}
      >
        {status === "loading" ? "Sending..." : "Send me the PDF"}
      </Button>

      {status === "error" && (
        <p className="text-sm text-destructive">
          Something went wrong. Try again, or refresh the page if it persists.
        </p>
      )}
    </form>
  );
}

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { CalculatorInputs, CalculatorOutputs } from "@/lib/types";
import {
  dealFrequencyLabel,
  formatCurrency,
  formatDeals,
  formatInteger,
} from "@/lib/utils";

interface BuildPdfArgs {
  visitor: { name: string; companyName?: string };
  inputs: CalculatorInputs;
  outputs: CalculatorOutputs;
  generatedAt?: Date;
}

const BRAND = {
  primary: "#7C3AED",
  primaryDeep: "#5B21B6",
  ink: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BRAND.ink,
    backgroundColor: BRAND.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  brand: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 4,
    color: BRAND.primary,
  },
  headerLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: BRAND.muted,
    textTransform: "uppercase",
  },
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: BRAND.muted,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: BRAND.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: BRAND.muted,
    marginBottom: 28,
  },
  heroGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  heroBox: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 8,
    backgroundColor: BRAND.bgSoft,
  },
  heroBoxAccent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BRAND.primary,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
  },
  heroLabel: {
    fontSize: 8,
    letterSpacing: 2,
    color: BRAND.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 20,
    fontWeight: 700,
    color: BRAND.ink,
  },
  heroValueAccent: {
    fontSize: 20,
    fontWeight: 700,
    color: BRAND.primary,
  },
  heroCaption: {
    fontSize: 8,
    color: BRAND.muted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: BRAND.ink,
    marginBottom: 10,
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  table: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    marginBottom: 20,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  rowLast: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 10,
    color: BRAND.muted,
  },
  rowValue: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND.ink,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: BRAND.muted,
  },
  footerBrand: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: BRAND.primary,
  },
  note: {
    fontSize: 9,
    color: BRAND.muted,
    lineHeight: 1.5,
    marginBottom: 16,
  },
});

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={last ? styles.rowLast : styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function RoiProjectionDoc({ visitor, inputs, outputs, generatedAt }: BuildPdfArgs) {
  const date = (generatedAt ?? new Date()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const recipient = visitor.companyName?.trim() || visitor.name.trim() || "your team";
  const dealsCaption = dealFrequencyLabel(outputs.deals);
  const annualRevenue = outputs.revenuePerMonth * 12;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>OMNIVATE</Text>
          <Text style={styles.headerLabel}>Outbound ROI Projection</Text>
        </View>

        <Text style={styles.eyebrow}>Run the numbers</Text>
        <Text style={styles.title}>Revenue projection for {recipient}</Text>
        <Text style={styles.subtitle}>Generated {date}</Text>

        <View style={styles.heroGrid}>
          <View style={styles.heroBox}>
            <Text style={styles.heroLabel}>Deals / month</Text>
            <Text style={styles.heroValue}>{formatDeals(outputs.deals)}</Text>
            {dealsCaption ? (
              <Text style={styles.heroCaption}>{dealsCaption}</Text>
            ) : null}
          </View>
          <View style={styles.heroBoxAccent}>
            <Text style={styles.heroLabel}>Revenue / month</Text>
            <Text style={styles.heroValueAccent}>
              {formatCurrency(outputs.revenuePerMonth)}
            </Text>
          </View>
          <View style={styles.heroBox}>
            <Text style={styles.heroLabel}>Revenue / year</Text>
            <Text style={styles.heroValue}>{formatCurrency(annualRevenue)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your assumptions</Text>
        <View style={styles.table}>
          <Row label="Average deal value" value={formatCurrency(inputs.dealValue)} />
          <Row
            label="Sequence strategy"
            value={`${inputs.sequenceSteps} email${
              inputs.sequenceSteps > 1 ? "s" : ""
            } per lead, ${formatInteger(inputs.leadsReached)} leads / month`}
          />
          <Row label="Open rate" value={`${inputs.openRate}%`} />
          <Row label="Reply rate" value={`${inputs.replyRate}%`} />
          <Row label="Positive reply rate" value={`${inputs.positiveReplyRate}%`} />
          <Row label="Meeting booked rate" value={`${inputs.meetingBookedRate}%`} />
          <Row label="Close rate" value={`${inputs.closeRate}%`} last />
        </View>

        <Text style={styles.sectionTitle}>Monthly funnel breakdown</Text>
        <View style={styles.table}>
          <Row label="Emails sent" value={formatInteger(outputs.emailsSentPerMonth)} />
          <Row label="Leads reached" value={formatInteger(outputs.contactsReached)} />
          <Row label="Opens" value={formatInteger(outputs.opens)} />
          <Row label="Replies" value={formatInteger(outputs.replies)} />
          <Row label="Positive replies" value={formatInteger(outputs.positiveReplies)} />
          <Row label="Meetings" value={formatInteger(outputs.meetings)} />
          <Row label="Deals closed" value={formatDeals(outputs.deals)} last />
        </View>

        <Text style={styles.note}>
          This projection is a model. Actual results depend on list quality,
          messaging, deliverability and sales execution. Use it as a starting
          point for planning, not a guarantee.
        </Text>

        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>OMNIVATE.AI</Text>
          <Text style={styles.footerText}>
            Built for high performing outbound teams
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Render the ROI projection PDF for a visitor. Returns a Buffer suitable
 * for streaming back from a route handler as application/pdf.
 */
export async function buildRoiPdf(args: BuildPdfArgs): Promise<Buffer> {
  return renderToBuffer(<RoiProjectionDoc {...args} />);
}

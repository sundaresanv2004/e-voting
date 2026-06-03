import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
  Font,
} from "@react-email/components";
import * as React from "react";

// ─── Design Tokens (matching globals.css) ─────────────────────────────────────
export const colors = {
  // Light mode backgrounds
  pageBg: "#f8f8fc",
  cardBg: "#ffffff",
  // Typography
  heading: "#0f0f14",
  body: "#3f3f5a",
  muted: "#71717a",
  // Brand
  primary: "#2563eb",        // shadcn blue-600
  primaryHover: "#1d4ed8",   // blue-700
  primaryForeground: "#ffffff",
  // Borders
  border: "#e4e4f0",
  divider: "#e4e4f0",
  // Accent bg for OTP / code blocks
  accentBg: "#eff6ff",       // blue-50
  accentBorder: "#bfdbfe",   // blue-200
};

// ─── Reusable Styles ───────────────────────────────────────────────────────────
export const styles = {
  body: {
    backgroundColor: colors.pageBg,
    fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: "0",
    padding: "40px 16px",
  } as React.CSSProperties,

  container: {
    backgroundColor: colors.cardBg,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "0",
    overflow: "hidden",
  } as React.CSSProperties,

  // ── Header Band ──────────────────────────────────────────────────────────────
  header: {
    background: `linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #60a5fa 100%)`,
    padding: "36px 40px 32px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  logoText: {
    fontFamily: "'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#ffffff",
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    margin: "0",
  } as React.CSSProperties,

  logoSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "12px",
    fontWeight: "400",
    margin: "0",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  } as React.CSSProperties,

  // ── Content Area ─────────────────────────────────────────────────────────────
  content: {
    padding: "36px 40px 32px",
  } as React.CSSProperties,

  heading: {
    fontFamily: "'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: colors.heading,
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    lineHeight: "1.3",
    margin: "0 0 12px 0",
  } as React.CSSProperties,

  subheading: {
    color: colors.body,
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.6",
    margin: "0 0 28px 0",
  } as React.CSSProperties,

  paragraph: {
    color: colors.body,
    fontSize: "15px",
    fontWeight: "400",
    lineHeight: "1.65",
    margin: "0 0 16px 0",
  } as React.CSSProperties,

  // ── Primary CTA Button (Pill Shape) ──────────────────────────────────────────
  buttonWrapper: {
    textAlign: "center" as const,
    margin: "28px 0",
  } as React.CSSProperties,

  button: {
    backgroundColor: colors.primary,
    borderRadius: "9999px",     // fully pill-shaped — matches rounded-4xl in the app
    color: colors.primaryForeground,
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.1px",
    padding: "13px 36px",
    textDecoration: "none",
    textAlign: "center" as const,
    lineHeight: "1",
  } as React.CSSProperties,

  // ── OTP / Code Block ─────────────────────────────────────────────────────────
  otpWrapper: {
    backgroundColor: colors.accentBg,
    border: `1px solid ${colors.accentBorder}`,
    borderRadius: "12px",
    margin: "24px 0",
    padding: "20px 24px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  otpCode: {
    color: colors.heading,
    fontFamily: "'Courier New', 'Menlo', monospace",
    fontSize: "40px",
    fontWeight: "700",
    letterSpacing: "10px",
    lineHeight: "1",
    margin: "0",
    paddingLeft: "10px",  // compensates for letter-spacing visual offset
  } as React.CSSProperties,

  // ── Info / Alert Box ─────────────────────────────────────────────────────────
  infoBox: {
    backgroundColor: "#f0f4ff",
    border: `1px solid #c7d2fe`,
    borderRadius: "10px",
    padding: "14px 18px",
    margin: "20px 0",
  } as React.CSSProperties,

  infoText: {
    color: "#1e40af", // blue-800
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: "1.5",
    margin: "0",
  } as React.CSSProperties,

  // ── Divider ──────────────────────────────────────────────────────────────────
  hr: {
    borderColor: colors.divider,
    borderStyle: "solid",
    borderTopWidth: "1px",
    margin: "0",
  } as React.CSSProperties,

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    padding: "24px 40px 28px",
    textAlign: "center" as const,
  } as React.CSSProperties,

  footerText: {
    color: colors.muted,
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "1.7",
    margin: "0 0 4px 0",
  } as React.CSSProperties,

  footerLink: {
    color: colors.primary,
    textDecoration: "underline",
  } as React.CSSProperties,

  footerBrand: {
    color: "#a1a1aa",
    fontSize: "11px",
    fontWeight: "400",
    margin: "12px 0 0 0",
  } as React.CSSProperties,
};

// ─── Base Layout Wrapper ────────────────────────────────────────────────────────
// Wrap your email content with this for a consistent look across all templates.
interface BaseEmailProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseEmail({ preview, children }: BaseEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Bricolage Grotesque"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMmGKKHb0VQ.woff2",
            format: "woff2",
          }}
          fontWeight={600}
          fontStyle="normal"
        />
        <Font
          fontFamily="Bricolage Grotesque"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMmGKKHb0VQ.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Space Grotesk"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-guwFumSe_YzMGdT.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Space Grotesk"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-guwFumSe_YzMGdT.woff2",
            format: "woff2",
          }}
          fontWeight={600}
          fontStyle="normal"
        />
        <Font
          fontFamily="Space Grotesk"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-guwFumSe_YzMGdT.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* ── Brand Header ── */}
          <Section style={styles.header}>
            <Text style={styles.logoText}>E-VOTING</Text>
          </Section>

          {/* ── Main Content ── */}
          {children}

          {/* ── Divider ── */}
          <Hr style={styles.hr} />

          {/* ── Footer ── */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Questions? Contact us at{" "}
              <Link href="mailto:support@evoting.sundaresan.dev" style={styles.footerLink}>
                support@evoting.sundaresan.dev
              </Link>
            </Text>
            <Text style={styles.footerText}>
              <Link href={`${cleanBaseUrl}/terms`} style={styles.footerLink}>Terms</Link>
              {"  ·  "}
              <Link href={`${cleanBaseUrl}/privacy`} style={styles.footerLink}>Privacy</Link>
            </Text>
            <Text style={styles.footerBrand}>
              © {new Date().getFullYear()} Sundaresan V · e-voting Platform
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

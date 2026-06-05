import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface ResetPasswordEmailProps {
  resetPasswordLink?: string;
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const ResetPasswordEmail = ({
  resetPasswordLink = `${cleanBaseUrl}/auth/reset-password`,
  userName,
}: ResetPasswordEmailProps) => {
  return (
    <BaseEmail preview="Reset your e-voting account password">
      <Section style={styles.content}>
        <Text style={styles.heading}>Reset your password</Text>
        <Text style={styles.subheading}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          we received a request to reset the password for your e-voting account. Click the button below to set a new password.
        </Text>

        {/* CTA Button */}
        <div style={styles.buttonWrapper}>
          <Link href={resetPasswordLink} style={styles.button}>
            Reset Password
          </Link>
        </div>

        {/* Info note */}
        <div style={styles.infoBox}>
          <Text style={styles.infoText}>
            This link expires in <strong>30 minutes</strong>. If you didn't request a password reset, you can safely ignore this email — your account is secure.
          </Text>
        </div>

        <Text style={styles.paragraph}>
          If the button above doesn't work, copy and paste the link below into your browser:
        </Text>
        <Text
          style={{
            ...styles.paragraph,
            fontSize: "12px",
            color: "#6366f1",
            wordBreak: "break-all",
          }}
        >
          {resetPasswordLink}
        </Text>
      </Section>
    </BaseEmail>
  );
};

export default ResetPasswordEmail;

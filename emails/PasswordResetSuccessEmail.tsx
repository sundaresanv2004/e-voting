import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface PasswordResetSuccessEmailProps {
  loginLink?: string;
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const PasswordResetSuccessEmail = ({
  loginLink = `${cleanBaseUrl}/auth/login`,
  userName,
}: PasswordResetSuccessEmailProps) => {
  return (
    <BaseEmail preview="Your e-voting password was updated successfully">
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          Password updated successfully
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          your e-voting account password has been changed. You can now log in with your new password.
        </Text>

        {/* CTA Button */}
        <div style={styles.buttonWrapper}>
          <Link href={loginLink} style={styles.button}>
            Log In to Your Account
          </Link>
        </div>

        {/* Security Warning */}
        <div
          style={{
            ...styles.infoBox,
            backgroundColor: "#fff7ed",
            borderColor: "#fed7aa",
          }}
        >
          <Text style={{ ...styles.infoText, color: "#9a3412" }}>
            <strong>Didn't make this change?</strong> If you did not authorize this password change, please contact our security team immediately at{" "}
            <Link
              href="mailto:support@evoting.sundaresan.dev"
              style={{ color: "#9a3412", textDecoration: "underline" }}
            >
              support@evoting.sundaresan.dev
            </Link>
          </Text>
        </div>
      </Section>
    </BaseEmail>
  );
};

export default PasswordResetSuccessEmail;

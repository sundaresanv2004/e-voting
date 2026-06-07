import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface AccountDeletedEmailProps {
  userName?: string;
}

export const AccountDeletedEmail = ({
  userName,
}: AccountDeletedEmailProps) => {
  return (
    <BaseEmail preview="Your e-voting account has been deleted">
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          Account Deleted
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          we're confirming that your e-voting account has been permanently deleted.
        </Text>

        <Text style={styles.paragraph}>
          We're sorry to see you go. All of your personal data, active sessions, and access to organizations have been removed from our active systems.
        </Text>

        {/* Info box */}
        <div
          style={{
            ...styles.infoBox,
            backgroundColor: "#fff7ed", // orange-50
            borderColor: "#fed7aa",     // orange-200
            marginTop: "24px"
          }}
        >
          <Text style={{ ...styles.infoText, color: "#9a3412" }}>
            If you didn't request this deletion, or if you believe this was a mistake, please contact our support team immediately.
          </Text>
        </div>

        {/* Support CTA */}
        <div style={{ ...styles.buttonWrapper, marginTop: "24px" }}>
          {process.env.NEXT_PUBLIC_CONTACT_MAIL ? (
            <Link 
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_MAIL}`} 
              style={{ ...styles.button, backgroundColor: "#52525b", color: "#ffffff" }}
            >
              Contact Support
            </Link>
          ) : (
            <Text style={{ ...styles.infoText, color: "#9a3412", fontWeight: 600 }}>no contact is given</Text>
          )}
        </div>
      </Section>
    </BaseEmail>
  );
};

export default AccountDeletedEmail;

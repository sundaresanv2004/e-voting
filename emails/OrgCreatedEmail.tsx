import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface OrgCreatedEmailProps {
  userName?: string;
  orgName?: string;
  orgSlug?: string;
  orgCode?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const OrgCreatedEmail = ({
  userName,
  orgName = "Your Organization",
  orgSlug = "your-org",
  orgCode = "ORG123",
}: OrgCreatedEmailProps) => {
  return (
    <BaseEmail preview={`Your organization "${orgName}" is ready`}>
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          Your organization is ready
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          you've successfully created the organization <strong>{orgName}</strong> (Code: <strong>{orgCode}</strong>) on e-voting.
        </Text>

        {/* Info box */}
        <div style={{ ...styles.infoBox, textAlign: "center" }}>
          <Text style={styles.infoText}>
            You can now start inviting members, setting up teams, and creating your first elections.
          </Text>
        </div>

        {/* CTA Button */}
        <div style={styles.buttonWrapper}>
          <Link href={`${cleanBaseUrl}/org/${orgSlug}`} style={styles.button}>
            Go to Organization Dashboard
          </Link>
        </div>
      </Section>
    </BaseEmail>
  );
};

export default OrgCreatedEmail;

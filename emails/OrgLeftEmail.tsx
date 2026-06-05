import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface OrgLeftEmailProps {
  userName?: string;
  orgName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const OrgLeftEmail = ({
  userName,
  orgName = "An Organization",
}: OrgLeftEmailProps) => {
  return (
    <BaseEmail preview={`You have left "${orgName}"`}>
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          You've left an organization
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          we're confirming that you have successfully left the organization <strong>{orgName}</strong>.
        </Text>

        <Text style={styles.paragraph}>
          You will no longer have access to this organization's workspace, active elections, or historical data. If you left by mistake, you'll need to ask an administrator of the organization to invite you back.
        </Text>

        {/* CTA Button */}
        <div style={{ ...styles.buttonWrapper, marginTop: "32px" }}>
          <Link href={`${cleanBaseUrl}/setup/organization`} style={styles.button}>
            Create New Organization
          </Link>
        </div>
      </Section>
    </BaseEmail>
  );
};

export default OrgLeftEmail;

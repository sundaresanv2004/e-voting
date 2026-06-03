import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface OrgOwnershipTransferredEmailProps {
  userName?: string;
  orgName?: string;
  previousOwnerName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const OrgOwnershipTransferredEmail = ({
  userName,
  orgName = "Your Organization",
  previousOwnerName = "the previous owner",
}: OrgOwnershipTransferredEmailProps) => {
  return (
    <BaseEmail preview={`You are now the owner of "${orgName}"`}>
      <Section style={styles.content}>
        <Text style={{ ...styles.heading, textAlign: "center" }}>
          Organization Ownership Transferred
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          you have been made the new owner of the organization <strong>{orgName}</strong> by {previousOwnerName}.
        </Text>

        <Text style={styles.paragraph}>
          As the new owner, you now have full administrative control over the organization, including managing billing, deleting the organization, and transferring ownership to someone else in the future.
        </Text>

        {/* CTA Button */}
        <div style={{ ...styles.buttonWrapper, marginTop: "32px" }}>
          <Link href={`${cleanBaseUrl}/organisation/settings`} style={styles.button}>
            Go to Organization Settings
          </Link>
        </div>
      </Section>
    </BaseEmail>
  );
};

export default OrgOwnershipTransferredEmail;

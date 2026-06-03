import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface OrgDeletedEmailProps {
  userName?: string;
  orgName?: string;
  deletedBy?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const OrgDeletedEmail = ({
  userName,
  orgName = "An Organization",
  deletedBy = "the owner",
}: OrgDeletedEmailProps) => {
  return (
    <BaseEmail preview={`The organization "${orgName}" has been deleted`}>
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          Organization Deleted
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          the organization <strong>{orgName}</strong> has been permanently deleted by {deletedBy}.
        </Text>

        <Text style={styles.paragraph}>
          As a result of this action, all elections, members, and data associated with this organization have been removed from our systems according to our data retention policy. You no longer have access to this organization's workspace.
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

export default OrgDeletedEmail;

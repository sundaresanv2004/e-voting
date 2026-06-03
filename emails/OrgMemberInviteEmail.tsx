import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

export type MemberRole = "organization admin" | "staff" | "viewer";
export type AccessType = "all" | "specific";

interface OrgMemberInviteEmailProps {
  userName?: string;
  orgName?: string;
  role?: MemberRole;
  accessType?: AccessType;
  elections?: string[];
  addedBy?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const OrgMemberInviteEmail = ({
  userName,
  orgName = "An Organization",
  role = "viewer",
  accessType = "all",
  elections = [],
  addedBy = "An administrator",
}: OrgMemberInviteEmailProps) => {
  return (
    <BaseEmail preview={`You've been added to "${orgName}"`}>
      <Section style={styles.content}>
        <Text style={{ ...styles.heading, textAlign: "center" }}>
          You've been added!
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          {addedBy} has added you to the organization <strong>{orgName}</strong> on e-voting.
        </Text>

        <Text style={{ ...styles.paragraph, textAlign: "center" }}>
          You have been assigned the role of <strong style={{ textTransform: "capitalize", color: "#6366f1" }}>{role}</strong>.
        </Text>

        {/* Permissions / Access Info Box */}
        <div style={{ ...styles.infoBox, backgroundColor: "#ffffff", textAlign: "left", marginTop: "24px" }}>
          <Text style={{ ...styles.paragraph, margin: "0 0 12px 0", fontWeight: "600", color: "#3f3f5a" }}>
            Your Access Level:
          </Text>

          {role === "organization admin" ? (
            <Text style={{ ...styles.paragraph, margin: 0, fontSize: "14px", color: "#52525b" }}>
              As an Organization Admin, you have full administrative access to manage all current and future elections, invite new members, and configure organization settings.
            </Text>
          ) : accessType === "all" ? (
            <Text style={{ ...styles.paragraph, margin: 0, fontSize: "14px", color: "#52525b" }}>
              You have been granted access to view and participate in <strong>all current and future elections</strong> managed by this organization.
            </Text>
          ) : (
            <>
              <Text style={{ ...styles.paragraph, margin: "0 0 8px 0", fontSize: "14px", color: "#52525b" }}>
                You have been granted access to the following specific elections:
              </Text>
              <ul style={{ margin: "0", paddingLeft: "20px", color: "#3f3f5a", fontSize: "14px" }}>
                {elections.map((electionName, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>
                    <strong>{electionName}</strong>
                  </li>
                ))}
              </ul>
              {elections.length === 0 && (
                <Text style={{ ...styles.paragraph, margin: 0, fontSize: "14px", color: "#9ca3af", fontStyle: "italic" }}>
                  No specific elections have been assigned to you yet.
                </Text>
              )}
            </>
          )}
        </div>

        {/* CTA Button */}
        <div style={{ ...styles.buttonWrapper, marginTop: "32px" }}>
          <Link href={`${cleanBaseUrl}/organisation`} style={styles.button}>
            Go to Dashboard
          </Link>
        </div>
      </Section>
    </BaseEmail>
  );
};

export default OrgMemberInviteEmail;

import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

export type MemberRole = "org_admin" | "staff" | "viewer";

interface OrgMemberAccessUpdatedEmailProps {
  userName?: string;
  orgName?: string;
  newRole?: MemberRole;
  oldRole?: MemberRole;
  nowHasAllAccess?: boolean;
  previouslyHadAllAccess?: boolean;
  addedElections?: string[];
  removedElections?: string[];
  updatedBy?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

const roleDisplayNames: Record<MemberRole, string> = {
  org_admin: "Organization Admin",
  staff: "Staff",
  viewer: "Viewer",
};

export const OrgMemberAccessUpdatedEmail = ({
  userName,
  orgName = "Your Organization",
  newRole = "viewer",
  oldRole = "viewer",
  nowHasAllAccess = false,
  previouslyHadAllAccess = false,
  addedElections = [],
  removedElections = [],
  updatedBy = "An administrator",
}: OrgMemberAccessUpdatedEmailProps) => {
  const roleChanged = newRole !== oldRole;
  const newRoleName = roleDisplayNames[newRole];

  return (
    <BaseEmail preview={`Your access in "${orgName}" has been updated`}>
      <Section style={styles.content}>
        <Text style={{ ...styles.heading, textAlign: "center" }}>
          Access Updated
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          {updatedBy} has updated your access permissions in the organization <strong>{orgName}</strong>.
        </Text>

        {/* Changes Summary Box */}
        <div style={{ ...styles.infoBox, backgroundColor: "#ffffff", textAlign: "left", marginTop: "24px" }}>
          <Text style={{ ...styles.paragraph, margin: "0 0 16px 0", fontWeight: "600", color: "#3f3f5a" }}>
            Summary of Changes:
          </Text>

          {roleChanged && (
            <div style={{ marginBottom: "16px" }}>
              <Text style={{ ...styles.paragraph, margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#52525b" }}>
                Role Updated:
              </Text>
              <Text style={{ ...styles.paragraph, margin: 0, fontSize: "14px", color: "#52525b" }}>
                Your role has been changed to <strong style={{ color: "#6366f1" }}>{newRoleName}</strong>.
              </Text>
            </div>
          )}

          {!roleChanged && (
            <div style={{ marginBottom: "16px" }}>
               <Text style={{ ...styles.paragraph, margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#52525b" }}>
                Current Role:
              </Text>
              <Text style={{ ...styles.paragraph, margin: 0, fontSize: "14px", color: "#52525b" }}>
                <strong style={{ color: "#6366f1" }}>{newRoleName}</strong>
              </Text>
            </div>
          )}

          {newRole === "org_admin" ? (
             <Text style={{ ...styles.paragraph, margin: 0, fontSize: "14px", color: "#52525b" }}>
               As an Organization Admin, you now have full administrative access to all current and future elections.
             </Text>
          ) : nowHasAllAccess ? (
            <Text style={{ ...styles.paragraph, margin: 0, fontSize: "14px", color: "#52525b" }}>
               You now have access to view and participate in <strong>all current and future elections</strong>.
            </Text>
          ) : (
            <>
               {(addedElections.length > 0 || removedElections.length > 0 || previouslyHadAllAccess) && (
                 <Text style={{ ...styles.paragraph, margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#52525b" }}>
                   Election Access Changes:
                 </Text>
               )}
               
               {previouslyHadAllAccess && !nowHasAllAccess && (
                 <Text style={{ ...styles.paragraph, margin: "0 0 8px 0", fontSize: "14px", color: "#ef4444" }}>
                   Your access to "all current and future elections" has been revoked. You now have specific access only.
                 </Text>
               )}

               {addedElections.length > 0 && (
                 <div style={{ marginBottom: "12px" }}>
                   <Text style={{ ...styles.paragraph, margin: "0 0 4px 0", fontSize: "14px", color: "#10b981", fontWeight: "500" }}>
                     Added Access:
                   </Text>
                   <ul style={{ margin: "0", paddingLeft: "20px", color: "#3f3f5a", fontSize: "14px" }}>
                     {addedElections.map((electionName, idx) => (
                       <li key={idx} style={{ marginBottom: "4px" }}>
                         <strong>{electionName}</strong>
                       </li>
                     ))}
                   </ul>
                 </div>
               )}

               {removedElections.length > 0 && (
                 <div style={{ marginBottom: "12px" }}>
                   <Text style={{ ...styles.paragraph, margin: "0 0 4px 0", fontSize: "14px", color: "#ef4444", fontWeight: "500" }}>
                     Removed Access:
                   </Text>
                   <ul style={{ margin: "0", paddingLeft: "20px", color: "#3f3f5a", fontSize: "14px" }}>
                     {removedElections.map((electionName, idx) => (
                       <li key={idx} style={{ marginBottom: "4px" }}>
                         <strong>{electionName}</strong>
                       </li>
                     ))}
                   </ul>
                 </div>
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

export default OrgMemberAccessUpdatedEmail;

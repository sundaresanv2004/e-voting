import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface ElectionCreatedEmailProps {
  userName?: string;
  orgName?: string;
  electionName?: string;
  electionId?: string;
  electionCode?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const ElectionCreatedEmail = ({
  userName,
  orgName = "Your Organization",
  electionName = "New Election",
  electionId = "123",
  electionCode = "ELEC-123",
  startDate = "Soon",
  endDate = "Later",
  createdBy = "An admin",
}: ElectionCreatedEmailProps) => {
  return (
    <BaseEmail preview={`New election: "${electionName}" in ${orgName}`}>
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          A new election has been created
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          a new election titled <strong>{electionName}</strong> has been created in <strong>{orgName}</strong> by {createdBy}.
        </Text>

        {/* Election Details Table */}
        <div style={{ ...styles.infoBox, backgroundColor: "#ffffff", textAlign: "left" }}>
          <Text style={{ ...styles.paragraph, margin: "0 0 12px 0", fontWeight: "600" }}>Election Details:</Text>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px", width: "100px" }}>Organization</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{orgName}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px" }}>Election Code</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{electionCode}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px" }}>Start Date</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{startDate}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px" }}>End Date</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{endDate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA Button */}
        <div style={{ ...styles.buttonWrapper, marginTop: "24px" }}>
          <Link href={`${cleanBaseUrl}/organisation/election/${electionId}`} style={styles.button}>
            View Election
          </Link>
        </div>
      </Section>
    </BaseEmail>
  );
};

export default ElectionCreatedEmail;

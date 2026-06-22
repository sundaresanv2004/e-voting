import { Section, Text, Link } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface ResultsDownloadedEmailProps {
  ownerName?: string;
  orgName?: string;
  electionName?: string;
  electionId?: string;
  downloadedBy?: string;
  downloadType?: string; // "Excel Spreadsheet", "CSV File", "Print Report (PDF)"
  downloadedAt?: string; // formatted date string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const ResultsDownloadedEmail = ({
  ownerName,
  orgName = "Your Organization",
  electionName = "Election",
  electionId = "123",
  downloadedBy = "A member",
  downloadType = "Excel Spreadsheet",
  downloadedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
}: ResultsDownloadedEmailProps) => {
  return (
    <BaseEmail preview={`Results exported for "${electionName}" — ${downloadType}`}>
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          Election results were exported
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {ownerName ? `Hi ${ownerName},` : "Hello,"}{" "}
          a member of <strong>{orgName}</strong> has downloaded the results for{" "}
          <strong>{electionName}</strong>.
        </Text>

        {/* Download Details Table */}
        <div style={{ ...styles.infoBox, backgroundColor: "#ffffff", textAlign: "left" }}>
          <Text style={{ ...styles.paragraph, margin: "0 0 12px 0", fontWeight: "600" }}>Export Details:</Text>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "5px 0", color: "#71717a", fontSize: "14px", width: "120px" }}>Election</td>
                <td style={{ padding: "5px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{electionName}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: "#71717a", fontSize: "14px" }}>Organization</td>
                <td style={{ padding: "5px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{orgName}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: "#71717a", fontSize: "14px" }}>Exported By</td>
                <td style={{ padding: "5px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{downloadedBy}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: "#71717a", fontSize: "14px" }}>Format</td>
                <td style={{ padding: "5px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{downloadType}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", color: "#71717a", fontSize: "14px" }}>Date &amp; Time</td>
                <td style={{ padding: "5px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{downloadedAt}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security note */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "10px",
            padding: "14px 18px",
            margin: "20px 0",
          }}
        >
          <Text
            style={{
              color: "#92400e",
              fontSize: "13px",
              fontWeight: "500",
              lineHeight: "1.6",
              margin: "0",
            }}
          >
            ⚠️ If you did not authorize this export or don&apos;t recognise who downloaded the results, please review your organization&apos;s member access.
          </Text>
        </div>

        {/* CTA Button */}
        <div style={{ ...styles.buttonWrapper, marginTop: "24px" }}>
          <Link href={`${cleanBaseUrl}/organisation/election/${electionId}/results`} style={styles.button}>
            View Results
          </Link>
        </div>

      </Section>
    </BaseEmail>
  );
};

export default ResultsDownloadedEmail;

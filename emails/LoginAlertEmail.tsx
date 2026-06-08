import { Section, Text, Link, Hr } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface LoginAlertEmailProps {
  userName?: string;
  loginMethod?: "email" | "google" | "github";
  browser?: string;
  os?: string;
  ipAddress?: string;
  location?: string;
  loginTime?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://evoting.sundaresan.dev";
const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

export const LoginAlertEmail = ({
  userName,
  loginMethod = "email",
  browser = "Unknown Browser",
  os = "Unknown OS",
  ipAddress = "Unknown IP",
  location = "Unknown Location",
  loginTime = new Date().toLocaleString(),
}: LoginAlertEmailProps) => {
  return (
    <BaseEmail preview="New sign-in to your e-voting account">
      <Section style={styles.content}>

        <Text style={{ ...styles.heading, textAlign: "center" }}>
          New sign-in to your account
        </Text>
        <Text style={{ ...styles.subheading, textAlign: "center" }}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          we noticed a new login to your e-voting account using <strong>{loginMethod}</strong>.
        </Text>

        {/* Login Details Table */}
        <div style={{ ...styles.infoBox, backgroundColor: "#ffffff", textAlign: "left" }}>
          <Text style={{ ...styles.paragraph, margin: "0 0 12px 0", fontWeight: "600" }}>Login Details:</Text>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px", width: "100px" }}>Browser</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{browser}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px" }}>OS</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{os}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px" }}>IP Address</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{ipAddress}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", color: "#71717a", fontSize: "14px" }}>Time</td>
                <td style={{ padding: "4px 0", color: "#3f3f5a", fontSize: "14px", fontWeight: "500" }}>{loginTime}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security Warning */}
        <div
          style={{
            ...styles.infoBox,
            backgroundColor: "#fff7ed", // orange-50
            borderColor: "#fed7aa",     // orange-200
            marginTop: "24px"
          }}
        >
          <Text style={{ ...styles.infoText, color: "#9a3412" }}>
            <strong>Didn't make this login?</strong> Secure your account immediately by resetting your password.
          </Text>
        </div>

        {/* CTA Button */}
        <div style={{ ...styles.buttonWrapper, marginTop: "24px" }}>
          <Link href={`${cleanBaseUrl}/user/profile?tab=security`} style={{ ...styles.button, backgroundColor: "#dc2626", color: "#ffffff" }}>
            Secure My Account
          </Link>
        </div>
      </Section>
    </BaseEmail>
  );
};

export default LoginAlertEmail;

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { BaseEmail, styles } from "./BaseEmail";

interface VerificationEmailProps {
  otp?: string;
  userName?: string;
}

export const VerificationEmail = ({
  otp = "123456",
  userName,
}: VerificationEmailProps) => {
  return (
    <BaseEmail preview="Your e-voting verification code">
      <Section style={styles.content}>
        <Text style={styles.heading}>Verify your email address</Text>
        <Text style={styles.subheading}>
          {userName ? `Hi ${userName},` : "Hello,"}{" "}
          please enter the code below to verify your email address and activate your e-voting account.
        </Text>

        {/* OTP Code Block */}
        <div style={styles.otpWrapper}>
          <Text style={styles.otpCode}>{otp}</Text>
        </div>

        {/* Info note */}
        <div style={styles.infoBox}>
          <Text style={styles.infoText}>
            This code expires in <strong>5 minutes</strong>. If you didn't create an account, you can safely ignore this email.
          </Text>
        </div>

        <Text style={{ ...styles.paragraph, marginTop: "8px" }}>
          For your security, never share this code with anyone — our team will never ask for it.
        </Text>
      </Section>
    </BaseEmail>
  );
};

export default VerificationEmail;

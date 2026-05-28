import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface VerificationEmailProps {
  otp: string;
}

export const VerificationEmail = ({
  otp = "000000",
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>e-voting</Text>
          </Section>
          
          <Heading style={h1}>Verify your email address</Heading>
          
          <Text style={text}>
            Hello,
          </Text>
          <Text style={text}>
            Please use the verification code below to confirm your email address and complete your login process.
          </Text>
          
          <Section style={codeContainer}>
            <Text style={codeText}>{otp}</Text>
          </Section>
          
          <Text style={text}>
            This code is valid for <strong>5 minutes</strong>. If you didn't request this email, you can safely ignore it.
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            For help, contact{" "}
            <Link href="mailto:support@evoting.sundaresan.dev" style={link}>
              support@evoting.sundaresan.dev
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "480px",
};

const header = {
  marginBottom: "24px",
  textAlign: "center" as const,
};

const headerText = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#111827",
  letterSpacing: "-0.5px",
  margin: "0",
};

const h1 = {
  color: "#111827",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "0 0 24px",
  letterSpacing: "-0.5px",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const codeContainer = {
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  margin: "24px 0",
  padding: "16px",
  textAlign: "center" as const,
};

const codeText = {
  color: "#111827",
  fontFamily: "monospace",
  fontSize: "36px",
  fontWeight: "bold",
  letterSpacing: "8px",
  lineHeight: "40px",
  margin: "0",
  paddingLeft: "8px", // To visually center with letter spacing
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0 24px",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

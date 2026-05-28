import {
  Body,
  Button,
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

interface ResetPasswordEmailProps {
  resetPasswordLink: string;
}

export const ResetPasswordEmail = ({
  resetPasswordLink = "https://evoting.sundaresan.dev/reset-password",
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>e-voting</Text>
          </Section>

          <Heading style={h1}>Reset your password</Heading>
          
          <Text style={text}>
            Hello,
          </Text>
          <Text style={text}>
            We received a request to reset the password for your e-voting account. If this was you, you can set a new password by clicking the button below:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetPasswordLink}>
              Reset Password
            </Button>
          </Section>
          
          <Text style={text}>
            This link will expire in <strong>30 minutes</strong>. If you don't want to change your password or didn't request this, just ignore and delete this message.
          </Text>
          <Text style={subText}>
            To keep your account secure, please don't forward this email to anyone.
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

export default ResetPasswordEmail;

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

const subText = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#111827",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
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

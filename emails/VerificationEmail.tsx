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
  Tailwind,
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
      <Tailwind>
        <Head />
        <Preview>Verify your email address for e-voting</Preview>
        <Body className="bg-zinc-50 dark:bg-zinc-950 font-sans my-auto mx-auto px-2 py-10">
          <Container className="border border-solid border-zinc-200 dark:border-zinc-800 rounded-xl my-[40px] mx-auto p-[40px] max-w-[600px] bg-white dark:bg-zinc-900 shadow-sm">
            <Section className="mb-[24px] text-center">
              <Text className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight m-0">
                e-voting
              </Text>
            </Section>
            
            <Text className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[24px]">
              Thank you for registering with e-voting. To complete your registration and secure your account, please verify your email address by entering the code below.
            </Text>
            
            <Section className="bg-zinc-100 dark:bg-zinc-800 border border-solid border-zinc-200 dark:border-zinc-700 rounded-lg my-[24px] mx-auto p-[16px] text-center">
              <Text className="text-zinc-950 dark:text-zinc-50 font-mono text-[36px] font-bold tracking-[8px] leading-[40px] m-0 pl-[8px]">
                {otp}
              </Text>
            </Section>
            
            <Text className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[24px]">
              This code is valid for <strong>5 minutes</strong>. If you did not request this email, you can safely ignore it.
            </Text>
            
            <Hr className="border border-solid border-zinc-200 dark:border-zinc-800 my-[32px] mx-0 w-full" />
            
            <Text className="text-zinc-500 dark:text-zinc-400 text-[14px] leading-[24px] text-center m-0">
              For security assistance, contact our support team at{" "}
              <Link href="mailto:support@evoting.sundaresan.dev" className="text-indigo-600 dark:text-indigo-400 underline">
                support@evoting.sundaresan.dev
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;

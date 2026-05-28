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
  Button,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetSuccessEmailProps {
  loginLink?: string;
}

export const PasswordResetSuccessEmail = ({
  loginLink = "https://evoting.sundaresan.dev/auth/login",
}: PasswordResetSuccessEmailProps) => {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Your password has been successfully updated</Preview>
        <Body className="bg-zinc-50 dark:bg-zinc-950 font-sans my-auto mx-auto px-2 py-10">
          <Container className="border border-solid border-zinc-200 dark:border-zinc-800 rounded-xl my-[40px] mx-auto p-[40px] max-w-[600px] bg-white dark:bg-zinc-900 shadow-sm">
            <Section className="mb-[24px] text-center">
              <Text className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight m-0">
                e-voting
              </Text>
            </Section>

            <Heading className="text-zinc-950 dark:text-zinc-50 text-[24px] font-semibold text-center p-0 my-[24px] mx-0 tracking-tight">
              Password Updated Successfully
            </Heading>
            
            <Text className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[24px]">
              This is a confirmation that the password for your e-voting account was just changed successfully. You can now use your new password to log in.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#4f46e5] text-white rounded-full text-[16px] font-semibold no-underline text-center px-[32px] py-[12px]"
                href={loginLink}
              >
                Log In to Your Account
              </Button>
            </Section>
            
            <Text className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[24px]">
              <strong>Didn't make this change?</strong>
            </Text>
            <Text className="text-zinc-700 dark:text-zinc-300 text-[16px] leading-[24px] mt-0">
              If you did not authorize this change, please contact our security team immediately to secure your account.
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

export default PasswordResetSuccessEmail;

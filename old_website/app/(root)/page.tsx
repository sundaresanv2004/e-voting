import type { Metadata } from "next";
import Hero from "@/components/landing/hero";

export const metadata: Metadata = {
  title: "E-Voting | Secure Digital Elections",
  description:
    "E-Voting is a secure digital election platform for organizations, schools, and colleges.",
}

const Page = () => {
  return <Hero />;
}

export default Page;

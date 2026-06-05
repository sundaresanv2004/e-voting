import { notFound } from "next/navigation";
import * as React from "react";

export default function TempLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Completely block the /temp route group in production
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <>{children}</>;
}

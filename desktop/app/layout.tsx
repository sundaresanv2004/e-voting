import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { TerminalProvider } from "@/components/shared/terminal-context"
import { RootContent } from "@/components/shared/root-content"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils";

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "E-Voting",
  description: "Secure Electronic Voting Terminal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", spaceGrotesk.variable, geistHeading.variable)}
    >
      <body>
        <ThemeProvider>
          <TerminalProvider>
            <RootContent>{children}</RootContent>
            <Toaster position="top-right" richColors />
          </TerminalProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

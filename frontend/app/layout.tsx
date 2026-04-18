import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Providers } from "@/components/providers/session-provider"
import { cn } from "@/lib/utils";

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { Toaster } from "sonner"
import { SuccessToastListener } from "@/components/auth/success-toast-listener"
import { Suspense } from "react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={cn("antialiased", fontMono.variable, "font-sans", spaceGrotesk.variable, geistHeading.variable)}
      >
        <Providers>
          <ThemeProvider>
            {children}
            <Suspense fallback={null}>
              <SuccessToastListener />
            </Suspense>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

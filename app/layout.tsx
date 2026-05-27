import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { cn } from "@/lib/utils";

const bricolageHeading = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-heading' });

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", spaceGrotesk.variable, bricolageHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils";

const geistHeading = Geist({ subsets: ['latin'], variable: '--font-heading' });

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})


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
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

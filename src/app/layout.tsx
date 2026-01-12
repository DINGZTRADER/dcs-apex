import type { Metadata } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

export const metadata: Metadata = {
  title: "DCS Apex - University Management",
  description: "Professional university dashboard for managing students, staff, and finances",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans`}>
        <ThemeProvider defaultTheme="system" storageKey="dcs-ui-theme">
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster 
                position="top-right" 
                richColors 
                closeButton
                toastOptions={{
                  duration: 4000,
                }}
              />
              <Analytics />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

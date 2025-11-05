import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

// ✅ Fonts laden
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// ✅ Metadaten
export const metadata: Metadata = {
  title: "Luma - Finde deinen Soulmate",
  description: "Dating-App basierend auf Persönlichkeit und gemeinsamen Interessen",
  generator: "maynsta",
}

// ✅ Client-Komponente für Mounting-Check
function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    // Hintergrund gleich wie Startseite → verhindert Weißflackern beim Mount
    return <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" />
  }

  return <>{children}</>
}

// ✅ Analytics als eigene Client-Komponente (nicht dynamisch!)
function AnalyticsClient() {
  // Das ist erlaubt, weil diese Funktion in einer Client-Komponente verwendet wird
  if (typeof window === "undefined") return null
  const { Analytics } = require("@vercel/analytics/react")
  return <Analytics />
}

// ✅ RootLayout (Server-Komponente)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-neutral-900">
        <ClientWrapper>{children}</ClientWrapper>
        <AnalyticsClient /> {/* außerhalb vom ClientWrapper */}
      </body>
    </html>
  )
}


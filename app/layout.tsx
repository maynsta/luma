import React, { useState, useEffect } from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

// ✅ Fonts konfigurieren
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// ✅ Metadaten für die App
export const metadata: Metadata = {
  title: "Luma - Finde deinen Soulmate",
  description: "Dating-App basierend auf Persönlichkeit und gemeinsamen Interessen",
  generator: "maynsta",
}

// ✅ ClientWrapper (verhindert Weißflackern beim Laden)
function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    // gleiche Hintergrundfarbe wie Startseite → kein Flackern
    return <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" />
  }

  return <>{children}</>
}

// ✅ Analytics in separater Client-Komponente
function AnalyticsClient() {
  if (typeof window === "undefined") return null
  const { Analytics } = require("@vercel/analytics/react")
  return <Analytics />
}

// ✅ Root Layout (Server-Komponente)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-neutral-900">
        <ClientWrapper>{children}</ClientWrapper>
        <AnalyticsClient />
      </body>
    </html>
  )
}



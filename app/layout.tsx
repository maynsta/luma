import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
// ❌ Analytics NICHT direkt hier importieren – erst später dynamisch
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Luma - Finde deinen Soulmate",
  description: "Dating-App basierend auf Persönlichkeit und gemeinsamen Interessen",
    generator: 'maynsta'
}

function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    // Hintergrund gleich wie Startseite, verhindert Weißflackern
    return <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50" />
  }
  return <>{children}</>
}

// 👉 Analytics dynamisch importieren (verhindert mehrfaches Mounten)
import dynamic from "next/dynamic"
const Analytics = dynamic(() => import("@vercel/analytics/react").then(mod => mod.Analytics), { ssr: false })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 text-neutral-900">
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <Analytics /> {/* außerhalb vom ClientWrapper */}
      </body>
    </html>
  )
}

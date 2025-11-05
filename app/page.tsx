import { Button } from "@/components/ui/button"
import { Heart, Sparkles, Users, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Heart className="h-16 w-16 text-rose-500 fill-rose-500" />
            <h1 className="text-6xl font-bold text-rose-600">Luma</h1>
          </div>

          <p className="text-2xl text-balance text-muted-foreground leading-relaxed">
            Finde deinen perfekten Match basierend auf Persönlichkeit und gemeinsamen Interessen
          </p>

          <div className="flex gap-4 pt-4">
            <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600 text-lg px-8">
              <Link href="/auth/login">Jetzt starten</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Link href="/auth/login">Anmelden</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="p-4 bg-rose-100 rounded-full">
              <Sparkles className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-semibold">Persönlichkeits-Matching</h3>
            <p className="text-muted-foreground leading-relaxed">
              Unser Algorithmus findet Menschen, die wirklich zu dir passen
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="p-4 bg-rose-100 rounded-full">
              <Users className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-semibold">Gemeinsame Interessen</h3>
            <p className="text-muted-foreground leading-relaxed">Verbinde dich mit Menschen, die deine Hobbys teilen</p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white/50 rounded-lg backdrop-blur">
            <div className="p-4 bg-rose-100 rounded-full">
              <MessageCircle className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-semibold">Echte Verbindungen</h3>
            <p className="text-muted-foreground leading-relaxed">
              Keine oberflächlichen Matches - nur authentische Beziehungen
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

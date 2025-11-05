"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Heart, ArrowLeft, MapPin, User, Sparkles } from "lucide-react"

interface Match {
  matchId: string
  matchedAt: string
  profile: {
    id: string
    display_name: string
    age: number
    bio: string | null
    location: string | null
    hobbies: { hobby: string }[]
    personality_traits: { trait: string; value: number }[]
  }
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      loadMatches()
    }

    checkAuth()
  }, [router])

  const loadMatches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/matches")
      const data = await response.json()

      if (data.matches) {
        setMatches(data.matches)
      }
    } catch (error) {
      console.error("[v0] Error loading matches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Heute"
    if (diffInDays === 1) return "Gestern"
    if (diffInDays < 7) return `Vor ${diffInDays} Tagen`
    return date.toLocaleDateString("de-DE")
  }

  if (isLoading) {
    return (
      <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-rose-500 fill-rose-500 animate-pulse mx-auto" />
          <p className="text-lg text-muted-foreground">Lade deine Matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/discover")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl font-bold text-rose-600">Meine Matches</h1>
          </div>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Matches Grid */}
      <div className="max-w-4xl mx-auto">
        {matches.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center space-y-4">
              <Sparkles className="h-12 w-12 text-rose-500 mx-auto" />
              <h2 className="text-2xl font-bold">Noch keine Matches</h2>
              <p className="text-muted-foreground">Swipe weiter, um deinen perfekten Match zu finden!</p>
              <Button onClick={() => router.push("/discover")} className="bg-rose-500 hover:bg-rose-600">
                Jetzt swipen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.matchId} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {/* Profile Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center relative">
                  <User className="h-20 w-20 text-rose-400" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
                    <span className="text-xs font-medium text-rose-600">{formatDate(match.matchedAt)}</span>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Name and Age */}
                  <div>
                    <h3 className="text-xl font-bold">
                      {match.profile.display_name}, {match.profile.age}
                    </h3>
                    {match.profile.location && (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>{match.profile.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {match.profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{match.profile.bio}</p>
                  )}

                  {/* Hobbies */}
                  {match.profile.hobbies && match.profile.hobbies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {match.profile.hobbies.slice(0, 4).map((hobby, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {hobby.hobby}
                        </Badge>
                      ))}
                      {match.profile.hobbies.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{match.profile.hobbies.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button className="w-full bg-rose-500 hover:bg-rose-600 mt-2" size="sm">
                    Nachricht senden
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

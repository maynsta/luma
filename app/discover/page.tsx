"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Heart, X, MapPin, Sparkles, UserIcon, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Profile {
  id: string
  display_name: string
  age: number
  bio: string | null
  location: string | null
  hobbies: { hobby: string }[]
  personality_traits: { trait: string; value: number }[]
  compatibilityScore: number
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showMatch, setShowMatch] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
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

      loadProfiles()
    }

    checkAuth()
  }, [router])

  const loadProfiles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/discover")
      const data = await response.json()

      if (data.profiles) {
        setProfiles(data.profiles)
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error("[v0] Error loading profiles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = async (liked: boolean) => {
    if (isAnimating || currentIndex >= profiles.length) return

    setIsAnimating(true)
    const currentProfile = profiles[currentIndex]

    try {
      const response = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swipedId: currentProfile.id,
          liked,
        }),
      })

      const data = await response.json()

      if (data.match) {
        setShowMatch(true)
        setTimeout(() => setShowMatch(false), 3000)
      }

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsAnimating(false)
      }, 300)
    } catch (error) {
      console.error("[v0] Error swiping:", error)
      setIsAnimating(false)
    }
  }

  const currentProfile = profiles[currentIndex]

  if (isLoading) {
    return (
      <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-rose-500 fill-rose-500 animate-pulse mx-auto" />
          <p className="text-lg text-muted-foreground">Suche nach deinem perfekten Match...</p>
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <Sparkles className="h-12 w-12 text-rose-500 mx-auto" />
            <h2 className="text-2xl font-bold">Keine Profile mehr</h2>
            <p className="text-muted-foreground">
              Du hast alle verfügbaren Profile gesehen. Schau später wieder vorbei!
            </p>
            <Button onClick={() => router.push("/matches")} className="bg-rose-500 hover:bg-rose-600">
              Zu meinen Matches
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
          <h1 className="text-2xl font-bold text-rose-600">Luma</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/matches")}>
              <Heart className="h-4 w-4 mr-2" />
              Meine Matches
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <UserIcon className="h-4 w-4 mr-2" />
              Mein Profil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Match Notification */}
      {showMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="max-w-sm w-full mx-4 animate-in zoom-in-95">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <Heart className="h-16 w-16 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-rose-600">It's a Match!</h2>
              <p className="text-muted-foreground">Ihr habt euch gegenseitig geliked!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Card */}
      <div className="max-w-md mx-auto">
        <Card
          className={`overflow-hidden transition-all duration-300 ${
            isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
          }`}
        >
          {/* Profile Image Placeholder */}
          <div className="h-96 bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center relative">
            <UserIcon className="h-32 w-32 text-rose-400" />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-rose-500" />
                <span className="text-sm font-semibold text-rose-600">{currentProfile.compatibilityScore}% Match</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Name and Age */}
            <div>
              <h2 className="text-3xl font-bold">
                {currentProfile.display_name}, {currentProfile.age}
              </h2>
              {currentProfile.location && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentProfile.location}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {currentProfile.bio && <p className="text-muted-foreground leading-relaxed">{currentProfile.bio}</p>}

            {/* Hobbies */}
            {currentProfile.hobbies && currentProfile.hobbies.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Hobbys & Interessen</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.hobbies.map((hobby, index) => (
                    <Badge key={index} variant="secondary">
                      {hobby.hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Personality Traits */}
            {currentProfile.personality_traits && currentProfile.personality_traits.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">Persönlichkeit</h3>
                <div className="space-y-1">
                  {currentProfile.personality_traits.map((trait, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-sm capitalize">{trait.trait}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${i < trait.value ? "bg-rose-500" : "bg-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full border-2 hover:border-red-500 hover:bg-red-50 bg-transparent"
            onClick={() => handleSwipe(false)}
            disabled={isAnimating}
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>
          <Button
            size="lg"
            className="h-16 w-16 rounded-full bg-rose-500 hover:bg-rose-600"
            onClick={() => handleSwipe(true)}
            disabled={isAnimating}
          >
            <Heart className="h-8 w-8 fill-white" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          {currentIndex + 1} / {profiles.length}
        </div>
      </div>
    </div>
  )
}

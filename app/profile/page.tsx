"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Heart, ArrowLeft, MapPin, User, LogOut } from "lucide-react"

interface Profile {
  id: string
  display_name: string
  age: number
  bio: string | null
  gender: string | null
  looking_for: string | null
  location: string | null
  hobbies: { hobby: string }[]
  personality_traits: { trait: string; value: number }[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*, hobbies(*), personality_traits(*)")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("[v0] Error loading profile:", error)
      } else {
        setProfile(data)
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Heart className="h-12 w-12 text-rose-500 fill-rose-500 animate-pulse mx-auto" />
          <p className="text-lg text-muted-foreground">Lade Profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Profil nicht gefunden</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/discover")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
            <h1 className="text-2xl font-bold text-rose-600">Mein Profil</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          {/* Profile Image Placeholder */}
          <div className="h-64 bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center">
            <User className="h-32 w-32 text-rose-400" />
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-3xl font-bold">
                {profile.display_name}, {profile.age}
              </h2>
              {profile.location && (
                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="font-semibold mb-2">Über mich</h3>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Preferences */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Geschlecht</h3>
                <p className="capitalize">
                  {profile.gender === "male" ? "Männlich" : profile.gender === "female" ? "Weiblich" : "Divers"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">Suche nach</h3>
                <p className="capitalize">
                  {profile.looking_for === "male" ? "Männern" : profile.looking_for === "female" ? "Frauen" : "Allen"}
                </p>
              </div>
            </div>

            {/* Hobbies */}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Hobbys & Interessen</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby, index) => (
                    <Badge key={index} className="bg-rose-500 hover:bg-rose-600">
                      {hobby.hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Personality Traits */}
            {profile.personality_traits && profile.personality_traits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Persönlichkeit</h3>
                <div className="space-y-2">
                  {profile.personality_traits.map((trait, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm capitalize min-w-32">{trait.trait}</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-3 w-3 rounded-full ${i < trait.value ? "bg-rose-500" : "bg-gray-200"}`}
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
      </div>
    </div>
  )
}

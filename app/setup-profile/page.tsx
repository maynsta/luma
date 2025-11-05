"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Heart, X, Sparkles } from "lucide-react"
import { Slider } from "@/components/ui/slider"

const PERSONALITY_TRAITS = [
  { name: "Extrovertiert", key: "extroverted" },
  { name: "Abenteuerlustig", key: "adventurous" },
  { name: "Kreativ", key: "creative" },
  { name: "Humorvoll", key: "humorous" },
  { name: "Empathisch", key: "empathetic" },
]

const HOBBY_SUGGESTIONS = [
  "Sport",
  "Reisen",
  "Kochen",
  "Lesen",
  "Gaming",
  "Musik",
  "Kunst",
  "Fotografie",
  "Wandern",
  "Yoga",
  "Tanzen",
  "Filme",
]

export default function SetupProfilePage() {
  const [displayName, setDisplayName] = useState("")
  const [age, setAge] = useState("")
  const [bio, setBio] = useState("")
  const [gender, setGender] = useState("")
  const [lookingFor, setLookingFor] = useState("")
  const [location, setLocation] = useState("")
  const [hobbies, setHobbies] = useState<string[]>([])
  const [currentHobby, setCurrentHobby] = useState("")
  const [traits, setTraits] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      // Check if profile already exists
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profile) {
        router.push("/discover")
      }
    }

    checkUser()
  }, [router])

  const addHobby = () => {
    if (currentHobby.trim() && !hobbies.includes(currentHobby.trim())) {
      setHobbies([...hobbies, currentHobby.trim()])
      setCurrentHobby("")
    }
  }

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter((h) => h !== hobby))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        display_name: displayName,
        age: Number.parseInt(age),
        bio,
        gender,
        looking_for: lookingFor,
        location,
      })

      if (profileError) throw profileError

      // Add hobbies
      if (hobbies.length > 0) {
        const hobbiesData = hobbies.map((hobby) => ({
          user_id: userId,
          hobby,
        }))
        const { error: hobbiesError } = await supabase.from("hobbies").insert(hobbiesData)

        if (hobbiesError) throw hobbiesError
      }

      // Add personality traits
      const traitsData = Object.entries(traits).map(([trait, value]) => ({
        user_id: userId,
        trait,
        value,
      }))

      if (traitsData.length > 0) {
        const { error: traitsError } = await supabase.from("personality_traits").insert(traitsData)

        if (traitsError) throw traitsError
      }

      router.push("/discover")
    } catch (error: unknown) {
      console.error("[v0] Profile creation error:", error)
      setError(error instanceof Error ? error.message : "Fehler beim Erstellen des Profils")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-rose-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Heart className="h-10 w-10 text-rose-500 fill-rose-500" />
            <h1 className="text-4xl font-bold text-rose-600">Luma</h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5" />
            <p className="text-lg">Erstelle dein Profil</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Erzähl uns von dir</CardTitle>
            <CardDescription>
              Je mehr wir über dich wissen, desto besser können wir deinen perfekten Match finden
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="displayName">Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Wie möchtest du genannt werden?"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="age">Alter</Label>
                    <Input
                      id="age"
                      type="number"
                      min="18"
                      max="100"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Ort</Label>
                    <Input
                      id="location"
                      placeholder="Stadt"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Geschlecht</Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Männlich</SelectItem>
                        <SelectItem value="female">Weiblich</SelectItem>
                        <SelectItem value="other">Divers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lookingFor">Suche nach</Label>
                    <Select value={lookingFor} onValueChange={setLookingFor} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Männern</SelectItem>
                        <SelectItem value="female">Frauen</SelectItem>
                        <SelectItem value="everyone">Allen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">Über mich</Label>
                  <Textarea
                    id="bio"
                    placeholder="Erzähl etwas über dich..."
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              {/* Hobbies */}
              <div className="space-y-3">
                <Label>Hobbys & Interessen</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Füge ein Hobby hinzu..."
                    value={currentHobby}
                    onChange={(e) => setCurrentHobby(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addHobby()
                      }
                    }}
                  />
                  <Button type="button" onClick={addHobby} variant="outline">
                    Hinzufügen
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {HOBBY_SUGGESTIONS.map((hobby) => (
                    <Badge
                      key={hobby}
                      variant="outline"
                      className="cursor-pointer hover:bg-rose-100"
                      onClick={() => {
                        if (!hobbies.includes(hobby)) {
                          setHobbies([...hobbies, hobby])
                        }
                      }}
                    >
                      {hobby}
                    </Badge>
                  ))}
                </div>
                {hobbies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hobbies.map((hobby) => (
                      <Badge key={hobby} className="bg-rose-500 hover:bg-rose-600">
                        {hobby}
                        <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeHobby(hobby)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Personality Traits */}
              <div className="space-y-4">
                <Label>Persönlichkeit (1-5)</Label>
                {PERSONALITY_TRAITS.map((trait) => (
                  <div key={trait.key} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{trait.name}</span>
                      <span className="text-sm font-medium">{traits[trait.key] || 3}</span>
                    </div>
                    <Slider
                      value={[traits[trait.key] || 3]}
                      onValueChange={(value) => setTraits({ ...traits, [trait.key]: value[0] })}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isLoading} size="lg">
                {isLoading ? "Profil wird erstellt..." : "Profil erstellen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

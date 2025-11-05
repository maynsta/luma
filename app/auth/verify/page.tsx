"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Heart } from "lucide-react"

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      })
      if (error) throw error

      // Check if user has a profile
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

        if (profile) {
          router.push("/discover")
        } else {
          router.push("/setup-profile")
        }
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ungültiger Code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/discover`,
        },
      })
      if (error) throw error
      setError("Neuer Code wurde gesendet!")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Fehler beim Senden")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
              <h1 className="text-3xl font-bold text-rose-600">Luma</h1>
            </div>
            <p className="text-balance text-muted-foreground">Finde deinen perfekten Match</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Code eingeben</CardTitle>
              <CardDescription>Gib den 6-stelligen Code aus deiner E-Mail ein</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyOTP}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} disabled className="bg-muted" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="code">Bestätigungscode</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={isLoading}>
                    {isLoading ? "Verifiziere..." : "Bestätigen"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    Code erneut senden
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}

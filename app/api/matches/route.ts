import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all matches for the current user
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (matchesError) {
      throw matchesError
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // Get profile details for each match
    const matchedUserIds = matches.map((match) => (match.user1_id === user.id ? match.user2_id : match.user1_id))

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*, hobbies(*), personality_traits(*)")
      .in("id", matchedUserIds)

    if (profilesError) {
      throw profilesError
    }

    // Combine match data with profile data
    const enrichedMatches = matches.map((match) => {
      const matchedUserId = match.user1_id === user.id ? match.user2_id : match.user1_id
      const profile = profiles?.find((p) => p.id === matchedUserId)

      return {
        matchId: match.id,
        matchedAt: match.created_at,
        profile,
      }
    })

    return NextResponse.json({ matches: enrichedMatches })
  } catch (error) {
    console.error("[v0] Matches error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

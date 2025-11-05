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

    // Get current user's profile with preferences
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*, hobbies(*), personality_traits(*)")
      .eq("id", user.id)
      .single()

    if (profileError || !currentProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get all profiles the user has already swiped on
    const { data: swipedProfiles } = await supabase.from("swipes").select("swiped_id").eq("swiper_id", user.id)

    const swipedIds = swipedProfiles?.map((s) => s.swiped_id) || []

    // Build query for potential matches
    let query = supabase.from("profiles").select("*, hobbies(*), personality_traits(*)").neq("id", user.id)

    // Filter by looking_for preference
    if (currentProfile.looking_for !== "everyone") {
      query = query.eq("gender", currentProfile.looking_for)
    }

    // Exclude already swiped profiles
    if (swipedIds.length > 0) {
      query = query.not("id", "in", `(${swipedIds.join(",")})`)
    }

    const { data: potentialMatches, error: matchesError } = await query.limit(50)

    if (matchesError) {
      throw matchesError
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return NextResponse.json({ profiles: [] })
    }

    // Calculate compatibility scores
    const currentHobbies = currentProfile.hobbies?.map((h: { hobby: string }) => h.hobby.toLowerCase()) || []
    const currentTraits = currentProfile.personality_traits || []

    const scoredProfiles = potentialMatches.map((profile) => {
      let score = 0

      // Score based on shared hobbies (up to 50 points)
      const profileHobbies = profile.hobbies?.map((h: { hobby: string }) => h.hobby.toLowerCase()) || []
      const sharedHobbies = currentHobbies.filter((h: string) => profileHobbies.includes(h))
      score += Math.min(sharedHobbies.length * 10, 50)

      // Score based on personality trait similarity (up to 50 points)
      const profileTraits = profile.personality_traits || []
      let traitScore = 0
      let traitCount = 0

      currentTraits.forEach((currentTrait: { trait: string; value: number }) => {
        const matchingTrait = profileTraits.find((pt: { trait: string }) => pt.trait === currentTrait.trait)
        if (matchingTrait) {
          // Calculate similarity (5 - difference)
          const difference = Math.abs(currentTrait.value - matchingTrait.value)
          traitScore += 5 - difference
          traitCount++
        }
      })

      if (traitCount > 0) {
        score += (traitScore / traitCount) * 10
      }

      return {
        ...profile,
        compatibilityScore: Math.round(score),
      }
    })

    // Sort by compatibility score (highest first)
    scoredProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

    return NextResponse.json({ profiles: scoredProfiles })
  } catch (error) {
    console.error("[v0] Discover error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

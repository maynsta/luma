import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
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

    const body = await request.json()
    const { swipedId, liked } = body

    if (!swipedId || typeof liked !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Insert swipe
    const { error: swipeError } = await supabase.from("swipes").insert({
      swiper_id: user.id,
      swiped_id: swipedId,
      liked,
    })

    if (swipeError) {
      throw swipeError
    }

    // Check if it's a match (the trigger will handle creating the match)
    if (liked) {
      const { data: mutualLike } = await supabase
        .from("swipes")
        .select("*")
        .eq("swiper_id", swipedId)
        .eq("swiped_id", user.id)
        .eq("liked", true)
        .single()

      if (mutualLike) {
        return NextResponse.json({ match: true })
      }
    }

    return NextResponse.json({ match: false })
  } catch (error) {
    console.error("[v0] Swipe error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

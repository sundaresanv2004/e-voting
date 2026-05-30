"use client"

import { useEffect } from "react"

export function ElectionTracker({ electionId }: { electionId: string }) {
  useEffect(() => {
    // Save the last viewed election ID to a cookie for 1 year
    document.cookie = `last_election_id=${electionId}; path=/; max-age=31536000; SameSite=Lax`
  }, [electionId])

  return null
}

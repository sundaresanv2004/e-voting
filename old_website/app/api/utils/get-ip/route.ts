import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(/, /)[0] : req.nextUrl.hostname || "127.0.0.1"
  
  return NextResponse.json({ ip })
}

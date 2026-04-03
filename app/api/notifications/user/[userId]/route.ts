import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    const res = await fetch(`${BACKEND_URL}/notifications/${userId}`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ notifications: [] })
  }
}

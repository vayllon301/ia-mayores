import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: { messages?: Array<{ role: string; content: string }>; access_token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const accessToken = body.access_token
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the JWT by calling Supabase auth.getUser(jwt)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const messages = body.messages ?? []

  const backendUrl = process.env.BACKEND_URL
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend not configured' }, { status: 500 })
  }

  // Await the FastAPI call — browser never reads this response (sendBeacon is fire-and-forget)
  await fetch(`${backendUrl}/memory/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id, messages }),
  }).catch((err) => {
    console.error('[memory/summarize] Failed to reach backend:', err)
  })

  return NextResponse.json({ status: 'accepted' }, { status: 202 })
}

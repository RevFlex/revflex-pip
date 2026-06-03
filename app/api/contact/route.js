import { NextResponse } from 'next/server'

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimit = new Map()
function isRateLimited(ip) {
  const now = Date.now()
  const window = 60 * 1000
  const max = 3
  const key = `contact:${ip}`
  const record = rateLimit.get(key) || { count: 0, start: now }
  if (now - record.start > window) {
    rateLimit.set(key, { count: 1, start: now })
    return false
  }
  if (record.count >= max) return true
  rateLimit.set(key, { count: record.count + 1, start: record.start })
  return false
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()

    // Honeypot check
    if (body._hp) {
      return NextResponse.json({ ok: true })
    }

    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const TO_EMAIL = process.env.INQUIRY_EMAIL || 'hello@revflex.co'

    if (!RESEND_API_KEY) {
      console.log('=== RevFlex Contact ===', { name, email, message })
      return NextResponse.json({ ok: true })
    }

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1D1A;">
        <div style="background: #1A1D1A; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <div style="color: #9A8A7A; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">Contact Form</div>
          <div style="color: #FAF8F4; font-size: 24px; font-weight: 300;">New message from ${name}</div>
        </div>
        <div style="background: #FAF8F4; padding: 28px 32px; border: 1px solid #E0D9CF; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 80px;">Name</td><td style="padding: 4px 0; font-size: 14px; font-weight: 500;">${name}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Email</td><td style="padding: 4px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #C27C4E;">${email}</a></td></tr>
          </table>
          <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;">Message</div>
          <div style="font-size: 15px; line-height: 1.7; color: #1A1D1A; white-space: pre-wrap;">${message}</div>
        </div>
        <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #B0A898;">
          RevFlex · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · IP: ${ip}
        </div>
      </div>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RevFlex <onboarding@resend.dev>',
        to: [TO_EMAIL],
        reply_to: email,
        subject: `RevFlex Contact — ${name}`,
        html,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

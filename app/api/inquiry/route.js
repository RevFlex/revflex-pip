import { NextResponse } from 'next/server'

// ─── Rate limiting (in-memory, resets on cold start) ─────────────────────────
const rateLimit = new Map()
function isRateLimited(ip) {
  const now = Date.now()
  const window = 60 * 1000 // 1 minute
  const max = 5 // max 5 submissions per minute per IP
  const key = `inquiry:${ip}`
  const record = rateLimit.get(key) || { count: 0, start: now }
  if (now - record.start > window) {
    rateLimit.set(key, { count: 1, start: now })
    return false
  }
  if (record.count >= max) return true
  rateLimit.set(key, { count: record.count + 1, start: record.start })
  return false
}

function fmt(n) {
  if (!n && n !== 0) return 'N/A'
  return '$' + Math.round(n).toLocaleString('en-US')
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()

    // Honeypot check — bots fill this in, humans don't
    if (body._hp) {
      return NextResponse.json({ ok: true }) // silent accept to fool bots
    }

    const {
      type, name, email, role,
      propertyName, website, rooms, adr, occupancy,
      projectCost, projectScope, timeline, estimate
    } = body

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const TO_EMAIL = process.env.INQUIRY_EMAIL || 'hello@revflex.co'

    if (!RESEND_API_KEY) {
      // Log to console if no Resend key yet (development mode)
      console.log('=== RevFlex Inquiry ===')
      console.log(JSON.stringify(body, null, 2))
      return NextResponse.json({ ok: true })
    }

    const isFullInquiry = type === 'full_inquiry'
    const subject = isFullInquiry
      ? `RevFlex Inquiry — ${propertyName || 'Property'} (${name || 'Unknown'})`
      : `RevFlex Calculator Lead — ${propertyName || 'Unknown Property'}`

    const scopeLabels = {
      soft: 'Soft Goods Refresh', ffe: 'Guestroom FF&E',
      'ffe-common': 'FF&E + Common Areas', bath: 'Bathroom + Hard Finish',
      full: 'Full Repositioning', pip: 'Brand PIP Compliance', other: 'Not Sure Yet'
    }
    const timelineLabels = {
      immediate: 'Immediately / Within 30 days', '1-3mo': '1–3 months',
      '3-6mo': '3–6 months', '6-12mo': '6–12 months', exploring: 'Just exploring'
    }

    const html = `
      <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1D1A;">
        <div style="background: #1A1D1A; padding: 24px 32px; border-radius: 12px 12px 0 0;">
          <div style="color: #9A8A7A; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">
            ${isFullInquiry ? 'Full Inquiry' : 'Calculator Lead (No Submission)'}
          </div>
          <div style="color: #FAF8F4; font-size: 28px; font-weight: 300;">
            ${estimate ? fmt(estimate.advance) : 'Estimate Run'}
          </div>
          ${estimate ? `<div style="color: #7A8A7A; font-size: 13px; margin-top: 4px;">${estimate.scopeLabel || ''}</div>` : ''}
        </div>

        <div style="background: #FAF8F4; padding: 28px 32px; border: 1px solid #E0D9CF; border-top: none; border-radius: 0 0 12px 12px;">

          ${isFullInquiry ? `
          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E8E4DE;">
            <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Contact</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Name</td><td style="padding: 4px 0; font-size: 14px; font-weight: 500;">${name || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Email</td><td style="padding: 4px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #C27C4E;">${email || '—'}</a></td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Role</td><td style="padding: 4px 0; font-size: 14px;">${role || 'Not specified'}</td></tr>
            </table>
          </div>` : ''}

          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E8E4DE;">
            <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Property</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Name</td><td style="padding: 4px 0; font-size: 14px;">${propertyName || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Website</td><td style="padding: 4px 0; font-size: 14px;"><a href="https://${website}" style="color: #C27C4E;">${website || '—'}</a></td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Rooms</td><td style="padding: 4px 0; font-size: 14px;">${rooms || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">ADR</td><td style="padding: 4px 0; font-size: 14px;">${adr ? '$' + adr : '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Occupancy</td><td style="padding: 4px 0; font-size: 14px;">${occupancy ? occupancy + '%' : '—'}</td></tr>
            </table>
          </div>

          <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E8E4DE;">
            <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Project</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Scope</td><td style="padding: 4px 0; font-size: 14px;">${scopeLabels[projectScope] || projectScope || '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Project Cost</td><td style="padding: 4px 0; font-size: 14px;">${projectCost ? '$' + Number(projectCost).toLocaleString() : '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Timeline</td><td style="padding: 4px 0; font-size: 14px;">${timelineLabels[timeline] || timeline || 'Not specified'}</td></tr>
            </table>
          </div>

          ${estimate ? `
          <div>
            <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Estimate Output</div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Financing</td><td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #C27C4E;">${fmt(estimate.advance)}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Repayment Cap</td><td style="padding: 4px 0; font-size: 14px;">${fmt(estimate.totalRepayment)} (${estimate.capMultiple}×)</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Payback Period</td><td style="padding: 4px 0; font-size: 14px;">${estimate.paybackYrsBase}–${estimate.paybackYrsConservative} yrs</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Revenue Share</td><td style="padding: 4px 0; font-size: 14px;">${estimate.shareRate ? (estimate.shareRate * 100).toFixed(1) + '%' : '—'}</td></tr>
              <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Added Revenue</td><td style="padding: 4px 0; font-size: 14px;">${fmt(estimate.addlRevenueConservative)} – ${fmt(estimate.addlRevenueBase)}</td></tr>
            </table>
          </div>` : ''}

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
        from: 'RevFlex <inquiries@revflex.co>',
        to: [TO_EMAIL],
        subject,
        html,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Inquiry error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const INQUIRY_EMAIL = process.env.INQUIRY_EMAIL
const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL

// ── Rate limiting (in-memory, resets on cold start) ───────────────────────────
const rateLimitMap = new Map()
function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const maxRequests = 5
  const entry = rateLimitMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > windowMs) {
    rateLimitMap.set(ip, { count: 1, start: now })
    return false
  }
  if (entry.count >= maxRequests) return true
  entry.count++
  rateLimitMap.set(ip, entry)
  return false
}

// ── Scope label helper ────────────────────────────────────────────────────────
function scopeLabel(scope) {
  const map = {
    soft: 'Soft Goods Refresh',
    ffe: 'Guestroom FF&E',
    'ffe-common': 'FF&E + Common Areas',
    bath: 'Bathroom + Hard Finish',
    full: 'Full Repositioning',
    pip: 'Brand PIP Compliance',
    other: 'Not Sure Yet',
  }
  return map[scope] || scope || '—'
}

function fmt(n) {
  if (!n && n !== 0) return '—'
  return '$' + Math.round(n).toLocaleString('en-US')
}
function pctFmt(n) {
  if (!n && n !== 0) return '—'
  return (n * 100).toFixed(1) + '%'
}

// ── Post to Google Sheet (non-blocking) ──────────────────────────────────────
async function postToSheet(data) {
  if (!SHEET_WEBHOOK_URL) return
  try {
    await fetch(SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
      redirect: 'follow',
    })
  } catch (err) {
    console.error('Sheet webhook error:', err)
    // Non-fatal — don't block email delivery
  }
}

// ── Email: Full Inquiry ───────────────────────────────────────────────────────
function buildFullInquiryEmail(data) {
  const { name, email, role, propertyName, website, rooms, adr, occupancy,
          projectScope, projectCost, timeline, estimate } = data
  const ip = data.ip || '—'

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1D1A;">
      <div style="background: #1A1D1A; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <div style="color: #9A8A7A; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">Full Inquiry</div>
        <div style="color: #FAF8F4; font-size: 28px; font-weight: 300;">${fmt(estimate?.advance)}</div>
        <div style="color: #7A8A7A; font-size: 13px; margin-top: 4px;">${scopeLabel(projectScope)}</div>
      </div>
      <div style="background: #FAF8F4; padding: 28px 32px; border: 1px solid #E0D9CF; border-top: none; border-radius: 0 0 12px 12px;">

        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E8E4DE;">
          <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Contact</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Name</td><td style="padding: 4px 0; font-size: 14px; font-weight: 600;">${name || '—'}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Email</td><td style="padding: 4px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #C27C4E;">${email || '—'}</a></td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Role</td><td style="padding: 4px 0; font-size: 14px;">${role || '—'}</td></tr>
          </table>
        </div>

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
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Scope</td><td style="padding: 4px 0; font-size: 14px;">${scopeLabel(projectScope)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Project Cost</td><td style="padding: 4px 0; font-size: 14px;">${projectCost ? '$' + Number(projectCost).toLocaleString() : '—'}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Timeline</td><td style="padding: 4px 0; font-size: 14px;">${timeline || '—'}</td></tr>
          </table>
        </div>

        <div>
          <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Estimate Output</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Financing</td><td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #C27C4E;">${fmt(estimate?.advance)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Total Repayment</td><td style="padding: 4px 0; font-size: 14px;">${fmt(estimate?.totalRepayment)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Payback Period</td><td style="padding: 4px 0; font-size: 14px;">${estimate?.paybackYrsBase || '—'}–${estimate?.paybackYrsConservative || '—'} yrs</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Revenue Share</td><td style="padding: 4px 0; font-size: 14px;">${pctFmt(estimate?.shareRate)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Added Revenue</td><td style="padding: 4px 0; font-size: 14px;">${fmt(estimate?.addlRevenueConservative)} – ${fmt(estimate?.addlRevenueBase)}</td></tr>
          </table>
        </div>

      </div>
      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #B0A898;">
        RevFlex · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · IP: ${ip}
      </div>
    </div>
  `
}

// ── Email: Calculator Only (partial lead) ─────────────────────────────────────
function buildCalculatorOnlyEmail(data) {
  const { propertyName, website, rooms, adr, occupancy,
          projectScope, projectCost, timeline, estimate } = data
  const ip = data.ip || '—'

  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1D1A;">
      <div style="background: #1A1D1A; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <div style="color: #9A8A7A; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px;">Calculator Lead (No Submission)</div>
        <div style="color: #FAF8F4; font-size: 28px; font-weight: 300;">${fmt(estimate?.advance)}</div>
        <div style="color: #7A8A7A; font-size: 13px; margin-top: 4px;">${scopeLabel(projectScope)}</div>
      </div>
      <div style="background: #FAF8F4; padding: 28px 32px; border: 1px solid #E0D9CF; border-top: none; border-radius: 0 0 12px 12px;">

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
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Scope</td><td style="padding: 4px 0; font-size: 14px;">${scopeLabel(projectScope)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Project Cost</td><td style="padding: 4px 0; font-size: 14px;">${projectCost ? '$' + Number(projectCost).toLocaleString() : '—'}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Timeline</td><td style="padding: 4px 0; font-size: 14px;">${timeline || '—'}</td></tr>
          </table>
        </div>

        <div>
          <div style="font-size: 11px; color: #9A8A7A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;">Estimate Output</div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px; width: 140px;">Financing</td><td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #C27C4E;">${fmt(estimate?.advance)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Total Repayment</td><td style="padding: 4px 0; font-size: 14px;">${fmt(estimate?.totalRepayment)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Payback Period</td><td style="padding: 4px 0; font-size: 14px;">${estimate?.paybackYrsBase || '—'}–${estimate?.paybackYrsConservative || '—'} yrs</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Revenue Share</td><td style="padding: 4px 0; font-size: 14px;">${pctFmt(estimate?.shareRate)}</td></tr>
            <tr><td style="padding: 4px 0; color: #7A6A5A; font-size: 13px;">Added Revenue</td><td style="padding: 4px 0; font-size: 14px;">${fmt(estimate?.addlRevenueConservative)} – ${fmt(estimate?.addlRevenueBase)}</td></tr>
          </table>
        </div>

      </div>
      <div style="text-align: center; margin-top: 16px; font-size: 11px; color: #B0A898;">
        RevFlex · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · IP: ${ip}
      </div>
    </div>
  `
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'

    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429, headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()

    // Honeypot check
    if (body._hp) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }

    const data = { ...body, ip }
    const isFullInquiry = body.type === 'full_inquiry'

    // ── 1. Send to Google Sheet (both types) ─────────────────────────────────
    await postToSheet(data)

    // ── 2. Send notification email to RevFlex inbox ──────────────────────────
    const emailHtml = isFullInquiry
      ? buildFullInquiryEmail(data)
      : buildCalculatorOnlyEmail(data)

    const propertyLabel = body.propertyName || 'Unknown Property'
    const subject = isFullInquiry
      ? `RevFlex Inquiry — ${propertyLabel} (${body.name || 'No name'})`
      : `RevFlex Calculator Lead — ${propertyLabel}`

    await resend.emails.send({
      from: 'RevFlex <onboarding@resend.dev>',
      to: [INQUIRY_EMAIL],
      subject,
      html: emailHtml,
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Inquiry route error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}

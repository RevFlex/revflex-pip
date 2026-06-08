'use client'

import { useState, useEffect, useRef } from 'react'

function fmt(n) {
  return '$' + Math.round(n).toLocaleString('en-US')
}
function pct(n) {
  return (n * 100).toFixed(1) + '%'
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '11px 14px', fontSize: '15px',
  border: '1px solid #D0C9C0', borderRadius: '7px',
  background: '#FAF8F4', color: '#1A1D1A', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#7A6A5A', marginBottom: '6px',
}
const selectStyle = {
  ...inputStyle, appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A6A5A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px',
}

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1200, prefix = '$', suffix = '') {
  const [display, setDisplay] = useState(prefix + '0' + suffix)
  useEffect(() => {
    if (!target && target !== 0) return
    if (typeof window === 'undefined') return
    const start = Date.now()
    const end = typeof target === 'number' ? target : parseFloat(target)
    let raf
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(end * ease)
      setDisplay(prefix + current.toLocaleString('en-US') + suffix)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return display
}

function AnimatedAmount({ value }) {
  const display = useCountUp(value, 1400, '$')
  return <span>{display}</span>
}

// ── Validation helpers ────────────────────────────────────────────────────────
function cleanWebsite(val) {
  return val.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '')
}
function isValidWebsite(val) {
  const cleaned = cleanWebsite(val)
  return /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}/.test(cleaned)
}
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim())
}

export default function Calculator() {
  const [form, setForm] = useState({
    propertyName: '', website: '', rooms: '', adr: '',
    occupancy: '', projectScope: '', projectCost: '',
    timeline: '', name: '', email: '', role: '',
    _hp: '', // honeypot — hidden from humans
  })
  const [submitted, setSubmitted] = useState(false)
  const [inquirySent, setInquirySent] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [inquiryLoading, setInquiryLoading] = useState(false)

  // ── Partial lead refs ─────────────────────────────────────────────────────
  // partialRef holds calculator data in memory after estimate runs.
  // fullSentRef flips to true if user completes the full inquiry form.
  // On tab/browser close, we send the partial ONLY if full was never sent.
  const partialRef = useRef(null)
  const fullSentRef = useRef(false)

  // ── Send partial lead on tab/browser close ────────────────────────────────
  useEffect(() => {
    const handleUnload = () => {
      if (partialRef.current && !fullSentRef.current) {
        const payload = JSON.stringify(partialRef.current)
        navigator.sendBeacon('/api/inquiry', new Blob([payload], { type: 'application/json' }))
      }
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validateCalc() {
    const e = {}
    if (!form.rooms || Number(form.rooms) < 1) e.rooms = 'Required'
    if (!form.adr || Number(form.adr) < 1) e.adr = 'Required'
    if (!form.occupancy) e.occupancy = 'Required'
    else if (Number(form.occupancy) < 1 || Number(form.occupancy) > 100) e.occupancy = 'Enter 1–100'
    if (!form.projectCost || Number(form.projectCost) < 1) e.projectCost = 'Required'
    if (!form.projectScope) e.projectScope = 'Required'
    if (!form.website.trim()) e.website = 'Required'
    else if (!isValidWebsite(form.website)) e.website = 'Enter a valid website (e.g. meadowbrookinn.com)'
    return e
  }

  function validateInquiry() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email address'
    return e
  }

  async function handleSubmit() {
    const e = validateCalc()
    if (Object.keys(e).length) { setErrors(e); return }
    if (form._hp) return // honeypot triggered — silently reject
    setLoading(true)
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rooms: form.rooms,
          adr: form.adr,
          occupancy: form.occupancy,
          projectCost: form.projectCost,
          projectScope: form.projectScope,
        }),
      })
      if (!response.ok) throw new Error('Estimate failed')
      const est = await response.json()
      setResult(est)
      setSubmitted(true)

      // ── Scroll to estimate card after results render ──
      setTimeout(() => {
        const el = document.getElementById('estimate')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)

      // ── Store partial lead in memory only — do NOT send yet ──
      // Will be sent via sendBeacon on tab close, but only if
      // the user never completes the full inquiry form.
      partialRef.current = {
        type: 'calculator_only',
        propertyName: form.propertyName,
        website: cleanWebsite(form.website),
        rooms: form.rooms,
        adr: form.adr,
        occupancy: form.occupancy,
        projectCost: form.projectCost,
        projectScope: form.projectScope,
        timeline: form.timeline,
        estimate: est,
        _hp: form._hp,
      }

    } catch (err) {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleInquiry() {
    const e = validateInquiry()
    if (Object.keys(e).length) { setErrors(e); return }
    if (form._hp) return // honeypot
    setInquiryLoading(true)
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'full_inquiry',
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          propertyName: form.propertyName,
          website: cleanWebsite(form.website),
          rooms: form.rooms,
          adr: form.adr,
          occupancy: form.occupancy,
          projectCost: form.projectCost,
          projectScope: form.projectScope,
          timeline: form.timeline,
          estimate: result,
          _hp: form._hp,
        }),
      })
      if (!response.ok) throw new Error('Submission failed')

      // ── Mark full inquiry as sent — suppresses partial on tab close ──
      fullSentRef.current = true

      setInquirySent(true)
      setTimeout(() => {
        const el = document.getElementById('estimate')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    } catch (err) {
      setErrors({ inquiry: 'Something went wrong. Please try again.' })
    } finally {
      setInquiryLoading(false)
    }
  }

  function reset() {
    setSubmitted(false)
    setInquirySent(false)
    setResult(null)
    setErrors({})
    partialRef.current = null
    fullSentRef.current = false
    setForm({ propertyName: '', website: '', rooms: '', adr: '', occupancy: '', projectScope: '', projectCost: '', timeline: '', name: '', email: '', role: '', _hp: '' })
  }

  // ── Success view ─────────────────────────────────────────────────────────
  if (inquirySent) {
    return (
      <div id="estimate">
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>Estimate</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: '400', lineHeight: '1.25', color: '#1A1D1A', marginBottom: '12px' }}>
            You&apos;re on the list.
          </h2>
          <p style={{ fontSize: '15px', color: '#5A5E5A', lineHeight: '1.7' }}>
            We&apos;ve received your inquiry for {form.propertyName || 'your property'}. We&apos;ll be in touch as we select our founding properties.
          </p>
        </div>
        <div style={{ background: '#FAF8F4', borderRadius: '16px', border: '1px solid #E0D9CF', padding: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F0EBE3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1A1D1A' }}>Request received</div>
              <div style={{ fontSize: '13px', color: '#7A6A5A', marginTop: '2px' }}>Estimated financing: {fmt(result.advance)} — {result.scopeLabel}</div>
            </div>
          </div>
          <button onClick={reset} style={{ fontSize: '13px', color: '#C27C4E', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
            Run another estimate →
          </button>
        </div>
      </div>
    )
  }

  // ── Result view ─────────────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div id="estimate">
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>Estimate</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: '400', lineHeight: '1.25', color: '#1A1D1A', marginBottom: '12px' }}>
            {form.propertyName ? `Here's your estimate, ${form.propertyName}.` : "Here's your estimate."}
          </h2>
          <p style={{ fontSize: '15px', color: '#5A5E5A', lineHeight: '1.7' }}>
            Ready to continue? Enter your details below to request early access — we&apos;ll be in touch as we select our founding properties.
          </p>
        </div>

        <div style={{ background: '#FAF8F4', borderRadius: '16px', border: '1px solid #E0D9CF', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: '#1A1D1A', padding: '32px 36px' }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '6px', fontWeight: '600' }}>Your Illustrative Estimate</div>
            <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '42px', fontWeight: '400', color: '#FAF8F4', lineHeight: '1' }}>
              <AnimatedAmount value={result.advance} />
            </div>
            <div style={{ fontSize: '14px', color: '#7A8A7A', marginTop: '8px' }}>
              Estimated RevFlex financing — {result.scopeLabel}
            </div>
          </div>

          {/* 3 stat cards */}
          <style>{`@media (max-width: 600px) { .stat-grid { grid-template-columns: 1fr !important; } }`}</style>
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#E0D9CF' }}>
            <div style={{ background: '#FAF8F4', padding: '20px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', color: '#9A8A7A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Total Repayment</div>
              <div style={{ minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: '500', color: '#1A1D1A' }}><AnimatedAmount value={result.totalRepayment} /></div>
              </div>
              <div style={{ fontSize: '12px', color: '#B0A898', marginTop: '8px' }}>Your funding amount plus one fixed fee</div>
            </div>
            <div style={{ background: '#FAF8F4', padding: '20px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', color: '#9A8A7A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Est. Payback Period</div>
              <div style={{ minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: '500', color: '#1A1D1A' }}>{result.paybackYrsBase}–{result.paybackYrsConservative} yrs</div>
              </div>
              <div style={{ fontSize: '12px', color: '#B0A898', marginTop: '8px' }}>At {pct(result.shareRate)} gross revenue share</div>
            </div>
            <div style={{ background: '#FAF8F4', padding: '20px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', color: '#9A8A7A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Est. Added Annual Revenue</div>
              <div style={{ minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: '500', color: '#1A1D1A', lineHeight: '1.6', textAlign: 'center' }}>
                  {fmt(result.addlRevenueConservative)}<br />{fmt(result.addlRevenueBase)}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#B0A898', marginTop: '8px' }}>{result.liftRangeLow}–{result.liftRangeHigh}% revenue lift range</div>
            </div>
          </div>

          {/* Inquiry form */}
          <div style={{ padding: '28px 36px' }}>
            <p style={{ fontSize: '13px', color: '#9A8A7A', lineHeight: '1.7', marginBottom: '24px', fontStyle: 'italic' }}>
              This is an illustrative estimate based on the inputs you provided — not a financing offer or approval. Your actual funding amount, revenue share, and total repayment obligation will be determined through full underwriting and property review. Revenue figures shown are benchmark-based estimates and are not guaranteed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input style={{ ...inputStyle, borderColor: errors.name ? '#C0392B' : '#D0C9C0' }}
                  placeholder="Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.name}</div>}
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={{ ...inputStyle, borderColor: errors.email ? '#C0392B' : '#D0C9C0' }}
                  type="email" placeholder="jane@meadowbrookinn.com" value={form.email} onChange={e => set('email', e.target.value)} />
                {errors.email && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.email}</div>}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>I Am A…</label>
                <select style={selectStyle} value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="">Select your role…</option>
                  <option value="owner">Hotel owner</option>
                  <option value="operator">Operator / management company</option>
                  <option value="developer">Developer</option>
                  <option value="broker">Broker / advisor</option>
                  <option value="capital">Capital partner</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Honeypot — hidden from humans, bots fill this in */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
              <input tabIndex="-1" value={form._hp} onChange={e => set('_hp', e.target.value)} autoComplete="off" />
            </div>

            {errors.inquiry && <div style={{ fontSize: '13px', color: '#C0392B', marginBottom: '16px' }}>{errors.inquiry}</div>}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleInquiry} disabled={inquiryLoading} style={{
                background: inquiryLoading ? '#D4956E' : '#C27C4E', color: '#fff',
                fontSize: '14px', fontWeight: '500', padding: '12px 24px',
                borderRadius: '7px', border: 'none', cursor: inquiryLoading ? 'wait' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s ease'
              }}>
                {inquiryLoading ? 'Submitting…' : 'Request Early Access →'}
              </button>
              <button onClick={reset} style={{
                background: 'transparent', color: '#7A6A5A', fontSize: '14px',
                padding: '12px 20px', border: '1px solid #D0C9C0', borderRadius: '7px', cursor: 'pointer'
              }}>
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Form view ────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>Estimate</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: '400', lineHeight: '1.25', color: '#1A1D1A', marginBottom: '12px' }}>
          Start with a simple estimate.
        </h2>
        <p style={{ fontSize: '15px', color: '#5A5E5A', lineHeight: '1.7' }}>
          Just a few inputs to see your available RevFlex financing amount. This is not a commitment or approval — only an initial estimate.
        </p>
      </div>

      <div style={{ background: '#FAF8F4', borderRadius: '16px', border: '1px solid #E0D9CF', padding: 'clamp(24px, 5vw, 40px) clamp(20px, 5vw, 36px)' }}>
        <style>{`@media (max-width: 520px) { .calc-grid { grid-template-columns: 1fr !important; } }`}</style>
        <div className="calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Property Name</label>
            <input style={inputStyle} placeholder="The Meadowbrook Inn" value={form.propertyName} onChange={e => set('propertyName', e.target.value)} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Property Website *</label>
            <input style={{ ...inputStyle, borderColor: errors.website ? '#C0392B' : '#D0C9C0' }}
              placeholder="meadowbrookinn.com" value={form.website} onChange={e => set('website', e.target.value)} />
            {errors.website && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.website}</div>}
            <div style={{ fontSize: '11px', color: '#B0A898', marginTop: '4px' }}>Enables property pre-research before your inquiry</div>
          </div>

          <div>
            <label style={labelStyle}>Number of Rooms *</label>
            <input style={{ ...inputStyle, borderColor: errors.rooms ? '#C0392B' : '#D0C9C0' }}
              type="number" min="1" placeholder="24" value={form.rooms} onChange={e => set('rooms', e.target.value)} />
            {errors.rooms && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.rooms}</div>}
          </div>

          <div>
            <label style={labelStyle}>Current ADR ($) *</label>
            <input style={{ ...inputStyle, borderColor: errors.adr ? '#C0392B' : '#D0C9C0' }}
              type="number" min="1" placeholder="189" value={form.adr} onChange={e => set('adr', e.target.value)} />
            {errors.adr && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.adr}</div>}
            <div style={{ fontSize: '11px', color: '#B0A898', marginTop: '4px' }}>Approximate figures are fine</div>
          </div>

          <div>
            <label style={labelStyle}>Average Occupancy (%) *</label>
            <input style={{ ...inputStyle, borderColor: errors.occupancy ? '#C0392B' : '#D0C9C0' }}
              type="number" min="1" max="100" placeholder="62" value={form.occupancy} onChange={e => set('occupancy', e.target.value)} />
            {errors.occupancy && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.occupancy}</div>}
          </div>

          <div>
            <label style={labelStyle}>Estimated Project Cost ($) *</label>
            <input style={{ ...inputStyle, borderColor: errors.projectCost ? '#C0392B' : '#D0C9C0' }}
              type="number" min="1" placeholder="175000" value={form.projectCost} onChange={e => set('projectCost', e.target.value)} />
            {errors.projectCost && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.projectCost}</div>}
            <div style={{ fontSize: '11px', color: '#B0A898', marginTop: '4px' }}>A rough estimate is fine</div>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>What Are You Improving? *</label>
            <select style={{ ...selectStyle, borderColor: errors.projectScope ? '#C0392B' : '#D0C9C0' }}
              value={form.projectScope} onChange={e => set('projectScope', e.target.value)}>
              <option value="">Select project scope…</option>
              <option value="soft">Soft Goods Refresh</option>
              <option value="ffe">Guestroom FF&E</option>
              <option value="ffe-common">FF&E + Common Areas</option>
              <option value="bath">Bathroom + Hard Finish</option>
              <option value="full">Full Repositioning</option>
              <option value="pip">Brand PIP Compliance</option>
              <option value="other">Not Sure Yet</option>
            </select>
            {errors.projectScope && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.projectScope}</div>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>When Are You Looking to Start?</label>
            <select style={selectStyle} value={form.timeline} onChange={e => set('timeline', e.target.value)}>
              <option value="">Select a timeframe…</option>
              <option value="immediate">Immediately / Within 30 days</option>
              <option value="1-3mo">1–3 months</option>
              <option value="3-6mo">3–6 months</option>
              <option value="6-12mo">6–12 months</option>
              <option value="exploring">Just exploring for now</option>
            </select>
          </div>

          {/* Honeypot — invisible to humans */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <input tabIndex="-1" value={form._hp} onChange={e => set('_hp', e.target.value)} autoComplete="off" />
          </div>

        </div>

        {errors.submit && <div style={{ fontSize: '13px', color: '#C0392B', marginTop: '16px', textAlign: 'center' }}>{errors.submit}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', marginTop: '28px',
          background: loading ? '#D4956E' : '#C27C4E', color: '#fff',
          fontSize: '15px', fontWeight: '500', padding: '14px', borderRadius: '7px',
          border: 'none', cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em', transition: 'background 0.2s ease'
        }}>
          {loading ? 'Calculating…' : 'Estimate My RevFlex Financing →'}
        </button>

        <p style={{ fontSize: '12px', color: '#B0A898', textAlign: 'center', marginTop: '14px', lineHeight: '1.6' }}>
          Not a commitment or approval. Only an initial estimate based on the inputs you provide.
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'

// ─── Model constants (from RevFlex Underwriting Framework v1.5) ────────────
// Share rates by deal tier
const TIERS = [
  { min: 100000,  max: 500000,  shareRate: 0.07, termCap: 8  },
  { min: 500001,  max: 1000000, shareRate: 0.075, termCap: 10 },
  { min: 1000001, max: 2000000, shareRate: 0.08, termCap: 12 },
  { min: 2000001, max: 3000000, shareRate: 0.085, termCap: 15 },
]

// Cap multiple + RevPAR lift range by scope (low, high)
const SCOPES = {
  soft:       { cap: 1.70, liftLow: 0.05, liftHigh: 0.12, label: 'Soft Goods Refresh' },
  ffe:        { cap: 1.78, liftLow: 0.12, liftHigh: 0.22, label: 'FF&E Targeted' },
  'ffe-common': { cap: 1.83, liftLow: 0.18, liftHigh: 0.30, label: 'FF&E + Common Areas' },
  bath:       { cap: 1.83, liftLow: 0.18, liftHigh: 0.30, label: 'Bathroom + Hard Finish' },
  full:       { cap: 1.88, liftLow: 0.30, liftHigh: 0.50, label: 'Full Repositioning' },
  pip:        { cap: 1.78, liftLow: 0.12, liftHigh: 0.22, label: 'Brand PIP Compliance' },
  other:      { cap: 1.75, liftLow: 0.10, liftHigh: 0.20, label: 'General Improvement' },
}

function getTier(advance) {
  return TIERS.find(t => advance >= t.min && advance <= t.max) || TIERS[TIERS.length - 1]
}

function calcEstimate({ rooms, adr, occupancy, projectCost, projectScope }) {
  const r = Number(rooms)
  const a = Number(adr)
  const o = Number(occupancy) / 100
  const p = Number(projectCost)

  if (!r || !a || !o || !p) return null

  // Current annual gross room revenue
  const annualRevenue = r * a * 365 * o

  // Advance = project cost — no cap, operator enters what they need
  const advance = Math.max(25000, p)

  // Get tier-based share rate and term cap
  const tier = getTier(advance)
  const shareRate = tier.shareRate
  const termCapYears = tier.termCap

  // Get scope-based cap multiple and lift range
  const scope = SCOPES[projectScope] || SCOPES['ffe']
  const capMultiple = scope.cap
  const totalRepayment = Math.round(advance * capMultiple)

  // Post-PIP revenue — conservative (low lift) and base (midpoint lift)
  const midLift = (scope.liftLow + scope.liftHigh) / 2
  const postPIPRevenueConservative = annualRevenue * (1 + scope.liftLow)
  const postPIPRevenueBase = annualRevenue * (1 + midLift)

  // Annual repayment = post-PIP revenue × share rate
  const annualRepaymentConservative = postPIPRevenueConservative * shareRate
  const annualRepaymentBase = postPIPRevenueBase * shareRate

  // Payback = total repayment cap ÷ annual repayment
  const paybackYrsConservative = totalRepayment / annualRepaymentConservative
  const paybackYrsBase = totalRepayment / annualRepaymentBase

  // Additional annual revenue
  const addlRevenueConservative = Math.round(postPIPRevenueConservative - annualRevenue)
  const addlRevenueBase = Math.round(postPIPRevenueBase - annualRevenue)

  return {
    advance,
    totalRepayment,
    capMultiple,
    shareRate,
    termCapYears,
    paybackYrsBase: Math.round(paybackYrsBase * 10) / 10,
    paybackYrsConservative: Math.round(paybackYrsConservative * 10) / 10,
    annualRevenue: Math.round(annualRevenue),
    addlRevenueConservative,
    addlRevenueBase,
    scopeLabel: scope.label,
    liftRangeLow: Math.round(scope.liftLow * 100),
    liftRangeHigh: Math.round(scope.liftHigh * 100),
  }
}

function fmt(n) {
  return '$' + Math.round(n).toLocaleString('en-US')
}
function pct(n) {
  return (n * 100).toFixed(1) + '%'
}

// ─── Styles ─────────────────────────────────────────────────────────────────
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


// ── Animated result header ────────────────────────────────────────────────────
function AnimatedAmount({ value }) {
  const display = useCountUp(value, 1400, '$')
  return <span>{display}</span>
}

function AnimatedStat({ value, prefix = '', suffix = '' }) {
  const display = useCountUp(value, 1000, prefix, suffix)
  return <span>{display}</span>
}


export default function Calculator() {
  const [form, setForm] = useState({
    propertyName: '', name: '', email: '', rooms: '', adr: '',
    occupancy: '', projectScope: '', projectCost: '', timeline: '', role: '', website: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState({})

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.rooms) e.rooms = 'Required'
    if (!form.adr) e.adr = 'Required'
    if (!form.occupancy) e.occupancy = 'Required'
    else if (Number(form.occupancy) < 1 || Number(form.occupancy) > 100) e.occupancy = 'Enter 1–100'
    if (!form.projectCost) e.projectCost = 'Required'
    if (!form.projectScope) e.projectScope = 'Required'
    if (!form.website) e.website = 'Required'
    return e
  }

  function handleInquiry() {
    const e = {}
    if (!form.name) e.name = 'Required'
    if (!form.email) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (Object.keys(e).length) { setErrors(e); return }
    const subject = encodeURIComponent(`RevFlex Inquiry — ${form.propertyName || 'Property'}`)
    const body = encodeURIComponent(`Estimated advance: ${fmt(result.advance)}\nScope: ${result.scopeLabel}\nName: ${form.name}\nEmail: ${form.email}\nRole: ${form.role}\nProperty: ${form.propertyName}\nRooms: ${form.rooms}\nTimeline: ${form.timeline}\nWebsite: ${form.website}`)
    window.location.href = `mailto:hello@revflex.co?subject=${subject}&body=${body}`
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const est = calcEstimate({ ...form })
    setResult(est)
    setSubmitted(true)
  }

  // ── Result view ─────────────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div>
        {/* Reactive heading — post result */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>Estimate</div>
          <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: '400', lineHeight: '1.25', color: '#1A1D1A', marginBottom: '12px' }}>
            {form.propertyName ? `Here's your estimate, ${form.propertyName}.` : "Here's your estimate."}
          </h2>
          <p style={{ fontSize: '15px', color: '#5A5E5A', lineHeight: '1.7' }}>
            Ready to continue? Select your role below and request early access — we'll be in touch as we select our founding properties.
          </p>
        </div>
      <div style={{ background: '#FAF8F4', borderRadius: '16px', border: '1px solid #E0D9CF', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#1A1D1A', padding: '32px 36px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '6px', fontWeight: '600' }}>
            Your Illustrative Estimate
          </div>
          <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '42px', fontWeight: '400', color: '#FAF8F4', lineHeight: '1' }}>
            <AnimatedAmount value={result.advance} />
          </div>
          <div style={{ fontSize: '14px', color: '#7A8A7A', marginTop: '8px' }}>
            Estimated RevFlex financing capacity — {result.scopeLabel}
          </div>
        </div>

        {/* Key stats — 3 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#E0D9CF' }}>
          {/* Card 1 */}
          <div style={{ background: '#FAF8F4', padding: '20px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', color: '#9A8A7A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Total Repayment Cap</div>
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: '500', color: '#1A1D1A', lineHeight: '1' }}><AnimatedAmount value={result.totalRepayment} /></div>
            </div>
            <div style={{ fontSize: '12px', color: '#B0A898', marginTop: '8px' }}>Capped at {result.capMultiple}× of amount funded</div>
          </div>
          {/* Card 2 */}
          <div style={{ background: '#FAF8F4', padding: '20px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', color: '#9A8A7A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Est. Payback Period</div>
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: '500', color: '#1A1D1A', lineHeight: '1' }}>{result.paybackYrsBase}–{result.paybackYrsConservative} yrs</div>
            </div>
            <div style={{ fontSize: '12px', color: '#B0A898', marginTop: '8px' }}>At {pct(result.shareRate)} gross revenue share</div>
          </div>
          {/* Card 3 — two lines, same fixed height container */}
          <div style={{ background: '#FAF8F4', padding: '20px 22px', textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', color: '#9A8A7A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Est. Added Annual Revenue</div>
            <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: '500', color: '#1A1D1A', lineHeight: '1.6', textAlign: 'center' }}>
                {fmt(result.addlRevenueConservative)}<br />{fmt(result.addlRevenueBase)}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#B0A898', marginTop: '8px' }}>{result.liftRangeLow}–{result.liftRangeHigh}% revenue lift range</div>
          </div>
        </div>

        {/* Disclaimer + CTA */}
        <div style={{ padding: '28px 36px' }}>
          <p style={{ fontSize: '13px', color: '#9A8A7A', lineHeight: '1.7', marginBottom: '24px', fontStyle: 'italic' }}>
            Illustrative estimate only. Actual financing capacity, share rate, and repayment cap are subject to full underwriting, property review, and RevFlex approval. Revenue uplift projections are based on comparable market benchmarks and are not guaranteed.
          </p>
          {/* Post-result — name, email, role */}
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

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleInquiry}
              style={{
                background: '#C27C4E', color: '#fff', fontSize: '14px', fontWeight: '500',
                padding: '12px 24px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
              }}
            >
              Request Early Access →
            </button>
            <button
              onClick={() => { setSubmitted(false); setResult(null); setForm({ propertyName: '', name: '', email: '', rooms: '', adr: '', occupancy: '', projectScope: '', projectCost: '', timeline: '', role: '', website: '' }) }}
              style={{
                background: 'transparent', color: '#7A6A5A', fontSize: '14px',
                padding: '12px 20px', border: '1px solid #D0C9C0', borderRadius: '7px', cursor: 'pointer'
              }}
            >
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
      {/* Static heading — pre submit */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>Estimate</div>
        <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: '400', lineHeight: '1.25', color: '#1A1D1A', marginBottom: '12px' }}>
          Start with a simple estimate.
        </h2>
        <p style={{ fontSize: '15px', color: '#5A5E5A', lineHeight: '1.7' }}>
          Just a few inputs to see your available RevFlex financing amount. This is not a commitment or approval — only an initial estimate.
        </p>
      </div>
    <div style={{ background: '#FAF8F4', borderRadius: '16px', border: '1px solid #E0D9CF', padding: '40px 36px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Property Name</label>
          <input style={inputStyle} placeholder="The Meadowbrook Inn" value={form.propertyName} onChange={e => set('propertyName', e.target.value)} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Property Website *</label>
          <input style={{ ...inputStyle, borderColor: errors.website ? '#C0392B' : '#D0C9C0' }}
            placeholder="meadowbrookinn.com" value={form.website} onChange={e => set('website', e.target.value)} />
          {errors.website && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>Required — helps us pre-research your property</div>}
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



      </div>

      <button onClick={handleSubmit} style={{
        width: '100%', marginTop: '28px', background: '#C27C4E', color: '#fff',
        fontSize: '15px', fontWeight: '500', padding: '14px', borderRadius: '7px',
        border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.02em'
      }}>
        Estimate My RevFlex Financing →
      </button>

      <p style={{ fontSize: '12px', color: '#B0A898', textAlign: 'center', marginTop: '14px', lineHeight: '1.6' }}>
        Not a commitment or approval. Only an initial estimate based on the inputs you provide.
      </p>
    </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

// ─── Underwriting math ──────────────────────────────────────────────────────
// Annual gross room revenue = rooms × ADR × 365 × (occupancy/100)
// RevFlex capacity = MIN(project cost × 1.1, annual revenue × 0.35)
//   → floor: $25,000  |  ceiling: $500,000
// Repayment cap = capacity × 1.75
// Revenue share = 5%
// Illustrative payback months = (capacity × 1.75) / (annual revenue × 0.05 / 12)
// RevPAR uplift: conservative +12% post-renovation

function calcEstimate({ rooms, adr, occupancy, projectCost }) {
  const r = Number(rooms)
  const a = Number(adr)
  const o = Number(occupancy) / 100
  const p = Number(projectCost)

  if (!r || !a || !o || !p) return null

  const annualRevenue = r * a * 365 * o
  const rawCapacity = Math.min(p * 1.1, annualRevenue * 0.35)
  const capacity = Math.max(25000, Math.min(500000, rawCapacity))
  const cap = capacity * 1.75
  const monthlyRevShare = annualRevenue * 0.05 / 12
  const paybackMonths = Math.round(cap / monthlyRevShare)
  const currentRevPAR = a * o
  const upliftedRevPAR = currentRevPAR * 1.12
  const revparLift = upliftedRevPAR - currentRevPAR

  return {
    capacity: Math.round(capacity),
    cap: Math.round(cap),
    paybackMonths,
    annualRevenue: Math.round(annualRevenue),
    currentRevPAR: Math.round(currentRevPAR),
    revparLift: Math.round(revparLift),
  }
}

function fmt(n) {
  return '$' + n.toLocaleString('en-US')
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  fontSize: '15px',
  border: '1px solid #D0C9C0',
  borderRadius: '7px',
  background: '#FAF8F4',
  color: '#1A1D1A',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#7A6A5A',
  marginBottom: '6px',
}
const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237A6A5A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Calculator() {
  const [form, setForm] = useState({
    propertyName: '',
    location: '',
    rooms: '',
    adr: '',
    occupancy: '',
    projectScope: '',
    projectCost: '',
    role: '',
    website: '',
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
    if (!form.role) e.role = 'Required'
    return e
  }

  function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const est = calcEstimate({
      rooms: form.rooms,
      adr: form.adr,
      occupancy: form.occupancy,
      projectCost: form.projectCost,
    })
    setResult(est)
    setSubmitted(true)
  }

  // ── Result view ─────────────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div style={{
        background: '#FAF8F4', borderRadius: '16px',
        border: '1px solid #E0D9CF', overflow: 'hidden'
      }}>
        {/* Result header */}
        <div style={{
          background: '#1A1D1A', padding: '32px 36px'
        }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#9A8A7A', marginBottom: '6px', fontWeight: '600'
          }}>Your Illustrative Estimate</div>
          <div style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: '42px', fontWeight: '400', color: '#FAF8F4', lineHeight: '1'
          }}>
            {fmt(result.capacity)}
          </div>
          <div style={{ fontSize: '14px', color: '#7A8A7A', marginTop: '8px' }}>
            Estimated RevFlex financing capacity
          </div>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', background: '#E0D9CF'
        }}>
          {[
            { label: 'Repayment Cap', value: fmt(result.cap), sub: '1.75× advance' },
            { label: 'Est. Payback Period', value: `${result.paybackMonths} mo`, sub: 'At 5% gross revenue share' },
            { label: 'RevPAR Uplift Est.', value: `+${fmt(result.revparLift)}/night`, sub: '~12% conservative lift' },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              background: '#FAF8F4', padding: '20px 22px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#9A8A7A', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '20px', fontWeight: '500', color: '#1A1D1A', lineHeight: '1'
              }}>{value}</div>
              <div style={{ fontSize: '12px', color: '#B0A898', marginTop: '4px' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Disclaimer + CTA */}
        <div style={{ padding: '28px 36px' }}>
          <p style={{
            fontSize: '13px', color: '#9A8A7A', lineHeight: '1.7',
            marginBottom: '24px', fontStyle: 'italic'
          }}>
            This is an illustrative estimate only. Actual financing capacity is subject to full underwriting, property review, and RevFlex approval. Revenue uplift projections are based on comparable market data and not guaranteed.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={`mailto:hello@revflex.co?subject=RevFlex Inquiry — ${encodeURIComponent(form.propertyName || 'Property')}&body=Estimated capacity: ${fmt(result.capacity)}%0AProperty: ${form.propertyName}%0ALocation: ${form.location}%0ARooms: ${form.rooms}%0AWebsite: ${form.website}`}
              style={{
                background: '#C27C4E', color: '#fff',
                fontSize: '14px', fontWeight: '500',
                padding: '12px 24px', borderRadius: '7px', textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Continue My Inquiry →
            </a>
            <button
              onClick={() => { setSubmitted(false); setResult(null); setForm({ propertyName: '', location: '', rooms: '', adr: '', occupancy: '', projectScope: '', projectCost: '', role: '', website: '' }) }}
              style={{
                background: 'transparent', color: '#7A6A5A',
                fontSize: '14px', padding: '12px 20px',
                border: '1px solid #D0C9C0', borderRadius: '7px', cursor: 'pointer'
              }}
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form view ────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: '#FAF8F4', borderRadius: '16px',
      border: '1px solid #E0D9CF', padding: '40px 36px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Property name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Property Name</label>
          <input
            style={inputStyle}
            placeholder="The Meadowbrook Inn"
            value={form.propertyName}
            onChange={e => set('propertyName', e.target.value)}
          />
        </div>

        {/* Location */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Location / Market</label>
          <input
            style={inputStyle}
            placeholder="Asheville, NC"
            value={form.location}
            onChange={e => set('location', e.target.value)}
          />
        </div>

        {/* Rooms */}
        <div>
          <label style={labelStyle}>Number of Rooms *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.rooms ? '#C0392B' : '#D0C9C0' }}
            type="number" min="1" placeholder="24"
            value={form.rooms}
            onChange={e => set('rooms', e.target.value)}
          />
          {errors.rooms && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.rooms}</div>}
        </div>

        {/* ADR */}
        <div>
          <label style={labelStyle}>Current ADR ($) *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.adr ? '#C0392B' : '#D0C9C0' }}
            type="number" min="1" placeholder="189"
            value={form.adr}
            onChange={e => set('adr', e.target.value)}
          />
          {errors.adr && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.adr}</div>}
          <div style={{ fontSize: '11px', color: '#B0A898', marginTop: '4px' }}>Approximate figures are fine</div>
        </div>

        {/* Occupancy */}
        <div>
          <label style={labelStyle}>Average Occupancy (%) *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.occupancy ? '#C0392B' : '#D0C9C0' }}
            type="number" min="1" max="100" placeholder="62"
            value={form.occupancy}
            onChange={e => set('occupancy', e.target.value)}
          />
          {errors.occupancy && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.occupancy}</div>}
        </div>

        {/* Project cost */}
        <div>
          <label style={labelStyle}>Estimated Project Cost ($) *</label>
          <input
            style={{ ...inputStyle, borderColor: errors.projectCost ? '#C0392B' : '#D0C9C0' }}
            type="number" min="1" placeholder="175000"
            value={form.projectCost}
            onChange={e => set('projectCost', e.target.value)}
          />
          {errors.projectCost && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.projectCost}</div>}
          <div style={{ fontSize: '11px', color: '#B0A898', marginTop: '4px' }}>A rough estimate is fine</div>
        </div>

        {/* Project scope */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>What Are You Improving?</label>
          <select
            style={selectStyle}
            value={form.projectScope}
            onChange={e => set('projectScope', e.target.value)}
          >
            <option value="">Select project scope…</option>
            <option value="ffe">Guestroom FF&E refresh</option>
            <option value="soft">Soft goods refresh</option>
            <option value="ffe-common">FF&E + common areas</option>
            <option value="bath">Bathroom + hard-finish</option>
            <option value="full">Full repositioning</option>
            <option value="pip">Brand PIP compliance</option>
            <option value="other">Not sure yet</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <label style={labelStyle}>I Am A… *</label>
          <select
            style={{ ...selectStyle, borderColor: errors.role ? '#C0392B' : '#D0C9C0' }}
            value={form.role}
            onChange={e => set('role', e.target.value)}
          >
            <option value="">Select your role…</option>
            <option value="owner">Hotel owner</option>
            <option value="operator">Operator / management company</option>
            <option value="developer">Developer</option>
            <option value="broker">Broker / advisor</option>
            <option value="capital">Capital partner</option>
            <option value="other">Other</option>
          </select>
          {errors.role && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.role}</div>}
        </div>

        {/* Website */}
        <div>
          <label style={labelStyle}>Property Website</label>
          <input
            style={inputStyle}
            placeholder="meadowbrookinn.com"
            value={form.website}
            onChange={e => set('website', e.target.value)}
          />
        </div>

      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          marginTop: '28px',
          background: '#C27C4E', color: '#fff',
          fontSize: '15px', fontWeight: '500',
          padding: '14px', borderRadius: '7px',
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', letterSpacing: '0.02em'
        }}
      >
        Estimate My RevFlex Capacity →
      </button>

      <p style={{
        fontSize: '12px', color: '#B0A898', textAlign: 'center',
        marginTop: '14px', lineHeight: '1.6'
      }}>
        Not a commitment or approval. Only an initial estimate based on the inputs you provide.
      </p>
    </div>
  )
}

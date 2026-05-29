'use client';

import { useState, useRef } from 'react';

/* ── Underwriting engine ────────────────────────────── */
const SCOPES = {
  ffe:       { label: 'Guestroom FF&E refresh',     adr: [0.05, 0.085, 0.12], occ: [0.01, 0.02, 0.03] },
  soft:      { label: 'Soft goods refresh',          adr: [0.02, 0.035, 0.05], occ: [0.00, 0.005, 0.01] },
  mixed:     { label: 'FF&E + common areas',         adr: [0.10, 0.15, 0.20],  occ: [0.02, 0.04, 0.06] },
  bath:      { label: 'Bathroom + hard-finish',      adr: [0.10, 0.15, 0.20],  occ: [0.02, 0.04, 0.06] },
  full:      { label: 'Full repositioning',          adr: [0.20, 0.275, 0.35], occ: [0.04, 0.07, 0.10] },
  pip:       { label: 'Brand PIP compliance',        adr: [0.05, 0.085, 0.12], occ: [0.01, 0.02, 0.03] },
  unsure:    { label: 'Not sure yet',                adr: [0.05, 0.085, 0.12], occ: [0.01, 0.02, 0.03] },
};

const ROLES = [
  'Hotel owner',
  'Operator / management company',
  'Developer',
  'Broker / advisor',
  'Capital partner',
  'Other',
];

function revShareRate(cost) {
  if (cost < 150000) return 0.06;
  if (cost < 300000) return 0.065;
  return 0.07;
}

function calc(rooms, adr, occ, scope, cost) {
  const s = SCOPES[scope] || SCOPES.unsure;
  const rate = revShareRate(cost);
  const curRevPAR = adr * (occ / 100);
  const curAnnual = curRevPAR * rooms * 365;

  const scenarios = ['Conservative', 'Base', 'Optimistic'].map((label, i) => {
    const newADR = adr * (1 + s.adr[i]);
    const newOcc = Math.min(occ / 100 + s.occ[i], 0.98);
    const newRevPAR = newADR * newOcc;
    const uplift = newRevPAR - curRevPAR;
    const newAnnual = newRevPAR * rooms * 365;
    const share = newAnnual * rate;
    const obligation = cost * 1.75;
    const months = share > 0 ? Math.round((obligation / share) * 12) : 999;
    return { label, newRevPAR, uplift, pctADR: s.adr[i], months, obligation };
  });

  return {
    curRevPAR, curAnnual, scenarios, rate,
    fundLow: Math.round(cost * 0.85 / 1000) * 1000,
    fundHigh: Math.round(cost * 1.15 / 1000) * 1000,
  };
}

const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const pct = n => `${(n * 100).toFixed(1)}%`;

/* ── Component ──────────────────────────────────────── */
export default function Calculator() {
  const [rooms, setRooms]       = useState('');
  const [adr, setAdr]           = useState('');
  const [occ, setOcc]           = useState('');
  const [scope, setScope]       = useState('');
  const [cost, setCost]         = useState('');
  const [role, setRole]         = useState('');
  const [url, setUrl]           = useState('');
  const [market, setMarket]     = useState('');
  const [propName, setPropName] = useState('');
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [results, setResults]   = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const resultsRef = useRef(null);
  const ready = rooms && adr && occ && scope && cost && role;

  function handleCalc() {
    const r = calc(+rooms, +adr, +occ, scope, +cost);
    setResults(r);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      propName, url, market, rooms, adr, occ, scope, cost, role, name, email,
      results: results ? { fundLow: results.fundLow, fundHigh: results.fundHigh, baseRevPAR: results.scenarios[1]?.newRevPAR } : null,
      ts: new Date().toISOString(),
    };
    console.log('REVFLEX_LEAD:', JSON.stringify(payload, null, 2));
    setSubmitted(true);
  }

  return (
    <div>
      <div className="calc-wrap">
        {/* Property info */}
        <div className="calc-row">
          <label className="calc-label">Property name</label>
          <input className="calc-input" value={propName} onChange={e => setPropName(e.target.value)} placeholder="e.g., The Harborview Inn" />
        </div>

        <div className="calc-pair">
          <div className="calc-row">
            <label className="calc-label">Location / market</label>
            <input className="calc-input" value={market} onChange={e => setMarket(e.target.value)} placeholder="e.g., Asheville, NC" />
          </div>
          <div className="calc-row">
            <label className="calc-label">Number of rooms *</label>
            <input className="calc-input" type="number" value={rooms} onChange={e => setRooms(e.target.value)} placeholder="e.g., 42" />
          </div>
        </div>

        <hr className="calc-divider" />

        {/* Performance */}
        <div className="calc-pair">
          <div className="calc-row">
            <label className="calc-label">Current ADR ($) *</label>
            <input className="calc-input" type="number" value={adr} onChange={e => setAdr(e.target.value)} placeholder="e.g., 165" />
          </div>
          <div className="calc-row">
            <label className="calc-label">Average occupancy (%) *</label>
            <input className="calc-input" type="number" value={occ} onChange={e => setOcc(e.target.value)} placeholder="e.g., 68" />
          </div>
        </div>
        <p className="calc-hint">Approximate figures are fine at this stage.</p>

        <hr className="calc-divider" />

        {/* Project */}
        <div className="calc-row">
          <label className="calc-label">What are you improving? *</label>
          <select className="calc-input" value={scope} onChange={e => setScope(e.target.value)}>
            <option value="">Select project scope…</option>
            {Object.entries(SCOPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className="calc-row">
          <label className="calc-label">Estimated project cost ($) *</label>
          <input className="calc-input" type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g., 250000" />
          <p className="calc-hint">A rough estimate is fine. We will refine during review.</p>
        </div>

        <hr className="calc-divider" />

        {/* Discovery */}
        <div className="calc-row">
          <label className="calc-label">I am a… *</label>
          <select className="calc-input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="">Select your role…</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="calc-row">
          <label className="calc-label">Property website</label>
          <input className="calc-input" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://yourhotel.com" />
        </div>

        <button
          className={`btn ${ready ? 'btn-primary' : 'btn-outline'}`}
          onClick={handleCalc}
          disabled={!ready}
          style={{ width: '100%', marginTop: 8, opacity: ready ? 1 : 0.5, cursor: ready ? 'pointer' : 'not-allowed' }}
        >
          Estimate Your RevFlex Capacity
        </button>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      {results && (
        <div className="results" ref={resultsRef}>
          <p className="eyebrow" style={{ marginBottom: 24 }}>Illustrative Estimate</p>

          {/* Funding range */}
          <div className="result-card">
            <p className="eyebrow">Estimated Funding Range</p>
            <p className="result-value" style={{ marginTop: 8 }}>
              {fmt(results.fundLow)} – {fmt(results.fundHigh)}
            </p>
            <p className="result-label">Based on {fmt(+cost)} estimated project cost</p>
          </div>

          {/* RevPAR scenarios */}
          <div className="result-card">
            <p className="eyebrow">Illustrative RevPAR Improvement</p>
            <div className="result-scenarios">
              {results.scenarios.map((s, i) => (
                <div className="scenario" key={i}>
                  <p className="scenario-label">{s.label}</p>
                  <p className="scenario-value">{fmt(s.newRevPAR)}</p>
                  <p className="scenario-delta">+{fmt(s.uplift)} ({pct(s.pctADR)} ADR)</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
              Current RevPAR: {fmt(results.curRevPAR)} · Annual room revenue: {fmt(results.curAnnual)}
            </p>
          </div>

          {/* Repayment structure */}
          <div className="result-card">
            <p className="eyebrow">Illustrative Repayment Structure</p>
            <div className="result-pair">
              <div className="result-metric">
                <p className="result-metric-label">Revenue share rate</p>
                <p className="result-metric-value">{pct(results.rate)}</p>
                <p className="result-metric-detail">of gross room revenue</p>
              </div>
              <div className="result-metric">
                <p className="result-metric-label">Repayment cap</p>
                <p className="result-metric-value">1.75×</p>
                <p className="result-metric-detail">{fmt(results.scenarios[1].obligation)} total obligation</p>
              </div>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
              <p className="result-metric-label">Estimated repayment timeline (base scenario)</p>
              <p className="result-metric-value" style={{ marginTop: 4 }}>{results.scenarios[1].months} months</p>
              <p className="result-metric-detail">
                Range: {results.scenarios[2].months}–{results.scenarios[0].months} months
              </p>
            </div>
          </div>

          {/* Disclosures */}
          <p className="disclosure">
            Estimate shown for discussion purposes only. Not a commitment to fund or an offer to enter into an agreement. Actual eligibility, advance amount, repayment terms, and pricing depend on full underwriting review. RevPAR improvement assumptions are based on information provided and market-level analysis. Actual performance may vary.
          </p>

          {/* Lead capture */}
          {!submitted ? (
            <div className="lead-capture">
              <h3>Request an early review</h3>
              <p>Share your contact details and we will respond within 48 hours with an initial assessment.</p>
              <form onSubmit={handleSubmit}>
                <div className="calc-pair" style={{ marginBottom: 12 }}>
                  <input className="lead-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required style={{ width: '100%' }} />
                  <input className="lead-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required style={{ width: '100%' }} />
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                  Request Early Review
                </button>
              </form>
              <p className="trust-note">🔒 All property data is confidential. Used exclusively for qualification review.</p>
            </div>
          ) : (
            <div className="confirmation">
              <p><strong>Received.</strong></p>
              <p style={{ fontSize: 14, color: 'var(--text-soft)', marginTop: 8 }}>
                We will review your property details and respond within 48 hours. RevFlex is in early access — you are among the first operators we are working with.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

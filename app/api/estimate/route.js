import { NextResponse } from 'next/server'

/*
 * ════════════════════════════════════════════════════════════════════════════
 * RevFlex Illustrative Estimate — Underwriting Model v3 (server-side only)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 * Powers the public estimate calculator. ILLUSTRATIVE marketing estimate only —
 * NOT the RevFlex underwriting decision engine (that lives in the Tab 0 PIP
 * Underwriting Framework v1.2). This route is a lightweight, faithful shadow of
 * that framework: same validated share-rate floors, same XIRR-anchored cap
 * multiple, same validated payback range. The goal is a number that is
 * directionally defensible to a sophisticated operator or capital partner.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * METHODOLOGY (v3)
 * ────────────────────────────────────────────────────────────────────────────
 *
 * 1. SHARE RATE — validated tier floors from the v1.2 framework simulation:
 *      Tier 1  6.0%   |  Tier 2  6.5%   |  Tier 3 / Tier 4  7.0%
 *    (These replace an earlier 7.0/7.5/8.0/8.5 set that had drifted out of sync
 *    with the framework.)
 *
 * 2. CAP MULTIPLE — NOT a static lookup. Solved so the deal lands at a target
 *    14% gross XIRR, consistent with the framework's solver-derived cap design.
 *    Mechanics: operator receives `advance` at t0 and repays `share × post-PIP
 *    revenue` per year until the cap obligation is retired. Treating that as a
 *    level annuity, the payback term T that yields a 14% XIRR is:
 *
 *        T = -ln(1 - advance·r / P) / ln(1 + r)      where r = 0.14, P = share×revenue
 *        impliedCap = (P · T) / advance
 *
 *    CONSEQUENCE (this is the intended self-balancing behavior):
 *      • Small advance vs. revenue  → short payback, cap compresses toward ~1.0×
 *        (so a small fast deal is priced fairly, NOT at a predatory effective APR).
 *      • Large advance vs. revenue  → long payback, higher cap (matches validated
 *        anchors: Matthews $500K/50-room ≈ 5.81 yr; Mariner's Haven ≈ 8.2 yr).
 *      • Advance too large for the property's revenue to repay at 14% within the
 *        tier term cap → payback is capped at the tier term limit (8/10/12/15 yr)
 *        and the implied cap is recomputed at that capped term.
 *
 * 3. MINIMUM CAP FLOOR — 1.15×. At 14% XIRR a very small deal solves to ~1.09×,
 *    which throws off too little absolute return to cover origination + the one
 *    human touchpoint (operator discovery call) + capital allocation. The floor
 *    keeps small deals economically sane. (No hard minimum loan amount is
 *    enforced here — the fund's true economic sweet spot is ~$100K+, but during
 *    market-validation we capture all inquiries rather than blocking them.)
 *
 * 4. REVENUE LIFT CEILING — first-year incremental revenue is the LESSER of a
 *    property-revenue-based lift and a project-COST-based ceiling, so a small
 *    project cannot show an implausible whole-property lift. (Fixes the prior
 *    bug where a $25K refresh showed $51K–$87K of added revenue.)
 *
 * ────────────────────────────────────────────────────────────────────────────
 * SOURCES & BENCHMARK BASIS (as of mid-2026)
 * ────────────────────────────────────────────────────────────────────────────
 * INSTITUTIONAL ANCHOR (most reliable — audited public disclosure):
 *   • Host Hotels & Resorts (NYSE: HST) SEC filings / earnings calls 2023–2026.
 *     $2.1B across 34 comprehensive renovations; 21 stabilized hotels show ~9-pt
 *     avg RevPAR index share gain; second Marriott program targets 3–5 pt gains
 *     and MID-TEENS (~15%) stabilized cash-on-cash returns on incremental capital.
 *     This is the ceiling: even best-in-class repositioning returns mid-teens %
 *     annually on spend — not a multiple. It anchors both the 14% XIRR target
 *     and the cost-based lift ceilings below.
 * MACRO CONTEXT:
 *   • HVS U.S. Hotel Development Cost Survey 2024/2025; STR 2025 national
 *     benchmarks (~63% occ, ~$162 ADR, ~$103 RevPAR); Marriott/Host disclosed
 *     portfolio RevPAR growth running low single digits in a normal year.
 * VALIDATED DEAL ANCHORS (RevFlex framework research):
 *   • Matthews Real Estate: $500K / 50-room ≈ 5.81-yr payoff.
 *   • Mariner's Haven ≈ 8.2-yr payoff.
 *   • Cliffwater CDLI ≈ 9.3% net (2025) as the private-credit return reference.
 * RENOVATION ROI RANGE (mixed reliability — discounted):
 *   • General industry sources: 20% to >100% ROI by scope/market.
 *   • Vendor/FF&E-supplier marketing: 25–45% ADR lift, ~13-mo payback. Heavily
 *     discounted — these sell FF&E, are per-room not per-project, ignore ramp.
 *
 * COST-BASED LIFT CEILING (first-year incremental revenue as × of project cost):
 *     Soft Goods Refresh   0.15 – 0.30
 *     Guestroom FF&E       0.25 – 0.45
 *     FF&E + Common        0.30 – 0.50
 *     Bathroom/Hard Finish 0.30 – 0.55
 *     Full Repositioning   0.40 – 0.65
 *     Brand PIP Compliance 0.10 – 0.30
 *
 * NOTE: All figures are ILLUSTRATIVE HEURISTICS for a marketing estimate, not
 * underwriting truth. Actual deals are underwritten in the Tab 0 framework.
 * ════════════════════════════════════════════════════════════════════════════
 */

const TARGET_XIRR = 0.14
const MIN_CAP = 1.15          // minimum cap multiple floor (deal economics guard)
const MAX_CAP = 1.95          // sanity ceiling (above validated reposition range)

// Pricing tiers (server-side only — never sent to browser).
// shareRate = validated framework floor; termCap = max payback term in years.
// NOTE (flagged): the $100K floor / $3M ceiling bands predate the current
// "uncapped, no minimum/maximum" market-validation positioning. Left intact
// pending a pricing decision; below-floor and above-ceiling advances are handled
// by getTier so the model never silently mis-prices an out-of-band deal.
const TIERS = [
  { min: 100000,  max: 500000,  shareRate: 0.060, termCap: 8  },
  { min: 500001,  max: 1000000, shareRate: 0.065, termCap: 10 },
  { min: 1000001, max: 2000000, shareRate: 0.070, termCap: 12 },
  { min: 2000001, max: 3000000, shareRate: 0.070, termCap: 15 },
]

// cap fields removed — cap multiple is now solved to XIRR, not looked up.
// costLow/costHigh = first-year incremental revenue as a fraction of PROJECT COST.
// liftLow/liftHigh = property-revenue-based lift band (acts as the upper bound).
const SCOPES = {
  soft:         { liftLow: 0.05, liftHigh: 0.12, costLow: 0.15, costHigh: 0.30, label: 'Soft Goods Refresh' },
  ffe:          { liftLow: 0.12, liftHigh: 0.22, costLow: 0.25, costHigh: 0.45, label: 'FF&E Targeted' },
  'ffe-common': { liftLow: 0.18, liftHigh: 0.30, costLow: 0.30, costHigh: 0.50, label: 'FF&E + Common Areas' },
  bath:         { liftLow: 0.18, liftHigh: 0.30, costLow: 0.30, costHigh: 0.55, label: 'Bathroom + Hard Finish' },
  full:         { liftLow: 0.30, liftHigh: 0.50, costLow: 0.40, costHigh: 0.65, label: 'Full Repositioning' },
  pip:          { liftLow: 0.12, liftHigh: 0.22, costLow: 0.10, costHigh: 0.30, label: 'Brand PIP Compliance' },
  other:        { liftLow: 0.10, liftHigh: 0.20, costLow: 0.15, costHigh: 0.35, label: 'General Improvement' },
}

// Advances below the lowest band get the lowest tier (not the highest — that was
// a prior bug). Advances above the highest band get the highest tier.
function getTier(advance) {
  if (advance <= TIERS[0].max) return TIERS[0]
  const found = TIERS.find(t => advance >= t.min && advance <= t.max)
  return found || TIERS[TIERS.length - 1]
}

// Clamp a value into [lo, hi].
function clamp(v, lo, hi) {
  return Math.min(Math.max(v, lo), hi)
}

/*
 * Solve the cap multiple and payback term to a target XIRR.
 * Returns { capMultiple, paybackYears, termCapped }.
 *   advance        = capital deployed
 *   annualPayment  = share × post-PIP annual revenue (assumed level)
 *   termCap        = tier maximum term (years)
 */
function solveCapAndPayback(advance, annualPayment, termCap) {
  if (annualPayment <= 0) {
    return { capMultiple: MIN_CAP, paybackYears: termCap, termCapped: true }
  }

  const x = (advance * TARGET_XIRR) / annualPayment

  let paybackYears
  let termCapped = false

  if (x >= 1) {
    // Annual payment too small to ever amortize at the target XIRR:
    // the property's revenue can't repay this advance at 14%. Cap the payback
    // at the tier's term limit and let the cap multiple fall out at that term.
    paybackYears = termCap
    termCapped = true
  } else {
    paybackYears = -Math.log(1 - x) / Math.log(1 + TARGET_XIRR)
    if (paybackYears > termCap) {
      paybackYears = termCap
      termCapped = true
    }
  }

  // Implied cap multiple for the resulting term, then clamp to [MIN_CAP, MAX_CAP].
  const rawCap = (annualPayment * paybackYears) / advance
  const capMultiple = clamp(rawCap, MIN_CAP, MAX_CAP)

  return { capMultiple, paybackYears, termCapped }
}

function calcEstimate({ rooms, adr, occupancy, projectCost, projectScope }) {
  const r = Number(rooms)
  const a = Number(adr)
  const o = Number(occupancy) / 100
  const p = Number(projectCost)

  if (!r || !a || !o || !p) return null

  const annualRevenue = r * a * 365 * o
  const advance = Math.max(25000, p)
  const tier = getTier(advance)
  const shareRate = tier.shareRate
  const termCapYears = tier.termCap
  const scope = SCOPES[projectScope] || SCOPES['ffe']

  // ── Revenue lift: lesser of property-based and cost-based ceiling ──────────
  const midLift = (scope.liftLow + scope.liftHigh) / 2
  const addlRevenueConservative = Math.round(Math.min(annualRevenue * scope.liftLow, p * scope.costLow))
  const addlRevenueBase         = Math.round(Math.min(annualRevenue * midLift,      p * scope.costHigh))

  const postPIPRevenueConservative = annualRevenue + addlRevenueConservative
  const postPIPRevenueBase         = annualRevenue + addlRevenueBase

  // ── Solve cap + payback to 14% XIRR for both revenue scenarios ─────────────
  // Conservative revenue → longer payback; base revenue → shorter payback.
  const conservative = solveCapAndPayback(advance, postPIPRevenueConservative * shareRate, termCapYears)
  const base         = solveCapAndPayback(advance, postPIPRevenueBase * shareRate, termCapYears)

  // Total repayment is shown as a single figure. Use the conservative (higher)
  // cap so the operator sees the upper bound of what they'd repay.
  const capMultiple = Math.max(conservative.capMultiple, base.capMultiple)  // INTERNAL — not returned
  const totalRepayment = Math.round(advance * capMultiple)

  // Effective lift % derived from the capped incremental revenue, so the
  // displayed range matches the dollar figures shown.
  const effLiftLow  = annualRevenue > 0 ? Math.round((addlRevenueConservative / annualRevenue) * 100) : 0
  const effLiftHigh = annualRevenue > 0 ? Math.round((addlRevenueBase / annualRevenue) * 100) : 0

  return {
    advance,
    totalRepayment,
    // capMultiple intentionally NOT returned — internal only.
    shareRate,
    termCapYears,
    paybackYrsBase: Math.round(base.paybackYears * 10) / 10,
    paybackYrsConservative: Math.round(conservative.paybackYears * 10) / 10,
    termCapped: conservative.termCapped || base.termCapped,
    annualRevenue: Math.round(annualRevenue),
    addlRevenueConservative,
    addlRevenueBase,
    scopeLabel: scope.label,
    liftRangeLow: effLiftLow,
    liftRangeHigh: effLiftHigh,
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json()
    const { rooms, adr, occupancy, projectCost, projectScope } = body

    if (!rooms || !adr || !occupancy || !projectCost || !projectScope) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = calcEstimate({ rooms, adr, occupancy, projectCost, projectScope })

    if (!result) {
      return NextResponse.json(
        { error: 'Could not calculate estimate' },
        { status: 422 }
      )
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}

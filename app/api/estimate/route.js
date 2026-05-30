import { NextResponse } from 'next/server'

// ─── Model constants (server-side only — never sent to browser) ───────────────
const TIERS = [
  { min: 100000,  max: 500000,  shareRate: 0.07,  termCap: 8  },
  { min: 500001,  max: 1000000, shareRate: 0.075, termCap: 10 },
  { min: 1000001, max: 2000000, shareRate: 0.08,  termCap: 12 },
  { min: 2000001, max: 3000000, shareRate: 0.085, termCap: 15 },
]

const SCOPES = {
  soft:         { cap: 1.70, liftLow: 0.05, liftHigh: 0.12, label: 'Soft Goods Refresh' },
  ffe:          { cap: 1.78, liftLow: 0.12, liftHigh: 0.22, label: 'FF&E Targeted' },
  'ffe-common': { cap: 1.83, liftLow: 0.18, liftHigh: 0.30, label: 'FF&E + Common Areas' },
  bath:         { cap: 1.83, liftLow: 0.18, liftHigh: 0.30, label: 'Bathroom + Hard Finish' },
  full:         { cap: 1.88, liftLow: 0.30, liftHigh: 0.50, label: 'Full Repositioning' },
  pip:          { cap: 1.78, liftLow: 0.12, liftHigh: 0.22, label: 'Brand PIP Compliance' },
  other:        { cap: 1.75, liftLow: 0.10, liftHigh: 0.20, label: 'General Improvement' },
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

  const annualRevenue = r * a * 365 * o
  const advance = Math.max(25000, p)
  const tier = getTier(advance)
  const shareRate = tier.shareRate
  const termCapYears = tier.termCap
  const scope = SCOPES[projectScope] || SCOPES['ffe']
  const capMultiple = scope.cap
  const totalRepayment = Math.round(advance * capMultiple)

  const midLift = (scope.liftLow + scope.liftHigh) / 2
  const postPIPRevenueConservative = annualRevenue * (1 + scope.liftLow)
  const postPIPRevenueBase = annualRevenue * (1 + midLift)

  const annualRepaymentConservative = postPIPRevenueConservative * shareRate
  const annualRepaymentBase = postPIPRevenueBase * shareRate

  const paybackYrsConservative = totalRepayment / annualRepaymentConservative
  const paybackYrsBase = totalRepayment / annualRepaymentBase

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

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json()
    const { rooms, adr, occupancy, projectCost, projectScope } = body

    // Basic server-side validation
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

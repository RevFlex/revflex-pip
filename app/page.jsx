'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const Calculator = dynamic(() => import('../components/Calculator'), { ssr: false })

// ── Fade-up hook ─────────────────────────────────────────────────────────────
function useFadeUp(delay = 0) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'
    el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
    if (typeof window === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return ref
}

export default function Home() {
  const heroRef = useFadeUp(0)
  const challengeRef = useFadeUp(0)
  const structureRef = useFadeUp(0)
  const whyRef = useFadeUp(0)
  const earlyRef = useFadeUp(0)

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#FAF8F4', color: '#1A1D1A' }}>

      {/* ── NAV ── */}
      <Nav />

      {/* ── HERO ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(48px, 8vw, 96px) clamp(28px, 6vw, 40px) clamp(48px, 6vw, 80px)', textAlign: 'center' }}>
        <div ref={heroRef}>
          <div style={{
            display: 'inline-block',
            background: '#F0EBE3', border: '1px solid #DDD6CC',
            borderRadius: '20px', padding: '6px 14px',
            fontSize: '12px', fontWeight: '500', color: '#7A6A5A',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: '28px'
          }}>
            Early Access — Now Accepting Inquiries
          </div>

          <h1 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: '400', lineHeight: '1.15',
            color: '#1A1D1A', marginBottom: '24px', letterSpacing: '-0.01em'
          }}>
            Flexible capital for<br />hotel improvements.
          </h1>

          <p style={{
            fontSize: '18px', lineHeight: '1.7', color: '#4A4E4A',
            maxWidth: '580px', margin: '0 auto 40px'
          }}>
            RevFlex helps hotel owners fund property improvements with payments designed around your gross revenue.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#estimate" style={{
              background: '#C27C4E', color: '#fff',
              fontSize: '15px', fontWeight: '500',
              padding: '14px 28px', borderRadius: '7px', textDecoration: 'none'
            }}>
              Check Your Eligibility
            </a>
            <a href="#how-it-works" style={{
              background: 'transparent', color: '#1A1D1A',
              fontSize: '15px', fontWeight: '400',
              padding: '14px 28px', borderRadius: '7px', textDecoration: 'none',
              border: '1px solid #D0C9C0'
            }}>
              See How It Works
            </a>
          </div>

          <div style={{
            display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
            marginTop: '52px', paddingTop: '40px', borderTop: '1px solid #E8E4DE'
          }}>
            {[
              { label: 'Revenue-aligned repayment', sub: "Flexes with the hotel's revenue" },
              { label: 'No personal guarantee', sub: 'Capital risk stays with us' },
              { label: 'No franchise required', sub: 'All property types welcome' },
            ].map(({ label, sub }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#1A1D1A', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '13px', color: '#7A6A5A' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHALLENGE ── */}
      <section id="how-it-works" style={{ background: '#F3EEE7', padding: 'clamp(56px, 8vw, 88px) clamp(28px, 6vw, 40px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div ref={challengeRef}>
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>The Challenge</div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: '400', lineHeight: '1.25',
              color: '#1A1D1A', marginBottom: '56px', maxWidth: '600px'
            }}>
              Traditional financing does not always fit hotel improvement cycles.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {[
                { num: '01', title: 'Renovation costs are uneven', body: 'A soft-goods refresh is not the same as a full repositioning. Capital structures should reflect the scope, timeline, and expected return of the specific improvement.', delay: 0 },
                { num: '02', title: 'Revenue lift takes time', body: 'Rate increases, review improvement, and guest perception do not happen overnight. Repayment should account for the ramp-up period after renovation completion.', delay: 100 },
                { num: '03', title: 'Hotel cash flow is seasonal', body: 'Occupancy dips in shoulder seasons. Revenue fluctuates with weather, events, and market cycles. Fixed monthly payments ignore these realities.', delay: 200 },
              ].map(({ num, title, body, delay }) => (
                <FadeCard key={num} delay={delay}>
                  <div style={{
                    background: '#FAF8F4', borderRadius: '12px',
                    padding: '32px', border: '1px solid #E0D9CF', height: '100%'
                  }}>
                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '48px', fontWeight: '400', color: '#DDD5C8', lineHeight: '1', marginBottom: '16px' }}>{num}</div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1D1A', marginBottom: '10px', lineHeight: '1.3' }}>{title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#5A5E5A', margin: 0 }}>{body}</p>
                  </div>
                </FadeCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STRUCTURE ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 88px) clamp(28px, 6vw, 40px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div ref={structureRef}>
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>The Structure</div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: '400', lineHeight: '1.25',
              color: '#1A1D1A', marginBottom: '16px', maxWidth: '600px'
            }}>
              Funding that flexes with your revenue.
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4A4E4A', maxWidth: '560px', marginBottom: '56px' }}>
              You receive your funding amount up front, then repay through a small share of your room revenue. When business is strong, you pay down faster. When revenue dips, your payment dips with it. One fixed fee — no interest rate, no compounding, no fixed monthly payment.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'One fixed fee', sub: 'Not interest. Not compounding. The cost is set up front and never changes', delay: 0 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: 'Pay from revenue', sub: 'Repaid through a small share of room revenue, collected monthly — never a fixed bill', delay: 50 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="23" y1="6" x2="13.5" y2="15.5"/><polyline points="17 6 23 6 23 12"/><line x1="13.5" y1="15.5" x2="8.5" y2="10.5"/><line x1="8.5" y1="10.5" x2="1" y2="18"/></svg>, title: 'Pay more when you earn more', sub: 'Strong months pay down faster. Slow seasons ease off. Repayment follows your revenue', delay: 100 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'No personal guarantee', sub: 'Capital risk stays with RevFlex — not with you or your property', delay: 150 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'No brand or franchise required', sub: 'Independent, boutique, and all property types welcome', delay: 200 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Fast, pre-qualified funding', sub: 'Target close in 2–3 weeks from a qualified inquiry', delay: 250 },
              ].map(({ icon, title, sub, footnote, delay }) => (
                <FadeCard key={title} delay={delay}>
                  <div style={{ background: '#FAF8F4', border: '1px solid #E8E4DE', borderRadius: '12px', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                    <div style={{ lineHeight: '1' }}>{icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1D1A', lineHeight: '1.3' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: '#7A6A5A', lineHeight: '1.6' }}>{sub}</div>
                    {footnote && <div style={{ fontSize: '11px', color: '#B0A898', marginTop: '2px' }}>{footnote}</div>}
                  </div>
                </FadeCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section id="estimate" style={{ background: '#F3EEE7', padding: 'clamp(56px, 8vw, 88px) clamp(24px, 6vw, 32px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Calculator />
        </div>
      </section>

      {/* ── WHY REVFLEX ── */}
      <section style={{ padding: 'clamp(56px, 8vw, 88px) clamp(28px, 6vw, 40px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div ref={whyRef}>
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>Why RevFlex</div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: '400', lineHeight: '1.25',
              color: '#1A1D1A', marginBottom: '48px', maxWidth: '560px'
            }}>
              Built for the way hotel value is actually created.
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {[
                { title: 'Hospitality-aware underwriting', body: 'We evaluate the project, property, market, revenue history, and improvement thesis — not a generic loan file.', delay: 0 },
                { title: 'Revenue-aligned structure', body: 'Repayment flexes with hotel performance rather than forcing every property into the same fixed-payment model.', delay: 100 },
                { title: 'Scope-specific thinking', body: 'A light soft-goods refresh is not the same as a full repositioning. RevFlex evaluates capital needs by scope, timeline, and expected return.', delay: 200 },
                { title: 'Clear, disciplined capital', body: 'Transparent terms, defined use of proceeds, practical underwriting, and a capped total obligation. No hidden fees. No compounding.', delay: 300 },
              ].map(({ title, body, delay }) => (
                <FadeCard key={title} delay={delay}>
                  <div>
                    <div style={{ width: '32px', height: '3px', background: '#C27C4E', marginBottom: '16px', borderRadius: '2px' }} />
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1D1A', marginBottom: '10px' }}>{title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: '1.75', color: '#5A5E5A', margin: 0 }}>{body}</p>
                  </div>
                </FadeCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#F3EEE7', padding: 'clamp(56px, 8vw, 88px) clamp(28px, 6vw, 40px)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <FadeCard delay={0}>
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>FAQ</div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: '400', lineHeight: '1.25',
              color: '#1A1D1A', marginBottom: '48px', maxWidth: '560px'
            }}>
              Common questions about RevFlex.
            </h2>
            <FAQList />
          </FadeCard>
        </div>
      </section>

      {/* ── EARLY ACCESS ── */}
      <section id="early-access" style={{ background: '#1A1D1A', padding: 'clamp(56px, 8vw, 88px) clamp(28px, 6vw, 40px)' }}>
        <div ref={earlyRef} style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7A6A5A', marginBottom: '14px', fontWeight: '600' }}>Early Access</div>
          <h2 style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 'clamp(26px, 3.5vw, 40px)',
            fontWeight: '400', lineHeight: '1.25',
            color: '#FAF8F4', marginBottom: '20px'
          }}>
            We are building RevFlex with hotel owners and operators.
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.75', color: '#9A9E9A', marginBottom: '36px' }}>
            RevFlex is currently in early access and actively speaking with hotel owners, operators, and capital partners. If you have a property improvement in mind, we would like to hear from you.
          </p>
          <a href="#estimate" style={{
            display: 'inline-block', background: '#C27C4E', color: '#fff',
            fontSize: '15px', fontWeight: '500',
            padding: '14px 28px', borderRadius: '7px', textDecoration: 'none'
          }}>
            Check Your Eligibility
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#FAF8F4', borderTop: '1px solid #E8E4DE', padding: '40px 32px' }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center'
        }}>
          <Image src="/logo-dark.png" alt="RevFlex" width={160} height={48} style={{ objectFit: 'contain', height: '48px', width: 'auto', opacity: 0.7 }} />
          <p style={{ fontSize: '12px', color: '#9A8A7A', lineHeight: '1.8', maxWidth: '600px' }}>
            Revenue-aligned capital for hotel improvements. RevFlex is in development. Information provided on this website is for discussion purposes only and does not constitute a financing offer, commitment to lend, investment advice, or approval of credit. All financing is subject to underwriting, documentation, eligibility, and final approval. RevFlex is not a bank. Capital provided through revenue participation agreements.
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#9A8A7A', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/contact" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Contact</a>
            <a href="/terms" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/privacy" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/cookies" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Cookie Policy</a>
            <a href="/disclaimer" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Forward-Looking Statements</a>
          </div>
          <div style={{ fontSize: '12px', color: '#B0A898' }}>© 2026 RevFlex. All rights reserved.</div>
        </div>
      </footer>

    </main>
  )
}


// ── FAQList component ─────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Is RevFlex a loan?",
    a: "No. RevFlex provides revenue-based financing through a revenue participation agreement — not a traditional loan. There is no fixed interest rate, no compounding, and no fixed monthly payment schedule. Instead, repayment is tied to a percentage of your gross revenue. When revenue is lower, payments are lower. The total obligation is capped at a fixed multiple of the amount funded, and once that cap is reached, the agreement ends."
  },
  {
    q: "What properties qualify for RevFlex financing?",
    a: "RevFlex is designed for boutique hotels, independent inns, and lodging operators pursuing property improvement projects. We do not require a brand affiliation or franchise agreement. Properties of all sizes are considered. Eligibility is evaluated based on the property's gross revenue history, the scope and merit of the proposed improvement, the operator's track record, and the market opportunity — not on a generic loan file."
  },
  {
    q: "What kinds of improvements does RevFlex fund?",
    a: "RevFlex funds targeted property improvements including FF&E refreshes, soft goods upgrades, bathroom and hard-finish renovations, common area improvements, full repositioning projects, and brand PIP compliance work. The improvement must have a clear connection to revenue uplift potential — we evaluate scope, timeline, and expected return on the specific project."
  },
  {
    q: "How is the financing amount determined?",
    a: "The financing amount is based on the scope and cost of the proposed improvement, the property's gross revenue history, RevPAR performance, market conditions, and RevFlex's assessment of the revenue uplift potential of the project. Use the estimate calculator on this page to get an initial illustrative range. Actual amounts are subject to full underwriting and final approval."
  },
  {
    q: "How does repayment work?",
    a: "Repayment is structured as a fixed percentage of gross revenue, collected monthly. The percentage is determined at closing and is based on the financing amount and scope tier. Because payments are tied to revenue rather than a fixed calendar, payments naturally decrease during slower seasons and increase when revenue grows post-renovation. The total repayment obligation is capped — once the cap is reached, the agreement ends with no further obligation."
  },
  {
    q: "How much will I repay in total?",
    a: "Your total repayment is your funding amount plus one fixed fee, agreed up front. There is no interest rate and no compounding, so the total never grows beyond what you agreed to at closing. You repay it through a small share of your room revenue over time — when revenue is strong you pay down faster, and when it dips your payment dips with it. Once the agreed total is reached, the agreement is complete."
  },
  {
    q: "Is there a grace period before repayment begins?",
    a: "Yes. RevFlex includes an approximately 90-day grace period following renovation completion before revenue share payments begin. This accounts for the ramp-up period during which ADR improvements, guest review recovery, and occupancy lift typically occur."
  },
  {
    q: "Do I need to provide a personal guarantee?",
    a: "No. RevFlex does not require a personal guarantee. Capital risk stays with RevFlex, not with the operator or property owner."
  },
  {
    q: "Will RevFlex take equity in my property?",
    a: "No. RevFlex financing does not involve any equity stake, warrants, or ownership interest in your property or business. You retain full ownership throughout and after the financing."
  },
  {
    q: "How long does the process take?",
    a: "RevFlex targets a 2–3 week close from qualified inquiry to funded. This includes initial review, underwriting, documentation, and fund disbursement. Actual timelines depend on the completeness of information provided and the complexity of the project."
  },
  {
    q: "What does RevFlex look at during underwriting?",
    a: "RevFlex evaluates the property's gross revenue history, ADR and occupancy trends, RevPAR relative to the competitive set, the quality and scope of the proposed improvement, FF&E and soft goods condition, guest review quality and trajectory, distribution mix and OTA dependency, revenue management maturity, staffing and operational quality, and the overall market opportunity. We underwrite future cash flow uplift — not just historical collateral."
  },
  {
    q: "Does applying affect my personal credit score?",
    a: "RevFlex does not require a personal credit check as part of the standard qualification process. Our underwriting is focused on property-level revenue performance and the improvement thesis, not personal credit history."
  },
  {
    q: "Is RevFlex available nationwide?",
    a: "RevFlex is currently in early development and accepting inquiries from US-based hotel owners and operators. Certain geographic limitations may apply depending on local rules and regulations. Submit an inquiry to discuss your specific property and market."
  },
  {
    q: "This isn't a commitment to fund, right?",
    a: "Correct. Nothing on this website — including the estimate calculator — constitutes a financing offer, pre-approval, or commitment to lend. All estimates are illustrative. Actual financing is subject to full underwriting, documentation, eligibility review, and final approval by RevFlex."
  },
]

function FAQList() {
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} style={{
          borderTop: '1px solid #E0D9CF',
          ...(i === FAQ_ITEMS.length - 1 ? { borderBottom: '1px solid #E0D9CF' } : {})
        }}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              padding: '20px 0', cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              gap: '16px',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#1A1D1A', lineHeight: '1.4' }}>
              {item.q}
            </span>
            <span style={{
              flexShrink: 0, width: '20px', height: '20px',
              borderRadius: '50%', background: openIndex === i ? '#C27C4E' : '#E8E4DE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                {openIndex === i
                  ? <path d="M2 5h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
                  : <path d="M5 2v6M2 5h6" stroke="#7A6A5A" strokeWidth="1.5" strokeLinecap="round"/>
                }
              </svg>
            </span>
          </button>
          {openIndex === i && (
            <div style={{
              fontSize: '14px', lineHeight: '1.8', color: '#4A4E4A',
              paddingBottom: '20px', paddingRight: '36px',
            }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Nav component ────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false)
  const links = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Estimate', href: '#estimate' },
    { label: 'Early Access', href: '#early-access' },
  ]
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#FAF8F4', borderBottom: '1px solid #E8E4DE',
    }}>
      <div style={{
        padding: '0 24px', height: '76px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        <a href="/">
          <Image src="/logo-dark.png" alt="RevFlex" width={200} height={60}
            style={{ objectFit: 'contain', height: '52px', width: 'auto', display: 'block' }} priority />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}
          className="desktop-nav">
          {links.map(l => (
            <a key={l.label} href={l.href}
              style={{ fontSize: '14px', color: '#4A4E4A', textDecoration: 'none' }}>
              {l.label}
            </a>
          ))}
          <a href="#estimate" style={{
            background: '#C27C4E', color: '#fff',
            fontSize: '13px', fontWeight: '500',
            padding: '10px 20px', borderRadius: '6px', textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}>Check Eligibility</a>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: 'none', background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px', color: '#1A1D1A',
          }}
          className="hamburger"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div style={{
          background: '#FAF8F4', borderTop: '1px solid #E8E4DE',
          padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '0',
        }}
          className="mobile-menu">
          {links.map(l => (
            <a key={l.label} href={l.href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: '16px', color: '#1A1D1A', textDecoration: 'none',
                padding: '14px 0', borderBottom: '1px solid #F0EBE3',
                display: 'block',
              }}>
              {l.label}
            </a>
          ))}
          <a href="#estimate"
            onClick={() => setOpen(false)}
            style={{
              display: 'block', marginTop: '20px',
              background: '#C27C4E', color: '#fff', textAlign: 'center',
              fontSize: '15px', fontWeight: '500',
              padding: '14px', borderRadius: '7px', textDecoration: 'none',
            }}>
            Check Eligibility
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

// ── FadeCard component ────────────────────────────────────────────────────────
function FadeCard({ children, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window === 'undefined') return
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    el.style.transition = `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])
  return <div ref={ref}>{children}</div>
}

'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import Calculator from '../components/Calculator'

// ── Fade-up hook ─────────────────────────────────────────────────────────────
function useFadeUp(delay = 0) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(24px)'
    el.style.transition = `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`
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
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#FAF8F4', borderBottom: '1px solid #E8E4DE',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Image src="/logo-dark.png" alt="RevFlex" width={160} height={48} style={{ objectFit: 'contain', height: '44px', width: 'auto' }} priority />
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#how-it-works" style={{ fontSize: '14px', color: '#4A4E4A', textDecoration: 'none' }}>How It Works</a>
          <a href="#estimate" style={{ fontSize: '14px', color: '#4A4E4A', textDecoration: 'none' }}>Estimate</a>
          <a href="#early-access" style={{ fontSize: '14px', color: '#4A4E4A', textDecoration: 'none' }}>Early Access</a>
          <a href="#estimate" style={{
            background: '#C27C4E', color: '#fff',
            fontSize: '13px', fontWeight: '500', letterSpacing: '0.03em',
            padding: '10px 20px', borderRadius: '6px', textDecoration: 'none',
            whiteSpace: 'nowrap'
          }}>Check Eligibility</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '96px 32px 80px', textAlign: 'center' }}>
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
              { label: 'Revenue-aligned repayment', sub: "Flexes with hotel's revenue" },
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
      <section id="how-it-works" style={{ background: '#F3EEE7', padding: '88px 32px' }}>
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
      <section style={{ padding: '88px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div ref={structureRef}>
            <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '14px', fontWeight: '600' }}>The Structure</div>
            <h2 style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: '400', lineHeight: '1.25',
              color: '#1A1D1A', marginBottom: '16px', maxWidth: '600px'
            }}>
              Payments structured around revenue, not just a fixed payment schedule.
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#4A4E4A', maxWidth: '560px', marginBottom: '56px' }}>
              RevFlex provides flexible financing for qualified hotel improvement projects, with repayment tied to a percentage of gross revenue. When revenue dips seasonally, payments decrease. When revenue grows after renovation, repayment accelerates. Total obligation is capped, then the agreement ends.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: 'Fast pre-qualified financing', sub: 'Target close in 2–3 weeks from qualified inquiry', delay: 0 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>, title: 'Lump sum at closing', sub: 'Full amount available for your property improvement', footnote: '*Certain restrictions may apply', delay: 50 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, title: 'No fixed interest rate', sub: 'A financing fee, not a compounding interest structure', delay: 100 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, title: 'Fee based on revenue growth', sub: 'Repayment capped at 1.75× — then the agreement ends', delay: 150 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, title: 'Payments from gross revenue', sub: 'A fixed percentage of gross revenue, collected monthly', delay: 200 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, title: 'Brand or franchise not required', sub: 'Independent, boutique, and all property types welcome', delay: 250 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'No personal guarantees', sub: 'Capital risk stays with RevFlex, not with the operator', delay: 300 },
                { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C27C4E" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>, title: 'No equity dilution', sub: 'You keep full ownership. No warrants, no equity stake', delay: 350 },
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
      <section id="estimate" style={{ background: '#F3EEE7', padding: '88px 32px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <Calculator />
        </div>
      </section>

      {/* ── WHY REVFLEX ── */}
      <section style={{ padding: '88px 32px' }}>
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

      {/* ── EARLY ACCESS ── */}
      <section id="early-access" style={{ background: '#1A1D1A', padding: '88px 32px' }}>
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
            RevFlex is currently in early development. We are speaking with hotel owners, operators, and capital partners to refine the model. If you have a property improvement in mind, we would like to hear from you.
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
          <Image src="/logo-dark.png" alt="RevFlex" width={100} height={30} style={{ objectFit: 'contain', height: '28px', width: 'auto', opacity: 0.7 }} />
          <p style={{ fontSize: '12px', color: '#9A8A7A', lineHeight: '1.8', maxWidth: '600px' }}>
            Revenue-aligned capital for hotel improvements. RevFlex is in development. Information provided on this website is for discussion purposes only and does not constitute a financing offer, commitment to lend, investment advice, or approval of credit. All financing is subject to underwriting, documentation, eligibility, and final approval. RevFlex is not a bank. Capital provided through revenue participation agreements.
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#9A8A7A' }}>
            <a href="/terms" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/privacy" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/disclaimer" style={{ color: '#9A8A7A', textDecoration: 'none' }}>Forward-Looking Statements</a>
          </div>
          <div style={{ fontSize: '12px', color: '#B0A898' }}>© 2026 RevFlex. All rights reserved.</div>
        </div>
      </footer>

    </main>
  )
}

// ── FadeCard component ────────────────────────────────────────────────────────
function FadeCard({ children, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
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

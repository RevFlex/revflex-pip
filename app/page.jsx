import Image from 'next/image';
import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <>
      {/* ── Navigation ───────────────────────────────── */}
      <nav className="nav">
        <div className="container nav-inner">
          <Image src="/logo-dark.png" alt="RevFlex" width={120} height={24} className="nav-logo" priority />
          <div className="nav-links">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#estimate" className="nav-link">Estimate</a>
            <a href="#early-access" className="nav-link">Early Access</a>
            <a href="#estimate" className="btn btn-dark" style={{ padding: '10px 20px', fontSize: 13 }}>Estimate Capacity</a>
          </div>
        </div>
      </nav>

      {/* ── 1. Hero ──────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <span className="eyebrow">Early Access — Now Accepting Inquiries</span>
          </div>

          <h1>Flexible capital for hotel improvements.</h1>

          <p className="hero-sub">
            RevFlex helps hotel owners fund PIP, FF&E, soft goods, bathroom upgrades, 
            and repositioning projects with capital structures designed around 
            hospitality revenue realities.
          </p>

          <div className="hero-actions">
            <a href="#estimate" className="btn btn-primary">Estimate Your RevFlex Capacity</a>
            <a href="#how-it-works" className="btn btn-outline">See How It Works</a>
          </div>

          <p className="hero-note">
            Built for hotel owners, operators, and asset-level decision makers.
          </p>

          <div className="hero-proof">
            <div className="proof-item">
              <p className="proof-label">Revenue-aligned repayment</p>
              <p className="proof-detail">Flexes with hotel performance</p>
            </div>
            <div className="proof-item">
              <p className="proof-label">No personal guarantee</p>
              <p className="proof-detail">Capital risk stays with us</p>
            </div>
            <div className="proof-item">
              <p className="proof-label">No franchise required</p>
              <p className="proof-detail">All property types welcome</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Problem ───────────────────────────────── */}
      <section className="section section-stone" id="how-it-works">
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: 16 }}>The Challenge</p>
          <h2>Traditional financing does not always fit hotel improvement cycles.</h2>
          <p style={{ color: 'var(--text-soft)', fontSize: 17, lineHeight: 1.75, marginTop: 20, marginBottom: 40 }}>
            Hotel improvement projects are rarely simple. Costs vary by scope. 
            Revenue lift depends on timing, market depth, guest perception, and execution quality. 
            Fixed debt can create pressure before the property has fully absorbed the benefit 
            of the investment. RevFlex is designed for that gap.
          </p>

          <div className="card-grid">
            <div className="card">
              <div className="card-num">01</div>
              <h3>Renovation costs are uneven</h3>
              <p>
                A soft-goods refresh is not the same as a full repositioning. 
                Capital structures should reflect the scope, timeline, and expected return 
                of the specific improvement.
              </p>
            </div>
            <div className="card">
              <div className="card-num">02</div>
              <h3>Revenue lift takes time</h3>
              <p>
                Rate increases, review improvement, and guest perception 
                do not happen overnight. Repayment should account for the ramp-up period 
                after renovation completion.
              </p>
            </div>
            <div className="card">
              <div className="card-num">03</div>
              <h3>Hotel cash flow is seasonal</h3>
              <p>
                Occupancy dips in shoulder seasons. Revenue fluctuates with 
                weather, events, and market cycles. Fixed monthly payments 
                ignore these realities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Solution ──────────────────────────────── */}
      <section className="section">
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: 16 }}>The Structure</p>
          <h2>Capital structured around revenue, not just a fixed payment schedule.</h2>
          <p style={{ color: 'var(--text-soft)', fontSize: 17, lineHeight: 1.75, marginTop: 20, marginBottom: 40 }}>
            RevFlex provides flexible financing for qualified hotel improvement projects, 
            with repayment tied to a percentage of gross room revenue. 
            When revenue dips seasonally, payments decrease. 
            When revenue grows after renovation, repayment accelerates. 
            Total obligation is capped, then the agreement ends.
          </p>

          <table className="s-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Structure</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Capital deployed</td>
                <td>Lump sum at closing. Full amount available for renovation execution.</td>
              </tr>
              <tr>
                <td>Repayment</td>
                <td>A fixed percentage of gross room revenue, collected monthly.</td>
              </tr>
              <tr>
                <td>Repayment cap</td>
                <td>1.75× the advance. Once reached, the agreement ends.</td>
              </tr>
              <tr>
                <td>Grace period</td>
                <td>Approximately 90 days post-renovation completion.</td>
              </tr>
              <tr>
                <td>Personal guarantee</td>
                <td>Not required.</td>
              </tr>
              <tr>
                <td>Brand or franchise</td>
                <td>Not required. All property types welcome.</td>
              </tr>
              <tr>
                <td>Equity dilution</td>
                <td>None.</td>
              </tr>
              <tr>
                <td>Target close</td>
                <td>2–3 weeks from qualified inquiry.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FUTURE SECTION: Use Cases ────────────────── */}
      {/*
        USE CASES SECTION — Build in Phase 2
        
        Headline: "Designed for visible property improvement."
        
        Cards:
        - PIP requirements
        - Guestroom FF&E
        - Soft goods refresh
        - Bathroom and hard-finish upgrades
        - Public-area improvements
        - Boutique repositioning
        - Revenue-driving property upgrades
        
        Each card: short, practical copy explaining the scope
        and typical RevFlex fit for that improvement type.
      */}

      {/* ── 4. Calculator ────────────────────────────── */}
      <section className="section section-warm" id="estimate">
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: 16 }}>Estimate</p>
          <h2>Start with a simple estimate.</h2>
          <p style={{ color: 'var(--text-soft)', fontSize: 17, lineHeight: 1.75, marginTop: 20, marginBottom: 48 }}>
            Use a few inputs to estimate potential RevFlex capacity. 
            This is not a commitment or approval. It is a starting point for discussion.
          </p>

          <Calculator />
        </div>
      </section>

      {/* ── 5. Why RevFlex ───────────────────────────── */}
      <section className="section section-stone">
        <div className="container">
          <p className="eyebrow" style={{ marginBottom: 16 }}>Why RevFlex</p>
          <h2>Built for the way hotel value is actually created.</h2>

          <div className="card-grid" style={{ marginTop: 40 }}>
            <div className="card">
              <h3>Hospitality-aware underwriting</h3>
              <p>
                We evaluate the project, property, market, revenue history, 
                and improvement thesis — not a generic loan file.
              </p>
            </div>
            <div className="card">
              <h3>Revenue-aligned structure</h3>
              <p>
                Repayment flexes with hotel performance rather than 
                forcing every property into the same fixed-payment model.
              </p>
            </div>
            <div className="card">
              <h3>Scope-specific thinking</h3>
              <p>
                A light soft-goods refresh is not the same as a full repositioning. 
                RevFlex evaluates capital needs by scope, timeline, and expected return.
              </p>
            </div>
            <div className="card">
              <h3>Clear, disciplined capital</h3>
              <p>
                Transparent terms, defined use of proceeds, practical underwriting, 
                and a capped total obligation. No hidden fees. No compounding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FUTURE SECTION: Who It's For ─────────────── */}
      {/*
        WHO IT'S FOR SECTION — Build in Phase 2
        
        Headline: "For hotel owners with a credible improvement plan."
        
        Good fit:
        - Independent and boutique hotels
        - Select-service and lifestyle properties
        - Owners with existing revenue history
        - Properties with visible improvement needs
        - Operators with a clear plan
        
        Not ideal:
        - Ground-up development
        - Distressed without recovery plan
        - Unclear use of proceeds
        - Unresolved operating/reputation issues
        
        Tone: respectful, not exclusionary.
      */}

      {/* ── 6. Early Access ──────────────────────────── */}
      <section className="section" id="early-access">
        <div className="container">
          <div className="early-access">
            <p className="eyebrow" style={{ marginBottom: 16 }}>Early Access</p>
            <h2>We are building RevFlex with hotel owners and operators.</h2>
            <p style={{ color: 'var(--text-soft)', fontSize: 16, lineHeight: 1.7 }}>
              RevFlex is currently in early development. We are speaking with hotel owners, 
              operators, and capital partners to refine the model. 
              If you have a property improvement in mind, we would like to hear from you.
            </p>
            <a href="#estimate" className="btn btn-primary">Estimate Your RevFlex Capacity</a>
          </div>
        </div>
      </section>

      {/* ── 7. Footer ────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <Image src="/logo-dark.png" alt="RevFlex" width={100} height={20} style={{ marginBottom: 8, opacity: 0.85 }} />
              <p className="footer-tagline">Revenue-aligned capital for hotel improvements.</p>
            </div>
            <p className="footer-legal">
              RevFlex is in development. Information provided on this website is for discussion purposes only 
              and does not constitute a financing offer, commitment to lend, investment advice, or approval of credit. 
              All financing is subject to underwriting, documentation, eligibility, and final approval. 
              RevFlex is not a bank. Capital provided through revenue participation agreements.
            </p>
          </div>
          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Forward-Looking Statements</a>
            </div>
            <p className="footer-copy">© 2026 RevFlex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

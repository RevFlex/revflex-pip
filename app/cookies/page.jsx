export default function Cookies() {
  const sections = [
    {
      title: '1. What Are Cookies',
      body: 'Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, remember your preferences, and provide information to website owners about how their site is being used.'
    },
    {
      title: '2. How RevFlex Uses Cookies',
      body: 'RevFlex uses cookies and similar tracking technologies to understand how visitors interact with our website, remember form inputs during a single session, and improve the overall user experience. We do not use cookies to serve advertising or to track you across third-party websites.'
    },
    {
      title: '3. Types of Cookies We Use',
      body: 'Strictly necessary cookies: These are required for the website to function and cannot be disabled. They include session cookies that maintain your state as you navigate the site. Analytics cookies: We may use anonymized analytics tools to understand page views, session duration, and navigation patterns. These cookies do not identify you personally. Preference cookies: These remember settings you have chosen, such as form inputs during a session, so you do not have to re-enter them.'
    },
    {
      title: '4. Third-Party Cookies',
      body: 'Our website may be hosted or supported by third-party services including Vercel (hosting and performance). These providers may set their own cookies as part of delivering their services. We do not control third-party cookies and recommend reviewing the privacy policies of any third-party services.'
    },
    {
      title: '5. Managing Cookies',
      body: 'You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or be notified when a cookie is being set. Please note that disabling certain cookies may affect the functionality of our website. Instructions for managing cookies can be found in your browser\'s help documentation.'
    },
    {
      title: '6. Cookie Retention',
      body: 'Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period or until you delete them manually. Analytics cookies, if used, are typically retained for no longer than 12 months.'
    },
    {
      title: '7. Do Not Track',
      body: 'Some browsers include a "Do Not Track" setting that signals websites not to track your browsing activity. Our website currently does not respond to Do Not Track signals, though we do not engage in cross-site tracking for advertising purposes.'
    },
    {
      title: '8. Updates to This Policy',
      body: 'We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our practices. We will post any changes on this page with an updated date. Continued use of our website following any changes constitutes acceptance of the updated policy.'
    },
    {
      title: '9. California Residents — Your Privacy Rights',
      body: 'If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA). These include: the right to know what personal information we collect, use, disclose, and sell; the right to delete personal information we have collected from you, subject to certain exceptions; the right to opt out of the sale or sharing of your personal information (RevFlex does not sell personal information); the right to non-discrimination for exercising your privacy rights; and the right to correct inaccurate personal information. To exercise any of these rights, please contact us using the contact form on our website with the subject line "California Privacy Request." We will respond within 45 days as required by law. You may also designate an authorized agent to make a request on your behalf. RevFlex does not sell or share personal information as defined under California law, and does not use sensitive personal information for purposes beyond those permitted under the CPRA.'
    },
    {
      title: '10. Contact',
      body: 'If you have questions about our use of cookies or this policy, please contact us using the contact form on our website.'
    },
  ]

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#FAF8F4', color: '#1A1D1A', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #E8E4DE', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '20px', color: '#1A1D1A', textDecoration: 'none' }}>RevFlex</a>
      </nav>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '16px', fontWeight: '600' }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '400', marginBottom: '12px', lineHeight: '1.2' }}>Cookie Policy</h1>
        <p style={{ fontSize: '13px', color: '#9A8A7A', marginBottom: '48px' }}>Last updated: May 2026</p>
        {sections.map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '18px', fontWeight: '400', color: '#1A1D1A', marginBottom: '10px' }}>{title}</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#4A4E4A', margin: 0 }}>
              {body}{' '}
              {(title.toLowerCase().includes('contact')) && (
                <a href="/contact" style={{ color: '#C27C4E', textDecoration: 'none' }}>Contact us →</a>
              )}
            </p>
          </div>
        ))}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #E8E4DE' }}>
          <a href="/" style={{ fontSize: '14px', color: '#C27C4E', textDecoration: 'none' }}>← Back to RevFlex</a>
        </div>
      </div>
    </main>
  )
}

export default function Privacy() {
  const sections = [
    {
      title: '1. Information We Collect',
      body: 'When you use the RevFlex website, we may collect information you voluntarily provide, including your name, email address, property name, property website, and other details entered into our estimate form. We also collect standard usage data such as IP addresses, browser type, and pages visited through cookies and similar technologies.'
    },
    {
      title: '2. How We Use Your Information',
      body: 'We use the information you provide to respond to your inquiries, evaluate potential financing opportunities, communicate with you about RevFlex products and updates, and improve our website and services. We do not sell, rent, or trade your personal information to third parties for their marketing purposes.'
    },
    {
      title: '3. Estimate Form Data',
      body: 'Information submitted through our financing estimate form — including property details, room count, ADR, occupancy, and project scope — is used solely to generate an illustrative estimate and to facilitate follow-up communication. This data is not shared with third-party lenders or data brokers without your consent.'
    },
    {
      title: '4. Cookies and Tracking',
      body: 'Our website may use cookies and similar tracking technologies to understand how visitors use our site and to improve the user experience. You may disable cookies through your browser settings, though this may affect certain functionality of the site.'
    },
    {
      title: '5. Data Security',
      body: 'We take reasonable measures to protect the information you provide from unauthorized access, disclosure, or misuse. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.'
    },
    {
      title: '6. Third-Party Services',
      body: 'Our website may use third-party services for hosting, analytics, and communications. These service providers may have access to your information only as necessary to perform their functions and are obligated to protect it. We are not responsible for the privacy practices of third-party websites linked from our site.'
    },
    {
      title: '7. Data Retention',
      body: 'We retain personal information for as long as necessary to fulfill the purposes outlined in this policy or as required by law. You may request deletion of your personal information by contacting us using the contact form on our website.'
    },
    {
      title: '8. Your Rights',
      body: 'Depending on your jurisdiction, you may have the right to access, correct, or delete personal information we hold about you. To exercise these rights, please contact us using the contact form on our website. We will respond to your request within a reasonable timeframe.'
    },
    {
      title: '9. Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised date. Continued use of the site following changes constitutes acceptance of the updated policy.'
    },
    {
      title: '10. Contact',
      body: 'If you have questions or concerns about this Privacy Policy, please use the contact form on our website.'
    },
  ]

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#FAF8F4', color: '#1A1D1A', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #E8E4DE', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '20px', color: '#1A1D1A', textDecoration: 'none' }}>RevFlex</a>
      </nav>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '16px', fontWeight: '600' }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '400', marginBottom: '12px', lineHeight: '1.2' }}>Privacy Policy</h1>
        <p style={{ fontSize: '13px', color: '#9A8A7A', marginBottom: '48px' }}>Last updated: May 2026</p>
        {sections.map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '18px', fontWeight: '400', color: '#1A1D1A', marginBottom: '10px' }}>{title}</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#4A4E4A', margin: 0 }}>
              {body}{' '}
              {(title.includes('8.') || title.includes('10.')) && (
                <a href="/contact" style={{ color: '#C27C4E', textDecoration: 'none' }}>Contact us here →</a>
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

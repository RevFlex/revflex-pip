export default function Terms() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: 'By accessing or using the RevFlex website or any related services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services. RevFlex reserves the right to modify these terms at any time. Continued use of the site following any changes constitutes acceptance of those changes.'
    },
    {
      title: '2. No Offer of Financing',
      body: 'Nothing on this website constitutes an offer, solicitation, or commitment to provide financing, credit, or any financial product. All information, estimates, and calculator outputs are provided for illustrative and informational purposes only. Actual financing terms, if any, are subject to full underwriting review, documentation, eligibility determination, and final approval by RevFlex. RevFlex is under no obligation to provide financing to any individual or entity.'
    },
    {
      title: '3. Use of the Website',
      body: 'You agree to use this website only for lawful purposes and in a manner that does not infringe the rights of others. You may not use this site to transmit any harmful, offensive, or disruptive content. RevFlex reserves the right to restrict or terminate access to the website at its sole discretion.'
    },
    {
      title: '4. Intellectual Property',
      body: 'All content on this website, including but not limited to text, graphics, logos, and software, is the property of RevFlex or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works from any content on this site without prior written permission from RevFlex.'
    },
    {
      title: '5. Disclaimer of Warranties',
      body: 'This website and all content are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. RevFlex does not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components.'
    },
    {
      title: '6. Limitation of Liability',
      body: 'To the fullest extent permitted by law, RevFlex shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, this website or its content. This includes, without limitation, reliance on any information provided on this site or any interruption in service.'
    },
    {
      title: '7. Third-Party Links',
      body: 'This website may contain links to third-party websites. These links are provided for convenience only. RevFlex does not endorse and is not responsible for the content, accuracy, or practices of any third-party websites.'
    },
    {
      title: '8. Governing Law',
      body: 'These Terms of Service shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Delaware.'
    },
    {
      title: '9. Contact',
      body: 'If you have questions about these Terms of Service, please contact us at hello@revflex.co.'
    },
  ]

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#FAF8F4', color: '#1A1D1A', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #E8E4DE', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '20px', color: '#1A1D1A', textDecoration: 'none' }}>RevFlex</a>
      </nav>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '16px', fontWeight: '600' }}>Legal</div>
        <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '400', marginBottom: '12px', lineHeight: '1.2' }}>Terms of Service</h1>
        <p style={{ fontSize: '13px', color: '#9A8A7A', marginBottom: '48px' }}>Last updated: May 2026</p>
        {sections.map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '18px', fontWeight: '400', color: '#1A1D1A', marginBottom: '10px' }}>{title}</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#4A4E4A', margin: 0 }}>{body}</p>
          </div>
        ))}
        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #E8E4DE' }}>
          <a href="/" style={{ fontSize: '14px', color: '#C27C4E', textDecoration: 'none' }}>← Back to RevFlex</a>
        </div>
      </div>
    </main>
  )
}


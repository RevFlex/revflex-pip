'use client'

import { useState } from 'react'

const inputStyle = {
  width: '100%', padding: '11px 14px', fontSize: '15px',
  border: '1px solid #D0C9C0', borderRadius: '7px',
  background: '#fff', color: '#1A1D1A', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}
const labelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#7A6A5A', marginBottom: '6px',
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim())
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '', _hp: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email address'
    if (!form.message.trim()) e.message = 'Required'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    if (form._hp) return // honeypot
    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          _hp: form._hp,
        }),
      })
      if (!response.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#FAF8F4', color: '#1A1D1A', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid #E8E4DE', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '20px', color: '#1A1D1A', textDecoration: 'none' }}>RevFlex</a>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9A8A7A', marginBottom: '16px', fontWeight: '600' }}>Contact</div>

        {sent ? (
          <div>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '400', marginBottom: '20px', lineHeight: '1.2' }}>
              Message received.
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.75', color: '#4A4E4A', marginBottom: '32px' }}>
              Thanks for reaching out. We'll be in touch as we select our founding properties.
            </p>
            <a href="/" style={{ fontSize: '14px', color: '#C27C4E', textDecoration: 'none' }}>← Back to RevFlex</a>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Libre Baskerville', serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '400', marginBottom: '12px', lineHeight: '1.2' }}>
              Get in touch.
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.75', color: '#4A4E4A', marginBottom: '40px' }}>
              Have a question about RevFlex or a property in mind? We'd like to hear from you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input style={{ ...inputStyle, borderColor: errors.name ? '#C0392B' : '#D0C9C0' }}
                  placeholder="Jane Smith" value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.name}</div>}
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={{ ...inputStyle, borderColor: errors.email ? '#C0392B' : '#D0C9C0' }}
                  type="email" placeholder="jane@meadowbrookinn.com" value={form.email} onChange={e => set('email', e.target.value)} />
                {errors.email && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.email}</div>}
              </div>

              <div>
                <label style={labelStyle}>Message *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', lineHeight: '1.6', borderColor: errors.message ? '#C0392B' : '#D0C9C0' }}
                  placeholder="Tell us about your property or project…"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                />
                {errors.message && <div style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>{errors.message}</div>}
              </div>

              {/* Honeypot */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
                <input tabIndex="-1" value={form._hp} onChange={e => set('_hp', e.target.value)} autoComplete="off" />
              </div>

              {errors.submit && <div style={{ fontSize: '13px', color: '#C0392B' }}>{errors.submit}</div>}

              <button onClick={handleSubmit} disabled={loading} style={{
                background: loading ? '#D4956E' : '#C27C4E', color: '#fff',
                fontSize: '15px', fontWeight: '500', padding: '14px',
                borderRadius: '7px', border: 'none', cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s ease'
              }}>
                {loading ? 'Sending…' : 'Send Message →'}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

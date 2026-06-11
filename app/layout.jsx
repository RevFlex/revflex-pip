import './globals.css'
import { Analytics } from '@vercel/analytics/react'

export const metadata = {
  title: 'RevFlex — Capital for Hotel Renovations That Grow Revenue',
  description:
    'RevFlex funds hotel renovation projects designed to grow revenue — guestrooms, repositioning, F&B, and amenities — repaid through a fixed share of room revenue. No personal guarantee. No franchise required.',
  openGraph: {
    title: 'RevFlex — Capital for Hotel Renovations That Grow Revenue',
    description:
      'Capital for the renovations that raise your rate. Repayment flexes with your room revenue. One fixed fee — no interest rate, no compounding.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'RevFlex — Capital for Hotel Renovations That Grow Revenue',
    description:
      'Capital for the renovations that raise your rate. Repayment flexes with your room revenue. One fixed fee — no interest rate, no compounding.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600&family=Libre+Baskerville:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

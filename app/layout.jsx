import './globals.css';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'RevFlex — Revenue-Aligned Capital for Hotel Improvements',
  description:
    'RevFlex provides flexible, revenue-aligned financing for hotel property improvement projects. Repaid through a fixed share of room revenue. No personal guarantee. No franchise required.',
  openGraph: {
    title: 'RevFlex — Revenue-Aligned Capital for Hotel Improvements',
    description:
      'Flexible capital for hotel PIP, FF&E, soft goods, and repositioning. Repayment tied to revenue performance.',
    type: 'website',
  },
};

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
  );
}

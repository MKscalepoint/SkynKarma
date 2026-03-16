import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkynKarma — Your Personal Skincare Advisor',
  description: 'AI-powered skincare intelligence. Decode ingredients, build your routine, and get personalised advice based on your skin type and concerns.',
  keywords: 'skincare, ingredients, skincare routine, AI skincare, ingredient checker, skin advisor, skincare advice',
  authors: [{ name: 'SkynKarma' }],
  openGraph: {
    title: 'SkynKarma — Your Personal Skincare Advisor',
    description: 'Decode ingredients, build your routine, and get personalised skincare advice — tailored to your skin.',
    url: 'https://skynkarma.com',
    siteName: 'SkynKarma',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkynKarma — Your Personal Skincare Advisor',
    description: 'Decode ingredients, build your routine, and get personalised skincare advice — tailored to your skin.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}

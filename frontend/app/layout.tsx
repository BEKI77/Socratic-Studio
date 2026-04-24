import type { Metadata } from 'next'
import { Manrope, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans-next" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif-next" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-next" })

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased w-full p-0 m-0`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

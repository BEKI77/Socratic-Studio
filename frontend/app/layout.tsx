import type { Metadata } from 'next'
import { Manrope, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'sonner'
import './globals.css'

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans-next" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif-next" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-next" })

export const metadata: Metadata = {
  title: 'Socratic Studio',
  description: 'AI-powered Socratic Tutor',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased w-full p-0 m-0`}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  )
}

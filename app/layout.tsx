import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AIConfigProvider } from '@/lib/ai-config-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { ThemeProvider } from '@/lib/theme-provider'
import './globals.css'


export const metadata: Metadata = {
  title: 'AI Chat Assistant',
  description: 'AI-powered chat assistant with prompt optimization and streaming responses',
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
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <ErrorBoundary>
            <AIConfigProvider>
              {children}
              <Analytics />
            </AIConfigProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}

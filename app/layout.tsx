import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from './client-layout'

export const metadata: Metadata = {
  title: 'Zinsrechner',
  description: 'Zinsrechner um den Zinseszins effekt visuell zu veranschaulichen.',
  icons: {
    icon: 'https://avatars.githubusercontent.com/u/121523551?v=4',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <ClientLayout>{children}</ClientLayout>
    </html>
  )
}
